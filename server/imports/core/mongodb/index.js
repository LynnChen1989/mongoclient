/* global Async */
import { Meteor } from 'meteor/meteor';
import Logger from '/server/imports/modules/logger/index';
import Database from '/server/imports/modules/database/index';
import Error from '/server/imports/modules/error_handler/index';
import Connection from '/server/imports/core/connection/index';
import MongoDBHelper from './helper';
import MongoDBShell from './shell';

const mongodbApi = require('mongodb');
const tunnelSsh = require('tunnel-ssh');
const spawn = require('cross-spawn');

const MongoDB = function () {
  this.dbObjectsBySessionId = {};
  this.tunnelsBySessionId = {};
};

const proceedConnectingMongodb = function (dbName, sessionId, connectionUrl, connectionOptions = {}, done) {
  const metadataToLog = { sessionId, connectionOptions };
  mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, (mainError, client) => {
    try {
      if (mainError || !client) {
        done(Error.createWithoutThrow({ type: Error.types.ConnectionError, externalError: mainError, metadataToLog }), client);
        if (client) client.close();
        if (this.tunnelsBySessionId[sessionId]) {
          this.tunnelsBySessionId[sessionId].close();
          this.tunnelsBySessionId[sessionId] = null;
        }
        return;
      }
      this.dbObjectsBySessionId[sessionId] = { db: client.db(dbName), client };
      this.dbObjectsBySessionId[sessionId].db.listCollections().toArray((err, collections) => {
        let errorToBeThrown = null;
        if (err) errorToBeThrown = Error.createWithoutThrow({ type: Error.types.ConnectionError, externalError: err, metadataToLog });
        done(errorToBeThrown, collections);
      });

      Logger.info({ message: 'connect', metadataToLog: { sessionLength: `${Object.keys(this.dbObjectsBySessionId).length}` } });
    } catch (exception) {
      done(Error.createWithoutThrow({ type: Error.types.ConnectionError, metadataToLog, externalError: exception }), null);

      if (client) client.close();
      if (this.tunnelsBySessionId[sessionId]) {
        this.tunnelsBySessionId[sessionId].close();
        this.tunnelsBySessionId[sessionId] = null;
      }
    }
  });
};

const connectThroughTunnel = function ({ connection, sessionId, done, connectionUrl, connectionOptions, username, password }) {
  const config = {
    dstPort: connection.ssh.destinationPort,
    localPort: connection.ssh.localPort ? connection.ssh.localPort : connection.servers[0].port,
    host: connection.ssh.host,
    port: connection.ssh.port,
    readyTimeout: 99999,
    username: connection.ssh.username,
  };

  if (connection.ssh.certificateFile) config.privateKey = Buffer.from(connection.ssh.certificateFile);
  if (connection.ssh.passPhrase) config.passphrase = connection.ssh.passPhrase;
  if (connection.ssh.password) config.password = connection.ssh.password;

  if (this.tunnelsBySessionId[sessionId]) this.tunnelsBySessionId[sessionId].close();

  Logger.info({ message: 'connect-ssh', metadataToLog: { sessionId, config } });
  this.tunnelsBySessionId[sessionId] = tunnelSsh(config, Meteor.bindEnvironment((error) => {
    if (error) {
      done(Error.createWithoutThrow({
        type: Error.types.ConnectionError,
        metadataToLog: { sessionId, connectionOptions, username },
        externalError: error
      }), null);
      return;
    }
    proceedConnectingMongodb.call(this, connection.databaseName, sessionId, connectionUrl, connectionOptions, done);

    MongoDBShell.connectToShell({ connectionId: connection._id, username, password, sessionId });
  }));

  this.tunnelsBySessionId[sessionId].on('error', (err) => {
    if (err) {
      done(Error.createWithoutThrow({
        type: Error.types.ConnectionError,
        metadataToLog: { sessionId, connectionOptions, username },
        externalError: err
      }), null);
    }
    if (this.tunnelsBySessionId[sessionId]) {
      this.tunnelsBySessionId[sessionId].close();
      this.tunnelsBySessionId[sessionId] = null;
    }
  });
};

const checkConnectionIsAlive = function (sessionId, metadataToLog) {
  if (!this.dbObjectsBySessionId[sessionId]) {
    this.disconnect({ sessionId });
    Error.create({ type: Error.types.ConnectionError, externalError: 'connection-closed', metadataToLog });
  }
};

MongoDB.prototype = {
  executeClientMethod({ dbName, methodArray, sessionId }) {
    const metadataToLog = { methodArray, dbName, sessionId };
    Logger.info({ message: 'client-query-execution', metadataToLog });

    checkConnectionIsAlive.call(this, sessionId, metadataToLog);

    const execution = this.dbObjectsBySessionId[sessionId].client.db(dbName);
    return MongoDBHelper.proceedExecutingQuery({ methodArray, execution, metadataToLog });
  },

  execute({ selectedCollection, methodArray, sessionId, removeCollectionTopology }) {
    const metadataToLog = { methodArray, selectedCollection, sessionId };
    Logger.info({ message: 'collection-query-execution', metadataToLog });

    checkConnectionIsAlive.call(this, sessionId, metadataToLog);

    const execution = this.dbObjectsBySessionId[sessionId].db.collection(selectedCollection);
    return MongoDBHelper.proceedExecutingQuery({ methodArray, execution, removeCollectionTopology, metadataToLog });
  },

  executeAdmin({ methodArray, runOnAdminDB, sessionId, removeCollectionTopology }) {
    const metadataToLog = { methodArray, runOnAdminDB, sessionId };
    Logger.info({ message: 'admin-query-execution', metadataToLog });

    checkConnectionIsAlive.call(this, sessionId, metadataToLog);

    const execution = runOnAdminDB ? this.dbObjectsBySessionId[sessionId].db.admin() : this.dbObjectsBySessionId[sessionId].db;
    return MongoDBHelper.proceedExecutingQuery({ methodArray, execution, removeCollectionTopology, metadataToLog });
  },

  executeMapReduce({ selectedCollection, map, reduce, options, sessionId }) {
    const metadataToLog = { selectedCollection, map, reduce, options, sessionId };
    Logger.info({ message: 'mapreduce-query-execution', metadataToLog });

    checkConnectionIsAlive.call(this, sessionId, metadataToLog);

    const execution = this.dbObjectsBySessionId[sessionId].db.collection(selectedCollection);
    return MongoDBHelper.proceedMapReduceExecution({ execution, map, reduce, options, metadataToLog });
  },

  connect({ connectionId, username, password, sessionId }) {
    const connection = Database.readOne({ type: Database.types.Connections, query: { _id: connectionId } });
    const connectionUrl = Connection.getConnectionUrl(connection, username, password);
    const connectionOptions = Connection.getConnectionOptions(connection);
    const metadataToLog = { connectionUrl, options: MongoDBHelper.clearConnectionOptionsForLog(connectionOptions), sessionId };

    Logger.debug({ message: 'connect', metadataToLog });

    return Async.runSync((done) => {
      try {
        if (connection.ssh && connection.ssh.enabled) connectThroughTunnel.call(this, { connection, sessionId, done, connectionUrl, connectionOptions, username, password });
        else proceedConnectingMongodb.call(this, connection.databaseName, sessionId, connectionUrl, connectionOptions, done);
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.ConnectionError, metadataToLog, externalError: exception }), null);
      }
    });
  },

  disconnect({ sessionId }) {
    Logger.info({ message: 'disconnect', metadataToLog: sessionId });

    if (this.dbObjectsBySessionId[sessionId] && this.dbObjectsBySessionId[sessionId].client) {
      this.dbObjectsBySessionId[sessionId].client.close().then(
        () => {
          delete this.dbObjectsBySessionId[sessionId];
        },
        (error) => {
          Logger.error({ message: 'disconnect-error', metadataToLog: { sessionId, error } });
        }
      );
    }

    if (MongoDBShell.spawnedShellsBySessionId[sessionId]) {
      MongoDBShell.spawnedShellsBySessionId[sessionId].stdin.end();
      MongoDBShell.spawnedShellsBySessionId[sessionId] = null;
    }

    Database.remove({ type: Database.types.ShellCommands, selector: {} });
    Database.remove({ type: Database.types.SchemaAnalyzeResult, selector: {} });
    Database.remove({ type: Database.types.Dumps, selector: {} });
  },

  dropAllCollections({ sessionId }) {
    Logger.info({ message: 'drop-all-collections', metadataToLog: { sessionId } });

    checkConnectionIsAlive.call(this, sessionId, { sessionId });

    return Async.runSync((done) => {
      try {
        this.dbObjectsBySessionId[sessionId].db.collections((err, collections) => {
          MongoDBHelper.keepDroppingCollections(collections, 0, done);
        });
      } catch (exception) {
        done(Error.createWithoutThrow({ type: Error.types.QueryError, message: 'drop-all-collections-error', metadataToLog: { sessionId }, externalError: exception }), null);
      }
    });
  },

  analyzeSchema({ connectionId, username, password, collection, sessionId }) {
    const connection = Database.readOne({ type: Database.types.Connections, query: { _id: connectionId } });
    const connectionUrl = Connection.getConnectionUrl(connection, username, password, true, true);
    const args = [connectionUrl, '--quiet', '--eval', `var collection =\"${collection}\", outputFormat=\"json\"`, `${MongoDBHelper.getMongoExternalsPath()}/variety/variety.js_`];
    const metadataToLog = { sessionId, args, collection };

    Logger.debug({ message: 'analyze-schema', metadataToLog });
    try {
      const mongoPath = MongoDBHelper.getProperBinary('mongo');
      const spawned = spawn(mongoPath, args);
      let message = '';
      spawned.stdout.on('data', Meteor.bindEnvironment((data) => {
        if (data.toString()) {
          message += data.toString();
        }
      }));

      spawned.stderr.on('data', Meteor.bindEnvironment((data) => {
        if (data.toString()) {
          Database.create({
            type: Database.types.SchemaAnalyzeResult,
            document: {
              date: Date.now(),
              sessionId,
              connectionId,
              message: data.toString(),
            }
          });
        }
      }));

      spawned.on('close', Meteor.bindEnvironment(() => {
        Database.create({
          type: Database.types.SchemaAnalyzeResult,
          document: {
            date: Date.now(),
            sessionId,
            connectionId,
            message
          }
        });
      }));

      spawned.stdin.end();
    } catch (exception) {
      Error.create({ type: Error.types.SchemaAnalyzeError, externalError: exception, metadataToLog });
    }
  }
};

export default new MongoDB();

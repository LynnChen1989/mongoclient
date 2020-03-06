import { Meteor } from 'meteor/meteor';
import { MongoDBShell, MongoDB, MongoDBBackup, MongoDBUser } from '/server/imports/core';

Meteor.methods({
  clearShell({ sessionId }) {
    MongoDBShell.clearShell({ sessionId });
  },

  executeShellCommand({ command, connectionId, username, password, sessionId }) {
    MongoDBShell.executeShellCommand({ command, connectionId, username, password, sessionId });
  },

  connectToShell({ connectionId, username, password, sessionId }) {
    return MongoDBShell.connectToShell({ connectionId, username, password, sessionId });
  },

  analyzeSchema({ connectionId, username, password, collection, sessionId }) {
    MongoDB.analyzeSchema({ connectionId, username, password, collection, sessionId });
  },

  mongodump({ args, sessionId }) {
    MongoDBBackup.mongodump({ args, sessionId });
  },

  mongorestore({ args, sessionId }) {
    MongoDBBackup.mongorestore({ args, sessionId });
  },

  mongoexport({ args, sessionId }) {
    MongoDBBackup.mongoexport({ args, sessionId });
  },

  mongoimport({ args, sessionId }) {
    MongoDBBackup.mongoimport({ args, sessionId });
  },

  removeDumpLogs({ sessionId, binary }) {
    MongoDBBackup.removeDumpLogs({ sessionId, binary });
  },

  getAllActions() {
    return MongoDBUser.getAllActions();
  },

  getActionInfo({ action }) {
    return MongoDBUser.getActionInfo({ action });
  },

  getRoleInfo({ roleName }) {
    return MongoDBUser.getRoleInfo({ roleName });
  },

  getResourceInfo({ resource }) {
    return MongoDBUser.getResourceInfo({ resource });
  }
});

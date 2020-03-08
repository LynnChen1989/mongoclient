import {Meteor} from 'meteor/meteor';
import {
  Connections,
  Actions,
  Dumps,
  QueryHistory,
  Settings,
  ShellCommands,
  SchemaAnalyzeResult,
} from '/lib/imports/collections';

Meteor.publish('schema_analyze_result', () => SchemaAnalyzeResult.find({}));

Meteor.publish('shell_commands', () => ShellCommands.find({}));

Meteor.publish('connections', () => Connections.find());

Meteor.publish('actions', () => Actions.find());

Meteor.publish('dumps', () => Dumps.find({}, {sort: {date: 1}}));

Meteor.publish('queryHistories', () => QueryHistory.find());

Meteor.publish('settings', () => Settings.find());

// 发布所有用户，默认的只会返回第一个用户
Meteor.publish('allUsers', function () {
  return Meteor.users.find();
});
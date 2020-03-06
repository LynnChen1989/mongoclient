import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/set/set';
import '/client/imports/views/query_templates_options/upsert/upsert';
import '/client/imports/views/query_templates_options/array_filters/array_filters';
import './update_one.html';

Template.updateOne.onRendered(() => {
  Querying.initOptions(Enums.UPDATE_OPTIONS);
});

Template.updateOne.executeQuery = Querying.Collection.UpdateOne.execute.bind(Querying.Collection.UpdateOne);
Template.updateOne.renderQuery = Querying.Collection.UpdateOne.render.bind(Querying.Collection.UpdateOne);

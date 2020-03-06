import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { Enums, UIComponents } from '/client/imports/modules';
import './findone_and_replace.html';

Template.findOneAndReplace.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divReplacement'), txtAreaId: 'txtReplacement' });
  Querying.initOptions(Enums.FINDONE_MODIFY_OPTIONS, false, Enums.FINDONE_MODIFY_OPTIONS.ARRAY_FILTERS);
});

Template.findOneAndReplace.executeQuery = Querying.Collection.FindOneAndReplace.execute.bind(Querying.Collection.FindOneAndReplace);
Template.findOneAndReplace.renderQuery = Querying.Collection.FindOneAndReplace.render.bind(Querying.Collection.FindOneAndReplace);

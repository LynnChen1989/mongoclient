import { Template } from 'meteor/templating';
import $ from 'jquery';
import { UIComponents } from '/client/imports/modules';
import '/client/imports/views/query_templates_options/sort/sort';
import '/client/imports/views/query_templates_options/limit/limit.html';
import '/client/imports/views/query_templates_options/selector/selector';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import './map_reduce_options.html';

Template.out.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divOut'), txtAreaId: 'txtOut' });
});

Template.scope.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divScope'), txtAreaId: 'txtScope' });
});

Template.finalize.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divFinalize'), txtAreaId: 'txtFinalize' });
});

Template.jsMode.onRendered(() => {
  UIComponents.Checkbox.init($('#inputJsMode'));
});

Template.keepTemp.onRendered(() => {
  UIComponents.Checkbox.init($('#inputKeeptemp'));
});

Template.verbose.onRendered(() => {
  UIComponents.Checkbox.init($('#inputVerbose'));
});

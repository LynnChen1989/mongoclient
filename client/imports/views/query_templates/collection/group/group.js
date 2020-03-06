import { Template } from 'meteor/templating';
import { Querying } from '/client/imports/ui';
import { UIComponents } from '/client/imports/modules';
import './group.html';

Template.group.onRendered(() => {
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divKeys'), txtAreaId: 'txtKeys' });
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCondition'), txtAreaId: 'txtCondition' });
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divInitial'), txtAreaId: 'txtInitial' });
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divReduce'), txtAreaId: 'txtReduce' });
  UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divFinalize'), txtAreaId: 'txtFinalize' });

  UIComponents.Checkbox.init($('#inputCommand'));
});

Template.group.executeQuery = Querying.Collection.Group.execute.bind(Querying.Collection.Group);
Template.group.renderQuery = Querying.Collection.Group.render.bind(Querying.Collection.Group);

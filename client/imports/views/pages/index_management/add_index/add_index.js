import { Template } from 'meteor/templating';
import { UIComponents, Notification } from '/client/imports/modules';
import { IndexManagement } from '/client/imports/ui';
import './add_index.html';

Template.addIndex.onRendered(() => {
  UIComponents.Checkbox.init($('#inputSparse, #inputUnique, #inputBackground'));
  UIComponents.Combobox.init({ selector: $('#cmbTextIndexVersion, #cmbTextIndexDefaultLanguage'), empty: false });

  $('#accordion').on('show.bs.collapse', () => {
    setTimeout(() => {
      UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divPartial'), txtAreaId: 'txtPartial' });
    }, 150);
  });

  $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
    const target = $(e.target).attr('href');
    if (target === '#tab-4-indexes-collation') UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divCollationAddIndex'), txtAreaId: 'txtCollationAddIndex' });
    else if (target === '#tab-2-text-options') IndexManagement.prepareFieldWeights();
  });
});

Template.addIndex.events({
  'click .addField': function () {
    IndexManagement.addField();
  },

  'click .deleteField': function (event) {
    if ($('.divField:visible').length === 1) {
      Notification.warning('one-field-required');
      return;
    }
    $(event.currentTarget).parents('.divField').remove();
  },

  'click #btnSaveIndex': function () {
    IndexManagement.saveIndex();
  }
});

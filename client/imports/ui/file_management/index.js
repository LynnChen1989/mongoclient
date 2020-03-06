import { UIComponents, ExtendedJSON, Notification, ErrorHandler, SessionManager } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import FileManagementHelper from './helper';

const FileManagement = function () {};

FileManagement.prototype = {
  keepUploading() {
    const contentType = $('#inputContentType').val();
    const blob = $('#inputFile')[0].files[0];
    let metaData = UIComponents.Editor.getCodeMirrorValue($('#divMetadata'));
    metaData = ExtendedJSON.convertAndCheckJSON(metaData);
    if (metaData.ERROR) {
      Notification.error('syntax-error-metadata', null, { error: metaData.ERROR });
      return;
    }

    const aliases = [];
    $('#selectAliases').find('option').each(function () {
      aliases.push($(this).val());
    });

    $('#fileInfoModal').modal('hide');
    FileManagementHelper.proceedUploading(blob, contentType, metaData, aliases, this.initFilesInformation);
  },

  initFilesInformation() {
    Notification.start('#btnReloadFiles');

    let selector = UIComponents.Editor.getCodeMirrorValue($('#divSelector'));
    selector = ExtendedJSON.convertAndCheckJSON(selector);
    if (selector.ERROR) {
      Notification.error('syntax-error-selector', null, { error: selector.ERROR });
      return;
    }

    Communicator.call({
      methodName: 'getFilesInfo',
      args: { selector, limit: $('#txtFileFetchLimit').val(), bucketName: $('#txtBucketName').val() },
      callback: (err, result) => {
        if (err || result.error) {
          ErrorHandler.showMeteorFuncError(err, result);
          return;
        }
        FileManagementHelper.convertObjectIdAndDateToString(result.result);
        UIComponents.DataTable.setupDatatable({
          selectorString: '#tblFiles',
          data: result.result,
          columns: [
            { data: '_id', width: '15%' },
            { data: 'filename', width: '20%' },
            { data: 'chunkSize', width: '15%' },
            { data: 'uploadDate', width: '15%' },
            { data: 'length', width: '15%' },
          ],
          columnDefs: [
            {
              targets: [5],
              data: null,
              width: '5%',
              defaultContent: '<a href="" title="Edit Metadata" class="editor_show_metadata"><i class="fa fa-book text-navy"></i></a>',
            },
            {
              targets: [6],
              data: null,
              width: '5%',
              defaultContent: '<a href="" title="Download" class="editor_download"><i class="fa fa-download text-navy"></i></a>',
            },
            {
              targets: [7],
              data: null,
              width: '5%',
              defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>',
            },
          ]
        });

        Notification.stop();
      }
    });
  },

  deleteFiles() {
    Notification.modal({
      title: 'are-you-sure',
      text: 'all-selected-files-will-be-wiped',
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnDeleteFiles');

          let selector = UIComponents.Editor.getCodeMirrorValue($('#divSelector'));
          selector = ExtendedJSON.convertAndCheckJSON(selector);
          if (selector.ERROR) {
            Notification.error('syntax-error-selector', null, { error: selector.ERROR });
            return;
          }

          Communicator.call({
            methodName: 'deleteFiles',
            args: { bucketName: $('#txtBucketName').val(), selector },
            callback: (err, result) => {
              if (err || result.err) ErrorHandler.showMeteorFuncError(err, result);
              else {
                Notification.success('deleted-successfully');
                this.initFilesInformation();
              }
            }
          });
        }
      }
    });
  },

  delete() {
    const fileRow = SessionManager.get(SessionManager.strSessionSelectedFile);
    if (fileRow) {
      Notification.modal({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: (isConfirm) => {
          if (isConfirm) {
            Notification.start('#btnReloadFiles');

            Communicator.call({
              methodName: 'deleteFile',
              args: { bucketName: $('#txtBucketName').val(), fileId: fileRow._id },
              callback: (err) => {
                if (err) ErrorHandler.showMeteorFuncError(err);
                else {
                  Notification.success('deleted-successfully');
                  this.initFilesInformation();
                }
              }
            });
          }
        }
      });
    }
  },

  updateMetadata() {
    Notification.modal({
      title: 'are-you-sure',
      text: 'existing-metadata-will-be-overriden',
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start('#btnUpdateMetadata');
          const jsonEditor = $('#jsonEditorOfMetadata').data('jsoneditor');
          const setValue = jsonEditor.get();
          delete setValue._id;

          Communicator.call({
            methodName: 'updateOne',
            args: {
              selectedCollection: `${$('#txtBucketName').val()}.files`,
              selector: { _id: { $oid: SessionManager.get(SessionManager.strSessionSelectedFile)._id } },
              setObject: { $set: setValue }
            },
            callback: (err) => {
              if (err) ErrorHandler.showMeteorFuncError(err);
              else {
                Notification.success('saved-successfully');
                FileManagementHelper.proceedShowingMetadata(SessionManager.get(SessionManager.strSessionSelectedFile)._id, jsonEditor);
              }
            }
          });
        }
      }
    });
  },

  showMetadata() {
    Notification.start('#btnClose');

    const fileRow = SessionManager.get(SessionManager.strSessionSelectedFile);
    if (fileRow) {
      const jsonEditor = UIComponents.Editor.initializeJSONEditor({ selector: 'jsonEditorOfMetadata' });
      $('#metaDataModal').modal('show');
      FileManagementHelper.proceedShowingMetadata(fileRow._id, jsonEditor);
    }
  },

  download(sessionId) {
    const fileRow = SessionManager.get(SessionManager.strSessionSelectedFile);
    if (fileRow) window.open(`download?fileId=${fileRow._id}&bucketName=${$('#txtBucketName').val()}&sessionId=${sessionId}`);
  }
};

export default new FileManagement();

import Helper from '/client/imports/helpers/helper';

const toastr = require('toastr');
const ladda = require('ladda');
const swal = require('sweetalert');

const Notification = function () {
};

Notification.prototype = {
  notify({ type = 'error', message = 'unexpected-error', translateOptions, options, noTranslate }) {
    const finalMessage = noTranslate ? message : Helper.translate({ key: message, options: translateOptions });
    if (message === 'unexpected-error') type = 'error';
    toastr[type](finalMessage, options);
  },

  info(message, options, translateOptions) {
    this.notify({ type: 'info', message, options, translateOptions });
  },

  success(message, options, translateOptions) {
    this.notify({ type: 'success', message, options, translateOptions });
    ladda.stopAll();
  },

  warning(message, options, translateOptions) {
    this.notify({ type: 'warning', message, options, translateOptions });
    ladda.stopAll();
  },

  error(message, options, translateOptions) {
    this.notify({ type: 'error', message, options, translateOptions });
    ladda.stopAll();
  },

  errorNoTranslate(message) {
    this.notify({ type: 'error', message, noTranslate: true });
    ladda.stopAll();
  },

  start(strSelector) {
    const selector = document.querySelector(strSelector);
    if (selector) ladda.create(selector).start();
  },

  stop() {
    ladda.stopAll();
  },

  modal({ title, titleTranslateOptions, text, textTranslateOptions, type, callback, inputPlaceholder, showCancelButton = true,
    closeOnConfirm = true, confirmButtonText = 'yes-please', cancelButtonText = 'cancel' }) {
    swal({
      title: Helper.translate({ key: title, options: titleTranslateOptions }),
      text: Helper.translate({ key: text, options: textTranslateOptions }),
      html: true,
      type,
      inputPlaceholder: Helper.translate({ key: inputPlaceholder }),
      showCancelButton,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: Helper.translate({ key: confirmButtonText }),
      closeOnConfirm,
      cancelButtonText: Helper.translate({ key: cancelButtonText })
    }, callback);
  },

  closeModal() {
    swal.close();
  },

  showModalInputError(message, translateOptions) {
    swal.showInputError(Helper.translate({ key: message, options: translateOptions }));
  }
};

export default new Notification();

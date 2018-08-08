const ui = require('../ui');

const utils = {
  modalCloseAndReload: function() {
    ui.modal.classList.remove('is-active');
    ui.modalContent.innerHTML = '';
    window.location.reload();
  },
  reduceTags: function(arr, options) {
    return arr.reduce((accObj, item) => {
      if (!accObj[item]) {
        accObj[item] = options ? options.date : true;
      }
      return accObj;
    }, {});
  },
};

module.exports = utils;

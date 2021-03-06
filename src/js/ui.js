const ui = {
  // Sections
  loginSection: document.querySelector('#login'),
  dashboardSection: document.querySelector('#dashboard'),
  // Containers
  modal: document.querySelector('#dash_modal'),
  modalContent: document.querySelector('#dash_modal_content'),
  addList: document.querySelector('#add_list'),
  contentTableBody: document.querySelector('#content_table_body'),
  contentTable: document.querySelector('#content_table'),
  // Links
  loginLink: document.querySelector('#login_link'),
  logoutLink: document.querySelector('#logout_link'),
  modalClose: document.querySelector('.modal-close'),
  // Buttons
  contentTable: document.querySelector('#content_table'),
  loginButton: document.querySelector('#login_button'),
  savePostButton: document.querySelector('#save_post'),
  saveQuipButton: document.querySelector('#save_quip'),
  savePicButton: document.querySelector('#save_pic'),
  saveClipButton: document.querySelector('#save_clip'),
  prevButton: document.querySelector('#pagination_prev'),
  nextButton: document.querySelector('#pagination_next'),
  // Data
  email: document.querySelector('#email'),
  password: document.querySelector('#password'),
};

module.exports = ui;

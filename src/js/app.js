var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/storage');
require('firebase/firestore');
var ui = require('./ui');
var handler = require('./event-handlers');
var dashViews = require('./dash-views');

var firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DB_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

firebase.initializeApp(firebaseConfig);
window.firebase = firebase;

var auth = firebase.auth();
var firestore = firebase.firestore();
var firestoreConfig = { timestampsInSnapshots: true };
firestore.settings(firestoreConfig);

// Hide content before auth check
document.body.style.display = 'none';

auth.onAuthStateChanged(function checkUser(user) {
  if (user) {
    getAllContent();
    document.body.style.display = 'block';
    ui.loginSection.style.display = 'none';
    ui.loginLink.style.display = 'none';
    ui.dashboardSection.style.display = 'block';
    ui.logoutLink.style.display = 'block';
  } else {
    document.body.style.display = 'block';
    ui.loginSection.style.display = 'block';
    ui.loginLink.style.display = 'block';
    ui.dashboardSection.style.display = 'none';
    ui.logoutLink.style.display = 'none';
  }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', handler.toggleMobileMenu);
ui.logoutLink.addEventListener('click', handler.logout);
ui.loginButton.addEventListener('click', handler.login);
const addLinks = ui.addList.querySelectorAll('a');
addLinks.forEach(link => {
  link.addEventListener('click', handler.addModal);
});
ui.modalClose.addEventListener('click', handler.closeModal);
ui.modal.addEventListener('keyup', handler.inputTag);
ui.modal.addEventListener('click', handler.deleteTag);
ui.modal.addEventListener('click', handler.savePost);
ui.modal.addEventListener('click', handler.saveQuip);
ui.modal.addEventListener('click', handler.savePic);
ui.modal.addEventListener('click', handler.resetPic);
ui.modal.addEventListener('change', handler.previewPic);
ui.modal.addEventListener('click', handler.saveClip);
ui.modal.addEventListener('click', handler.deleteItem);
ui.contentTable.addEventListener('click', handler.openEditModal);
ui.contentTable.addEventListener('click', handler.openDeleteModal);

function getAllContent() {
  firestore
    .collection('feed_items')
    .orderBy('date', 'desc')
    .get()
    .then(snapshot => {
      return (ui.contentTableBody.innerHTML = dashViews.dashTable(
        snapshot.docs
      ));
    })
    .catch(err => console.error(err.message));
}

function getSingleContent(id) {}

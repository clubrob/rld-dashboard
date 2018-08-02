var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/storage');
require('firebase/firestore');
var ui = require('./ui');
var formViews = require('./form-views');
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
document.addEventListener('DOMContentLoaded', () => {
  navBurgerHandler();
});
ui.logoutLink.addEventListener('click', logoutHandler);
ui.loginButton.addEventListener('click', loginHandler);
const addLinks = ui.addList.querySelectorAll('a');
addLinks.forEach(link => {
  link.addEventListener('click', addModalHandler);
});
ui.modalClose.addEventListener('click', modalCloseHandler);
ui.modal.addEventListener('keyup', tagInputHandler);
ui.modal.addEventListener('click', tagDeleteHandler);
ui.contentTable.addEventListener('click', editButtonHandler);
ui.contentTable.addEventListener('click', deleteButtonHandler);

// Event Handlers
// Bulma script for expanding mainNav
function navBurgerHandler() {
  const navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll('.navbar-burger'),
    0
  );
  if (navbarBurgers.length > 0) {
    navbarBurgers.forEach(burger => {
      burger.addEventListener('click', () => {
        const target = burger.dataset.target;
        const menu = document.getElementById(target);
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
      });
    });
  }
}

function logoutHandler(event) {
  auth.signOut();
  event.preventDefault();
}

function loginHandler(event) {
  var email = ui.email.value;
  var password = ui.password.value;

  auth
    .signInWithEmailAndPassword(email, password)
    .catch(err => console.error(err.message));

  event.preventDefault();
}

function addModalHandler(event) {
  const formType = event.target.attributes.id.value.split('_')[1];
  ui.modalContent.innerHTML = formViews[formType];
  ui.modal.classList.add('is-active');
  event.preventDefault();
}

function modalCloseHandler(event) {
  ui.modalContent.innerHTML = '';
  ui.modal.classList.remove('is-active');
  event.preventDefault();
}

function tagInputHandler(event) {
  const tagInput = event.target;
  const key = event.keyCode;
  const tagHolder = tagInput.nextElementSibling;

  if (tagInput && tagInput.matches('.form-tags') && key === 188) {
    // Build the tagSpan and children
    // Tag text, comma removed
    const tagText = document.createTextNode(
      tagInput.value.substr(0, tagInput.value.length - 1)
    );
    // Tag delete button
    let tagDelete = document.createElement('button');
    tagDelete.classList.add('delete', 'is-small');
    // Tag wrapper span
    let tagSpan = document.createElement('span');
    tagSpan.classList.add('tag', 'is-dark');
    // Put it all together
    tagSpan.appendChild(tagText);
    tagSpan.appendChild(tagDelete);
    tagHolder.appendChild(tagSpan);
    // Reset the form
    tagInput.value = '';
  }
}

function tagDeleteHandler(event) {
  const tagDelete = event.target;
  if (tagDelete && tagDelete.matches('.delete')) {
    event.target.parentElement.remove();
  }
}

function editButtonHandler(event) {
  const btn = event.target;
  if (btn && btn.matches('.edit-button')) {
    console.log(btn);
  }
  event.preventDefault();
}

function deleteButtonHandler(event) {
  const btn = event.target;
  if (btn && btn.matches('.delete-button')) {
    console.log(btn);
  }
  event.preventDefault();
}
// End event handlers

function getAllContent() {
  firestore
    .collection('feed_items')
    .get()
    .then(snapshot => {
      return (ui.contentTableBody.innerHTML = dashViews.dashTable(
        snapshot.docs
      ));
    })
    .catch(err => console.error(err.message));
}

function getSingleContent(id) {}

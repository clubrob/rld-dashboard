var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/storage');
require('firebase/firestore');
var formViews = require('./form-views');

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DB_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

firebase.initializeApp(firebaseConfig);
window.firebase = firebase;
const firestore = firebase.firestore();
const firestoreConfig = { timestampsInSnapshots: true };
firestore.settings(firestoreConfig);

// Hide content before auth check
document.body.style.display = 'none';

const uiElements = {
  loginSection: document.querySelector('#login'),
  dashboardSection: document.querySelector('#dashboard'),
  loginLink: document.querySelector('#login_link'),
  logoutLink: document.querySelector('#logout_link'),
  contentTable: document.querySelector('#content_table'),
  loginButton: document.querySelector('#login_button'),
  email: document.querySelector('#email'),
  password: document.querySelector('#password'),
  addList: document.querySelector('#add_list'),
  modal: document.querySelector('#dash_modal'),
  modalContent: document.querySelector('#dash_modal_content'),
  modalClose: document.querySelector('.modal-close'),
};

firebase.auth().onAuthStateChanged(function checkUser(user) {
  if (user) {
    getContent();
    document.body.style.display = 'block';
    uiElements.loginSection.style.display = 'none';
    uiElements.loginLink.style.display = 'none';
    uiElements.dashboardSection.style.display = 'block';
    uiElements.logoutLink.style.display = 'block';
  } else {
    document.body.style.display = 'block';
    uiElements.loginSection.style.display = 'block';
    uiElements.loginLink.style.display = 'block';
    uiElements.dashboardSection.style.display = 'none';
    uiElements.logoutLink.style.display = 'none';
  }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  navBurgerHandler();
});
uiElements.logoutLink.addEventListener('click', logoutHandler);
uiElements.loginButton.addEventListener('click', loginHandler);
const addLinks = uiElements.addList.querySelectorAll('a');
addLinks.forEach(link => {
  link.addEventListener('click', addHandler);
});
uiElements.modalClose.addEventListener('click', modalCloseHandler);
uiElements.modal.addEventListener('keyup', tagInputHandler);
uiElements.modal.addEventListener('click', tagDeleteHandler);

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
  firebase.auth().signOut();
  event.preventDefault();
}

function loginHandler(event) {
  var email = uiElements.email.value;
  var password = uiElements.password.value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch(err => console.error(err.message));

  event.preventDefault();
}

function addHandler(event) {
  const formType = event.target.attributes.id.value.split('_')[1];
  uiElements.modalContent.innerHTML = formViews[formType];
  uiElements.modal.classList.add('is-active');
  event.preventDefault();
}

function modalCloseHandler(event) {
  uiElements.modalContent.innerHTML = '';
  uiElements.modal.classList.remove('is-active');
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
// End event handlers
function getContent() {
  firestore
    .collection('feed_items')
    .get()
    .then(snapshot => {
      return snapshot.forEach(doc => {
        return console.log(doc.data());
      });
    })
    .catch(err => console.error(err.message));
}

var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/storage');
require('firebase/firestore');
var ui = require('./ui');
var handler = require('./event-handlers/event-handlers');
var dashViews = require('./views/dash-views');

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
    ui.dashboardSection.classList.remove('hide');
    ui.logoutLink.style.display = 'block';
  } else {
    document.body.style.display = 'block';
    ui.dashboardSection.classList.add('hide');
    ui.loginSection.style.display = 'block';
    ui.loginLink.style.display = 'block';
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

const photos = require('../data/insta.json').photos;

let re = /#[a-z]*/gi;

const slugify = require('slugify');

function handleFileSelect(event) {
  event.stopPropagation();
  event.preventDefault();

  var files = event.dataTransfer.files; // FileList object.

  for (let i = 0, file; (file = files[i]); i++) {
    photos.forEach(photo => {
      if (photo.path.split('/')[2] === file.name) {
        let id = firebase
          .firestore()
          .collection('feed_items')
          .doc().id;

        let date = new Date(photo.taken_at).getTime();

        let hashtags = {
          bestofinstagram: date,
        };
        let match;
        do {
          match = re.exec(photo.caption);
          if (match) {
            // console.log('match', match[0]);
            hashtags[match[0].substr(1)] = date;
          }
        } while (match);

        let body = photo.caption || '';
        let alt = photo.caption || '';
        // Slug and filename for pic
        let altSlugged = slugify(`${alt.substr(0, 30).toLowerCase()}`, {
          remove: /[$*_+~.()'"!,?:@]/g,
        });
        let fileExt = file.name.split('.')[1];
        let filename = `${altSlugged}.${fileExt}`;

        let slugDigit = Math.floor(Math.random() * 90000) + 10000;
        let slug = `${date}-${slugDigit}`;

        let storage = firebase.storage();
        let storageRef = storage.ref();
        let picRef = storageRef.child(`${id}/${filename}`);

        /* let item = {
          // storage_url: url,
          filename: filename,
          body: body,
          tags: hashtags,
          slug: slug,
          alt: alt,
          item_type: 'pic',
          date: date,
        };
        console.log(item); */
        picRef
          .put(file)
          .then(snapshot => {
            console.log('New pic uploaded');
            return snapshot.ref.getDownloadURL();
          })
          .then(url => {
            console.log('file url: ', url);
            // TODO validation
            return firebase
              .firestore()
              .collection('feed_items')
              .doc(id)
              .set({
                storage_url: url,
                filename: filename,
                body: body,
                tags: hashtags,
                slug: slug,
                alt: alt,
                item_type: 'pic',
                date: date,
              });
          })
          .then(() => {
            console.log('New Pic with ID: ', id);
            return;
          })
          .catch(err => console.error(err.message));
      }
    });
  }
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

/* insta.forEach(snap => {
  // var objectURL = window.URL.createObjectURL(snap.path);
  console.log(snap);
}); */

/* tweets.forEach(tweet => {
  let body = tweet.body;
  let date = tweet.date * 1000;
  let hashtags = {
    bestoftwitter: date,
  };
  let match;
  do {
    match = re.exec(tweet.body);
    if (match) {
      // console.log('match', match[0]);
      hashtags[match[0].substr(1)] = tweet.date;
    }
  } while (match);

  let slugDigit = Math.floor(Math.random() * 90000) + 10000;
  let slug = `${date}-${slugDigit}`;

  let item = {
    body: body,
    date: date,
    slug: slug,
    item_type: 'quip',
    tags: hashtags,
  };

  console.log(item);
}); */

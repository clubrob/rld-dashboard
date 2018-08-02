var slugify = require('slugify');
var ui = require('./ui');
var formViews = require('./form-views');

function tagReducer(tagObj, tag) {
  if (!tagObj[tag]) {
    tagObj[tag] = Date.now();
  }
  return tagObj;
}

function modalCloseAndReload() {
  ui.modal.classList.remove('is-active');
  ui.modalContent.innerHTML = '';
  window.location.reload();
}

const eventHandlers = {
  toggleMobileMenu: function() {
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
  },

  logout: function(event) {
    firebase.auth().signOut();
    event.preventDefault();
  },

  login: function(event) {
    var email = ui.email.value;
    var password = ui.password.value;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(err => console.error(err.message));

    event.preventDefault();
  },

  addModal: function(event) {
    const formType = event.target.attributes.id.value.split('_')[1];
    ui.modalContent.innerHTML = formViews[formType];
    ui.modal.classList.add('is-active');
    event.preventDefault();
  },

  closeModal: function(event) {
    ui.modalContent.innerHTML = '';
    ui.modal.classList.remove('is-active');
    event.preventDefault();
  },

  inputTag: function(event) {
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
  },

  deleteTag: function(event) {
    const tagDelete = event.target;
    if (tagDelete && tagDelete.matches('.delete')) {
      event.target.parentElement.remove();
    }
  },

  openEditModal: function(event) {
    const btn = event.target;
    if (btn && btn.matches('.edit-button')) {
      console.log(btn);
    }
    event.preventDefault();
  },

  openDeleteModal: function(event) {
    const btn = event.target;
    if (btn && btn.matches('.delete-button')) {
      const id = btn.attributes.href.value.split('_')[1];
      ui.modalContent.innerHTML = `
      <div class="message is-info">
        <div class="message-header">
          <p>Are you sure? No take backsies!</p>
        </div>
        <div class="message-body">
        <button class="button is-danger for-real-delete" data-id="${id}">Yup. Delete it.</button>
        </div>
      </div>
    `;
      ui.modal.classList.add('is-active');
    }
    event.preventDefault();
  },

  deleteItem: function(event) {
    const btn = event.target;
    if (btn && btn.matches('.for-real-delete')) {
      const id = btn.dataset.id;

      firebase
        .firestore()
        .collection('feed_items')
        .doc(id)
        .delete()
        .then(() => {
          console.log('Successfully deleted.');
          return modalCloseAndReload();
        })
        .catch(err => console.error(err.message));
    }
    event.preventDefault();
  },

  savePost: function(event) {
    const btn = event.target;
    if (btn && btn.matches('#save_post')) {
      let form = document.querySelector('#post_form');

      let title = form.querySelector('#post_title').value;
      let body = form.querySelector('#post_body').value;
      let date = Date.now();
      let tags = Array.from(form.getElementsByClassName('tag')).map(
        tag => tag.textContent
      );
      let slugDigit = Math.floor(Math.random() * 90000) + 10000;
      let slug = slugify(`${title}-${slugDigit}`, {
        remove: /[$*_+~.()'"!,?:@]/g,
      });

      if (tags.length > 0) {
        tags = tags.reduce(tagReducer, {});
      }

      firebase
        .firestore()
        .collection('feed_items')
        .add({
          title: title,
          body: body,
          tags: tags,
          slug: slug,
          item_type: 'post',
          date: date,
        })
        .then(docRef => {
          console.log('New Post with ID: ', docRef.id);
          return modalCloseAndReload();
        })
        .catch(err => console.error(err.message));
    }
    event.preventDefault();
  },

  saveQuip: function(event) {
    const btn = event.target;
    if (btn && btn.matches('#save_quip')) {
      let form = document.querySelector('#quip_form');

      let body = form.querySelector('#quip_body').value;
      let date = Date.now();
      let tags = Array.from(form.getElementsByClassName('tag')).map(
        tag => tag.textContent
      );
      let slugDigit = Math.floor(Math.random() * 90000) + 10000;
      let slug = `${date}-${slugDigit}`;

      if (tags.length > 0) {
        tags = tags.reduce(tagReducer, {});
      }

      firebase
        .firestore()
        .collection('feed_items')
        .add({
          body: body,
          tags: tags,
          slug: slug,
          item_type: 'quip',
          date: date,
        })
        .then(docRef => {
          console.log('New Quip with ID: ', docRef.id);
          return modalCloseAndReload();
        })
        .catch(err => console.error(err.message));
    }
    event.preventDefault();
  },

  savePic: function(event) {
    const btn = event.target;
    if (btn && btn.matches('#save_pic')) {
      console.log(btn);
    }
    event.preventDefault();
  },

  saveClip: function(event) {
    const btn = event.target;
    if (btn && btn.matches('#save_clip')) {
      let form = document.querySelector('#clip_form');

      let url = form.querySelector('#clip_url').value;
      let date = Date.now();
      let tags = Array.from(form.getElementsByClassName('tag')).map(
        tag => tag.textContent
      );

      if (tags.length > 0) {
        tags = tags.reduce(tagReducer, {});
      }

      firebase
        .firestore()
        .collection('feed_items')
        .add({
          url: url,
          tags: tags,
          item_type: 'clip',
          date: date,
        })
        .then(docRef => {
          console.log('New Clip with ID: ', docRef.id);
          return modalCloseAndReload();
        })
        .catch(err => console.error(err.message));
    }
    event.preventDefault();
  },
};

module.exports = eventHandlers;

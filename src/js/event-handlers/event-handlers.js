const slugify = require('slugify');
const { modalCloseAndReload, reduceTags } = require('../lib/utils');
const ui = require('../ui');
const formViews = require('../views/form-views');

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
    ui.modalContent.innerHTML = formViews[formType]();
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
      const formType = btn.dataset.type;
      const id = btn.dataset.id;

      firebase
        .firestore()
        .collection('feed_items')
        .doc(id)
        .get()
        .then(doc => {
          ui.modalContent.innerHTML = formViews[formType](doc);
          ui.modal.classList.add('is-active');
          return;
        })
        .catch(err => console.error(err.message));
      event.preventDefault();
    }
  },

  openDeleteModal: function(event) {
    const btn = event.target;
    if (btn && btn.matches('.delete-button')) {
      const type = btn.dataset.type;
      const id = btn.dataset.id;
      const filename = btn.dataset.filename;

      ui.modalContent.innerHTML = `
      <div class="message is-info">
        <div class="message-header">
          <p>Are you sure? No take backsies!</p>
        </div>
        <div class="message-body">
        <button class="button is-danger for-real-delete" data-id="${id}" data-type="${type}" data-filename="${filename}">Yup. Delete it.</button>
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
      const type = btn.dataset.type;
      const filename = btn.dataset.filename;

      if (type === 'pic' || type === 'post') {
        firebase
          .storage()
          .ref()
          .child(`${id}/${filename}`)
          .delete()
          .then(() => console.log('File deleted'))
          .catch(err => console.error(err.message));
      }

      if (type === 'clip') {
        firebase
          .firestore()
          .collection('readable')
          .where('clip_id', '==', `${id}`)
          .get()
          .then(snapshot => {
            return snapshot.forEach(doc => {
              firebase
                .firestore()
                .collection('readable')
                .doc(doc.id)
                .delete();
            });
          })
          .then(() => console.log('Clip reference deleted'))
          .catch(err => console.error(err.message));
      }

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
      event.preventDefault();
    }
  },

  savePost: function(event) {
    const btn = event.target;

    if (btn && btn.matches('#save_post')) {
      // Gather variables
      let form = document.querySelector('#post_form');
      let title = form.querySelector('#post_title').value;
      let body = form.querySelector('#post_body').value;
      let summary = form.querySelector('#post_summary').value;
      let alt = form.querySelector('#post_alt').value;
      let date = form.querySelector('#post_date').value;
      let filename = form.querySelector('#post_filename').value;
      let published = form.querySelector('input[name="post_pub"]:checked')
        .value;
      if (published === 'publish') {
        published = true;
      } else {
        published = false;
      }

      let storage = firebase.storage();
      let storageRef = storage.ref();
      let id = firebase
        .firestore()
        .collection('feed_items')
        .doc().id;

      let tags = Array.from(form.getElementsByClassName('tag')).map(
        tag => tag.textContent
      );
      let slug = form.querySelector('#post_slug').value;

      // If empty ID, then new post; else, edit post.
      // CREATE POST
      if (form.querySelector('#post_id').value === '') {
        // File info
        let image = document.querySelector('#pic_image').files[0];
        let fileArr = image.name.toLowerCase().split('.');
        let fileExt = fileArr[fileArr.length - 1];

        date = Date.now();
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: date });
        }

        // Randomize slug to use as index for queries
        let slugDigit = Math.floor(Math.random() * 90000) + 10000;
        slug = slugify(`${title}-${slugDigit}`, {
          remove: /[$*_+~.()'"!,?:@]/g,
        });

        // Slug and filename for pic
        let altSlugged = slugify(`${alt.toLowerCase()}`, {
          remove: /[$*_+~.()'"!,?:@]/g,
        });
        filename = `${altSlugged}.${fileExt}`;

        let picRef = storageRef.child(`${id}/${filename}`);

        // TODO validation
        picRef
          .put(image)
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
                title: title,
                body: body,
                summary: summary,
                tags: tags,
                slug: slug,
                alt: alt,
                published: published,
                item_type: 'post',
                date: date,
              });
          })
          .then(() => {
            console.log('New Post with ID: ', id);
            return modalCloseAndReload();
          })
          .catch(err => console.error(err.message));
      } else {
        // EDIT POST
        let id = form.querySelector('#post_id').value;
        // Keep original post date for tag values
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: +date });
        }
        // File info
        let image = document.querySelector('#pic_image').files[0];

        // If new image file.
        if (image) {
          // Slug and filename for image
          let fileArr = image.name.toLowerCase().split('.');
          let fileExt = fileArr[fileArr.length - 1];
          let altSlugged = slugify(`${alt.toLowerCase()}`, {
            remove: /[$*_+~.()'"!,?:@]/g,
          });
          let newFilename = `${altSlugged}.${fileExt}`;

          // Delete original image
          firebase
            .storage()
            .ref()
            .child(`${id}/${filename}`)
            .delete()
            .then(() => console.log('File deleted'))
            .catch(err => console.error(err.message));

          // Upload new image
          let picRef = storageRef.child(`${id}/${newFilename}`);
          picRef
            .put(image)
            .then(snapshot => {
              console.log('Updated image uploaded');
              return snapshot.ref.getDownloadURL();
            })
            .then(url => {
              console.log('file url: ', url);
              // TODO validation
              // Update firestore document
              return firebase
                .firestore()
                .collection('feed_items')
                .doc(id)
                .update({
                  storage_url: url,
                  filename: newFilename,
                  title: title,
                  body: body,
                  summary: summary,
                  published: published,
                  tags: tags,
                  alt: alt,
                  updated: Date.now(),
                });
            })
            .then(() => {
              console.log(id, ' Updated!');
              return modalCloseAndReload();
            })
            .catch(err => console.error(err.message));
        } else {
          // TODO validation
          // Update firestore document
          firebase
            .firestore()
            .collection('feed_items')
            .doc(id)
            .update({
              title: title,
              body: body,
              summary: summary,
              published: published,
              tags: tags,
              alt: alt,
              updated: Date.now(),
            })
            .then(() => {
              console.log(id, ' Updated!');
              return modalCloseAndReload();
            })
            .catch(err => console.error(err.message));
        }
      }
      event.preventDefault();
    }
  },

  saveQuip: function(event) {
    const btn = event.target;

    if (btn && btn.matches('#save_quip')) {
      let form = document.querySelector('#quip_form');
      let body = form.querySelector('#quip_body').value;
      let tags = Array.from(form.getElementsByClassName('tag')).map(
        tag => tag.textContent
      );
      let date = form.querySelector('#quip_date').value;
      let published = form.querySelector('input[name="quip_pub"]:checked')
        .value;
      if (published === 'publish') {
        published = true;
      } else {
        published = false;
      }

      if (form.querySelector('#quip_id').value === '') {
        // CREATE QUIP
        date = Date.now();
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: date });
        }
        let slugDigit = Math.floor(Math.random() * 90000) + 10000;
        let slug = `${date}-${slugDigit}`;

        // TODO validation
        firebase
          .firestore()
          .collection('feed_items')
          .add({
            body: body,
            tags: tags,
            slug: slug,
            published: published,
            item_type: 'quip',
            date: date,
          })
          .then(docRef => {
            console.log('New Quip with ID: ', docRef.id);
            return modalCloseAndReload();
          })
          .catch(err => console.error(err.message));
      } else {
        // EDIT QUIP
        let id = form.querySelector('#quip_id').value;
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: +date });
        }
        // TODO validation
        firebase
          .firestore()
          .collection('feed_items')
          .doc(id)
          .update({
            body: body,
            tags: tags,
            published: published,
            updated: Date.now(),
          })
          .then(() => {
            console.log(id, ' Updated!');
            return modalCloseAndReload();
          })
          .catch(err => console.error(err.message));
      }
      event.preventDefault();
    }
  },

  savePic: function(event) {
    const btn = event.target;

    if (btn && btn.matches('#save_pic')) {
      // Form variables
      let form = document.querySelector('#pic_form');
      let body = form.querySelector('#pic_body').value;
      let alt = form.querySelector('#pic_alt').value;
      let tags = Array.from(form.getElementsByClassName('tag')).map(
        tag => tag.textContent
      );
      let date = form.querySelector('#pic_date').value;
      let filename = form.querySelector('#pic_filename').value;
      let published = form.querySelector('input[name="pic_pub"]:checked').value;
      if (published === 'publish') {
        published = true;
      } else {
        published = false;
      }

      let storage = firebase.storage();
      let storageRef = storage.ref();
      let id = firebase
        .firestore()
        .collection('feed_items')
        .doc().id;

      if (form.querySelector('#pic_id').value === '') {
        // CREATE PIC
        // File info
        let image = document.querySelector('#pic_image').files[0];
        let fileArr = image.name.toLowerCase().split('.');
        let fileExt = fileArr[fileArr.length - 1];

        // Rewrite scripted variables for new item
        date = Date.now();
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: date });
        }

        // Slug and filename for pic
        let altSlugged = slugify(`${alt.toLowerCase()}`, {
          remove: /[$*_+~.()'"!,?:@]/g,
        });
        filename = `${altSlugged}.${fileExt}`;

        let slugDigit = Math.floor(Math.random() * 90000) + 10000;
        let slug = `${date}-${slugDigit}`;

        let picRef = storageRef.child(`${id}/${filename}`);

        picRef
          .put(image)
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
                tags: tags,
                slug: slug,
                alt: alt,
                published: published,
                item_type: 'pic',
                date: date,
              });
          })
          .then(() => {
            console.log('New Pic with ID: ', id);
            return modalCloseAndReload();
          })
          .catch(err => console.error(err.message));
      } else {
        // EDIT PIC
        id = form.querySelector('#pic_id').value;
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: +date });
        }
        // File info
        let image = document.querySelector('#pic_image').files[0];

        // If new image file.
        if (image) {
          // Slug and filename for pic
          let fileArr = image.name.toLowerCase().split('.');
          let fileExt = fileArr[fileArr.length - 1];
          let altSlugged = slugify(`${alt}`, {
            remove: /[$*_+~.()'"!,?:@]/g,
          });
          let newFilename = `${altSlugged}.${fileExt}`;

          // Delete original picture
          firebase
            .storage()
            .ref()
            .child(`${id}/${filename}`)
            .delete()
            .then(() => console.log('File deleted'))
            .catch(err => console.error(err.message));

          // Upload new image
          let picRef = storageRef.child(`${id}/${newFilename}`);
          picRef
            .put(image)
            .then(snapshot => {
              console.log('Updated pic uploaded');
              return snapshot.ref.getDownloadURL();
            })
            .then(url => {
              console.log('file url: ', url);
              // TODO validation
              // Update firestore document
              return firebase
                .firestore()
                .collection('feed_items')
                .doc(id)
                .update({
                  storage_url: url,
                  filename: filename,
                  body: body,
                  tags: tags,
                  alt: alt,
                  published: published,
                  updated: Date.now(),
                });
            })
            .then(() => {
              console.log('Updated Pic for ID: ', id);
              return modalCloseAndReload();
            })
            .catch(err => console.error(err.message));
        } else {
          // TODO validation
          // Update firestore document
          firebase
            .firestore()
            .collection('feed_items')
            .doc(id)
            .update({
              body: body,
              tags: tags,
              alt: alt,
              published: published,
              updated: Date.now(),
            })
            .then(() => {
              console.log(id, ' Updated!');
              return modalCloseAndReload();
            })
            .catch(err => console.error(err.message));
        }
      }
      event.preventDefault();
    }
  },

  previewPic: function(event) {
    const input = event.target;

    if (input && input.matches('#pic_image')) {
      let imageFile = input.files[0];
      let fileName = imageFile.name;
      let picSrc = window.URL.createObjectURL(imageFile);

      let previewDiv = document.querySelector('#pic_preview');
      previewDiv.innerHTML = `
        <div class="box">
          <p>
            <img class="is-square" src="${picSrc}" alt="${fileName}">
          </p>
          <p>
            <button id="pic_reset" class="button is-danger">Replace image</button>
          </p>
        </div>
      `;
      let picContainer = document.querySelector('#pic_container');
      picContainer.classList.add('is-invisible');
      picContainer.style.position = 'absolute';
    }
  },

  resetPic: function(event) {
    const btn = event.target;

    if (btn && btn.matches('#pic_reset')) {
      btn.parentNode.removeChild(btn);
      let picContainer = document.querySelector('#pic_container');
      let picField = `
        <input type="file" name="image" id="pic_image" class="file-input" required>
        <span class="file-cta">
          <span class="file-icon">
            <i class="fa fa-upload"></i>
          </span>
          <span class="file-label">
            Add Image...
          </span>
        </span>
      `;
      picContainer.innerHTML = picField;
      picContainer.classList.remove('is-invisible');
      picContainer.style.position = 'static';
      let previewDiv = document.querySelector('#pic_preview');
      previewDiv.innerHTML = '';

      event.preventDefault();
    }
  },

  saveClip: function(event) {
    const btn = event.target;
    if (btn && btn.matches('#save_clip')) {
      let form = document.querySelector('#clip_form');
      let url = form.querySelector('#clip_url').value;
      let body = form.querySelector('#clip_body').value;
      let tags = Array.from(form.getElementsByClassName('tag')).map(
        tag => tag.textContent
      );
      let date = form.querySelector('#clip_date').value;
      let slug = form.querySelector('#clip_slug').value;
      let published = form.querySelector('input[name="clip_pub"]:checked')
        .value;
      if (published === 'publish') {
        published = true;
      } else {
        published = false;
      }

      if (form.querySelector('#clip_id').value === '') {
        date = Date.now();
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: date });
        }

        firebase
          .firestore()
          .collection('feed_items')
          .add({
            url: url,
            body: body,
            tags: tags,
            published: published,
            item_type: 'clip',
            date: date,
          })
          .then(docRef => {
            console.log('New Clip with ID: ', docRef.id);
            return modalCloseAndReload();
          })
          .catch(err => console.error(err.message));
      } else {
        // EDIT CLIP
        let id = form.querySelector('#clip_id').value;
        let title = form.querySelector('#clip_title').value;
        let body = form.querySelector('#clip_body').value;
        // Keep original post date for tag values
        if (tags.length > 0) {
          tags = reduceTags(tags, { date: +date });
        }
        // TODO validation
        firebase
          .firestore()
          .collection('feed_items')
          .doc(id)
          .update({
            title: title,
            body: body,
            tags: tags,
            slug: slug,
            published: published,
            updated: Date.now(),
          })
          .then(() => {
            console.log(id, ' Updated!');
            return modalCloseAndReload();
          })
          .catch(err => console.error(err.message));
      }
      event.preventDefault();
    }
  },
};

module.exports = eventHandlers;

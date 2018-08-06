const formViews = {
  post: function(data = false) {
    let formTitle = data ? 'Edit Post' : 'New Post';
    let id = data ? data.id : '';
    let title = data ? data.data().title : '';
    let body = data ? data.data().body : '';
    let date = data ? data.data().date : '';
    let slug = data ? data.data().slug : '';
    let tags = data ? Object.keys(data.data().tags) : '';
    let tagGroup = '';
    if (tags.length > 0) {
      tags.forEach(tag => {
        tagGroup += `
          <span class="tag is-dark">${tag}<button class="delete is-small"></button></span>
        `;
      });
    }

    return `
      <!-- POST FORM -->
      <div class="modal-card-head">
        <h3 class="modal-card-title is-3">${formTitle}</h3>
      </div>
      <div class="modal-card-body">
        <form id="post_form" class="form">
          <div class="field">
            <label for="title" class="label">Title</label>
            <div class="control">
              <input type="text" value="${title}" class="input is-primary" name="title" id="post_title" required>
            </div>
          </div>
          <div class="field">
            <label for="body" class="label">Body</label>
            <textarea class="textarea is-primary" name="body" id="post_body" required>${body}</textarea>
          </div>
          <div class="field">
            <label for="tags" class="label">Tags</label>
            <div class="control">
              <input type="text" class="input is-primary form-tags" name="tags" id="post_tags">
              <p class="tags help">${tagGroup}</p>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button id="save_post" class="button is-primary" type="submit">Save Post</button>
            </div>
          </div>
          <input type="hidden" id="post_id" value="${id}">
          <input type="hidden" id="post_date" value="${date}">
          <input type="hidden" id="post_slug" value="${slug}">
        </form>
      </div>
    `;
  },
  quip: function(data = false) {
    let formTitle = data ? 'Edit Quip' : 'New Quip';
    let id = data ? data.id : '';
    let body = data ? data.data().body : '';
    let date = data ? data.data().date : '';
    let slug = data ? data.data().slug : '';
    let tags = data ? Object.keys(data.data().tags) : '';
    let tagGroup = '';
    if (tags.length > 0) {
      tags.forEach(tag => {
        tagGroup += `
          <span class="tag is-dark">${tag}<button class="delete is-small"></button></span>
        `;
      });
    }

    return `
      <!-- QUIP FORM -->
      <div class="modal-card-head">
        <h3 class="modal-card-title is-3">${formTitle}</h3>
      </div>
      <div class="modal-card-body">
        <form id="quip_form" class="form">
          <div class="field">
            <label for="body" class="label">Body</label>
            <div class="control">
              <textarea class="textarea is-primary" name="body" id="quip_body" required>${body}</textarea>
            </div>
          </div>
          <div class="field">
            <label for="tags" class="label">Tags</label>
            <div class="control">
              <input type="text" class="input is-primary form-tags" name="tags" id="quip_tags">
              <p class="tags help">${tagGroup}</p>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button id="save_quip" class="button is-primary" type="submit">Save Quip</button>
            </div>
          </div>
          <input type="hidden" id="quip_id" value="${id}">
          <input type="hidden" id="quip_date" value="${date}">
          <input type="hidden" id="quip_slug" value="${slug}">
        </form>
      </div>
    `;
  },
  pic: function(data = false) {
    let formTitle = data ? 'Edit Pic' : 'New Pic';
    let id = data ? data.id : '';
    let body = data ? data.data().body : '';
    let date = data ? data.data().date : '';
    let slug = data ? data.data().slug : '';
    let tags = data ? Object.keys(data.data().tags) : '';
    let storage_url = data ? data.data().storage_url : '';
    let filename = data ? data.data().filename : '';

    let tagGroup = '';
    if (tags.length > 0) {
      tags.forEach(tag => {
        tagGroup += `
          <span class="tag is-dark">${tag}<button class="delete is-small"></button></span>
        `;
      });
    }

    let imgPreview = '';
    let hideToggle = '';
    if (data) {
      hideToggle = 'is-invisible';

      imgPreview = `
        <div class="box">
          <p>
            <img src="${storage_url}">
          </p>
          <p>
            <button class="button is-danger" id="pic_replace">Replace image</button>
          </p>
        </div>
      `;
    }

    return `
      <!-- PIC FORM -->
      <div class="modal-card-head">
        <h3 class="modal-card-title is-3">${formTitle}</h3>
      </div>
      <div class="modal-card-body">
        <div id="pic_preview">${imgPreview}</div>
        <form id="pic_form" class="form" method="post" enctype="multipart/form-data">
          <div class="field" id="pic_field">
            <div class="control">
              <div class="file">
                <label class="label ${hideToggle}" id="pic_container">
                  <input type="file" name="image" id="pic_image" class="file-input" required>
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fa fa-upload"></i>
                    </span>
                    <span class="file-label">
                      Add Image...
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div class="field">
            <label for="body" class="label">Body</label>
            <div class="control">
              <textarea name="body" id="pic_body" class="textarea is-primary" required>${body}</textarea>
            </div>
          </div>
          <div class="field">
            <label for="tags" class="label">Tags</label>
            <div class="control">
              <input type="text" class="input is-primary form-tags" name="tags" id="pic_tags">
              <p class="tags help">${tagGroup}</p>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button id="save_pic" class="button is-primary">Save Pic</button>
            </div>
          </div>
          <input type="hidden" id="pic_id" value="${id}">
          <input type="hidden" id="pic_date" value="${date}">
          <input type="hidden" id="pic_slug" value="${slug}">
          <input type="hidden" id="pic_filename" value="${filename}">
        </form>
      </div>
    `;
  },
  clip: function(data = false) {
    // Can edit different fields than can create initially. Hence the weird logic.
    let formTitle = data ? 'Edit Clip' : 'New Clip';
    let id = data ? data.id : '';
    let title = data ? data.data().title : '';
    let body = data ? data.data().body : '';
    let date = data ? data.data().date : '';
    let slug = data ? data.data().slug : '';
    let tags = data ? Object.keys(data.data().tags) : '';
    let tagGroup = '';
    if (tags.length > 0) {
      tags.forEach(tag => {
        tagGroup += `
          <span class="tag is-dark">${tag}<button class="delete is-small"></button></span>
        `;
      });
    }

    let fields;
    let urlDisplay = '';
    if (data) {
      let url = data.data().url;
      urlDisplay = `<div class="box">
        <p class="subtitle is-6 has-text-grey is-italic"><a href="${url}" target="_blank" id="link-test">${url} <i class="fa fa-external-link"></i></a></p>
      </div>`;

      fields = `
        <div class="field">
          <label for="title" class="label">Title</label>
          <div class="control">
            <input value="${title}" type="text" name="title" id="clip_title" class="input is-primary" required>
          </div>
        </div>
        <div class="field">
          <label for="body" class="label">Body</label>
          <div class="control">
            <textarea class="textarea is-primary" name="body" id="clip_body" required>${body}</textarea>
          </div>
        </div>
        <input type="hidden" id="clip_url" value="${url}">
      `;
    } else {
      fields = `
        <div class="field">
          <label for="url" class="label">URL</label>
          <div class="control">
            <input type="text" name="url" id="clip_url" class="input is-primary" required>
          </div>
        </div>
      `;
    }

    return `
      <!-- CLIP FORM -->
      <div class="modal-card-head">
        <h3 class="modal-card-title is-3">${formTitle}</h3>
      </div>
      <div class="modal-card-body">
        ${urlDisplay}
        <form id="clip_form" class="form">
          ${fields}
          <div class="field">
            <label for="tags" class="label">Tags</label>
            <div class="control">
              <input type="text" class="input is-primary form-tags" name="tags" id="clip_tags">
              <p class="tags help">${tagGroup}</p>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button id="save_clip" class="button is-primary" type="submit">Save Clip</button>
            </div>
          </div>
          <input type="hidden" id="clip_id" value="${id}">
          <input type="hidden" id="clip_date" value="${date}">
          <input type="hidden" id="clip_slug" value="${slug}">
        </form>
      </div>
    `;
  },
};

module.exports = formViews;

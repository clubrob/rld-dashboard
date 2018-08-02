const formViews = {
  post: `
    <!-- POST FORM -->
    <div class="modal-card-head">
      <h3 class="modal-card-title is-3">New Post</h3>
    </div>
    <div class="modal-card-body">
      <form id="post_form" class="form">
        <div class="field">
          <label for="title" class="label">Title</label>
          <div class="control">
            <input type="text" class="input is-primary" name="title" id="post_title">
          </div>
        </div>
        <div class="field">
          <label for="body" class="label">Body</label>
          <textarea class="textarea is-primary" name="body" id="post_body"></textarea>
        </div>
        <div class="field">
          <label for="tags" class="label">Tags</label>
          <div class="control">
            <input type="text" class="input is-primary form-tags" name="tags" id="post_tags">
            <p class="tags help"></p>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-primary" type="submit">Save Post</button>
          </div>
        </div>
      </form>
    </div>
  `,
  quip: `
    <!-- QUIP FORM -->
    <div class="modal-card-head">
      <h3 class="modal-card-title is-3">New Quip</h3>
    </div>
    <div class="modal-card-body">
      <form id="quip_form" class="form">
        <div class="field">
          <label for="body" class="label">Body</label>
          <div class="control">
            <textarea class="textarea is-primary" name="body" id="quip_body"></textarea>
          </div>
        </div>
        <div class="field">
          <label for="tags" class="label">Tags</label>
          <div class="control">
            <input type="text" class="input is-primary form-tags" name="tags" id="quip_tags">
            <p class="tags help"></p>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-primary" type="submit">Save Quip</button>
          </div>
        </div>
      </form>
    </div>
  `,
  pic: `
    <!-- PIC FORM -->
    <div class="modal-card-head">
      <h3 class="modal-card-title is-3">New Pic</h3>
    </div>
    <div class="modal-card-body">
      <form id="pic_form" class="form" enctype="multipart/form-data">
        <div class="field">
          <div class="control">
            <div class="file">
              <label class="label">
                <input type="file" name="image" id="pic_image" class="file-input">
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
            <textarea name="body" id="pic_body" class="textarea is-primary"></textarea>
          </div>
        </div>
        <div class="field">
          <label for="tags" class="label">Tags</label>
          <div class="control">
            <input type="text" class="input is-primary form-tags" name="tags" id="pic_tags">
            <p class="tags help"></p>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-primary" type="submit">Save Pic</button>
          </div>
        </div>
        <input type="hidden" name="item_type" value="pic">
      </form>
    </div>
  `,
  clip: `
    <!-- CLIP FORM -->
    <div class="modal-card-head">
      <h3 class="modal-card-title is-3">New Clip</h3>
    </div>
    <div class="modal-card-body">
      <form id="clip_form" class="form">
        <div class="field">
          <label for="url" class="label">URL</label>
          <div class="control">
            <input type="text" name="url" id="clip_url" class="input is-primary">
          </div>
        </div>
        <div class="field">
          <label for="tags" class="label">Tags</label>
          <div class="control">
            <input type="text" class="input is-primary form-tags" name="tags" id="clip_tags">
            <p class="tags help"></p>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-primary" type="submit">Save Clip</button>
          </div>
        </div>
        <input type="hidden" name="item_type" value="clip">
      </form>
    </div>
  `,
};

module.exports = formViews;

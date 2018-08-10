const dashViews = {
  dashTable: function(data) {
    let html = '';
    data.forEach(doc => {
      let item =
        '<span class="has-text-info is-italic has-text-weight-bold">Clip, refresh for title</span>';
      let filename = '';
      if (doc.data().body) {
        item = doc.data().body.substring(0, 50);
      }
      if (doc.data().title) {
        item = doc.data().title;
      }
      if (doc.data().filename) {
        filename = doc.data().filename;
      }
      const date = new Date(doc.data().date).toLocaleString();
      const type = doc.data().item_type;
      const id = doc.id;

      html += `
        <tr>
          <td>${item}</td>
          <td><span class="is-size-7">${date}</span></td>
          <td><span class="tag is-info is-uppercase content-type">${type}</span></td>
          <td style="white-space: nowrap;">
            <a href="#" class="button is-success edit-button" data-type="${type}" data-id="${id}" data-filename="${filename}">
              Edit
            </a>
            <a href="#" class="button is-danger delete-button" data-type="${type}" data-id="${id}" data-filename="${filename}">
              Delete
            </a>
          </td>
        </tr>
      `;
    });
    return html;
  },
};

module.exports = dashViews;

const dashViews = {
  dashTable: function(data) {
    let html = '';
    data.forEach(doc => {
      let item = 'Clip, refresh for title';
      if (doc.data().body) {
        item = doc.data().body.substring(0, 50);
      }
      if (doc.data().title) {
        item = doc.data().title;
      }
      const date = new Date(doc.data().date).toLocaleString();
      const type = doc.data().item_type;
      const id = doc.id;

      html += `
        <tr>
          <td>${item}</td>
          <td><span class="is-size-7">${date}</span></td>
          <td><span class="tag is-info is-uppercase">${type}</span></td>
          <td>
            <a href="edit_${id}" class="button is-success edit-button">
              Edit
            </a>
            <a href="delete_${id}" class="button is-danger delete-button">
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

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
admin.firestore().settings({ timestampsInSnapshots: true });

const express = require('express');
const rp = require('request-promise');
const cheerio = require('cheerio');
const slugify = require('slugify');
const cors = require('cors')({ origin: true });
const { check, validationResult } = require('express-validator/check');

const app = express();

// For cross origin resource sharing
app.use(cors);

//Routes... all routes protected
// GET one item
app.get(
  '/feed/:slug',
  [
    // Validate slug
    check('slug').matches(/^[a-zA-Z0-9-_]+$/),
  ],
  (req, res) => {
    // Return input validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Firestore collection
    const collectionRef = admin.firestore().collection('feed_items');
    const query = collectionRef.where('slug', '==', req.params.slug);

    return query
      .get()
      .then(querySnapshot => {
        let results = [];
        if (querySnapshot.size > 0) {
          querySnapshot.forEach(doc => {
            results.push(doc.data());
          });
          return res.json(results);
        }
        return res.send('No such document');
      })
      .catch(err => {
        console.error('Document not found: ', err.message);
        return res.send('Document not found');
      });
  }
);

// GET 20 items
// TODO Pagination
app.get('/feed', (req, res) => {
  const collectionRef = admin.firestore().collection('feed_items');
  const query = collectionRef.orderBy('date', 'desc').limit(20);

  return query
    .get()
    .then(querySnapshot => {
      let results = [];
      querySnapshot.forEach(doc => {
        results.push(doc.data());
      });
      return res.json(results);
    })
    .catch(err => {
      console.error('Error getting documents: ', err);
      return res.send('Error getting documents');
    });
});

// GET latest POST for home page
app.get('/latest-post', (req, res) => {
  const collectionRef = admin.firestore().collection('feed_items');
  const query = collectionRef
    .where('item_type', '=', 'post')
    .orderBy('date', 'desc')
    .limit(1);

  return query
    .get()
    .then(querySnapshot => {
      let results = [];
      querySnapshot.forEach(doc => {
        results.push(doc.data());
      });
      return res.json(results);
    })
    .catch(err => {
      console.error('Error getting documents: ', err);
      return res.send('Error getting documents');
    });
});

// GET tag item list
// TODO Pagination
app.get('/tag/:tag', [check('tag').isAlphanumeric()], (req, res) => {
  // Return input validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const tag = req.params.tag;
  console.log(tag);
  const collectionRef = admin.firestore().collection('feed_items');
  const query = collectionRef
    .where(`tags.${tag}`, '>', 0)
    .orderBy(`tags.${tag}`);

  return query
    .get()
    .then(querySnapshot => {
      let results = [];
      if (querySnapshot.size > 0) {
        querySnapshot.forEach(doc => {
          results.push(doc.data());
        });
        return res.json(results);
      }
      return res.send(results);
    })
    .catch(err => {
      console.error('Document not found: ', err.message);
      return res.send('Document not found');
    });
});

// GET item type list
app.get('/category/:type', [check('type').isAlphanumeric()], (req, res) => {
  const collectionRef = admin.firestore().collection('feed_items');
  const type = req.params.type;

  const query = collectionRef
    .where(`item_type`, '=', type)
    .orderBy(`date`, 'desc');

  return query
    .get()
    .then(querySnapshot => {
      let results = [];
      if (querySnapshot.size > 0) {
        querySnapshot.forEach(doc => {
          results.push(doc.data());
        });
        return res.json(results);
      }
      return res.send('No such document');
    })
    .catch(err => {
      console.error('Document not found: ', err.message);
      return res.send('Document not found');
    });
});

// HTTPS function
exports.rldesign = functions.https.onRequest(app);

// Trigger functions
// Simple web scraping function
exports.scrapeClip = functions.firestore
  .document('/feed_items/{documentId}')
  .onCreate(function scraper(snapshot, context) {
    if (snapshot.data().item_type === 'clip') {
      const url = snapshot.data().url;
      return rp(url)
        .then(page => {
          const $ = cheerio.load(page); // Cheerio for DOM parsing
          const jsonProps = {};
          // Check for open graph title, then meta title, then page title
          jsonProps.pageTitle =
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="title"]').attr('content') ||
            $('title').text() ||
            'No Title';
          // Check for open graph description, then meta description
          jsonProps.pageSummary =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            'No Summary';
          jsonProps.pageUrl = url;

          return jsonProps;
        })
        .then(jsonProps => {
          // Add random five-digit number so slugs are unique IDs
          const slugDigit = Math.floor(Math.random() * 90000) + 10000;
          const clipProps = {
            title: jsonProps.pageTitle,
            summary: jsonProps.pageSummary,
            slug: slugify(`${jsonProps.pageTitle}-${slugDigit}`, {
              remove: /[$*_+~.()'"!,?:@]/g,
            }),
          };
          console.log('Updating... ', context.params.documentId);
          return snapshot.ref.set(
            {
              title: clipProps.title,
              body: clipProps.summary,
              slug: clipProps.slug,
            },
            { merge: true }
          );
        })
        .then(res => console.log('Added additional properties: ', res))
        .catch(err => console.error(err.message));
    } else {
      return 'Not a clip';
    }
  });

// Adding readable text from Mercury Reader API
exports.saveReadable = functions.firestore
  .document('/feed_items/{documentId}')
  .onCreate(function readable(snapshot, context) {
    if (snapshot.data().item_type === 'clip') {
      const id = snapshot.id;
      const url = snapshot.data().url;
      const rpOptions = {
        uri: `https://mercury.postlight.com/parser?url=${url}`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': functions.config().mercuryreader.key,
        },
        json: true,
      };

      console.log('Updating... ', context.params.documentId);
      return rp(rpOptions)
        .then(data => {
          return data;
        })
        .then(data => {
          return admin
            .firestore()
            .collection('readable')
            .add({
              clip_id: id,
              readable: data.content,
            });
        })
        .then(res => console.log('Added reader-friendly content: ', res))
        .catch(err => console.error(err.message));
    } else {
      return 'Not a clip';
    }
  });

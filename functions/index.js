const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const rp = require('request-promise');
const cheerio = require('cheerio');
const slugify = require('slugify');
const cors = require('cors')({ origin: true });
const { check, validationResult } = require('express-validator/check');

const app = express();

// Firebase token auth middleware function to protect routes
function authorizeMe(req, res, next) {
  let idToken;
  // Grab token from POST header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1];
    // Firebase function to verify token
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(decoded => decoded)
      .then(() => next())
      .catch(err => {
        console.error(err.message);
        res.status(403).send('Unauthorized');
      });
  } else {
    res.status(403).send('Not Allowed');
  }
}

// For cross origin resource sharing
app.use(cors);

//Routes... all routes protected
// GET one item
app.get(
  '/feed/:slug',
  authorizeMe,
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
    const collectionRef = admin.firestore().collection('feed');
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

// GET all items
app.get('/feed', authorizeMe, (req, res) => {
  const collectionRef = admin.firestore().collection('feed');
  const query = collectionRef.orderBy('date');

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

// GET tag list
app.get(
  '/tag/:tag',
  authorizeMe,
  [check('tag').isAlphanumeric()],
  (req, res) => {
    // Return input validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const tag = req.params.tag;
    const collectionRef = admin.firestore().collection('feed');
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
        return res.send('No such document');
      })
      .catch(err => {
        console.error('Document not found: ', err.message);
        return res.send('Document not found');
      });
  }
);

// GET post type list
/* app.get('/featured', (req, res) => {
  const collectionRef = admin.firestore().collection('feed');
  const query = collectionRef.where(`item_type`, '=', 0).orderBy(`tags.featured`, 'desc').limit(3);

  return query.get()
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
}); */

// Post create pic
app.post('/pic', function createPic(req, res) {
  // Convert tags array to object. For querying in Firestore.
  // Reducer function for array to obj.
  var tagReducer = function(tagObj, tag) {
    if (!tagObj[tag]) {
      // Skip duplicate tags
      tagObj[tag] = Date.now();
    }
    return tagObj;
  };
  var tags = {};
  if (req.body.tags.length > 0) {
    tags = req.body.tags.reduce(tagReducer, {});
  }
  // Set Date
  var date = Date.now();
  // Create empty item to associate image URI
  var newItemId = admin
    .firestore()
    .collection('feed_items')
    .doc().id;

  var filename = 'temp.jpg';

  var picRef = admin.storage().ref(`${newItemId}/${filename}`);

  return picRef
    .put(req.body.image)
    .then(snapshot => {
      console.log('new pic uploaded');
      return snapshot.ref.getDownloadURL();
    })
    .then(url => {
      console.log('file url: ', url);
      return url;
    })
    .then(url => {
      return admin
        .firestore()
        .collection('feed_items')
        .doc(newItemId)
        .update({
          storage_uri: url,
          body: req.body.body,
          tags: tags,
          item_type: req.body.item_type,
          date: date,
        });
    })
    .catch(err => console.error(err.message));
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
          return snapshot.ref.set(
            {
              readable: data.content,
            },
            { merge: true }
          );
        })
        .then(res => console.log('Added reader-friendly content: ', res))
        .catch(err => console.error(err.message));
    } else {
      return 'Not a clip';
    }
  });

// TODO dedupe tags after update

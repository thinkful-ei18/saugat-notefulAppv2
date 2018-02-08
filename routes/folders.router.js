'use strict';

const express = require('express');
const knex = require('../knex');

const router = express.Router();


router.get('/folders', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(next);
});

router.get('/folders/:id', (req, res, next) => {
  const folderId = req.params.id;
  knex('folders')
    .where({ id: `${folderId}` })
    .then(results => {
      res.json(results);
    })
    .catch(next);

});

router.get('/folders/:id/notes/', (req, res, next) => {
  const folderId = req.params.id;
  knex('notes')
    .where({ folder_id: folderId })
    .then(results => {
      res.json(results);
    })
    .catch(next);

});


router.put('/folders/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
 
  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .where({ id: `${noteId}` })
    .update(updateObj)
    .then(result => res.json(result))
    .catch(err => next(err));

  /*
  notes.update(noteId, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */
});



router.post('/folders', (req, res, next) => {
  const {name} = req.body; // Add `folder_id`
  /*
  REMOVED FOR BREVITY
  */
  const newItem = {
    name
  };
  // Insert new note, instead of returning all the fields, just return the new `id`
  knex('folders')
    .insert(newItem)
    .returning(['name'])
    .then(result => res.json(result))
    .catch(err => next(err));
});

router.delete('/folders/:id', (req, res, next) => {
  const folderId = req.params.id;

  knex('folders')
    .where('id', folderId)
    .del()
    .then(() => res.status(204).end())
    .catch(err => next(err));

});



module.exports = router;


'use strict';

const express = require('express');
const knex = require('../knex');
const {UNIQUE_VIOLATION} = require('pg-error-constants')
// Create an router instance (aka "mini-app")
const router = express.Router();

router.get('/tags', (req, res, next) => {
  const { searchTerm } = req.query;

  if (searchTerm) {
    knex('tags')
      .select()
      .where('name', 'like', `%${searchTerm}%`)
      .then(result => res.json(result))
      .catch(err => next(err));
  }
  else {

    knex('tags')
      .select()
      .then(result => res.json(result))
      .catch(err => next(err));
    // }

  }
});

router.get('/tags/:id', (req, res, next) => {
  const tagId = req.params.id;

  knex('tags')
    .where({ id: tagId })
    .first()
    .then(result => res.json(result))
    .catch(err => next(err));
});


router.post('/tags', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }


  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === UNIQUE_VIOLATION && err.constraint === 'tags_name_key') {
        err = new Error('Tags name is already taken');
        err.status = 409;
      }
      next(err);
    });
});

router.put('/tags/:id', (req, res, next) => {
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
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .where({ id: `${noteId}` })
    .update(updateObj)
    .then(result => res.json(result))
    .catch(err => next(err));

});



module.exports = router;
'use strict';

const express = require('express');
const router = express.Router();

const knex = require('../knex');
const { UNIQUE_VIOLATION } = require('pg-error-constants');


router.get('/tags', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(next);
});

router.get('/tags/:id', (req, res, next) => {
  knex.select('id', 'name')
    .where('id', req.params.id)
    .from('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
});


router.post('/tags', (req, res, next) => {
  const { name } = req.body;


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
  const { name } = req.body;


  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = { name };

  knex('tags')
    .update(updateItem)
    .where('id', req.params.id)
    .returning(['id', 'name'])
    .then(([result]) => {
      if (result) {
        res.json(result);
      } else {
        next(); 
      }
    })
    .catch(err => {
      if (err.code === UNIQUE_VIOLATION && err.constraint === 'tags_name_key') {
        err = new Error('Tags name is already taken');
        err.status = 409;
      } 
      next(err);
    });
});


router.delete('/tags/:id', (req, res, next) => {
  knex.del()
    .where('id', req.params.id)
    .from('tags')
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next(); 
      }
    })
    .catch(next);
});

module.exports = router;

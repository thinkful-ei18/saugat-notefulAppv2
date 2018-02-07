'use strict';
const knex = require('../knex');

// knex.select().from('notes').then(res => console.log(res));

knex.select().from('notes').then(res => console.log(res));



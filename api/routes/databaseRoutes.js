'use strict';

module.exports = function(app) {
  const controller = require('../controllers/databaseController');

  app.route('/query')
    .post(controller.query);

  app.route('/:table')
    .get(controller.check, controller.list);

};

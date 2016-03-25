var dbc = require('epochtalk-core-pg')({ conString: process.env.DATABASE_URL });
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  return db.sqlQuery('SELECT id, name, description, viewable_by, created_at, updated_at, imported_at from boards')
  .then(helper.slugify);
};

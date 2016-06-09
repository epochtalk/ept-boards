var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(board) {
  board = helper.deslugify(board);
  var q, params;
  return using(db.createTransaction(), function(client){
    // insert new board
    q = 'INSERT INTO boards(name, description, viewable_by, postable_by, created_at) VALUES($1, $2, $3, $4, now()) RETURNING id';
    params = [board.name, board.description, board.viewable_by || null, board.postable_by || null];
    return client.queryAsync(q, params)
    .then(function(results) { console.log(results); board.id = results.rows[0].id; })
    // insert new board metadata
    .then(function() {
      q = 'INSERT INTO metadata.boards (board_id) VALUES ($1)';
      return client.queryAsync(q, [board.id]);
    });
  })
  .then(function() { return helper.slugify(board); });
};

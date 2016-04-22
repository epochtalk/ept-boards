var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var common = require(path.normalize(__dirname + '/../common'));
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var NotFoundError = Promise.OperationalError;

module.exports = function(id) {
  id = helper.deslugify(id);

  // get board with given id
  var q = 'SELECT b.id, b.name, b.description, b.viewable_by, b.created_at, b.thread_count, b.post_count, b.updated_at, b.imported_at, (SELECT bm.parent_id FROM board_mapping bm WHERE bm.board_id = b.id) as parent_id, (SELECT json_agg(row_to_json((SELECT x FROM ( SELECT bm.user_id as id, u.username as username) x ))) as moderators from board_moderators bm LEFT JOIN users u ON bm.user_id = u.id WHERE bm.board_id = b.id) as moderators FROM boards b WHERE b.id = $1;';
  return db.sqlQuery(q, [id])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { throw new NotFoundError('Board Not Found'); }
  })
  // append child boards
  .then(function(board) {
    // get all boards (inefficient) TODO: make effiecient
    var q = `SELECT * FROM (
      SELECT
        b.id,
        b.name,
        b.description,
        b.viewable_by,
        b.thread_count,
        b.post_count,
        b.created_at,
        b.updated_at,
        b.imported_at,
        mb.last_thread_id,
        bm.parent_id,
        bm.category_id,
        bm.view_order
      FROM board_mapping bm
      LEFT JOIN boards b ON bm.board_id = b.id
      LEFT JOIN metadata.boards mb ON b.id = mb.board_id
    ) blist
    LEFT JOIN LATERAL (
      SELECT pf.title as last_thread_title
      FROM posts pf
      WHERE pf.thread_id = blist.last_thread_id
      ORDER BY pf.created_at
      LIMIT 1
    ) pfirst ON true
    LEFT JOIN LATERAL (
      SELECT
        pl.deleted as post_deleted,
        pl.created_at as last_post_created_at,
        pl.position as last_post_position,
        u.username as last_post_username,
        u.id as user_id,
        u.deleted as user_deleted
      FROM posts pl
      LEFT JOIN users u ON pl.user_id = u.id
      WHERE blist.last_thread_id = pl.thread_id
      ORDER BY pl.created_at DESC
      LIMIT 1
    ) plast ON true
    LEFT JOIN LATERAL (
      SELECT json_agg(
        row_to_json(
          (SELECT x FROM ( SELECT bm.user_id as id, u.username as username) x )
        )
      ) as moderators
      FROM board_moderators bm
      LEFT JOIN users u ON bm.user_id = u.id
      WHERE bm.board_id = blist.id
    ) mods on true;`;
    return db.sqlQuery(q)
    // append all children board from all boards
    .then(function(boardMapping) {
      // get all children boards for this board
      board.children = _.filter(boardMapping, function(boardMap) {
        return boardMap.parent_id === board.id;
      });

      // sort all children boards by view_order
      board.children = _.sortBy(board.children, 'view_order');

      // handle deleted content for all children boards
      board.children.map(function(b) {
        if (b.post_deleted || b.user_deleted || !b.user_id) {
          b.last_post_username = '';
        }
        if (!b.user_id) {
          b.last_post_username = undefined;
          b.last_post_created_at = undefined;
          b.last_thread_id = undefined;
          b.last_thread_title = undefined;
          b.last_post_position = undefined;
        }
        return b;
      });

      // recurse through category boards
      board.children.map(function(childBoard) {
        return common.boardStitching(boardMapping, childBoard);
      });

      return board;
    });
  })
  .then(helper.slugify);
};

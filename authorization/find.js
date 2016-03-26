var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function boardsFind(server, auth, boardId) {
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'boards.find.allow'
  });

  // access board
  var access = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.boards.getBoardInBoardMapping,
    args: [boardId, server.plugins.acls.getUserPriority(auth)]
  });

  return Promise.all([allowed, access]);
};

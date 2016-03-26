var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function(server, auth) {
  // check base permission
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'boards.create.allow'
  });
};

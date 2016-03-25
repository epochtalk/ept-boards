var path = require('path');

module.exports = {
  all: require(path.normalize(__dirname + '/all')),
  allSelect: require(path.normalize(__dirname + '/allSelect')),
  create: require(path.normalize(__dirname + '/create')),
  update: require(path.normalize(__dirname + '/update')),
  breadcrumb: require(path.normalize(__dirname + '/breadcrumb')),
  find: require(path.normalize(__dirname + '/find')),
  updateCategories: require(path.normalize(__dirname + '/updateCategories')),
  allCategories: require(path.normalize(__dirname + '/allCategories')),
  getBoardInBoardMapping: require(path.normalize(__dirname + '/getBoardInBoardMapping')),
  delete: require(path.normalize(__dirname + '/delete')),
  watching: require(path.normalize(__dirname + '/watching')),
};

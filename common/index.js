var common = {};
module.exports = common;

var _ = require('lodash');

function boardsClean(sanitizer, payload) {
  // payload is an array
  payload.map(function(board) {
    // name
    board.name = sanitizer.strip(board.name);

    // description
    if (board.description) {
      board.description = sanitizer.display(board.description);
    }
  });
}

function boardStitching(boardMapping, currentBoard) {
  var hasChildren = _.find(boardMapping, function(board) {
    return board.parent_id === currentBoard.id;
  });

  if (hasChildren) {
    currentBoard.children = _.filter(boardMapping, function(board) {
      return board.parent_id === currentBoard.id;
    });
    currentBoard.children = _.sortBy(currentBoard.children, 'view_order');
    currentBoard.children.map(function(childBoard) {
      return boardStitching(boardMapping, childBoard);
    });
    return currentBoard;
  }
  else {
    currentBoard.children = [];
    return currentBoard;
  }
}

common.boardStitching = boardStitching;

common.export = () =>  {
  return [
    {
      name: 'common.boards.clean',
      method: boardsClean,
      options: { callback: false }
    }
  ];
};

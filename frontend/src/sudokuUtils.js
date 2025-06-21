export function createEmptyBoard(size) {
  return new Array(size * size).fill(0);
}

export function isValid(board, row, col, num, size) {
  for (let i = 0; i < size; i++) {
    if (board[row * size + i] === num || board[i * size + col] === num)
      return false;

    const boxSize = Math.sqrt(size);
    const boxRow = boxSize * Math.floor(row / boxSize) + Math.floor(i / boxSize);
    const boxCol = boxSize * Math.floor(col / boxSize) + i % boxSize;
    if (board[boxRow * size + boxCol] === num)
      return false;
  }
  return true;
}

export function solveSudokuBoard(board, size) {
  function solve(board) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row * size + col] === 0) {
          for (let num = 1; num <= size; num++) {
            if (isValid(board, row, col, num, size)) {
              board[row * size + col] = num;
              if (solve(board)) return true;
              board[row * size + col] = 0; // backtrack
            }
          }
          return false; // No valid number found
        }
      }
    }
    return true; // Solved
  }

  return solve(board);
}

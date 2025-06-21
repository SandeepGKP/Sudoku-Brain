import React, { useEffect, useState } from "react";
import {
  createEmptyBoard,
  isValid,
  solveSudokuBoard,
} from "./sudokuUtils";
import "./index.css";

function App() {
  const [boardSize, setBoardSize] = useState(9);
  const [board, setBoard] = useState(createEmptyBoard(9));
  const [hintIndex, setHintIndex] = useState(null);
  const [lockedCells, setLockedCells] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");

  useEffect(() => {
    const newBoard = createEmptyBoard(boardSize);
    const filledBoard = fillRandomCells(newBoard, boardSize, getPrefillCount(difficulty));
    setBoard(filledBoard);
    setLockedCells(new Set(filledBoard.map((val, i) => (val !== 0 ? i : null)).filter(i => i !== null)));
  }, [boardSize, difficulty]);

  const handleInputChange = (i, value) => {
    if (lockedCells.has(i)) return;
    const updatedBoard = [...board];
    updatedBoard[i] = value === "" ? 0 : parseInt(value, 10);
    setBoard(updatedBoard);
  };

  const resetBoard = () => {
    const newBoard = createEmptyBoard(boardSize);
    const filledBoard = fillRandomCells(newBoard, boardSize, getPrefillCount(difficulty));
    setBoard(filledBoard);
    setHintIndex(null);
    setLockedCells(new Set(filledBoard.map((val, i) => (val !== 0 ? i : null)).filter(i => i !== null)));
  };

  const solve = () => {
    const newBoard = [...board];

    // Step 1: Validate current board
    for (let i = 0; i < newBoard.length; i++) {
      const row = Math.floor(i / boardSize);
      const col = i % boardSize;
      const num = newBoard[i];
      if (num !== 0) {
        newBoard[i] = 0; // Temporarily clear to validate
        if (!isValid(newBoard, row, col, num, boardSize)) {
          alert("No solution exists: board has repeated values.");
          return;
        }
        newBoard[i] = num;
      }
    }

    // Step 2: Try solving
    if (solveSudokuBoard(newBoard, boardSize)) {
      setBoard(newBoard);
      alert("Sudoku Solved!");
    } else {
      alert("No solution exists for the given board.");
    }
  };



  const provideHint = () => {
    const newBoard = [...board];
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === 0 && !lockedCells.has(i)) {
        const row = Math.floor(i / boardSize);
        const col = i % boardSize;
        for (let num of shuffle(Array.from({ length: boardSize }, (_, i) => i + 1))) {
          if (isValid(newBoard, row, col, num, boardSize)) {
            newBoard[i] = num;
            setBoard(newBoard);
            setHintIndex(i);
            setTimeout(() => setHintIndex(null), 1000);
            return;
          }
        }
        break;
      }
    }
  };

  const validate = () => {
    for (let i = 0; i < board.length; i++) {
      const row = Math.floor(i / boardSize);
      const col = i % boardSize;
      const num = board[i];
      if (num !== 0) {
        board[i] = 0;
        if (!isValid(board, row, col, num, boardSize)) {
          alert("Board is invalid.");
          board[i] = num;
          return;
        }
        board[i] = num;
      }
    }
    alert("Board is valid!");
  };

  const saveGame = () => {
    localStorage.setItem("savedBoard", JSON.stringify({ board, locked: Array.from(lockedCells) }));
    alert("Game saved!");
  };

  const loadGame = () => {
    const saved = localStorage.getItem("savedBoard");
    if (saved) {
      const data = JSON.parse(saved);
      setBoard(data.board);
      setLockedCells(new Set(data.locked));
    } else {
      alert("No saved game found.");
    }
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function fillRandomCells(board, size, count) {
    const newBoard = [...board];
    let filled = 0;
    while (filled < count) {
      const index = Math.floor(Math.random() * (size * size));
      if (newBoard[index] !== 0) continue;
      const row = Math.floor(index / size);
      const col = index % size;
      const nums = shuffle(Array.from({ length: size }, (_, i) => i + 1));
      for (let num of nums) {
        if (isValid(newBoard, row, col, num, size)) {
          newBoard[index] = num;
          filled++;
          break;
        }
      }
    }
    return newBoard;
  }

  function getPrefillCount(level) {
    if (level === "easy") return 30;
    if (level === "hard") return 10;
    return 20; // medium
  }

  return (
    <div className={`${darkMode ? "dark bg-gray-800 text-white" : "bg-purple-100 text-gray-900"} min-h-screen flex`}>
      {sidebarOpen && (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r p-4">
          {/* <h2 className="text-xl font-bold mb-4">Settings</h2> */}
          <div className="space-y-4">
            <label className={`flex items-center ${darkMode ? 'text-white' : 'text-white'}`}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="mr-2"
              />
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </label>

            <button onClick={solve} className="w-full bg-blue-600 text-white py-2 rounded">Solve</button>
            <button onClick={resetBoard} className="w-full bg-blue-600 text-white py-2 rounded">Reset</button>
            <button onClick={provideHint} className="w-full bg-blue-600 text-white py-2 rounded">Hint</button>
            <button onClick={validate} className="w-full bg-blue-600 text-white py-2 rounded">Validate</button>
            <button onClick={saveGame} className="w-full bg-green-600 text-white py-2 rounded">Save</button>
            <button onClick={loadGame} className="w-full bg-yellow-600 text-white py-2 rounded">Load</button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col items-center p-4">
        <button className="self-start mb-4 bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded" onClick={toggleSidebar}>
          {sidebarOpen ? '✖' : '☰'}
        </button>

        <h1 className="text-3xl font-bold mb-6">Sudoku Solver</h1>

        <div
          className="grid gap-1 border-4 border-black rounded-lg p-4 shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, 60px)`,
          }}
        >
          {board.map((value, index) => {
            const row = Math.floor(index / boardSize);
            const col = index % boardSize;
            const isRightEdge = (col + 1) % Math.sqrt(boardSize) === 0;
            const isBottomEdge = (row + 1) % Math.sqrt(boardSize) === 0;

            return (
              <div
                className={`w-[60px] h-[60px] border-2 ${lockedCells.has(index) ? "bg-gray-300" : "bg-white dark:bg-white"} border-blue-500 flex items-center justify-center`}
                key={index}
                style={{
                  borderRight: isRightEdge ? "4px solid #FF4500" : "",
                  borderBottom: isBottomEdge ? "4px solid #FF4500" : "",
                }}
              >
                <input
                  type="number"
                  className={`w-[90%] h-[90%] bg-transparent text-center text-lg outline-none ${index === hintIndex ? "highlight-animation" : ""
                    }`}
                  value={value === 0 ? "" : value}
                  min={1}
                  max={boardSize}
                  readOnly={lockedCells.has(index)}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

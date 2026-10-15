import { useEffect, useState } from "react";
import "./App.css";

const shapes = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

const randomPiece = () => ({
  shape: shapes[Math.floor(Math.random() * shapes.length)],
  x: 3, y: 0,
});

const emptyBoard = () => Array.from({ length: 20 }, () => Array(10).fill(0));

export default function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [score, setScore] = useState(0);

  function move(dx, dy, rotate = false) {
    let shape = rotate
      ? piece.shape[0].map((_, i) =>
          piece.shape.map(row => row[i]).reverse())
      : piece.shape;

    const next = { ...piece, shape, x: piece.x + dx, y: piece.y + dy };

    const hit = shape.some((row, y) =>
      row.some((cell, x) =>
        cell &&
        (next.x + x < 0 || next.x + x >= 10 ||
         next.y + y >= 20 ||
         (next.y + y >= 0 && board[next.y + y][next.x + x]))
      )
    );

    if (!hit) {
      setPiece(next);
    } else if (dy > 0) {
      const b = board.map(row => [...row]);
      piece.shape.forEach((row, y) => row.forEach((cell, x) => {
        if (cell && piece.y + y >= 0) b[piece.y + y][piece.x + x] = 1;
      }));

      const remaining = b.filter(row => row.some(cell => !cell));
      const cleared = 20 - remaining.length;
      setScore(s => s + cleared * 100);
      setBoard([...Array.from({ length: cleared }, () => Array(10).fill(0)), ...remaining]);
      setPiece(randomPiece());
    }
  }

  useEffect(() => {
    const timer = setInterval(() => move(0, 1), 600);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    const key = e => {
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowUp") move(0, 0, true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const cells = board.map(row => [...row]);
  piece.shape.forEach((row, y) => row.forEach((cell, x) => {
    if (cell && piece.y + y >= 0 && piece.y + y < 20 &&
        piece.x + x >= 0 && piece.x + x < 10)
      cells[piece.y + y][piece.x + x] = 2;
  }));

  return (
    <main>
      <h1>⚡ TETRIS</h1>
      <p>Score: {score}</p>
      <div className="board">
        {cells.flatMap((row, y) =>
          row.map((cell, x) =>
            <div key={`${y}-${x}`} className={`cell c${cell}`} />
          )
        )}
      </div>
      <p>← → Move · ↑ Rotate · ↓ Drop</p>
      <button onClick={() => { setBoard(emptyBoard()); setPiece(randomPiece()); setScore(0); }}>
        Restart
      </button>
    </main>
  );
}

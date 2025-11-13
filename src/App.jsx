import { useState, useMemo } from 'react'

function Square({ value, onClick, isWinning }) {
  return (
    <button
      onClick={onClick}
      className={`w-24 h-24 md:w-28 md:h-28 flex items-center justify-center text-4xl md:text-5xl font-bold rounded-lg transition-all duration-200 border 
        ${value === 'X' ? 'text-blue-600' : value === 'O' ? 'text-pink-600' : 'text-gray-400'}
        ${isWinning ? 'bg-yellow-100 border-yellow-400 shadow-lg' : 'bg-white/80 hover:bg-white border-gray-200 shadow'}
      `}
      aria-label={`Square ${value || 'empty'}`}
    >
      {value}
    </button>
  )
}

function Board({ squares, onSquareClick, winningLine }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {squares.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          onClick={() => onSquareClick(idx)}
          isWinning={winningLine?.includes(idx)}
        />)
      )}
    </div>
  )
}

function getWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ]
  for (const [a,b,c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a,b,c] }
    }
  }
  return null
}

function App() {
  const [history, setHistory] = useState([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const [xIsNext, setXIsNext] = useState(true)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const currentSquares = history[currentMove]

  const winnerInfo = useMemo(() => getWinner(currentSquares), [currentSquares])
  const isDraw = useMemo(() => currentSquares.every(Boolean) && !winnerInfo, [currentSquares, winnerInfo])
  const status = winnerInfo
    ? `${winnerInfo.player} wins!`
    : isDraw
    ? "It's a draw"
    : `Turn: ${xIsNext ? 'X' : 'O'}`

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
    setXIsNext(!xIsNext)
  }

  function handleSquareClick(i) {
    if (winnerInfo || currentSquares[i]) return
    const nextSquares = currentSquares.slice()
    nextSquares[i] = xIsNext ? 'X' : 'O'
    handlePlay(nextSquares)
  }

  function resetBoard(nextStarter) {
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setXIsNext(nextStarter ?? (currentMove % 2 === 0 ? true : false))
  }

  function newRound() {
    if (winnerInfo) {
      setScores(s => ({ ...s, [winnerInfo.player]: s[winnerInfo.player] + 1 }))
    } else if (isDraw) {
      setScores(s => ({ ...s, draws: s.draws + 1 }))
    }
    resetBoard(winnerInfo ? winnerInfo.player === 'X' ? false : true : undefined)
  }

  function undo() {
    if (currentMove === 0 || winnerInfo) return
    setCurrentMove(m => m - 1)
    setXIsNext(m => !m)
  }

  function jumpTo(move) {
    setCurrentMove(move)
    setXIsNext(move % 2 === 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-white/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-600 to-rose-600">
              Tic Tac Toe
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">X: {scores.X}</span>
                <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 font-semibold border border-pink-200">O: {scores.O}</span>
                <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 font-semibold border border-gray-200">Draws: {scores.draws}</span>
              </div>
              <button
                onClick={() => { setScores({ X: 0, O: 0, draws: 0 }); resetBoard(true) }}
                className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300"
              >
                Reset All
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="text-lg md:text-xl font-semibold text-gray-800">
                {status}
              </div>
              <Board squares={currentSquares} onSquareClick={handleSquareClick} winningLine={winnerInfo?.line} />
              <div className="flex gap-3 mt-2">
                <button onClick={() => resetBoard()} className="px-4 py-2 rounded-lg bg-white border border-gray-200 shadow hover:bg-gray-50 font-medium">Clear</button>
                <button onClick={newRound} className="px-4 py-2 rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-700 font-semibold">Next Round</button>
                <button onClick={undo} disabled={currentMove === 0 || !!winnerInfo} className="px-4 py-2 rounded-lg bg-white border border-gray-200 shadow hover:bg-gray-50 font-medium disabled:opacity-40">Undo</button>
              </div>
            </div>

            <div className="w-full md:w-64 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h2 className="font-semibold text-gray-800 mb-3">History</h2>
              <div className="flex flex-col gap-2 max-h-64 overflow-auto pr-1">
                {history.map((_, move) => (
                  <button
                    key={move}
                    onClick={() => jumpTo(move)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      move === currentMove
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {move === 0 ? 'Start' : `Move #${move}`} {move === currentMove ? '(current)' : ''}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Tip: You can jump to any move.
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Built with love. Have fun!
        </p>
      </div>
    </div>
  )
}

export default App

export type Player = 'X' | 'O' | null;

export const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export function checkWinner(board: Player[]): Player | 'DRAW' | null {
    for (let combo of WINNING_COMBINATIONS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.every((cell) => cell !== null)) {
        return 'DRAW';
    }

    return null;
}

export function generatePromoCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function getBestMove(board: Player[], computerPlayer: Player): number {
    // Simple AI: 
    // 1. Win if possible
    // 2. Block opponent win
    // 3. Take center
    // 4. Take random available

    const opponent = computerPlayer === 'X' ? 'O' : 'X';

    // Helper to check if a move leads to immediate win for a player
    const findWinningMove = (player: Player): number => {
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                const tempBoard = [...board];
                tempBoard[i] = player;
                if (checkWinner(tempBoard) === player) {
                    return i;
                }
            }
        }
        return -1;
    };

    // 1. Try to win
    const winningMove = findWinningMove(computerPlayer);
    if (winningMove !== -1) return winningMove;

    // 2. Block opponent
    const blockingMove = findWinningMove(opponent);
    if (blockingMove !== -1) return blockingMove;

    // 3. Take center
    if (!board[4]) return 4;

    // 4. Random available
    const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(idx => idx !== -1);
    if (availableMoves.length > 0) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    return -1;
}

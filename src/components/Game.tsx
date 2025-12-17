import React, { useState, useEffect } from 'react';
import Board from './Board';
import Modal from './Modal';
import { checkWinner, getBestMove, generatePromoCode } from '../utils';
import type { Player } from '../utils';

// Add global type definition for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                ready: () => void;
                sendData: (data: string) => void;
                close: () => void;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                    };
                };
                MainButton: {
                    text: string;
                    show: () => void;
                    hide: () => void;
                    onClick: (cb: () => void) => void;
                };
            };
        };
    }
}

const Game: React.FC = () => {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [playerSymbol, setPlayerSymbol] = useState<Player>(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);
    const [gameStatus, setGameStatus] = useState<'SETUP' | 'PLAYING' | 'WON' | 'LOST' | 'DRAW'>('SETUP');
    const [promoCode, setPromoCode] = useState<string | undefined>(undefined);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    // Initialize Telegram WebApp
    useEffect(() => {
        window.Telegram?.WebApp.ready();
    }, []);

    // Bot Logic
    useEffect(() => {
        if (!playerSymbol) return;
        const cpuSymbol = playerSymbol === 'X' ? 'O' : 'X';

        if (!isPlayerTurn && gameStatus === 'PLAYING') {
            const timeout = setTimeout(() => {
                const bestMove = getBestMove(board, cpuSymbol);
                if (bestMove !== -1) {
                    handleMove(bestMove, cpuSymbol);
                }
            }, 600);
            return () => clearTimeout(timeout);
        }
    }, [isPlayerTurn, gameStatus, board, playerSymbol]);

    const startGame = (selectedSide: 'X' | 'O') => {
        setPlayerSymbol(selectedSide);
        // X always goes first. If player picks X, player turn. If O, bot (X) turn.
        setIsPlayerTurn(selectedSide === 'X');
        setGameStatus('PLAYING');
    };

    const handleMove = (index: number, player: Player) => {
        if (board[index] || gameStatus !== 'PLAYING') return;

        const newBoard = [...board];
        newBoard[index] = player;
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            if (result === 'DRAW') {
                endGame('DRAW');
            } else {
                endGame(result === playerSymbol ? 'WON' : 'LOST');
            }
        } else {
            setIsPlayerTurn(player !== playerSymbol ? true : false);
        }
    };

    const endGame = async (status: 'WON' | 'LOST' | 'DRAW') => {
        setGameStatus(status);

        const tg = window.Telegram?.WebApp;
        const userId = tg?.initDataUnsafe?.user?.id;

        if (status === 'WON') {
            const code = generatePromoCode();
            setPromoCode(code);
            console.log(`Telegram Bot: Победа! Промокод выдан: ${code}`);

            if (userId) {
                try {
                    // Use relative path for Vercel/Proxy compatibility
                    await fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, type: 'WIN', promoCode: code })
                    });
                } catch (e) {
                    console.error('Failed to notify bot', e);
                }
            }
        } else if (status === 'LOST') {
            console.log('Telegram Bot: Проигрыш');
            if (userId) {
                try {
                    await fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, type: 'LOST' })
                    });
                } catch (e) {
                    console.error('Failed to notify bot', e);
                }
            }
        }

        setModalOpen(true);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setGameStatus('SETUP');
        setPlayerSymbol(null);
        setPromoCode(undefined);
        setModalOpen(false);
    };

    const handlePlayerClick = (index: number) => {
        if (isPlayerTurn && gameStatus === 'PLAYING' && playerSymbol) {
            handleMove(index, playerSymbol);
        }
    };

    if (gameStatus === 'SETUP') {
        return (
            <div className="app-container">
                <h1 className="game-title">Выберите сторону</h1>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                    <button onClick={() => startGame('X')} className="board-cell" style={{ width: '100px', height: '100px' }}>
                        <svg viewBox="0 0 24 24" className="icon-x" style={{ width: '60px', height: '60px' }} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <button onClick={() => startGame('O')} className="board-cell" style={{ width: '100px', height: '100px' }}>
                        <svg viewBox="0 0 24 24" className="icon-o" style={{ width: '60px', height: '60px' }} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                    </button>
                </div>
                <p className="status-text" style={{ marginTop: '2rem' }}>X ходит первым</p>
            </div>
        );
    }

    return (
        <div className="app-container">
            <h1 className="game-title">
                Крестики-нолики
            </h1>

            <Board
                board={board}
                onSquareClick={handlePlayerClick}
                disabled={!isPlayerTurn || gameStatus !== 'PLAYING'}
            />

            <div className="status-text">
                {gameStatus === 'PLAYING' ? (
                    isPlayerTurn ? `Ваш ход (${playerSymbol})` : "Ход компьютера..."
                ) : "Игра окончена"}
            </div>

            <Modal
                isOpen={modalOpen}
                title={gameStatus === 'WON' ? "Поздравляем!" : gameStatus === 'LOST' ? "Увы!" : "Ничья"}
                message={
                    gameStatus === 'WON'
                        ? "Вы выиграли и получили скидку!"
                        : gameStatus === 'LOST'
                            ? "В этот раз компьютер оказался хитрее."
                            : "Победила дружба!"
                }
                promoCode={promoCode}
                onClose={resetGame}
                actionLabel="На главную"
            />

            {/* Hidden toast or feedback for Telegram integration could go here if needed */}
        </div>
    );
};

export default Game;

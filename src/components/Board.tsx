import React from 'react';
import type { Player } from '../utils';

interface BoardProps {
    board: Player[];
    onSquareClick: (index: number) => void;
    disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick, disabled }) => {
    return (
        <div className="board-container">
            {board.map((cell, index) => (
                <button
                    key={index}
                    onClick={() => onSquareClick(index)}
                    disabled={disabled || cell !== null}
                    className="board-cell"
                >
                    {cell === 'X' && (
                        <svg viewBox="0 0 24 24" className="icon-x" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    )}
                    {cell === 'O' && (
                        <svg viewBox="0 0 24 24" className="icon-o" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                    )}
                </button>
            ))}
        </div>
    );
};

export default Board;

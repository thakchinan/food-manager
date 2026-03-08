import React, { useState } from 'react';

function GachaModal({ onSpin, onClose, result }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [displayNumber, setDisplayNumber] = useState(0);

    const handleSpin = () => {
        setIsSpinning(true);
        setShowResult(false);

        // Spinning animation
        let counter = 0;
        const interval = setInterval(() => {
            setDisplayNumber(Math.floor(Math.random() * 50) + 5);
            counter++;
            if (counter > 20) {
                clearInterval(interval);
                onSpin(); // This sets the actual discount via Math.random
                setIsSpinning(false);
                setShowResult(true);
            }
        }, 100);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="gacha-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} id="gacha-close-btn">
                    ✕
                </button>

                <div className="gacha-content">
                    <h2 className="gacha-title">🎰 สุ่มส่วนลด!</h2>
                    <p className="gacha-subtitle">
                        กดปุ่มเพื่อสุ่มรับส่วนลดพิเศษ (5% - 54%)
                    </p>

                    <div className={`gacha-display ${isSpinning ? 'spinning' : ''} ${showResult ? 'result' : ''}`}>
                        <span className="gacha-number">
                            {showResult ? result : isSpinning ? displayNumber : '?'}
                        </span>
                        <span className="gacha-percent">%</span>
                    </div>

                    {showResult ? (
                        <div className="gacha-result">
                            <p className="gacha-congrats">🎉 ยินดีด้วย!</p>
                            <p className="gacha-result-text">
                                คุณได้รับส่วนลด <strong>{result}%</strong>
                            </p>
                            <button className="gacha-done-btn" onClick={onClose} id="gacha-done-btn">
                                ใช้ส่วนลด
                            </button>
                        </div>
                    ) : (
                        <button
                            className={`gacha-spin-btn ${isSpinning ? 'disabled' : ''}`}
                            onClick={handleSpin}
                            disabled={isSpinning}
                            id="gacha-spin-btn"
                        >
                            {isSpinning ? '🎰 กำลังสุ่ม...' : '🎲 หมุนเลย!'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GachaModal;

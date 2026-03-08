import React, { useEffect, useState } from 'react';

function SuccessModal({ orderId, total, onClose, onViewTracking }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setShow(true));
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`success-modal-overlay ${show ? 'show' : ''}`}>
            <div className={`success-modal ${show ? 'show' : ''}`}>
                <div className="success-animation">
                    <div className="success-check-circle">
                        <svg viewBox="0 0 52 52" className="success-checkmark">
                            <circle cx="26" cy="26" r="25" fill="none" className="success-circle" />
                            <path fill="none" d="M14 27l7 7 16-16" className="success-check" />
                        </svg>
                    </div>
                    <div className="success-confetti">
                        {[...Array(12)].map((_, i) => (
                            <span key={i} className="confetti-piece" style={{ '--i': i }} />
                        ))}
                    </div>
                </div>

                <h2 className="success-title">🎉 สั่งอาหารสำเร็จ!</h2>
                <p className="success-subtitle">ออเดอร์ของคุณถูกส่งไปยังครัวแล้ว</p>

                <div className="success-order-info">
                    <div className="success-info-item">
                        <span className="success-info-label">หมายเลขออเดอร์</span>
                        <span className="success-info-value">{orderId}</span>
                    </div>
                    <div className="success-info-item">
                        <span className="success-info-label">ยอดรวม</span>
                        <span className="success-info-value success-price">฿{total.toLocaleString()}</span>
                    </div>
                </div>

                <div className="success-actions">
                    <button className="success-btn primary" onClick={onViewTracking} id="success-view-tracking">
                        📦 ติดตามออเดอร์
                    </button>
                    <button className="success-btn secondary" onClick={handleClose} id="success-close">
                        ✕ ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SuccessModal;

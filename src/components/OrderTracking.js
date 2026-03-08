import React, { useState, useEffect, useRef } from 'react';

const STATUSES = [
    { key: 'pending', label: 'รอยืนยัน', icon: '📋', color: '#f59e0b' },
    { key: 'confirmed', label: 'ยืนยันแล้ว', icon: '✅', color: '#06b6d4' },
    { key: 'cooking', label: 'กำลังปรุง', icon: '👨‍🍳', color: '#8b5cf6' },
    { key: 'ready', label: 'พร้อมเสิร์ฟ', icon: '🍽️', color: '#10b981' },
    { key: 'delivered', label: 'เสิร์ฟแล้ว', icon: '🎉', color: '#6366f1' },
];

function OrderTracking({ orderData, onNewOrder }) {
    // Visual Tracking Logic — setTimeout Mock Status Transition
    const [currentStatus, setCurrentStatus] = useState('pending');
    const timeoutsRef = useRef([]);

    useEffect(() => {
        // Clear previous timeouts
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];

        // Mock status transitions using setTimeout
        const transitions = [
            { status: 'confirmed', delay: 3000 },   // 3 seconds
            { status: 'cooking', delay: 7000 },      // 7 seconds
            { status: 'ready', delay: 13000 },       // 13 seconds
            { status: 'delivered', delay: 18000 },   // 18 seconds
        ];

        transitions.forEach(({ status, delay }) => {
            const timeout = setTimeout(() => {
                setCurrentStatus(status);
            }, delay);
            timeoutsRef.current.push(timeout);
        });

        return () => {
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, []);

    const currentIndex = STATUSES.findIndex((s) => s.key === currentStatus);

    return (
        <div className="tracking-page">
            <div className="tracking-container">
                <header className="tracking-header">
                    <div className="tracking-header-content">
                        <h1>📦 ติดตามคำสั่งซื้อ</h1>
                        <div className="order-badge">
                            <span className="order-id">{orderData.orderId}</span>
                        </div>
                    </div>
                </header>

                <div className="tracking-body">
                    {/* Timeline */}
                    <div className="timeline-section">
                        <h3>สถานะคำสั่งซื้อ</h3>
                        <div className="timeline">
                            {STATUSES.map((status, index) => {
                                const isActive = index <= currentIndex;
                                const isCurrent = index === currentIndex;
                                return (
                                    <div
                                        key={status.key}
                                        className={`timeline-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                                    >
                                        <div
                                            className="timeline-dot"
                                            style={isActive ? { background: status.color, boxShadow: `0 0 20px ${status.color}50` } : {}}
                                        >
                                            <span>{status.icon}</span>
                                        </div>
                                        {index < STATUSES.length - 1 && (
                                            <div
                                                className={`timeline-line ${isActive && index < currentIndex ? 'filled' : ''}`}
                                                style={isActive && index < currentIndex ? { background: `linear-gradient(to bottom, ${status.color}, ${STATUSES[index + 1].color})` } : {}}
                                            />
                                        )}
                                        <div className="timeline-content">
                                            <p className="timeline-label">{status.label}</p>
                                            {isCurrent && (
                                                <span
                                                    className="timeline-pulse"
                                                    style={{ background: status.color }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="order-details-section">
                        <h3>รายละเอียดคำสั่งซื้อ</h3>

                        <div className="order-info-card">
                            <div className="order-info-row">
                                <span className="info-label">👤 ชื่อผู้รับ</span>
                                <span className="info-value">{orderData.customerInfo.name}</span>
                            </div>
                            <div className="order-info-row">
                                <span className="info-label">🪑 เลขโต๊ะ</span>
                                <span className="info-value">{orderData.customerInfo.tableNo}</span>
                            </div>
                            <div className="order-info-row">
                                <span className="info-label">💰 วิธีชำระเงิน</span>
                                <span className="info-value">
                                    {orderData.customerInfo.paymentMethod === 'cash'
                                        ? '💵 เงินสด'
                                        : orderData.customerInfo.paymentMethod === 'card'
                                            ? '💳 บัตรเครดิต'
                                            : '📱 QR Code'}
                                </span>
                            </div>
                            <div className="order-info-row">
                                <span className="info-label">🕐 เวลาสั่ง</span>
                                <span className="info-value">{orderData.timestamp}</span>
                            </div>
                        </div>

                        <div className="order-items-card">
                            <h4>รายการที่สั่ง</h4>
                            {orderData.items.map((item, idx) => (
                                <div key={idx} className="order-item-row">
                                    <span className="order-item-emoji">{item.image}</span>
                                    <div className="order-item-info">
                                        <p>{item.name} x{item.quantity}</p>
                                        <p className="order-item-sub">
                                            {Object.values(item.selectedOptions || {})
                                                .map((o) => o.label)
                                                .join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-total-card">
                            <div className="order-total-row">
                                <span>รวม</span>
                                <span>฿{orderData.calculations.subtotal}</span>
                            </div>
                            {orderData.calculations.discountPercent > 0 && (
                                <div className="order-total-row discount">
                                    <span>ส่วนลด {orderData.calculations.discountPercent}%</span>
                                    <span>-฿{orderData.calculations.discountAmount}</span>
                                </div>
                            )}
                            <div className="order-total-row">
                                <span>VAT 7%</span>
                                <span>฿{orderData.calculations.vat}</span>
                            </div>
                            <div className="order-total-row final">
                                <span>ยอดสุทธิ</span>
                                <span>฿{orderData.calculations.total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tracking-footer">
                    <button className="new-order-btn" onClick={onNewOrder} id="new-order-btn">
                        🛒 สั่งอาหารใหม่
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderTracking;

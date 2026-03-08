import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../lib/supabaseApi';

function OrderHistory({ onBack }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        async function loadOrders() {
            setLoading(true);
            const data = await fetchOrders();
            if (data) {
                setOrders(data);
            }
            setLoading(false);
        }
        loadOrders();
    }, []);

    const getStatusInfo = (status) => {
        const map = {
            pending: { label: 'รอยืนยัน', icon: '⏳', color: '#ffd166' },
            confirmed: { label: 'ยืนยันแล้ว', icon: '✅', color: '#2ec4b6' },
            cooking: { label: 'กำลังปรุง', icon: '🔥', color: '#f4a236' },
            ready: { label: 'พร้อมเสิร์ฟ', icon: '🔔', color: '#ff6b6b' },
            delivered: { label: 'เสิร์ฟแล้ว', icon: '✨', color: '#2ec4b6' },
        };
        return map[status] || { label: status, icon: '📋', color: '#8a706a' };
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="order-history-page">
            <div className="history-header">
                <button className="history-back-btn" onClick={onBack} id="history-back-btn">
                    ← กลับ
                </button>
                <div className="history-title-area">
                    <h1>📜 ประวัติการสั่งซื้อ</h1>
                    <p className="history-subtitle">ออเดอร์ทั้งหมดจาก Supabase ({orders.length} รายการ)</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">กำลังโหลดประวัติ...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="history-empty">
                    <span className="history-empty-icon">📭</span>
                    <h3>ยังไม่มีประวัติการสั่งซื้อ</h3>
                    <p>เมื่อคุณสั่งอาหาร ประวัติจะปรากฏที่นี่</p>
                </div>
            ) : (
                <div className="history-list">
                    {orders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        const isExpanded = expandedOrder === order.order_id;
                        return (
                            <div
                                key={order.order_id}
                                className={`history-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}
                                id={`order-${order.order_id}`}
                            >
                                <div className="history-card-header">
                                    <div className="history-card-left">
                                        <span className="history-order-id">{order.order_id}</span>
                                        <span className="history-date">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="history-card-right">
                                        <span
                                            className="history-status-badge"
                                            style={{ background: statusInfo.color + '22', color: statusInfo.color }}
                                        >
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="history-card-summary">
                                    <div className="history-info-row">
                                        <span>👤 {order.customer_name}</span>
                                        <span>🪑 โต๊ะ {order.table_no}</span>
                                        <span>💳 {order.payment_method === 'cash' ? 'เงินสด' : order.payment_method === 'promptpay' ? 'พร้อมเพย์' : 'บัตรเครดิต'}</span>
                                    </div>
                                    <div className="history-price-row">
                                        {order.discount_percent > 0 && (
                                            <span className="history-discount">ส่วนลด {order.discount_percent}%</span>
                                        )}
                                        <span className="history-total">฿{Number(order.total).toLocaleString()}</span>
                                    </div>
                                </div>

                                {isExpanded && order.order_items && (
                                    <div className="history-items-detail">
                                        <div className="history-detail-divider"></div>
                                        <p className="history-detail-title">📋 รายการสินค้า</p>
                                        {order.order_items.map((item, idx) => (
                                            <div key={idx} className="history-item-row">
                                                <span className="history-item-emoji">{item.image}</span>
                                                <div className="history-item-info">
                                                    <span className="history-item-name">{item.name}</span>
                                                    {item.note && (
                                                        <span className="history-item-note">📝 {item.note}</span>
                                                    )}
                                                </div>
                                                <span className="history-item-qty">x{item.quantity}</span>
                                                <span className="history-item-price">฿{Number(item.line_total).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="history-detail-divider"></div>
                                        <div className="history-totals">
                                            <div className="history-total-row">
                                                <span>ยอดรวมก่อนลด</span>
                                                <span>฿{Number(order.subtotal).toLocaleString()}</span>
                                            </div>
                                            {order.discount_percent > 0 && (
                                                <div className="history-total-row discount">
                                                    <span>ส่วนลด ({order.discount_percent}%)</span>
                                                    <span>-฿{Number(order.discount_amount).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="history-total-row">
                                                <span>VAT 7%</span>
                                                <span>฿{Number(order.vat).toLocaleString()}</span>
                                            </div>
                                            <div className="history-total-row final">
                                                <span>ยอดรวมสุทธิ</span>
                                                <span>฿{Number(order.total).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="history-expand-hint">
                                    {isExpanded ? '▲ ซ่อนรายละเอียด' : '▼ ดูรายละเอียด'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;

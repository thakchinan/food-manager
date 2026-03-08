import React, { useState } from 'react';

function CheckoutPage({ cart, calculations, customerInfo, onConfirm, onBack }) {
    // In-Memory Storage for customer info
    const [name, setName] = useState(customerInfo.name);
    const [tableNo, setTableNo] = useState(customerInfo.tableNo);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !tableNo.trim()) {
            alert('กรุณากรอกชื่อและเลขโต๊ะ');
            return;
        }
        onConfirm({ name, tableNo, paymentMethod });
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <header className="checkout-header">
                    <button className="back-btn" onClick={onBack} id="checkout-back-btn">
                        ← กลับ
                    </button>
                    <h1>📋 สรุปคำสั่งซื้อ</h1>
                </header>

                <div className="checkout-body">
                    <div className="checkout-items-section">
                        <h3>รายการอาหาร</h3>
                        <div className="checkout-items">
                            {cart.map((item) => {
                                const optionsExtra = Object.values(item.selectedOptions || {}).reduce(
                                    (acc, opt) => acc + (opt.extraPrice || 0),
                                    0
                                );
                                const addonsTotal = (item.selectedAddons || []).reduce(
                                    (acc, a) => acc + a.price,
                                    0
                                );
                                const lineTotal = (item.price + optionsExtra + addonsTotal) * item.quantity;

                                return (
                                    <div key={item.cartId} className="checkout-item">
                                        <div className="checkout-item-left">
                                            <span className="checkout-item-emoji">{item.image}</span>
                                            <div>
                                                <p className="checkout-item-name">
                                                    {item.name} x{item.quantity}
                                                </p>
                                                <p className="checkout-item-detail">
                                                    {Object.values(item.selectedOptions || {})
                                                        .map((o) => o.label)
                                                        .join(', ')}
                                                </p>
                                                {item.selectedAddons && item.selectedAddons.length > 0 && (
                                                    <p className="checkout-item-detail">
                                                        +{item.selectedAddons.map((a) => a.name).join(', ')}
                                                    </p>
                                                )}
                                                {item.note && (
                                                    <p className="checkout-item-note">📝 {item.note}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="checkout-item-price">฿{lineTotal}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="checkout-totals">
                            <div className="checkout-total-row">
                                <span>ราคารวม</span>
                                <span>฿{calculations.subtotal}</span>
                            </div>
                            {calculations.discountPercent > 0 && (
                                <div className="checkout-total-row discount">
                                    <span>🎉 ส่วนลด {calculations.discountPercent}%</span>
                                    <span>-฿{calculations.discountAmount}</span>
                                </div>
                            )}
                            <div className="checkout-total-row">
                                <span>VAT 7%</span>
                                <span>฿{calculations.vat}</span>
                            </div>
                            <div className="checkout-total-row final">
                                <span>ยอดรวมสุทธิ</span>
                                <span>฿{calculations.total}</span>
                            </div>
                        </div>
                    </div>

                    <form className="checkout-form-section" onSubmit={handleSubmit}>
                        <h3>ข้อมูลผู้สั่ง</h3>

                        <div className="form-group">
                            <label htmlFor="customer-name">ชื่อผู้รับ</label>
                            <input
                                type="text"
                                id="customer-name"
                                placeholder="กรอกชื่อผู้รับ"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="table-no">เลขโต๊ะ</label>
                            <input
                                type="text"
                                id="table-no"
                                placeholder="กรอกเลขโต๊ะ"
                                value={tableNo}
                                onChange={(e) => setTableNo(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>ช่องทางชำระเงิน</label>
                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cash"
                                        checked={paymentMethod === 'cash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-icon">💵</span>
                                    <span>เงินสด</span>
                                </label>
                                <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-icon">💳</span>
                                    <span>บัตรเครดิต</span>
                                </label>
                                <label className={`payment-option ${paymentMethod === 'qr' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="qr"
                                        checked={paymentMethod === 'qr'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="payment-icon">📱</span>
                                    <span>QR Code</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="confirm-order-btn" id="confirm-order-btn">
                            ✅ ยืนยันคำสั่งซื้อ
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;

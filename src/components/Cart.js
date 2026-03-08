import React from 'react';

function Cart({
    cart,
    calculations,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onCheckout,
    onOpenGacha,
    gachaUsed,
}) {
    const { subtotal, discountAmount, discountPercent, vat, total, itemCount } = calculations;

    return (
        <aside className="cart-panel">
            <div className="cart-header">
                <h2>
                    <span className="cart-icon">🛒</span> ตะกร้าสินค้า
                </h2>
                {cart.length > 0 && (
                    <button className="cart-clear-btn" onClick={onClearCart} id="clear-cart-btn">
                        ล้างทั้งหมด
                    </button>
                )}
            </div>

            <div className="cart-items">
                {cart.length === 0 ? (
                    <div className="cart-empty">
                        <span className="cart-empty-icon">🧺</span>
                        <p>ยังไม่มีสินค้าในตะกร้า</p>
                        <p className="cart-empty-sub">เลือกเมนูจากรายการด้านซ้าย</p>
                    </div>
                ) : (
                    cart.map((item) => {
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
                            <div key={item.cartId} className="cart-item" id={`cart-item-${item.cartId}`}>
                                <div className="cart-item-top">
                                    <div className="cart-item-info">
                                        <span className="cart-item-emoji">{item.image}</span>
                                        <div>
                                            <p className="cart-item-name">{item.name}</p>
                                            <p className="cart-item-options">
                                                {Object.values(item.selectedOptions || {})
                                                    .map((o) => o.label)
                                                    .join(', ')}
                                            </p>
                                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                                                <p className="cart-item-addons">
                                                    +{item.selectedAddons.map((a) => a.name).join(', ')}
                                                </p>
                                            )}
                                            {item.note && <p className="cart-item-note">📝 {item.note}</p>}
                                        </div>
                                    </div>
                                    <button
                                        className="cart-item-remove"
                                        onClick={() => onRemoveItem(item.cartId)}
                                        id={`remove-item-${item.cartId}`}
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="cart-item-bottom">
                                    <div className="cart-item-qty">
                                        <button
                                            className="qty-btn-sm"
                                            onClick={() => onUpdateQuantity(item.cartId, -1)}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            className="qty-btn-sm"
                                            onClick={() => onUpdateQuantity(item.cartId, 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="cart-item-price">฿{lineTotal}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {cart.length > 0 && (
                <div className="cart-summary">
                    {/* Gacha Discount Button */}
                    {!gachaUsed && (
                        <button className="gacha-btn" onClick={onOpenGacha} id="gacha-btn">
                            <span className="gacha-icon">🎰</span>
                            <span>สุ่มส่วนลด!</span>
                            <span className="gacha-sparkle">✨</span>
                        </button>
                    )}

                    <div className="summary-row">
                        <span>รายการ ({itemCount} รายการ)</span>
                        <span>฿{subtotal}</span>
                    </div>

                    {discountPercent > 0 && (
                        <div className="summary-row discount">
                            <span>🎉 ส่วนลด {discountPercent}%</span>
                            <span>-฿{discountAmount}</span>
                        </div>
                    )}

                    <div className="summary-row">
                        <span>VAT 7%</span>
                        <span>฿{vat}</span>
                    </div>

                    <div className="summary-row total">
                        <span>ยอดรวมสุทธิ</span>
                        <span>฿{total}</span>
                    </div>

                    <button className="checkout-btn" onClick={onCheckout} id="checkout-btn">
                        <span>💳</span>
                        <span>สั่งอาหาร</span>
                    </button>
                </div>
            )}
        </aside>
    );
}

export default Cart;

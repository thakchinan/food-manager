import React, { useState, useMemo } from 'react';

function FoodModal({ food, onClose, onAddToCart }) {
    // Modal Local State — Copy data from main array
    const [selectedOptions, setSelectedOptions] = useState(() => {
        const defaults = {};
        if (food.options) {
            Object.entries(food.options).forEach(([key, opt]) => {
                const defaultChoice = opt.choices.find((c) => c.value === opt.default) || opt.choices[0];
                defaults[key] = {
                    value: defaultChoice.value,
                    label: defaultChoice.label,
                    extraPrice: defaultChoice.extraPrice || 0,
                };
            });
        }
        return defaults;
    });

    // Checkbox Add-ons — Array of Objects
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [note, setNote] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Option Mapping — Radio (Mandatory)
    const handleOptionChange = (optionKey, choice) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionKey]: {
                value: choice.value,
                label: choice.label,
                extraPrice: choice.extraPrice || 0,
            },
        }));
    };

    // Option Mapping — Checkbox (Add-ons)
    const handleAddonToggle = (addon) => {
        setSelectedAddons((prev) => {
            const exists = prev.find((a) => a.id === addon.id);
            if (exists) {
                return prev.filter((a) => a.id !== addon.id);
            }
            return [...prev, { id: addon.id, name: addon.name, price: addon.price }];
        });
    };

    // Computed price
    const itemTotal = useMemo(() => {
        const optionsExtra = Object.values(selectedOptions).reduce(
            (acc, opt) => acc + (opt.extraPrice || 0),
            0
        );
        const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);
        return (food.price + optionsExtra + addonsTotal) * quantity;
    }, [food.price, selectedOptions, selectedAddons, quantity]);

    // Add to Cart Logic — Create new Object
    const handleConfirm = () => {
        const cartItem = {
            id: food.id,
            name: food.name,
            nameEn: food.nameEn,
            image: food.image,
            price: food.price,
            category: food.category,
            selectedOptions,
            selectedAddons,
            note,
            quantity,
        };
        onAddToCart(cartItem);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} id="modal-close-btn">
                    ✕
                </button>

                <div className="modal-header">
                    <div className="modal-food-image">
                        <span className="modal-food-emoji">{food.image}</span>
                    </div>
                    <div className="modal-food-info">
                        <h2>{food.name}</h2>
                        <p className="modal-food-en">{food.nameEn}</p>
                        <p className="modal-food-desc">{food.description}</p>
                        <p className="modal-food-price">฿{food.price}</p>
                    </div>
                </div>

                <div className="modal-body">
                    {/* Radio Options (Mandatory) */}
                    {food.options &&
                        Object.entries(food.options).map(([key, opt]) => (
                            <div key={key} className="option-group">
                                <h4 className="option-label">
                                    {opt.label}
                                    <span className="option-required">จำเป็น</span>
                                </h4>
                                <div className="option-choices">
                                    {opt.choices.map((choice) => (
                                        <label
                                            key={choice.value}
                                            className={`option-radio ${selectedOptions[key]?.value === choice.value ? 'selected' : ''
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={key}
                                                value={choice.value}
                                                checked={selectedOptions[key]?.value === choice.value}
                                                onChange={() => handleOptionChange(key, choice)}
                                            />
                                            <span className="radio-custom" />
                                            <span className="radio-label">{choice.label}</span>
                                            {choice.extraPrice > 0 && (
                                                <span className="radio-extra">+฿{choice.extraPrice}</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                    {/* Checkbox Add-ons */}
                    {food.addons && food.addons.length > 0 && (
                        <div className="option-group">
                            <h4 className="option-label">
                                เพิ่มเติม
                                <span className="option-optional">เลือกได้</span>
                            </h4>
                            <div className="option-choices">
                                {food.addons.map((addon) => (
                                    <label
                                        key={addon.id}
                                        className={`option-checkbox ${selectedAddons.find((a) => a.id === addon.id) ? 'selected' : ''
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!selectedAddons.find((a) => a.id === addon.id)}
                                            onChange={() => handleAddonToggle(addon)}
                                        />
                                        <span className="checkbox-custom" />
                                        <span className="checkbox-label">{addon.name}</span>
                                        {addon.price > 0 && (
                                            <span className="checkbox-extra">+฿{addon.price}</span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <div className="option-group">
                        <h4 className="option-label">หมายเหตุ</h4>
                        <textarea
                            className="note-input"
                            placeholder="เช่น ไม่ใส่ผัก, เพิ่มข้าว..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            id="food-note-input"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="quantity-control">
                        <button
                            className="qty-btn"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            id="modal-qty-minus"
                        >
                            −
                        </button>
                        <span className="qty-value">{quantity}</span>
                        <button
                            className="qty-btn"
                            onClick={() => setQuantity((q) => q + 1)}
                            id="modal-qty-plus"
                        >
                            +
                        </button>
                    </div>
                    <button className="add-to-cart-btn" onClick={handleConfirm} id="confirm-add-to-cart">
                        เพิ่มลงตะกร้า — ฿{itemTotal}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FoodModal;

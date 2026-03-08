import React from 'react';

function FoodGrid({ foods, onFoodClick }) {
    if (foods.length === 0) {
        return (
            <div className="food-grid-empty">
                <span className="empty-icon">🔍</span>
                <p>ไม่พบเมนูที่ค้นหา</p>
                <p className="empty-sub">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
            </div>
        );
    }

    return (
        <div className="food-grid">
            {foods.map((food) => (
                <div
                    key={food.id}
                    className="food-card"
                    onClick={() => onFoodClick(food)}
                    id={`food-card-${food.id}`}
                >
                    <div className="food-card-image">
                        <span className="food-emoji">{food.image}</span>
                        <span className="food-card-badge">
                            {food.category === 'food'
                                ? '🍛'
                                : food.category === 'drink'
                                    ? '🧋'
                                    : food.category === 'dessert'
                                        ? '🍨'
                                        : '🍢'}
                        </span>
                    </div>
                    <div className="food-card-info">
                        <h3 className="food-card-name">{food.name}</h3>
                        <p className="food-card-name-en">{food.nameEn}</p>
                        <p className="food-card-desc">{food.description}</p>
                        <div className="food-card-footer">
                            <span className="food-card-price">฿{food.price}</span>
                            <button className="food-card-add" id={`add-food-${food.id}`}>
                                <span>+</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default FoodGrid;

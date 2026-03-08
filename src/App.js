import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMenuItems, fetchCategories, createOrder, updateOrderStatus } from './lib/supabaseApi';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import FoodGrid from './components/FoodGrid';
import FoodModal from './components/FoodModal';
import Cart from './components/Cart';
import CheckoutPage from './components/CheckoutPage';
import OrderTracking from './components/OrderTracking';
import OrderHistory from './components/OrderHistory';
import GachaModal from './components/GachaModal';
import SuccessModal from './components/SuccessModal';
import './App.css';

function App() {
  // ---- Global State: Data from Supabase ----
  const [allFoods, setAllFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');

  // ---- Display State (filtered results) ----
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // ---- Modal Local State ----
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---- Cart Array ----
  const [cart, setCart] = useState([]);

  // ---- Gacha Discount ----
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [gachaUsed, setGachaUsed] = useState(false);

  // ---- View Switching (Boolean) ----
  const [isCheckout, setIsCheckout] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isHistory, setIsHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ---- In-Memory Storage ----
  const [customerInfo, setCustomerInfo] = useState({ name: '', tableNo: '' });
  const [orderData, setOrderData] = useState(null);

  // ---- Sidebar mobile toggle ----
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ==== LOAD DATA FROM SUPABASE ON MOUNT ====
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch categories from Supabase
        const dbCategories = await fetchCategories();
        if (dbCategories && dbCategories.length > 0) {
          const formattedCategories = dbCategories.map((cat) => ({
            id: cat.id,
            label: cat.label,
            icon: cat.icon,
            color: cat.color,
          }));
          setCategories(formattedCategories);
        }

        // Fetch menu items from Supabase
        const dbMenuItems = await fetchMenuItems();
        if (dbMenuItems && dbMenuItems.length > 0) {
          setAllFoods(dbMenuItems);
          setDataSource('supabase');
          console.log('✅ Data loaded from Supabase (' + dbMenuItems.length + ' items)');
        } else {
          setDataSource('empty');
          console.warn('⚠️ No menu items found in Supabase');
        }
      } catch (err) {
        console.error('❌ Supabase connection failed:', err.message);
        setDataSource('error');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ==== COMPUTED: Display State (filter from allFoods) ====
  const displayFoods = useMemo(() => {
    let filtered = allFoods;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter((food) => food.category === activeCategory);
    }

    // Search filter (check name property)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (food) =>
          food.name.toLowerCase().includes(term) ||
          food.nameEn.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allFoods, activeCategory, searchTerm]);

  // ==== HANDLERS ====

  const handleFoodClick = useCallback((food) => {
    // Copy data from main array to Modal state
    setSelectedFood({ ...food });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFood(null);
  }, []);

  // Add to Cart Logic — Separation Logic
  const handleAddToCart = useCallback((cartItem) => {
    setCart((prevCart) => {
      // Check if same ID with same options and note already exists
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.id === cartItem.id &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(cartItem.selectedOptions) &&
          JSON.stringify(item.selectedAddons) === JSON.stringify(cartItem.selectedAddons) &&
          item.note === cartItem.note
      );

      if (existingIndex !== -1) {
        // Same item, same options, same note → increment quantity
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + cartItem.quantity,
        };
        return updated;
      } else {
        // Different options or note → push as new element
        return [...prevCart, { ...cartItem, cartId: Date.now() + Math.random() }];
      }
    });
    setIsModalOpen(false);
    setSelectedFood(null);
  }, []);

  // Quantity Management
  const handleUpdateQuantity = useCallback((cartId, delta) => {
    setCart((prevCart) => {
      const index = prevCart.findIndex((item) => item.cartId === cartId);
      if (index === -1) return prevCart;

      const updated = [...prevCart];
      const newQty = updated[index].quantity + delta;

      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...updated[index], quantity: newQty };
      }
      return updated;
    });
  }, []);

  const handleRemoveItem = useCallback((cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setDiscountPercent(0);
    setGachaUsed(false);
  }, []);

  // ==== Gacha Logic (Math.random) ====
  const handleGacha = useCallback(() => {
    // Math.floor(Math.random() * max) + min
    const min = 5;
    const max = 50;
    const result = Math.floor(Math.random() * max) + min;
    setDiscountPercent(result);
    setGachaUsed(true);
    setIsGachaOpen(false);
  }, []);

  // ==== Calculation Functions (reduce) ====
  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const optionsExtra = Object.values(item.selectedOptions || {}).reduce(
        (acc, opt) => acc + (opt.extraPrice || 0),
        0
      );
      const addonsTotal = (item.selectedAddons || []).reduce(
        (acc, addon) => acc + addon.price,
        0
      );
      return sum + (item.price + optionsExtra + addonsTotal) * item.quantity;
    }, 0);

    const discountAmount = Math.floor(subtotal * (discountPercent / 100));
    const vat = Math.floor((subtotal - discountAmount) * 0.07);
    const total = subtotal - discountAmount + vat;

    return { subtotal, discountAmount, discountPercent, vat, total, itemCount: cart.length };
  }, [cart, discountPercent]);

  // ==== Checkout ====
  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    setIsCheckout(true);
  }, [cart]);

  const handleConfirmOrder = useCallback(
    async (info) => {
      const newOrderData = {
        items: [...cart],
        customerInfo: info,
        calculations: cartCalculations,
        orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toLocaleString('th-TH'),
      };

      setCustomerInfo(info);
      setOrderData(newOrderData);
      setIsCheckout(false);
      setShowSuccess(true); // Show success modal first!
      setCart([]);
      setDiscountPercent(0);
      setGachaUsed(false);

      // Save to Supabase (non-blocking)
      try {
        const savedOrder = await createOrder(newOrderData);
        if (savedOrder) {
          console.log('✅ Order saved to Supabase:', savedOrder.order_id);

          // Update status transitions in Supabase too
          const statusTimeline = [
            { status: 'confirmed', delay: 3000 },
            { status: 'cooking', delay: 7000 },
            { status: 'ready', delay: 13000 },
            { status: 'delivered', delay: 18000 },
          ];
          statusTimeline.forEach(({ status, delay }) => {
            setTimeout(async () => {
              await updateOrderStatus(newOrderData.orderId, status);
              console.log(`📦 Order ${newOrderData.orderId} → ${status}`);
            }, delay);
          });
        }
      } catch (err) {
        console.warn('⚠️ Could not save order to Supabase:', err.message);
      }
    },
    [cart, cartCalculations]
  );

  const handleBackToMenu = useCallback(() => {
    setIsCheckout(false);
  }, []);

  const handleNewOrder = useCallback(() => {
    setIsTracking(false);
    setOrderData(null);
    setCustomerInfo({ name: '', tableNo: '' });
  }, []);

  const handleViewTracking = useCallback(() => {
    setShowSuccess(false);
    setIsTracking(true);
  }, []);

  const handleOpenHistory = useCallback(() => {
    setIsHistory(true);
  }, []);

  const handleBackFromHistory = useCallback(() => {
    setIsHistory(false);
  }, []);

  // ==== ORDER HISTORY VIEW ====
  if (isHistory) {
    return <OrderHistory onBack={handleBackFromHistory} />;
  }

  // ==== ORDER TRACKING VIEW ====
  if (isTracking && orderData) {
    return <OrderTracking orderData={orderData} onNewOrder={handleNewOrder} />;
  }

  // ==== CHECKOUT VIEW ====
  if (isCheckout) {
    return (
      <CheckoutPage
        cart={cart}
        calculations={cartCalculations}
        customerInfo={customerInfo}
        onConfirm={handleConfirmOrder}
        onBack={handleBackToMenu}
      />
    );
  }

  // ==== MAIN VIEW ====
  return (
    <div className="app">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenHistory={handleOpenHistory}
      />

      <main className="main-content">
        <header className="main-header">
          <button
            className="menu-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            id="menu-toggle-btn"
          >
            ☰
          </button>
          <div className="header-info">
            <h1><img src="/logo-four-allies.png" alt="Four Allies" className="header-logo-img" /> Four Allies</h1>
            <p className="header-subtitle">
              4 สหาย — ระบบสั่งอาหารอัจฉริยะ
              <span className={`data-badge ${dataSource}`}>
                {dataSource === 'supabase' && '🟢 Supabase'}
                {dataSource === 'loading' && '⏳ Loading...'}
                {dataSource === 'error' && '🔴 Connection Error'}
                {dataSource === 'empty' && '🟡 No Data'}
              </span>
            </p>
          </div>
          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
        </header>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={
                activeCategory === cat.id
                  ? { background: cat.color, borderColor: cat.color }
                  : {}
              }
              id={`category-pill-${cat.id}`}
            >
              <span className="pill-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">กำลังโหลดข้อมูลจาก Supabase...</p>
          </div>
        ) : (
          <FoodGrid foods={displayFoods} onFoodClick={handleFoodClick} />
        )}
      </main>

      <Cart
        cart={cart}
        calculations={cartCalculations}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
        onOpenGacha={() => setIsGachaOpen(true)}
        gachaUsed={gachaUsed}
      />

      {isModalOpen && selectedFood && (
        <FoodModal
          food={selectedFood}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}

      {isGachaOpen && (
        <GachaModal
          onSpin={handleGacha}
          onClose={() => setIsGachaOpen(false)}
          result={discountPercent}
        />
      )}

      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {showSuccess && orderData && (
        <SuccessModal
          orderId={orderData.orderId}
          total={orderData.calculations.total}
          onClose={() => setShowSuccess(false)}
          onViewTracking={handleViewTracking}
        />
      )}
    </div>
  );
}

export default App;

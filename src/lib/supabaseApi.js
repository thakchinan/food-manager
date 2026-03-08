import supabase from './supabase';

// ============================================
// MENU & CATEGORIES — Read from Supabase
// ============================================

export async function fetchCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return null;
    }
    return data;
}

export async function fetchMenuItems() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching menu items:', error);
        return null;
    }

    // Transform to match existing component format
    return data.map((item) => ({
        id: item.id,
        name: item.name,
        nameEn: item.name_en,
        category: item.category,
        price: Number(item.price),
        image: item.image,
        description: item.description,
        options: item.options || {},
        addons: item.addons || [],
    }));
}

// ============================================
// ORDERS — Create & Track
// ============================================

export async function createOrder(orderData) {
    const { items, customerInfo, calculations, orderId } = orderData;

    // 1. Insert order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            order_id: orderId,
            customer_name: customerInfo.name,
            table_no: customerInfo.tableNo,
            payment_method: customerInfo.paymentMethod,
            status: 'pending',
            subtotal: calculations.subtotal,
            discount_percent: calculations.discountPercent,
            discount_amount: calculations.discountAmount,
            vat: calculations.vat,
            total: calculations.total,
        })
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
    }

    // 2. Insert order items
    const orderItems = items.map((item) => {
        const optionsExtra = Object.values(item.selectedOptions || {}).reduce(
            (acc, opt) => acc + (opt.extraPrice || 0),
            0
        );
        const addonsTotal = (item.selectedAddons || []).reduce(
            (acc, a) => acc + a.price,
            0
        );
        const lineTotal = (item.price + optionsExtra + addonsTotal) * item.quantity;

        return {
            order_id: orderId,
            menu_item_id: item.id,
            name: item.name,
            name_en: item.nameEn,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            note: item.note || '',
            selected_options: item.selectedOptions || {},
            selected_addons: item.selectedAddons || [],
            line_total: lineTotal,
        };
    });

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return null;
    }

    return order;
}

export async function updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .select()
        .single();

    if (error) {
        console.error('Error updating order status:', error);
        return null;
    }
    return data;
}

export async function fetchOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (*)
    `)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching orders:', error);
        return null;
    }
    return data;
}

export async function fetchOrderById(orderId) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (*)
    `)
        .eq('order_id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }
    return data;
}

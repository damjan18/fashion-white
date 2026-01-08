import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database helper functions

// ============ PRODUCTS ============
export async function getProducts(filters = {}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters.brand) {
    query = query.eq('brand_id', filters.brand);
  }

  if (filters.style) {
    query = query.eq('style', filters.style);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Filter by stock if needed
  if (filters.inStockOnly) {
    return data.filter(product => 
      product.variants.some(v => v.quantity > 0)
    );
  }

  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      variants:product_variants(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function createProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
}

export async function updateProduct(id, productData) {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// ============ VARIANTS ============
export async function createVariant(variantData) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert([variantData])
    .select()
    .single();

  if (error) {
    console.error('Error creating variant:', error);
    throw error;
  }

  return data;
}

export async function updateVariant(id, variantData) {
  const { data, error } = await supabase
    .from('product_variants')
    .update(variantData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating variant:', error);
    throw error;
  }

  return data;
}

export async function updateStock(variantId, quantity) {
  const { data, error } = await supabase
    .from('product_variants')
    .update({ quantity })
    .eq('id', variantId)
    .select()
    .single();

  if (error) {
    console.error('Error updating stock:', error);
    throw error;
  }

  return data;
}

export async function decrementStock(variantId, amount = 1) {
  const { data: variant } = await supabase
    .from('product_variants')
    .select('quantity')
    .eq('id', variantId)
    .single();

  if (variant && variant.quantity >= amount) {
    return updateStock(variantId, variant.quantity - amount);
  }

  throw new Error('Insufficient stock');
}

// ============ BRANDS ============
export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return data;
}

export async function createBrand(brandData) {
  const { data, error } = await supabase
    .from('brands')
    .insert([brandData])
    .select()
    .single();

  if (error) {
    console.error('Error creating brand:', error);
    throw error;
  }

  return data;
}

export async function updateBrand(id, brandData) {
  const { data, error } = await supabase
    .from('brands')
    .update(brandData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating brand:', error);
    throw error;
  }

  return data;
}

// ============ ORDERS ============
export async function getOrders(filters = {}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        variant:product_variants(
          *,
          product:products(*)
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data;
}

export async function getOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        variant:product_variants(
          *,
          product:products(*)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export async function createOrder(orderData, items) {
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    variant_id: item.variantId,
    quantity: item.quantity,
    price_at_purchase: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw itemsError;
  }

  return order;
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  // If confirmed, decrement stock
  if (status === 'confirmed') {
    const order = await getOrderById(id);
    for (const item of order.order_items) {
      await decrementStock(item.variant_id, item.quantity);
    }
  }

  return data;
}

// ============ ANALYTICS ============
export async function getAnalytics(dateFrom, dateTo) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        variant:product_variants(
          *,
          product:products(*)
        )
      )
    `)
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo)
    .in('status', ['confirmed', 'shipped', 'delivered']);

  if (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  
  // Products sold
  const productsSold = {};
  orders.forEach(order => {
    order.order_items.forEach(item => {
      const productId = item.variant?.product?.id;
      if (productId) {
        if (!productsSold[productId]) {
          productsSold[productId] = {
            product: item.variant.product,
            quantity: 0,
            revenue: 0,
          };
        }
        productsSold[productId].quantity += item.quantity;
        productsSold[productId].revenue += item.quantity * item.price_at_purchase;
      }
    });
  });

  // Top products
  const topProducts = Object.values(productsSold)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Revenue by day
  const revenueByDay = {};
  orders.forEach(order => {
    const day = order.created_at.split('T')[0];
    revenueByDay[day] = (revenueByDay[day] || 0) + order.total;
  });

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    topProducts,
    revenueByDay,
  };
}

export async function getLowStockProducts(threshold = 3) {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      *,
      product:products(*)
    `)
    .lte('quantity', threshold)
    .order('quantity');

  if (error) {
    console.error('Error fetching low stock:', error);
    return [];
  }

  return data.filter(v => v.product?.is_active);
}

// ============ AUTH ============
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ============ STORAGE ============
export async function uploadImage(file, bucket = 'products') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

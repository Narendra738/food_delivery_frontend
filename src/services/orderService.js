const ORDERS_STORAGE_KEY = 'zestro_orders';

export const getOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const createOrder = (cart, restaurantId, userId) => {
  const orders = getOrders();
  const order = {
    id: Date.now().toString(),
    userId,
    restaurantId,
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0),
    status: 'PLACED',
    createdAt: new Date().toISOString(),
    riderId: null
  };

  orders.push(order);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return order;
};

export const getOrdersByUser = (userId) => {
  return getOrders().filter(o => o.userId === userId);
};

export const getOrdersByRestaurant = (restaurantId) => {
  return getOrders().filter(o => o.restaurantId === restaurantId && o.status !== 'DELIVERED');
};

export const getAvailableOrdersForRider = () => {
  return getOrders().filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING');
};

export const updateOrderStatus = (orderId, status, riderId = null) => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  
  if (order) {
    order.status = status;
    if (riderId) {
      order.riderId = riderId;
    }
    order.updatedAt = new Date().toISOString();
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }
  
  return order;
};

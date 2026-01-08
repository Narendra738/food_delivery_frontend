const CART_STORAGE_KEY = 'zestro_cart';

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addToCart = (item, restaurantId) => {
  const cart = getCart();
  
  // If cart has items from different restaurant, clear it
  if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
    const confirmed = window.confirm('Your cart contains items from another restaurant. Do you want to clear it and add items from this restaurant?');
    if (!confirmed) return cart;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    cart.length = 0;
  }

  const existingItem = cart.find(c => c.item.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      item,
      quantity: 1,
      restaurantId
    });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

export const updateCartQuantity = (itemId, quantity) => {
  const cart = getCart();
  const item = cart.find(c => c.item.id === itemId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    item.quantity = quantity;
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (itemId) => {
  const cart = getCart().filter(c => c.item.id !== itemId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  return [];
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, cartItem) => {
    return total + (cartItem.item.price * cartItem.quantity);
  }, 0);
};

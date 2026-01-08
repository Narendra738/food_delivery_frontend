import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart } from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const refreshCart = () => {
        if (user && user.role === 'Customer') {
            try {
                const cartItems = getCart() || [];
                console.log('CartContext: Refreshing cart', cartItems);

                if (!Array.isArray(cartItems)) {
                    console.error('CartContext: cartItems is not an array', cartItems);
                    setCartCount(0);
                    return;
                }

                // Calculate total quantity of items
                const count = cartItems.reduce((total, item) => {
                    const qty = item.quantity || 0;
                    return total + qty;
                }, 0);

                console.log('CartContext: Calculated count', count);
                setCartCount(count);
            } catch (error) {
                console.error('Failed to fetch cart count:', error);
                setCartCount(0);
            }
        } else {
            setCartCount(0);
        }
    };

    useEffect(() => {
        refreshCart();
        // Listen for storage events to sync across tabs
        const handleStorageChange = () => refreshCart();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user]);

    const value = {
        cartCount,
        refreshCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

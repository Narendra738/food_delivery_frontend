import { foodItems } from './foodItems';

export const restaurants = [
  {
    id: 1,
    name: 'Spice Garden',
    cuisine: 'North Indian',
    rating: 4.5,
    banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
    menu: [1, 2, 9, 10, 11, 8]
  },
  {
    id: 2,
    name: 'Biryani House',
    cuisine: 'Hyderabadi',
    rating: 4.7,
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop',
    menu: [3, 4, 10, 11, 12]
  },
  {
    id: 3,
    name: 'South Indian Delight',
    cuisine: 'South Indian',
    rating: 4.4,
    banner: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&h=400&fit=crop',
    menu: [5, 6, 7, 8]
  },
  {
    id: 4,
    name: 'Pizza Palace',
    cuisine: 'Italian',
    rating: 4.3,
    banner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop',
    menu: [13, 14, 15, 16, 17, 18, 19]
  },
  {
    id: 5,
    name: 'The Burger Joint',
    cuisine: 'Fast Food',
    rating: 4.2,
    banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop',
    menu: [13, 14, 15, 20]
  }
];

export const getRestaurantById = (id) => {
  return restaurants.find(r => r.id === parseInt(id));
};

export const getFoodItemById = (id) => {
  return foodItems.find(item => item.id === id);
};

export const getMenuItemsForRestaurant = (restaurantId) => {
  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant) return [];
  return restaurant.menu.map(foodId => getFoodItemById(foodId)).filter(Boolean);
};

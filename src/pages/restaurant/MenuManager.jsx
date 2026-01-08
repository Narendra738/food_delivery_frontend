import { useState, useEffect } from 'react';
import { restaurantAPI, menuItemAPI } from '../../services/api';
import FoodForm from '../../components/FoodForm';

const MenuManager = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    cuisine: '',
    banner: '',
  });

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getMyRestaurant();
      setRestaurant(response.restaurant);
      setMenuItems(response.restaurant.menuItems || []);
    } catch (err) {
      if (err.message.includes('not found')) {
        setRestaurant(null);
        setMenuItems([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingRestaurant(true);

    try {
      const response = await restaurantAPI.create(restaurantForm);
      setRestaurant(response.restaurant);
      setCreatingRestaurant(false);
      setRestaurantForm({ name: '', cuisine: '', banner: '' });
    } catch (err) {
      setError(err.message);
      setCreatingRestaurant(false);
    }
  };

  const handleAddOrUpdateMenuItem = async (formData) => {
    try {
      if (editingItem) {
        await menuItemAPI.update(editingItem.id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: formData.imageUrl,
          veg: formData.veg,
        });
      } else {
        await menuItemAPI.create({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          imageUrl: formData.imageUrl,
          veg: formData.veg,
        });
      }

      // Reload menu items
      await loadMenuItems();
      setEditingItem(null);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.message || `Failed to ${editingItem ? 'update' : 'create'} menu item`);
      throw err;
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await menuItemAPI.getMy();
      setMenuItems(response.menuItems || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await menuItemAPI.delete(id);
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-textPrimary dark:text-white">Loading...</div>
      </div>
    );
  }

  // Show restaurant creation form if restaurant doesn't exist
  if (!restaurant) {
    return (
      <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-white mb-4">
          Create Your Restaurant
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateRestaurant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              required
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
              placeholder="e.g., Spice Garden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
              Cuisine Type *
            </label>
            <input
              type="text"
              required
              value={restaurantForm.cuisine}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
              placeholder="e.g., North Indian"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
              Banner Image URL
            </label>
            <input
              type="url"
              value={restaurantForm.banner}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, banner: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <button
            type="submit"
            disabled={creatingRestaurant}
            className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {creatingRestaurant ? 'Creating...' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary dark:text-white mb-2">
            Menu Management
          </h2>
          <p className="text-textSecondary dark:text-gray-400">
            {restaurant.name} • {restaurant.cuisine}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Add Food Item
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <>
          <FoodForm
            onSubmit={handleAddOrUpdateMenuItem}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            initialData={editingItem}
          />
          <div className="mb-4 text-sm text-textSecondary dark:text-gray-400">
            💡 You can add multiple dishes. Fill the form and click "Add Item" for each dish.
          </div>
        </>
      )}

      {menuItems.length === 0 ? (
        <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-8 text-center">
          <p className="text-textSecondary dark:text-gray-400 mb-4">
            No menu items yet
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {!item.image && (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                {item.veg && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    VEG
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-1">
                  {item.name}
                </h3>
                <p className="text-textSecondary dark:text-gray-400 text-sm mb-2">
                  {item.description || 'No description'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuManager;

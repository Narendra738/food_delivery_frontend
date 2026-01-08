import { useState } from 'react';

const FoodForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    imageUrl: initialData?.image || '', // Backend sends 'image', form uses 'imageUrl'
    veg: initialData?.veg !== undefined ? initialData.veg : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        veg: true,
      });
    } catch (err) {
      setError(err.message || 'Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-4">
        {initialData ? 'Edit Food Item' : 'Add Food Item'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
            placeholder="e.g., Butter Chicken"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
            rows="3"
            placeholder="Description of the food item"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
              placeholder="260"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.veg}
                  onChange={() => setFormData({ ...formData, veg: true })}
                  className="mr-2"
                />
                <span className="text-textPrimary dark:text-white">Veg</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.veg}
                  onChange={() => setFormData({ ...formData, veg: false })}
                  className="mr-2"
                />
                <span className="text-textPrimary dark:text-white">Non-Veg</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (initialData ? 'Updating...' : 'Adding...') : (initialData ? 'Update Item' : 'Add Item')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-textPrimary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FoodForm;

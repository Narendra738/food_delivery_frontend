import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';

const Profile = () => {
    const { user, login } = useAuth(); // login is used to update user state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        image: user?.image || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-textPrimary dark:text-white">Please login</div>
            </div>
        );
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await userAPI.updateProfile(formData);
            // Update local storage and context
            // simplified update: reuse login method or trigger a reload/refresh
            // Ideally AuthContext should have an update method. For now, we manually update.
            const updatedUser = { ...user, ...response.user };
            // We can't easily update AuthContext state without a specific method, 
            // but we can update localStorage and reload or use the response.
            // Let's rely on backend response.

            // Force update AuthContext by manually setting localStorage and reloading window 
            // OR (better) if AuthContext has a setUser, use that. 
            // Since it doesn't, we will assume the user needs to reload or re-login, 
            // but let's try to update the UI at least.
            setSuccess('Profile updated successfully!');
            setIsEditing(false);

            // A cheat to update context is hard without exposing setUser. 
            // We'll update formData to reflect new state and hope a refresh happens later.
            // Actually, let's just create a temporary hack to reload the page to get fresh data 
            // or accept that the context is stale until next reload.
            // Better UX: Show the new image immediately in the UI using formData.

            // CRITICAL: We need to update the global user state for the navbar image to update.
            // Since we don't have setUser, we will reload the page after a short delay or prompt.
            setTimeout(() => window.location.reload(), 1000);

        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark pt-20 px-4">
            <div className="max-w-2xl mx-auto bg-cardLight dark:bg-cardDark rounded-lg shadow-md overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-textPrimary dark:text-white">Profile</h1>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {error && <div className="mb-4 text-red-500">{error}</div>}
                    {success && <div className="mb-4 text-green-500">{success}</div>}

                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-primary">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-3xl">
                                            {formData.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textSecondary dark:text-gray-400 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textSecondary dark:text-gray-400 mb-1">
                                    Profile Image URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">Paste a direct link to an image file.</p>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-primary mb-4 flex items-center justify-center">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-3xl font-bold text-gray-500">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-textPrimary dark:text-white">
                                    {user.name}
                                </h1>
                                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mt-2">
                                    {user.role}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-textSecondary dark:text-gray-400 mb-1">
                                        Email
                                    </label>
                                    <div className="text-textPrimary dark:text-white text-lg border-b border-gray-200 dark:border-gray-700 pb-2">
                                        {user.email}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-textSecondary dark:text-gray-400 mb-1">
                                        Member Since
                                    </label>
                                    <div className="text-textPrimary dark:text-white text-lg border-b border-gray-200 dark:border-gray-700 pb-2">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-textPrimary dark:text-white">
                                        Activity
                                    </h3>
                                    {user.role === 'Customer' && (
                                        <Link to="/user/orders" className="text-primary hover:underline">
                                            View Order History
                                        </Link>
                                    )}
                                    {user.role === 'Restaurant' && (
                                        <Link to="/restaurant/dashboard" className="text-primary hover:underline">
                                            Go to Dashboard
                                        </Link>
                                    )}
                                    {user.role === 'Rider' && (
                                        <Link to="/rider/dashboard" className="text-primary hover:underline">
                                            View Assignments
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

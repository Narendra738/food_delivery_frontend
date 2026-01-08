import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Map frontend role to backend role
      const roleMap = {
        'Customer': 'USER',
        'Restaurant': 'RESTAURANT',
        'Rider': 'RIDER'
      };

      // Call backend API for signup
      const response = await authAPI.signup({
        name,
        email,
        password,
        role: roleMap[role] || 'USER'
      });

      // Store token and user info
      localStorage.setItem('zestro_token', response.token);
      localStorage.setItem('zestro_user', JSON.stringify({
        ...response.user,
        token: response.token
      }));

      // Update AuthContext
      signup({ 
        ...response.user, 
        token: response.token,
        role: role === 'Customer' ? 'Customer' : role === 'Restaurant' ? 'Restaurant' : 'Rider'
      });
      
      // Redirect based on role
      if (role === 'Customer') {
        navigate('/user/home');
      } else if (role === 'Restaurant') {
        navigate('/restaurant/dashboard');
      } else if (role === 'Rider') {
        navigate('/rider/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-backgroundDark px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Zestro</h1>
          <p className="text-textSecondary dark:text-gray-400">Create your account</p>
        </div>

        <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-textPrimary dark:text-white"
              >
                <option value="Customer">Customer</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Rider">Rider</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-textSecondary dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend API for login
      const response = await authAPI.login({
        email,
        password
      });

      // Map backend role to frontend role
      const roleMap = {
        'USER': 'Customer',
        'RESTAURANT': 'Restaurant',
        'RIDER': 'Rider'
      };

      // Store token and user info
      localStorage.setItem('zestro_token', response.token);
      const userWithRole = {
        ...response.user,
        role: roleMap[response.user.role] || response.user.role,
        token: response.token
      };
      localStorage.setItem('zestro_user', JSON.stringify(userWithRole));

      // Update AuthContext
      login(userWithRole);
      
      // Redirect based on role
      const frontendRole = roleMap[response.user.role] || response.user.role;
      if (frontendRole === 'Customer') {
        navigate('/user/home');
      } else if (frontendRole === 'Restaurant') {
        navigate('/restaurant/dashboard');
      } else if (frontendRole === 'Rider') {
        navigate('/rider/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-backgroundDark px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Zestro</h1>
          <p className="text-textSecondary dark:text-gray-400">Login to your account</p>
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
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-textSecondary dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

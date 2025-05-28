import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, LogIn, LogOut, Bell } from 'lucide-react';
import { useAuth } from './AuthContext';

export const LoginForm = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Campus Food Finder</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">University Email</label>
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456@edu.p.lodz.pl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn size={20} className="mr-2" />
              Login
            </>
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:underline font-medium"
          >
            Register here
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p><strong>Demo Credentials:</strong></p>
        <p>Student: 111111@edu.p.lodz.pl / password123</p>
        <p>Admin: admin@edu.p.lodz.pl / admin123</p>
		<p className="text-xs mt-1 text-gray-500">Format: 123456@edu.p.lodz.pl</p>
      </div>
    </div>
  );
};

export const RegisterForm = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();

  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!value.endsWith('@edu.p.lodz.pl')) {
          errors.email = 'Must end with @edu.p.lodz.pl';
        } else if (!value.replace('@edu.p.lodz.pl', '').length) {
          errors.email = 'Invalid email format';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!formData.name || formData.name.trim().length === 0) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Full name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (!formData.email || formData.email.trim().length === 0) {
      setError('University email is required');
      setLoading(false);
      return;
    }

    if (!formData.email.endsWith('@edu.p.lodz.pl')) {
      setError('Please use your university email ending with @edu.p.lodz.pl');
      setLoading(false);
      return;
    }

    const emailPrefix = formData.email.replace('@edu.p.lodz.pl', '');
    if (emailPrefix.length === 0) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@edu\.p\.lodz\.pl$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format. Use format: 123456@edu.p.lodz.pl');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Register for Campus Food Finder</h2>
      
      <div className="space-y-4">
        <div>
		  <label className="block text-sm font-medium mb-2">Full Name</label>
		  <div className="relative">
			<User size={20} className="absolute left-3 top-3 text-gray-400" />
			<input
			  type="text"
			  value={formData.name}
			  onChange={(e) => {
				const value = e.target.value;
				setFormData({...formData, name: value});
				validateField('name', value);
			  }}
			  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
				fieldErrors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
			  }`}
			  placeholder="John Doe"
			/>
		  </div>
		  <div className="h-5 mt-1">
			{fieldErrors.name && (
			  <p className="text-red-500 text-xs">{fieldErrors.name}</p>
			)}
		  </div>
		</div>

        <div>
		  <label className="block text-sm font-medium mb-2">University Email</label>
		  <div className="relative">
			<Mail size={20} className="absolute left-3 top-3 text-gray-400" />
			<input
			  type="email"
			  value={formData.email}
			  onChange={(e) => {
				const value = e.target.value;
				setFormData({...formData, email: value});
				validateField('email', value);
			  }}
			  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
				fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
			  }`}
			  placeholder="123456@edu.p.lodz.pl"
			/>
		  </div>
		  <div className="h-5 mt-1">
			{fieldErrors.email && (
			  <p className="text-red-500 text-xs">{fieldErrors.email}</p>
			)}
		  </div>
		</div>

        <div>
		  <label className="block text-sm font-medium mb-2">Password</label>
		  <div className="relative">
			<Lock size={20} className="absolute left-3 top-3 text-gray-400" />
			<input
			  type="password"
			  value={formData.password}
			  onChange={(e) => {
				const value = e.target.value;
				setFormData({...formData, password: value});
				validateField('password', value);
			  }}
			  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
				fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
			  }`}
			  placeholder="Password (min 6 characters)"
			/>
		  </div>
		  <div className="h-5 mt-1">
			{fieldErrors.password && (
			  <p className="text-red-500 text-xs">{fieldErrors.password}</p>
			)}
		  </div>
		</div>

        <div>
		  <label className="block text-sm font-medium mb-2">Confirm Password</label>
		  <div className="relative">
			<Lock size={20} className="absolute left-3 top-3 text-gray-400" />
			<input
			  type="password"
			  value={formData.confirmPassword}
			  onChange={(e) => {
				const value = e.target.value;
				setFormData({...formData, confirmPassword: value});
				validateField('confirmPassword', value);
			  }}
			  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
				fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
			  }`}
			  placeholder="Confirm Password"
			/>
		  </div>
		  <div className="h-5 mt-1">
			{fieldErrors.confirmPassword && (
			  <p className="text-red-500 text-xs">{fieldErrors.confirmPassword}</p>
			)}
		  </div>
		</div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <UserPlus size={20} className="mr-2" />
              Register
            </>
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline font-medium"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export const UserProfile = ({ user, onUpdatePreferences, onClose, showAllDiscounts }) => {
  const [preferences, setPreferences] = useState(user.preferences);
  const { logout } = useAuth();

  const handleSave = () => {
    onUpdatePreferences(preferences);
    onClose();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      
      {/* Add this warning when showAllDiscounts is active */}
      {showAllDiscounts && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            <strong>Note:</strong> Your preferences are currently overridden to show all locations. 
            Update your preferences below to apply filtering again.
          </p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <User size={24} className="text-blue-600 mr-3" />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-3">Food Preferences</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Preferred Price Range</label>
          <select
            value={preferences.priceRange}
            onChange={(e) => setPreferences({...preferences, priceRange: e.target.value})}
            className={`w-full p-2 border rounded-lg ${showAllDiscounts ? 'border-orange-300 bg-orange-50' : ''}`}
          >
            <option value="all">All Prices</option>
            <option value="low">Budget (Under 10 PLN)</option>
            <option value="medium">Mid-Range (10-15 PLN)</option>
            <option value="high">Premium (15+ PLN)</option>
          </select>
          {showAllDiscounts && (
            <p className="text-xs text-orange-600 mt-1">Currently showing all prices regardless of this setting</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Dietary Preferences</label>
          <div className="space-y-2">
            {['vegetarian', 'vegan', 'gluten-free', 'halal'].map(diet => (
              <label key={diet} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.dietary.includes(diet)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences({
                        ...preferences,
                        dietary: [...preferences.dietary, diet]
                      });
                    } else {
                      setPreferences({
                        ...preferences,
                        dietary: preferences.dietary.filter(d => d !== diet)
                      });
                    }
                  }}
                  className={`mr-2 ${showAllDiscounts ? 'accent-orange-500' : ''}`}
                />
                <span className={`capitalize ${showAllDiscounts ? 'text-orange-700' : ''}`}>
                  {diet.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
          {showAllDiscounts && (
            <p className="text-xs text-orange-600 mt-1">Currently showing all dietary options regardless of these settings</p>
          )}
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
              className="mr-2"
            />
            <Bell size={16} className="mr-1" />
            <span>Enable notifications for new discounts</span>
          </label>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
        <button
          onClick={logout}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
        >
          <LogOut size={16} className="mr-1" />
          Logout
        </button>
      </div>
    </div>
  );
};
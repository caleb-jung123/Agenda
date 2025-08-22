import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Agenda
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-6">
              <Link 
                to="/tasks" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Tasks
              </Link>
              <Link 
                to="/notes" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Notes
              </Link>
              <span className="text-gray-600">Hello, {user.username}!</span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

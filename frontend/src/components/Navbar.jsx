import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/85 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-lg shadow-gray-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-200">
              Agenda
            </span>
          </Link>
          
          {user ? (
            <div className="flex items-center">
              <div className="hidden sm:flex items-center space-x-1 pr-6">
                <Link 
                  to="/tasks" 
                  className="px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-medium transition-all duration-200 relative group hover:shadow-sm"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>Tasks</span>
                  </span>
                </Link>
                <Link 
                  to="/notes" 
                  className="px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-medium transition-all duration-200 relative group hover:shadow-sm"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Notes</span>
                  </span>
                </Link>
                <Link 
                  to="/calendar" 
                  className="px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-medium transition-all duration-200 relative group hover:shadow-sm"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Calendar</span>
                  </span>
                </Link>
              </div>

              <div className="flex items-center space-x-4 border-l border-gray-300/60 pl-6">
                <span className="text-gray-700 font-medium text-sm bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-200/50">
                  {user.username}
                </span>
            
                <button 
                  onClick={logout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                to="/login"
                className="px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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

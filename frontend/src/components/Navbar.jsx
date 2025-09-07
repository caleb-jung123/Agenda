import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50" style={{backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
              <svg 
                className="w-4 h-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <span className="text-lg font-medium" style={{color: 'var(--text)'}}>
              Taskly Agenda Test
            </span>
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-1">
              <div className="hidden sm:flex items-center space-x-1 mr-4">
                <Link 
                  to="/tasks" 
                  className="px-2 py-1.5 rounded-md font-medium text-sm transition-all duration-150 flex items-center space-x-1.5 hover-bg"
                  style={{color: 'var(--text-light)'}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Tasks</span>
                </Link>
                <Link 
                  to="/notes" 
                  className="px-2 py-1.5 rounded-md font-medium text-sm transition-all duration-150 flex items-center space-x-1.5 hover-bg"
                  style={{color: 'var(--text-light)'}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Notes</span>
                </Link>
                <Link 
                  to="/calendar" 
                  className="px-2 py-1.5 rounded-md font-medium text-sm transition-all duration-150 flex items-center space-x-1.5 hover-bg"
                  style={{color: 'var(--text-light)'}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Calendar</span>
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md" style={{backgroundColor: 'var(--hover)'}}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium" style={{backgroundColor: 'var(--primary)', color: 'white'}}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{color: 'var(--text)'}}>
                    {user.username}
                  </span>
                </div>
            
                <button 
                  onClick={logout}
                  className="btn flex items-center space-x-1.5"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                to="/login"
                className="btn"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="btn-primary"
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
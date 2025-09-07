import { useAuth } from '../utils/auth';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-12">
      {user ? (
        <div className="space-y-8">
          <div className="text-left">
            <h1 className="title text-3xl mb-3">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.first_name || user.username} 👋
            </h1>
            <p className="subtitle">
              Your personal workspace for tasks and notes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Link 
              to="/tasks"
              className="card p-6 group cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'var(--primary-light)'}}>
                  <svg className="w-5 h-5" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text)'}}>
                    Tasks
                  </h3>
                  <p className="body" style={{color: 'var(--text-light)'}}>
                    Organize and track your tasks with due dates, tags, and Pomodoro timers
                  </p>
                </div>
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{color: 'var(--text-gray)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            
            <Link 
              to="/notes"
              className="card p-6 group cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#1a2a3a'}}>
                  <svg className="w-5 h-5" style={{color: '#60a5fa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text)'}}>
                    Notes
                  </h3>
                  <p className="body" style={{color: 'var(--text-light)'}}>
                    Capture your thoughts, ideas, and important information in organized notes
                  </p>
                </div>
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{color: 'var(--text-gray)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            
            <Link 
              to="/calendar"
              className="card p-6 group cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#1a2a1f'}}>
                  <svg className="w-5 h-5" style={{color: '#4ade80'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text)'}}>
                    Calendar
                  </h3>
                  <p className="body" style={{color: 'var(--text-light)'}}>
                    View your schedule and manage your time with calendar integration
                  </p>
                </div>
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{color: 'var(--text-gray)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            
            <div className="card p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#2a2519'}}>
                  <svg className="w-5 h-5" style={{color: '#fbbf24'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text)'}}>
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.location.href = '/tasks'}
                      className="btn text-sm w-full text-left"
                    >
                      Create new task
                    </button>
                    <button 
                      onClick={() => window.location.href = '/notes'}
                      className="btn text-sm w-full text-left"
                    >
                      Write a note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--primary-light)'}}>
              <svg className="w-8 h-8" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="title text-3xl mb-4">Welcome to Taskly Agenda</h1>
            <p className="subtitle mb-8">
              Your personal workspace for organizing tasks, notes, and schedules in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/login"
                className="btn-primary px-6 py-2.5"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="btn px-6 py-2.5"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

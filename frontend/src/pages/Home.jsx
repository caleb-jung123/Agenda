import { useAuth } from '../utils/auth';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to Agenda</h1>
      {user ? (
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-gray-700">
            Hello, {user.first_name || user.username}! 👋
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personal task and note management system. Stay organized and productive with our simple and elegant tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              to="/tasks"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors transform hover:scale-105 shadow-lg"
            >
              📋 Manage Tasks
            </Link>
            <Link 
              to="/notes"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors transform hover:scale-105 shadow-lg"
            >
              📝 Manage Notes
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please log in to access your personal agenda and start organizing your tasks and notes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

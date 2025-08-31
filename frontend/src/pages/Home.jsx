import { useAuth } from '../utils/auth';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <h1 className="text-4xl font-bold text-neutral-900 mb-6">Welcome to Agenda</h1>
      {user ? (
        <div className="space-y-8">
          <h2 className="text-2xl font-medium text-neutral-700">
            Hello, {user.first_name || user.username}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Your personal task and note management system. Stay organized and productive with our simple and elegant tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link 
              to="/tasks"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-medium text-base transition-colors"
            >
              Manage Tasks
            </Link>
            <Link 
              to="/notes"
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-8 py-3 rounded-lg font-medium text-base transition-colors border border-neutral-200"
            >
              Manage Notes
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Please log in to access your personal agenda and start organizing your tasks and notes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-medium text-base transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-8 py-3 rounded-lg font-medium text-base transition-colors border border-neutral-200"
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

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import AuthForm from '../components/AuthForm';

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <AuthForm type="login" onSubmit={handleLogin} />
        {error && (
          <div className="card px-4 py-3" style={{backgroundColor: '#2d1b1b', borderColor: '#5c2626'}}>
            <p className="body" style={{color: '#fca5a5'}}>{error}</p>
          </div>
        )}
        <p className="text-center body">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium" style={{color: 'var(--primary)'}}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import AuthForm from '../components/AuthForm';

const Register = () => {
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    const result = await register(userData);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <AuthForm type="register" onSubmit={handleRegister} />
        {error && (
          <div className="card px-4 py-3" style={{backgroundColor: '#2d1b1b', borderColor: '#5c2626'}}>
            <p className="body" style={{color: '#fca5a5'}}>
              {typeof error === 'object' ? JSON.stringify(error) : error}
            </p>
          </div>
        )}
        <p className="text-center body">
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{color: 'var(--primary)'}}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

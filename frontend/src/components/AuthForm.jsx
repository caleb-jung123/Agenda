import { useState } from 'react';

const AuthForm = ({ type, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto card p-8">
      <h2 className="title text-2xl text-center mb-6">
        {type === 'login' ? 'Welcome back' : 'Create account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        
        {type === 'register' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="password" className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        
        <button 
          type="submit"
          className="btn-primary w-full py-3 font-medium"
        >
          {type === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;

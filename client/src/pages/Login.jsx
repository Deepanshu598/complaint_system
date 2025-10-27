import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login(){
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(data){
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(data) 
      });
      const j = await res.json();
      if(j.token){ 
        dispatch(setAuth({ token: j.token, user: j.user })); 
        navigate('/dashboard'); 
      } else {
        alert(j.error||'Login failed');
      }
    } catch (error) {
      alert('Login error');
    }
  }

  return (
    <div className="center card login-container">
      <div className="login-header">
        <h2>Complaint Management System</h2>
        <p>Sign in to your account</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div className="form-group">
          <input 
            placeholder="Email address" 
            {...register('email',{required:true, pattern: /^\S+@\S+$/i})} 
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">Valid email is required</span>}
        </div>
        
        <div className="form-group">
          <input 
            placeholder="Password" 
            type="password" 
            {...register('password',{required:true})} 
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-text">Password is required</span>}
        </div>
        
        <button type="submit" className="btn-login">Sign In</button>
      </form>
      
      {/* <div className="login-footer">
        <Link to="/signup">Don't have an account? Sign up</Link>
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>SuperAdmin:</strong> superadmin@gmail.com / superadmin@123</p>
        </div>
      </div> */}
      <div className="login-footer">
        <Link to="/signup">Don't have an account? Sign up</Link>
        </div>
    </div>
  );
}

import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login(){
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(data){
    const res = await fetch('http://localhost:4000/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    const j = await res.json();
    if(j.token){ dispatch(setAuth({ token: j.token, user: j.user })); navigate('/dashboard'); }
    else alert(j.error||'login failed');
  }

  return (
    <div className="center card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="email" {...register('email',{required:true})} />
        <input placeholder="password" type="password" {...register('password',{required:true})} />
        <button type="submit">Login</button>
      </form>
      <div><Link to="/signup">Create account</Link></div>
    </div>
  );
}

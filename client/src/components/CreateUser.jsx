import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { fetchUsers } from '../store/slices/usersSlice';

export default function CreateUser(){
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  
  async function onSubmit(data){
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/users', { 
        method:'POST', 
        headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, 
        body: JSON.stringify(data) 
      });
      const j = await res.json();
      if(j.user_id){ 
        alert('User created successfully!'); 
        reset(); 
        dispatch(fetchUsers()); // Refresh users list
      } else {
        alert(j.error || 'Failed to create user');
      }
    } catch (error) {
      alert('Error creating user');
    }
  }
  
  return (
    <div className="create-user-form">
      <h3>Create New Admin</h3>
      <div className="create-admin-info">
        <p>Create a new admin user who can manage and resolve complaints.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="user-form">
        <div className="form-group">
          <input 
            {...register('email',{required:true, pattern: /^\S+@\S+$/i})} 
            placeholder="Email address" 
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">Valid email is required</span>}
        </div>
        
        <div className="form-group">
          <input 
            {...register('first_name',{required:true})} 
            placeholder="First Name" 
            className={errors.first_name ? 'error' : ''}
          />
          {errors.first_name && <span className="error-text">First name is required</span>}
        </div>
        
        <div className="form-group">
          <input 
            {...register('last_name',{required:true})} 
            placeholder="Last Name" 
            className={errors.last_name ? 'error' : ''}
          />
          {errors.last_name && <span className="error-text">Last name is required</span>}
        </div>
        
        <div className="form-group">
          <input 
            {...register('password',{required:true, minLength: 6})} 
            placeholder="Password (min 6 characters)" 
            type="password"
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-text">Password must be at least 6 characters</span>}
        </div>
        
        <div className="form-group">
          <select {...register('role_name',{required:true})} className="role-select">
            <option value="">Select Role</option>
            <option value="approver">Admin (Can resolve complaints)</option>
            <option value="reviewer">Reviewer (Can review complaints)</option>
          </select>
          {errors.role_name && <span className="error-text">Role is required</span>}
        </div>
        
        <button type="submit" className="btn-create">Create User</button>
      </form>
    </div>
  );
}

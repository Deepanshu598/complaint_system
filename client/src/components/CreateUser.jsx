import React from 'react';
import { useForm } from 'react-hook-form';

export default function CreateUser(){
  const { register, handleSubmit, reset } = useForm();
  async function onSubmit(data){
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/api/users', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, body: JSON.stringify(data) });
    const j = await res.json();
    if(j.user_id){ alert('created'); reset(); } else alert(JSON.stringify(j));
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>Create User (SuperAdmin)</h3>
      <input {...register('email',{required:true})} placeholder="email" />
      <select {...register('role_name')}>
        <option value="approver">Approver</option>
        <option value="reviewer">Reviewer</option>
      </select>
      <button type="submit">Create</button>
    </form>
  );
}

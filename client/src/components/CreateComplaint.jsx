import React from 'react';
import { useForm } from 'react-hook-form';

export default function CreateComplaint(){
  const { register, handleSubmit, reset } = useForm();
  async function onSubmit(data){
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/api/complaints', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, body: JSON.stringify(data) });
    const j = await res.json();
    if(j.complaint_id){ alert('filed'); reset(); } else alert(JSON.stringify(j));
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>File Complaint</h3>
      <textarea {...register('description',{required:true})} placeholder="Describe..." />
      <button type="submit">Submit</button>
    </form>
  );
}

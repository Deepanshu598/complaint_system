import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { fetchComplaints } from '../store/slices/complaintsSlice';

export default function CreateComplaint(){
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  
  async function onSubmit(data){
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/complaints', { 
        method:'POST', 
        headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, 
        body: JSON.stringify(data) 
      });
      const j = await res.json();
      if(j.complaint_id){ 
        alert('Complaint filed successfully! Your complaint ID is: ' + j.complaint_id.slice(0, 8)); 
        reset(); 
        dispatch(fetchComplaints()); 
      } else {
        alert(j.error || 'Failed to file complaint');
      }
    } catch (error) {
      alert('Error filing complaint');
    }
  }
  
  return (
    <div className="create-complaint-form">
      <h3>File New Complaint</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="complaint-form">
        <div className="form-group">
          <label htmlFor="description">Describe your complaint:</label>
          <textarea 
            id="description"
            {...register('description',{required:true, minLength: 10})} 
            placeholder="Please provide a detailed description of your complaint. Include relevant information such as dates, locations, and any supporting details..."
            rows="6"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && (
            <span className="error-text">
              {errors.description.type === 'required' ? 'Description is required' : 'Description must be at least 10 characters'}
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="assign_to_role">Assign to (optional):</label>
          <select id="assign_to_role" {...register('assign_to_role')} className="assign-select">
            <option value="">Auto-assign (Recommended)</option>
            <option value="reviewer">Reviewer</option>
            <option value="approver">Admin</option>
          </select>
        </div>
        
        <button type="submit" className="btn-submit">File Complaint</button>
      </form>
    </div>
  );
}

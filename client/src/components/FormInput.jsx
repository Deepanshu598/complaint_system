import React from 'react';

export default function FormInput({ label, register, name, required, type='text' }){
  return (
    <div className="form-group">
      <label>{label}</label>
      <input {...(register? register(name, { required }) : {})} type={type} />
    </div>
  );
}

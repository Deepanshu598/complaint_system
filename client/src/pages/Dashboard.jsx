import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchComplaints } from '../store/slices/complaintsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import CreateComplaint from '../components/CreateComplaint';
import CreateUser from '../components/CreateUser';

export default function Dashboard(){
  const auth = useSelector(s=>s.auth);
  const complaints = useSelector(s=>s.complaints.list);
  const users = useSelector(s=>s.users.list || []);
  const dispatch = useDispatch();
  const [config, setConfig] = useState(null);

  useEffect(()=>{
    if(!auth || !auth.user) return;
  const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:4000';
    fetch(`${url}/api/users/${auth.user.user_id}/screen-config`, { headers: { Authorization: 'Bearer '+auth.token } })
      .then(r=>{
        if(!r.ok) return r.text().then(t=>{ console.error('screen-config error', t); return null; });
        return r.json();
      })
      .then(cfg=>{ if(cfg) setConfig(cfg); });
  },[auth]);
  useEffect(()=>{ dispatch(fetchComplaints()); dispatch(fetchUsers()); },[]);

  return (
    <div className="container">
      <header className="header"><h1>Welcome</h1></header>
      <div className="grid">
        <aside className="sidebar">
          <h3>Menu</h3>
          {config && config.screens.map(s=> <div key={s}>{s}</div>)}
        </aside>
        <main>
          <section className="card"><h3>Complaints</h3><ul>{complaints.map(c=> <li key={c.complaint_id}>{c.description} — {c.status}</li>)}</ul></section>
          <section className="card"><CreateComplaint /></section>
          <section className="card"><CreateUser /></section>
          <section className="card"><h3>Users</h3>
            <ul>
              {Array.isArray(users) && users.length>0 ? users.map(u=> <li key={u.user_id}>{u.email} ({u.role?u.role.role_name:''})</li>) : <li>No users available</li>}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

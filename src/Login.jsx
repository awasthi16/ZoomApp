import React, { useState } from 'react';
import axios from 'axios';

// Direct backend URL since no .env in frontend
const API = 'http://localhost:4000';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async () => {
    try {
      const url = `${API}/api/${isRegister ? 'register' : 'login'}`;
      const payload = isRegister ? { name, email, password } : { email, password };
      const res = await axios.post(url, payload);
      onLogin(res.data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      {isRegister && <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />}
      <br />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <br />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <br />
      <button onClick={submit}>{isRegister ? 'Register' : 'Login'}</button>
      <button onClick={()=>setIsRegister(!isRegister)} style={{ marginLeft: 10 }}>
        {isRegister ? 'Switch to Login' : 'Switch to Register'}
      </button>
      {err && <div style={{ color: 'red' }}>{err}</div>}
    </div>
  );
}

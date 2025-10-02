import React, { useState, useEffect } from 'react';
import Login from './Login';
import Lobby from './Lobby';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const onLogin = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.reload();
  };

  return (
    <div>
      {!token ? <Login onLogin={onLogin} /> : <Lobby token={token} user={user} onLogout={logout} />}
    </div>
  );
}

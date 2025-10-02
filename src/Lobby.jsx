import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import CallRoom from './CallRoom';

// Hardcoded backend API URL for Vite
const API = 'http://localhost:4000';

export default function Lobby({ token, user, onLogout }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [messages, setMessages] = useState([]);
  const msgInputRef = useRef();

  useEffect(() => {
    const s = io(API, { autoConnect: true });
    setSocket(s);

    s.on('connect', () => {
      s.emit('auth', token);
    });

    s.on('auth-success', (payload) => {
      console.log('auth-success', payload);
    });

    s.on('user-list', (users) => {
      setOnlineUsers(users);
    });

    s.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => s.close();
  }, [token]);

  const joinRoom = async () => {
    if(!roomId) return alert('Enter room ID');
    socket.emit('join-room', { roomId });

    // Load previous messages
    const res = await axios.get(`${API}/api/rooms/${roomId}/messages`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    setMessages(res.data);
    setInRoom(true);
  };

  const leaveRoom = () => {
    socket.emit('leave-room', { roomId });
    setInRoom(false);
    setMessages([]);
  };

  const sendMessage = () => {
    const text = msgInputRef.current.value;
    if(!text) return;
    socket.emit('send-message', { roomId, text });
    msgInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20 }}>
      <div style={{ width: 250 }}>
        <h3>Welcome, {user.name}</h3>
        <button onClick={onLogout}>Logout</button>

        <h4>Online users</h4>
        <ul>
          {onlineUsers.map((u, idx) => (
            <li key={idx}>{u.name} — {u.email}</li>
          ))}
        </ul>

        <div style={{ marginTop: 20 }}>
          <h4>Join room / start call</h4>
          <input placeholder="room id" value={roomId} onChange={e => setRoomId(e.target.value)} />
          <button onClick={joinRoom}>Join</button>
          <button onClick={leaveRoom} style={{ marginLeft: 10 }}>Leave</button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {!inRoom ? (
          <div>
            <h3>Not in a room</h3>
            <p>Enter a room ID to join chat or call (1:1 calls supported).</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <h4>Chat — Room: {roomId}</h4>
              <div style={{ border: '1px solid #ddd', padding: 10, height: 400, overflow: 'auto' }}>
                {messages.map(m => (
                  <div key={m._id || Math.random()}>
                    <b>{m.from}</b>: {m.text}{' '}
                    <small style={{ color:'#666' }}>{new Date(m.createdAt).toLocaleTimeString()}</small>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <input ref={msgInputRef} placeholder="Type a message..." style={{ width: '80%' }} />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>

            <div style={{ width: 480 }}>
              <h4>Video</h4>
              <CallRoom socket={socket} token={token} roomId={roomId} localUser={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

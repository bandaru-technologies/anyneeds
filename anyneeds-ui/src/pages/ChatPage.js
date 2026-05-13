import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import api from '../services/api';
import './ChatPage.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_URL = API_BASE.replace(/^http/, 'ws') + '/ws';

function timeLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function sameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.toDateString() === db.toDateString();
}

export default function ChatPage() {
  const { conversationId } = useParams();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const clientRef = useRef(null);
  const token = localStorage.getItem('salepe_token');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
  }, [isLoggedIn, navigate]);

  // Load conversation + message history
  useEffect(() => {
    Promise.all([
      api.get('/api/conversations'),
      api.get(`/api/conversations/${conversationId}/messages`),
    ]).then(([convRes, msgRes]) => {
      const found = convRes.data.find((c) => String(c.id) === String(conversationId));
      setConv(found || null);
      setMessages(msgRes.data);
      api.patch(`/api/conversations/${conversationId}/read`).catch(() => {});
    }).catch(() => navigate('/messages'));
  }, [conversationId, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/user/queue/inbox', (frame) => {
          const msg = JSON.parse(frame.body);
          if (String(msg.conversationId) === String(conversationId)) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            api.patch(`/api/conversations/${conversationId}/read`).catch(() => {});
          }
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, [token, conversationId]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const req = { content, type: 'TEXT' };

    // Try WebSocket first, fall back to REST
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/chat/${conversationId}`,
        body: JSON.stringify(req),
      });
      setSending(false);
    } else {
      try {
        const { data } = await api.post(`/api/conversations/${conversationId}/messages`, req);
        setMessages((prev) => [...prev, data]);
      } catch {
        setInput(content);
      } finally {
        setSending(false);
      }
    }
  }, [input, sending, conversationId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const otherParty = conv && user ? (
    conv.buyerId === user.id
      ? { name: conv.sellerName, id: conv.sellerId }
      : { name: conv.buyerName, id: conv.buyerId }
  ) : null;

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <Link to="/messages" className="chat-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            {otherParty?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="chat-header-name">{otherParty?.name || 'Loading...'}</p>
            {conv && (
              <Link to={`/listings/${conv.listingId}`} className="chat-header-listing">
                {conv.listingTitle}
              </Link>
            )}
          </div>
        </div>
        <div className={`chat-status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'Live' : 'Connecting...'}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-start-hint">
            <p>Start the conversation about this listing</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user?.id;
          const showDate = idx === 0 || !sameDay(messages[idx - 1].createdAt, msg.createdAt);
          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="chat-date-sep">
                  {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              <div className={`msg-row ${isMe ? 'msg-mine' : 'msg-theirs'}`}>
                <div className="msg-bubble">
                  <p>{msg.content}</p>
                  <span className="msg-time">{timeLabel(msg.createdAt)}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <textarea
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={1000}
        />
        <button className="chat-send-btn" onClick={sendMessage} disabled={!input.trim() || sending}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

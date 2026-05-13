import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './MessagesPage.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function MessagesPage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/messages' } }); return; }
    api.get('/api/conversations')
      .then((r) => setConversations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  const getOtherParty = (conv) => {
    const isBuyer = conv.buyerId === user?.id;
    return isBuyer
      ? { name: conv.sellerName, id: conv.sellerId }
      : { name: conv.buyerName, id: conv.buyerId };
  };

  return (
    <div className="messages-page">
      <div className="container">
        <div className="messages-header">
          <h1 className="messages-title">Messages</h1>
          {conversations.length > 0 && (
            <span className="messages-count">{conversations.length}</span>
          )}
        </div>

        {loading ? (
          <div className="spinner" style={{ marginTop: 60 }} />
        ) : conversations.length === 0 ? (
          <div className="messages-empty">
            <div className="messages-empty-icon">💬</div>
            <h3>No messages yet</h3>
            <p>When you contact a seller, your conversation will appear here</p>
            <Link to="/listings" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Listings</Link>
          </div>
        ) : (
          <div className="conv-list">
            {conversations.map((conv) => {
              const other = getOtherParty(conv);
              const initials = other.name?.[0]?.toUpperCase() || '?';
              return (
                <Link key={conv.id} to={`/messages/${conv.id}`} className="conv-item">
                  <div className="conv-avatar">{initials}</div>
                  <div className="conv-listing-thumb">
                    {conv.listingThumbnail
                      ? <img src={conv.listingThumbnail} alt="" />
                      : <div className="conv-thumb-placeholder">📷</div>}
                  </div>
                  <div className="conv-body">
                    <div className="conv-row">
                      <span className="conv-name">{other.name}</span>
                      <span className="conv-time">{timeAgo(conv.lastMessageAt || conv.createdAt)}</span>
                    </div>
                    <div className="conv-listing-title">{conv.listingTitle}</div>
                    <div className="conv-last-row">
                      <span className="conv-last-msg">{conv.lastMessage || 'Conversation started'}</span>
                      {conv.unreadCount > 0 && (
                        <span className="conv-unread">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

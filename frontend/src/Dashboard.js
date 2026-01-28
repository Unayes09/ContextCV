import React, { useState, useEffect } from 'react';
import api from './api';
import ReactMarkdown from 'react-markdown';
import { Save, LogOut, ExternalLink, Edit3, Eye } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      setContent(res.data.content);
      setUserId(res.data.userId);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setContent('# Welcome to my Living CV\n\nStart editing to introduce yourself!');
      } else {
        console.error('Error fetching portfolio:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.put('/portfolio', { content });
      setMessage('Portfolio updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh to ensure we have userId if it was first save
      if (!userId) fetchPortfolio();
    } catch (err) {
      setMessage('Error saving portfolio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Portfolio</h1>
        <div className="header-actions">
          {userId && (
            <a href={`/profile/${userId}`} target="_blank" rel="noopener noreferrer" className="action-btn outline">
              <ExternalLink size={18} /> View Public
            </a>
          )}
          <button onClick={onLogout} className="action-btn danger">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="editor-container">
        <div className="toolbar">
          <div className="tabs">
            <button 
              className={`tab-btn ${!isPreview ? 'active' : ''}`} 
              onClick={() => setIsPreview(false)}
            >
              <Edit3 size={16} /> Edit
            </button>
            <button 
              className={`tab-btn ${isPreview ? 'active' : ''}`} 
              onClick={() => setIsPreview(true)}
            >
              <Eye size={16} /> Preview
            </button>
          </div>
          <button onClick={handleSave} disabled={saving} className="save-btn">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {message && <div className="notification">{message}</div>}

        <div className="editor-content">
          {!isPreview ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your markdown here..."
              className="markdown-editor"
            />
          ) : (
            <div className="markdown-preview">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

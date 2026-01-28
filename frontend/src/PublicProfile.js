import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import io from 'socket.io-client';
import api from './api';
import { Send, User, Bot, MessageSquare } from 'lucide-react';

const PublicProfile = ({ userId }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchPortfolio();
    
    // Socket connection
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on('bot_stream', (chunk) => {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'owner' && lastMsg.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, text: lastMsg.text + chunk }
          ];
        } else {
          return [...prev, { sender: 'owner', text: chunk, isStreaming: true }];
        }
      });
      setIsTyping(false);
    });

    socketRef.current.on('error', (err) => {
      console.error('Socket error:', err);
      setIsTyping(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      // Direct axios call to avoid auth header if api.js injects it automatically
      // But api.js injects only if token exists. 
      // Public profile should be accessible without token.
      const res = await api.get(`/portfolio/${userId}`);
      setContent(res.data.content);
    } catch (err) {
      setContent('# User not found or has no portfolio.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const question = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'visitor', text: question }]);
    setIsTyping(true);

    // If previous message was streaming, mark it as done
    setMessages(prev => prev.map(msg => ({ ...msg, isStreaming: false })));

    socketRef.current.emit('chat_with_bot', { targetUserId: userId, question });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) return <div className="loading">Loading Profile...</div>;

  return (
    <div className="public-profile-container">
      <div className="profile-content">
        <div className="markdown-viewer">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      <div className="chat-interface">
        <div className="chat-header">
          <div className="avatar owner-avatar-small">
            <User size={20} />
          </div>
          <h3>Chat with Owner (AI)</h3>
        </div>

        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-state">
              <MessageSquare size={40} />
              <p>Ask me anything about my experience!</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'visitor' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && <div className="typing-indicator">Owner is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

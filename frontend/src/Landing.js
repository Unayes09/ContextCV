import React from 'react';
import { ArrowRight, Sparkles, Layout, MessageSquare, Zap } from 'lucide-react';

const Landing = ({ onGetStarted }) => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">
          <Sparkles className="logo-icon" />
          <span>ContextCV</span>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero-section">
          <h1 className="hero-title">
            Your CV is <span className="gradient-text">Alive</span>
          </h1>
          <p className="hero-subtitle">
            Transform your static markdown into an interactive experience. 
            Build your profile and let visitors chat with your AI twin.
          </p>
          <button className="cta-button" onClick={onGetStarted}>
            Get Started <ArrowRight size={20} />
          </button>
        </section>

        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Layout size={24} />
            </div>
            <h3>Markdown First</h3>
            <p>Write your portfolio in familiar markdown. Simple, clean, and versionable.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3>AI Powered</h3>
            <p>Our RAG-based AI learns your experience to answer visitor questions accurately.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <MessageSquare size={24} />
            </div>
            <h3>Interactive Chat</h3>
            <p>Let visitors engage with your profile through a natural, intuitive chat interface.</p>
          </div>
        </section>

        <section className="how-it-works">
          <h2>How it works</h2>
          <div className="steps-container">
            <div className="step">
              <span className="step-num">1</span>
              <h4>Create</h4>
              <p>Sign up and write your profile in markdown.</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <span className="step-num">2</span>
              <h4>Publish</h4>
              <p>Your profile is instantly live with a unique URL.</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <span className="step-num">3</span>
              <h4>Interact</h4>
              <p>Visitors chat with your AI to learn about you.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 ContextCV. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

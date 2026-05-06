import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('React render error:', error, info);
    // Remove loading screen so error is visible
    const ls = document.getElementById('loading-screen');
    if (ls) ls.remove();
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24, fontFamily: 'monospace', fontSize: 13,
          background: '#e8dfc9', minHeight: '100vh', color: '#15110d',
        }}>
          <div style={{ color: '#a8330c', fontWeight: 700, marginBottom: 8 }}>
            App failed to render
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a0a0f',
          color: '#ffffff',
          padding: '20px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Oops! Something went wrong</h1>
          <p style={{ fontSize: '16px', marginBottom: '20px', maxWidth: '600px', textAlign: 'center' }}>
            We're experiencing a technical issue. Please refresh the page or try again later.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#1a1a24',
              borderRadius: '8px',
              maxWidth: '800px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                Error Details (Development Only)
              </summary>
              <p style={{ fontSize: '12px', margin: '0' }}>
                {this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <p style={{ fontSize: '12px', margin: '10px 0 0 0' }}>
                  {this.state.errorInfo.componentStack}
                </p>
              )}
            </details>
          )}
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '30px',
              padding: '12px 24px',
              backgroundColor: '#c026d3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

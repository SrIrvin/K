import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../services/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({ err: error, errorInfo }, 'Uncaught error in React component');
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Check the console for details.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

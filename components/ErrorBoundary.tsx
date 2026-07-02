import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../services/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({ err: error, errorInfo }, 'Uncaught error in React component');
  }

  public override render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Check the console for details.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Comprehensive Logging Utility for StoryNest
 * Provides structured logging with timestamps, colors, and different log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = process.env.LOG_LEVEL || 'info';
  private verboseLogging = process.env.VERBOSE_LOGGING === 'true';

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = this.getTimestamp();
    const emoji = this.getEmoji(level);
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${emoji} ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🐛';
      case 'info': return 'ℹ️ ';
      case 'warn': return '⚠️ ';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📝';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      };
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  success(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('success', message, context));
    }
  }

  // Specialized logging methods for different application areas
  oauth(message: string, context?: LogContext): void {
    if (process.env.LOG_OAUTH_FLOWS === 'true') {
      this.info(`[OAUTH] ${message}`, context);
    }
  }

  api(message: string, context?: LogContext): void {
    if (process.env.LOG_API_REQUESTS === 'true') {
      this.info(`[API] ${message}`, context);
    }
  }

  database(message: string, context?: LogContext): void {
    if (process.env.LOG_DATABASE_QUERIES === 'true') {
      this.debug(`[DATABASE] ${message}`, context);
    }
  }

  ai(message: string, context?: LogContext): void {
    if (process.env.LOG_AI_INTERACTIONS === 'true') {
      this.info(`[AI] ${message}`, context);
    }
  }

  // Performance logging
  performance(operation: string, startTime: number, context?: LogContext): void {
    const duration = Date.now() - startTime;
    const performanceContext = { ...context, duration: `${duration}ms` };
    
    if (duration > 5000) {
      this.warn(`[PERFORMANCE] Slow operation: ${operation}`, performanceContext);
    } else if (duration > 1000) {
      this.info(`[PERFORMANCE] ${operation}`, performanceContext);
    } else if (this.verboseLogging) {
      this.debug(`[PERFORMANCE] ${operation}`, performanceContext);
    }
  }

  // Request logging middleware helper
  request(method: string, url: string, context?: LogContext): void {
    this.api(`${method} ${url}`, {
      ...context,
      timestamp: this.getTimestamp(),
      userAgent: context?.userAgent || 'unknown'
    });
  }

  // Response logging helper
  response(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    const emoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    this.api(`${emoji} ${method} ${url} - ${status} (${duration}ms)`, context);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogContext };

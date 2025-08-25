/**
 * Enhanced Logging System
 * 
 * Provides structured logging for the Facebook Ads data collection system
 * with different log levels and contextual information
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  error?: Error
}

class Logger {
  private context: string
  private isDevelopment: boolean

  constructor(context: string = 'App') {
    this.context = context
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...(data && { data })
    }
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const logEntry = this.formatMessage(level, message, data)
    if (error) {
      logEntry.error = error
    }

    // In development, use console with emojis for better visibility
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[level]

      const prefix = `${emoji} [${this.context}]`
      
      switch (level) {
        case 'debug':
          console.debug(prefix, message, data)
          break
        case 'info':
          console.info(prefix, message, data)
          break
        case 'warn':
          console.warn(prefix, message, data)
          break
        case 'error':
          console.error(prefix, message, data, error)
          break
      }
    } else {
      // In production, use structured JSON logging
      console.log(JSON.stringify(logEntry))
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error, data?: any) {
    this.log('error', message, data, error)
  }

  // Specific logging methods for Facebook API operations
  facebookApiRequest(url: string, attempt: number = 1) {
    this.debug(`Facebook API Request (attempt ${attempt})`, {
      url: url.replace(/access_token=[^&]+/, 'access_token=***'),
      attempt
    })
  }

  facebookApiResponse(endpoint: string, recordCount: number, responseTime?: number) {
    this.info(`Facebook API Response - ${endpoint}`, {
      endpoint,
      recordCount,
      responseTime: responseTime ? `${responseTime}ms` : undefined
    })
  }

  facebookApiError(endpoint: string, error: Error, attempt: number = 1) {
    this.error(`Facebook API Error - ${endpoint}`, error, {
      endpoint,
      attempt,
      errorCode: (error as any).code,
      errorMessage: error.message
    })
  }

  dataValidation(isValid: boolean, errors?: string[], warnings?: string[]) {
    if (isValid) {
      this.info('Data validation passed', { 
        warnings: warnings?.length || 0 
      })
    } else {
      this.error('Data validation failed', undefined, {
        errors: errors || [],
        errorCount: errors?.length || 0
      })
    }
  }

  dataTransformation(transformationCount: number, transformations: string[]) {
    if (transformationCount > 0) {
      this.info(`Data transformation applied`, {
        transformationCount,
        transformations: transformations.slice(0, 5) // Limit to first 5 for brevity
      })
    }
  }

  dataStorage(clientName: string, monthYear: string, recordCount: number, timeMs: number) {
    this.info(`Data stored successfully`, {
      clientName,
      monthYear,
      recordCount,
      storageTimeMs: timeMs
    })
  }

  dataStorageError(clientName: string, monthYear: string, error: Error) {
    this.error(`Data storage failed`, error, {
      clientName,
      monthYear
    })
  }

  adminAction(adminEmail: string, action: string, details?: any) {
    this.info(`Admin action: ${action}`, {
      adminEmail,
      action,
      timestamp: new Date().toISOString(),
      ...details
    })
  }
}

// Create logger instances for different parts of the system
export const facebookApiLogger = new Logger('FacebookAPI')
export const dataValidationLogger = new Logger('DataValidation')
export const dataStorageLogger = new Logger('DataStorage')
export const adminLogger = new Logger('Admin')
export const authLogger = new Logger('Auth')

// Generic logger for general use
export const logger = new Logger('App')

// Error tracking and reporting
export class ErrorTracker {
  private static errors: Array<{
    timestamp: string
    context: string
    error: Error
    additionalData?: any
  }> = []

  static trackError(context: string, error: Error, additionalData?: any) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      additionalData
    }

    this.errors.push(errorEntry as any)
    
    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100)
    }

    // Log the error
    const contextLogger = new Logger(context)
    contextLogger.error(error.message, error, additionalData)
  }

  static getRecentErrors(count: number = 10) {
    return this.errors.slice(-count)
  }

  static getErrorsByContext(context: string) {
    return this.errors.filter(e => e.context === context)
  }

  static clearErrors() {
    this.errors = []
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Array<{
    timestamp: string
    operation: string
    duration: number
    success: boolean
    additionalData?: any
  }> = []

  static startTimer(operation: string) {
    const startTime = Date.now()
    
    return {
      end: (success: boolean = true, additionalData?: any) => {
        const duration = Date.now() - startTime
        
        this.metrics.push({
          timestamp: new Date().toISOString(),
          operation,
          duration,
          success,
          additionalData
        })

        // Keep only last 1000 metrics
        if (this.metrics.length > 1000) {
          this.metrics = this.metrics.slice(-1000)
        }

        const performanceLogger = new Logger('Performance')
        performanceLogger.info(`${operation} completed`, {
          duration: `${duration}ms`,
          success,
          ...additionalData
        })

        return duration
      }
    }
  }

  static getMetrics(operation?: string) {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation)
    }
    return this.metrics
  }

  static getAverageTime(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation && m.success)
    if (operationMetrics.length === 0) return 0
    
    const totalTime = operationMetrics.reduce((sum, m) => sum + m.duration, 0)
    return Math.round(totalTime / operationMetrics.length)
  }

  static getSuccessRate(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation)
    if (operationMetrics.length === 0) return 0
    
    const successfulOps = operationMetrics.filter(m => m.success).length
    return Math.round((successfulOps / operationMetrics.length) * 100)
  }
}
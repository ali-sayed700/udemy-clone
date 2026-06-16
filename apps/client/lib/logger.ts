/**
 * A centralized logger utility for the Next.js frontend.
 *
 * In development mode, logs are outputted to the console.
 * In production mode, standard logs (info, log) are suppressed,
 * while warnings and errors are logged minimally (and can be sent to a tracking service like Sentry).
 */

class Logger {
  log(message: string, ...optionalParams: string[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(message, ...optionalParams);
    }
  }

  info(message: string, ...optionalParams: string[]) {
    if (process.env.NODE_ENV !== "production") {
      console.info(message, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: string[]) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(message, ...optionalParams);
    } else {
      // In production, keep warnings but format them
      console.warn("[WARN]", message, ...optionalParams);
    }
  }

  error(message: string, error?: { message: string }) {
    if (process.env.NODE_ENV !== "production") {
      console.error(message, error);
    } else {
      // In production, log just enough info for tracking (could be replaced with Sentry captureException)
      console.error("[ERROR]", message, error?.message || error);
    }
  }
}

export const logger = new Logger();

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: any[]) {
    const time = new Date().toISOString();

    return `[${time}] [${level.toUpperCase()}]`;
  }

  info(...args: any[]) {
    console.log(this.formatMessage("info", args), ...args);
  }

  warn(...args: any[]) {
    console.warn(this.formatMessage("warn", args), ...args);
  }

  error(...args: any[]) {
    console.error(this.formatMessage("error", args), ...args);
  }

  debug(...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("debug", args), ...args);
    }
  }
}

export const logger = new Logger();

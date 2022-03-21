interface LoggerLevels {
  [index: string]: number;
}

interface LoggerInterface {
  debug(level: any[]): void;
  info(level: any[]): void;
  warn(level: any[]): void;
  error(level: any[]): void;
}

const LOGGER_LEVELS: LoggerLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger implements LoggerInterface {
  level_state: string | undefined;
  private readonly level: number;

  constructor(level_state = "debug") {
    if (!(level_state in LOGGER_LEVELS)) level_state = "debug";
    this.level = LOGGER_LEVELS[level_state];
  }

  debug(...args: any[]) {
    if (this.level <= LOGGER_LEVELS["debug"]) console.debug(args);
  }

  info(...args: any[]) {
    if (this.level <= LOGGER_LEVELS["info"]) console.info(args);
  }

  warn(...args: any[]) {
    if (this.level <= LOGGER_LEVELS["warn"]) console.warn(args);
  }

  error(...args: any[]) {
    if (this.level <= LOGGER_LEVELS["error"]) console.error(args);
  }
}

export const logger = new Logger();

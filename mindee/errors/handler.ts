import { logger } from "../logger";

interface ErrorHandlerInterface {
  throw(error: any, force: boolean): void;
}

class ErrorHandler implements ErrorHandlerInterface {
  constructor(public throwOnError: boolean = true) {
    this.throwOnError = throwOnError;
  }

  throw(error: { message: any }, force = true) {
    if (this.throwOnError || force) throw error;
    else logger.error(error.message);
  }
}

export const errorHandler = new ErrorHandler();
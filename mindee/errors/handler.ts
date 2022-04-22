import { logger } from "../logger";

interface ErrorHandlerInterface {
  throw(error: any): void;
}

class ErrorHandler implements ErrorHandlerInterface {
  constructor(public throwOnError: boolean = true) {
    this.throwOnError = throwOnError;
  }

  throw(error: any): void {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'force'.
    if (this.throwOnError || force) throw error;
    else logger.error(error.message);
  }
}

export const errorHandler = new ErrorHandler();

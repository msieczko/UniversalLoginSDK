type ErrorType = 'ConcurrentAuthorisation' | 'ConcurrentDeployment' | 'UnsupportedBytecode' | 'InvalidAddress' | 'MissingConfiguration' | 'TransactionHashNotFound' | 'MissingMessageHash' | 'TimeoutError' | 'InvalidEvent';

export class SDKError extends Error {
  errorType : ErrorType;

  constructor (message: string, errorType: ErrorType) {
    super(message);
    this.errorType = errorType;
    Object.setPrototypeOf(this, SDKError.prototype);
  }
}

export class Conflict extends SDKError {
  constructor (message: string, errorType: ErrorType) {
    super(message, errorType);
    this.errorType = errorType;
    Object.setPrototypeOf(this, Conflict.prototype);
  }
}

export class ConcurrentDeployment extends Conflict {
  constructor () {
    super('Other wallet waiting for counterfactual deployment. Stop observer to cancel old wallet instantialisation.', 'ConcurrentDeployment');
    Object.setPrototypeOf(this, ConcurrentDeployment.prototype);
  }
}

export class ConcurrentAuthorisation extends Conflict {
  constructor () {
    super('Another wallet is subscribed.', 'ConcurrentAuthorisation');
    Object.setPrototypeOf(this, ConcurrentAuthorisation.prototype);
  }
}

export class ValidationFailed extends SDKError {
  constructor (message: string, errorType: ErrorType) {
    super(message, errorType);
    this.errorType = errorType;
    Object.setPrototypeOf(this, ValidationFailed.prototype);
  }
}

export class InvalidAddress extends ValidationFailed {
  constructor (address: string) {
    super(`Address ${address} is not valid.`, 'InvalidAddress');
    Object.setPrototypeOf(this, InvalidAddress.prototype);
  }
}

export class UnsupportedBytecode extends ValidationFailed {
  constructor () {
    super('Proxy Bytecode is not supported by relayer', 'UnsupportedBytecode');
    Object.setPrototypeOf(this, UnsupportedBytecode.prototype);
  }
}

export class InvalidEvent extends ValidationFailed {
  constructor (eventType: string) {
    super(`Unknown event type: ${eventType}`, 'InvalidEvent');
    Object.setPrototypeOf(this, InvalidEvent.prototype);
  }
}

export class NotFound extends SDKError {
  constructor (message: string, errorType: ErrorType) {
    super(message, errorType);
    this.errorType = errorType;
    Object.setPrototypeOf(this, NotFound.prototype);
  }
}

export class MissingConfiguration extends NotFound {
  constructor () {
    super('Relayer configuration not yet loaded', 'MissingConfiguration');
    Object.setPrototypeOf(this, MissingConfiguration.prototype);
  }
}

export class TransactionHashNotFound extends NotFound {
  constructor () {
    super('Transaction hash is not found in Message Status', 'TransactionHashNotFound');
    Object.setPrototypeOf(this, TransactionHashNotFound.prototype);
  }
}

export class MissingMessageHash extends NotFound {
  constructor () {
    super('Message hash is missing in Message Status', 'MissingMessageHash');
    Object.setPrototypeOf(this, MissingMessageHash.prototype);
  }
}

export class TimeoutError extends SDKError {
  constructor () {
    super('Timeout exceeded', 'TimeoutError');
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

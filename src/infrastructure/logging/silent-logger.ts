import type { ILogger } from '../../domain/interfaces/logger.interface.ts';

export class SilentLogger implements ILogger {
  info(_message: string): void {}
  success(_message: string): void {}
  warn(_message: string): void {}
  error(_message: string): void {}
  log(_message: string): void {}
}

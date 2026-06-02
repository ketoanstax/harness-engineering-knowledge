import chalk from 'chalk';
import type { ILogger } from '../../domain/interfaces/logger.interface.ts';

export class ConsoleLogger implements ILogger {
  info(message: string): void {
    console.log(message);
  }

  success(message: string): void {
    console.log(chalk.green(message));
  }

  warn(message: string): void {
    console.warn(chalk.yellow(message));
  }

  error(message: string): void {
    console.error(chalk.red(message));
  }

  log(message: string): void {
    console.log(message);
  }
}

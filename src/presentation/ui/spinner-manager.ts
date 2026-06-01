import { spinner } from '@clack/prompts';
import chalk from 'chalk';

/**
 * Wrapper cho @clack/prompts spinner — tự động start/stop message.
 */
export class SpinnerManager {
  private s = spinner();
  private active = false;

  start(msg: string): void {
    this.s.start(msg);
    this.active = true;
  }

  stop(successMsg: string): void {
    if (this.active) {
      this.s.stop(chalk.green(successMsg));
      this.active = false;
    }
  }

  stopWithColor(color: 'green' | 'red' | 'cyan' | 'yellow', msg: string): void {
    if (!this.active) return;
    const colorMap = { green: chalk.green, red: chalk.red, cyan: chalk.cyan, yellow: chalk.yellow };
    this.s.stop(colorMap[color](msg));
    this.active = false;
  }
}

import { Injectable, ConsoleLogger, LoggerService } from "@nestjs/common";

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

@Injectable() 
export class CustomLogger extends ConsoleLogger implements LoggerService { 
  constructor(context: string = 'Application') { 
    super(context, { colors: false });

    this.setLogLevels(['log', 'warn', 'error', 'debug']);
    this.setContext(context); 
  }

  error(message: string, trace?: string, context?: string) {
    super.error(`${colors.red}${message}${colors.reset}`, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(`${colors.yellow}${message}${colors.reset}`, context);
  }

  log(message: string, context?: string) {
    super.log(`${colors.green}${message}${colors.reset}`, context);
  }

  debug(message: string, context?: string) {
    super.debug(`${colors.cyan}${message}${colors.reset}`, context);
  }
}
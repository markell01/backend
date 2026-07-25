import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, body, params, query } = req;
        const start = Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const duration = Date.now() - start;
                    this.logger.log({
                        method,
                        url,
                        status: 'success',
                        duration: `${duration}ms`,
                    })
                },
                error: () => {}
            })
        )
    }
}
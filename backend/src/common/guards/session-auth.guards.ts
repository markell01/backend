import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class SessionAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        try {
            const request = context.switchToHttp().getRequest();
        
            if (!request.session?.userId) {
                throw new UnauthorizedException('Unauthorized');
            }
            
            return true
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomLogger } from '../config/config.logger';
import { DuelDto } from './dto/duel.dto';
import crypto from 'crypto';
import { TextGeneratorService } from '../textGenerator/textGenerator.service';

@WebSocketGateway({
    cors: {
        origin: '192.168.0.144:5173',
        credentials: true,
    },
    namespace: 'duels'
})
export class DuelsWebsocketGateway {
    constructor (
        private readonly textGeneratorService: TextGeneratorService,
    ) {}
    private readonly logger = new CustomLogger(DuelsWebsocketGateway.name);
    private waitingPlayer: { socket: Socket; userId: string } | null = null;
    private activeDuels = new Map<string, {
      room: string;
      players: string[];
      text: string;
      startedAt?: number;
      status: 'countdown' | 'active' | 'finished';
    }>();

    @WebSocketServer()
    server!: Server;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            this.logger.log(`Connected, socket id: ${socket.id}`);
        });
    }

    @SubscribeMessage('findDuel')
    async onFindDuel(
        @MessageBody() body: DuelDto,
        @ConnectedSocket() socket: Socket
    ) {
        this.logger.log(`body=${JSON.stringify(body)}`);
        if (!body.userId) {
            this.logger.warn(`findDuel failed: userId is missing`);
            socket.emit('duelError', {
                message: 'userId is required',
            });
            return;
        }

        if (!this.waitingPlayer) {
            this.waitingPlayer = {
                socket,
                userId: body.userId
            }
            this.logger.log(
            `waitingPlayer=${this.waitingPlayer
                ? JSON.stringify({
                    socketId: this.waitingPlayer.socket.id,
                    userId: this.waitingPlayer.userId,
                })
                : null}`,
            );
            socket.emit('waitingForOpponent', 'Waiting for players...');
            return;
        }

        this.logger.log(
            `Player is waiting: ${JSON.stringify(this.waitingPlayer.userId)}`,
        );

        const opponent = this.waitingPlayer;
        this.waitingPlayer = null;

        const duelId = crypto.randomUUID();
        const room = `duel:${duelId}`;

        // Добавляем игроков в руму
        await socket.join(room);
        await opponent.socket.join(room);

        const text = await this.textGeneratorService.textGenerator();

        this.logger.log(
            `Duel found: ${duelId}, players=${opponent.userId},${body.userId}`,
        );
        this.server.to(room).emit('duelFound', {
            duelId,
            players: [opponent.userId, body.userId],
            text
        });

        this.server.to(room).emit('duelCountdown', {
            startsIn: 3,
        });

        setTimeout(() => {
            this.server.to(room).emit('duelStarted', {
                duelId,
                startedAt: Date.now(),
            });
        }, 3000)
    }
}
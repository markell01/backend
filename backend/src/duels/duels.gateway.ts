import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomLogger } from '../config/config.logger';
import {
  DuelDto,
  FinishDuelDto,
  JoinDuelDto,
  UpdateUserProgressDto,
} from './dto/duel.dto';
import DuelsService from './duels.service';

const DUEL_COUNTDOWN_MS = 3_000;
const PROGRESS_TICK_MS = 1_000;

@WebSocketGateway({
  cors: {
    origin: 'http://192.168.0.144:5173',
    credentials: true,
  },
  namespace: 'duels',
})
export class DuelsWebsocketGateway {
  constructor(private readonly duelsService: DuelsService) {}
  private readonly logger = new CustomLogger(DuelsWebsocketGateway.name);

  @WebSocketServer()
  server!: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      this.logger.log(`Connected, socket id: ${socket.id}`);

      socket.on('disconnect', () => {
        this.logger.log(`Disconnected, socket id: ${socket.id}`);
        this.duelsService.removeWaitingPlayer(socket);
      });
    });
  }

  @SubscribeMessage('findDuel')
  async onFindDuel(
    @MessageBody() body: DuelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const result = await this.duelsService.findDuel(body.userId, socket);

    if (result.status === 'error') {
      socket.emit('duelError', {
        message: result.message,
      });
      return;
    }

    if (result.status === 'waiting') {
      socket.emit('waitingForOpponent');
      return;
    }

    this.server.to(result.room).emit('duelFound', {
      duelId: result.duelId,
    });
  }

  @SubscribeMessage('joinDuel')
  async onJoinDuel(
    @MessageBody() body: JoinDuelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`Enter user: ${body.userId}`);
    const result = await this.duelsService.joinDuel(body.duelId, body.userId);

    if (result.status === 'error') {
      socket.emit('duelError', {
        message: result.message,
      });
      return;
    }

    await socket.join(result.duel.room);

    socket.emit('duelJoined', {
      duelId: body.duelId,
      players: this.duelsService.getDuelStats(body.duelId),
      text: result.duel.text,
      status: result.duel.status,
      startedAt: result.duel.startedAt,
      endsAt: result.duel.endsAt,
      durationMs: result.duel.durationMs,
    });

    if (!result.shouldStartCountdown) {
      return;
    }

    this.server.to(result.duel.room).emit('duelCountdown', {
      startsIn: 3,
    });

    setTimeout(() => {
      const started = this.duelsService.startDuel(body.duelId);

      if (!started) return;

      this.server.to(started.duel.room).emit('duelStart', {
        duelId: body.duelId,
        startedAt: started.startedAt,
        endsAt: started.endsAt,
        durationMs: started.durationMs,
      });

      const progressInterval = setInterval(() => {
        const stats = this.duelsService.getDuelStats(body.duelId);

        this.server.to(started.duel.room).emit('duelProgressTick', {
          duelId: body.duelId,
          players: stats,
        });
      }, PROGRESS_TICK_MS);

      setTimeout(() => {
        clearInterval(progressInterval);

        const finishedPayload = this.duelsService.finishDuelByTimer(
          body.duelId,
        );

        if (!finishedPayload) return;

        this.server
          .to(started.duel.room)
          .emit('duelFinished', finishedPayload.payload);
      }, started.durationMs);
    }, DUEL_COUNTDOWN_MS);
  }

  @SubscribeMessage('updateProgress')
  async updateUserProgress(
    @MessageBody() body: UpdateUserProgressDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`Users data: ${JSON.stringify(body)}`);
    const result = this.duelsService.saveUserStats(body);

    if (result.status === 'error') {
      socket.emit('duelError', {
        message: result.message,
      });
    }
  }

  @SubscribeMessage('duelFinish')
  async onDuelFinish(
    @MessageBody() body: FinishDuelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const result = this.duelsService.finishDuelByUser(body);

    if (result.status === 'error') {
      socket.emit('duelError', {
        message: result.message,
      });
      return;
    }

    if (result.status === 'accepted') {
      socket.emit('duelFinishAccepted', {
        duelId: body.duelId,
        stats: result.stats,
      });
      return;
    }

    this.server.to(result.room).emit('duelFinished', result.payload);
  }
}

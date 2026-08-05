import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ActiveDuel,
  DuelFinalStats,
  DuelFinishedPayload,
  DuelPlayer,
  UserStats,
  WaitingPlayer,
} from './types/duels.type';
import { TextGeneratorService } from '../textGenerator/textGenerator.service';
import { Socket } from 'socket.io';
import { PrismaService } from '../config/prisma.service';
import { FinishDuelDto, UpdateUserProgressDto } from './dto/duel.dto';
import crypto from 'crypto';
import { CustomLogger } from '../config/config.logger';

const DUEL_DURATION_MS = 60_000;

@Injectable()
export default class DuelsService {
  private readonly logger = new CustomLogger(DuelsService.name);
  private waitingPlayer: WaitingPlayer | null = null;
  private activeDuels = new Map<string, ActiveDuel>();
  private userStats = new Map<string, Map<string, UserStats>>();

  constructor(
    private readonly textGeneratorService: TextGeneratorService,
    private readonly prisma: PrismaService,
  ) {}

  async findDuel(userId: string, socket: Socket) {
    if (!userId) {
      return {
        status: 'error' as const,
        message: 'userId is required',
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid userId');
    }

    if (!this.waitingPlayer) {
      this.waitingPlayer = {
        socket,
        userId,
        username: user.username,
      };

      return {
        status: 'waiting' as const,
      };
    }

    if (
      this.waitingPlayer.socket.id === socket.id ||
      this.waitingPlayer.userId === userId
    ) {
      this.logger.warn('User is already waiting for a duel');
      return {
        status: 'error' as const,
        message: 'You are already waiting for a duel',
      };
    }

    const opponent = this.waitingPlayer;
    this.waitingPlayer = null;

    const duelId = crypto.randomUUID();
    const room = `duel:${duelId}`;
    const text = await this.textGeneratorService.textGenerator();

    await socket.join(room);
    await opponent.socket.join(room);

    const players: DuelPlayer[] = [
      {
        userId: opponent.userId,
        username: opponent.username,
      },
      {
        userId,
        username: user.username,
      },
    ];

    const duel: ActiveDuel = {
      room,
      players,
      joinedPlayerIds: [],
      text,
      durationMs: DUEL_DURATION_MS,
      status: 'created',
      countdownStarted: false,
      finalResults: new Map(),
    };

    this.activeDuels.set(duelId, duel);

    return {
      status: 'found' as const,
      duelId,
      room,
      duel,
    };
  }

  startDuel(duelId: string) {
    const duel = this.activeDuels.get(duelId);

    if (!duel) return null;

    if (duel.status !== 'countdown') return null;

    const startedAt = Date.now();
    const endsAt = startedAt + duel.durationMs;

    duel.status = 'active';
    duel.startedAt = startedAt;
    duel.endsAt = endsAt;

    return {
      duel,
      startedAt,
      endsAt,
      durationMs: duel.durationMs,
    };
  }

  finishDuelByTimer(duelId: string) {
    const duel = this.activeDuels.get(duelId);

    if (!duel) return null;

    if (duel.status === 'finished') return null;

    this.fillMissingFinalResults(duelId, duel);
    duel.status = 'finished';

    return {
      status: 'finished' as const,
      duelId,
      room: duel.room,
      payload: this.createFinishedPayload(duelId, duel, 'time'),
    };
  }

  async joinDuel(duelId: string, userId: string) {
    const duel = this.activeDuels.get(duelId);

    if (!duel) {
      return {
        status: 'error' as const,
        message: 'Duel not found',
      };
    }

    if (!duel.players.some((player) => player.userId === userId)) {
      return {
        status: 'error' as const,
        message: 'You are not a player of this duel',
      };
    }

    if (!duel.joinedPlayerIds.includes(userId)) {
      duel.joinedPlayerIds.push(userId);
    }

    const shouldStartCountdown =
      duel.joinedPlayerIds.length === duel.players.length &&
      !duel.countdownStarted &&
      duel.status === 'created';

    if (shouldStartCountdown) {
      duel.countdownStarted = true;
      duel.status = 'countdown';
    }

    return {
      status: 'joined' as const,
      duel,
      shouldStartCountdown,
    };
  }

  removeWaitingPlayer(socket: Socket) {
    if (this.waitingPlayer?.socket.id === socket.id) {
      this.waitingPlayer = null;
    }
  }

  saveUserStats(data: UpdateUserProgressDto) {
    const duel = this.activeDuels.get(data.duelId);

    if (!duel) {
      return {
        status: 'error' as const,
        message: 'Duel not found',
      };
    }

    if (duel.status !== 'active') {
      return {
        status: 'error' as const,
        message: 'Duel is not active',
      };
    }

    const player = duel.players.find((item) => item.userId === data.userId);

    if (!player) {
      return {
        status: 'error' as const,
        message: 'You are not a player of this duel',
      };
    }

    const duelStats = this.userStats.get(data.duelId) ?? new Map();

    duelStats.set(data.userId, {
      userId: data.userId,
      username: player.username,
      typedLength: data.typedLength,
      correctChars: data.correctChars,
      mistakes: data.mistakes,
      accuracy: data.accuracy,
      cpm: data.cpm,
      wpm: data.wpm,
      updatedAt: Date.now(),
    });

    this.userStats.set(data.duelId, duelStats);

    return {
      status: 'saved' as const,
    };
  }

  getDuelStats(duelId: string) {
    const duel = this.activeDuels.get(duelId);
    const duelStats = this.userStats.get(duelId);

    if (!duel) return [];

    return duel.players.map((player) => {
      const stats = duelStats?.get(player.userId);

      return (
        stats ?? {
          userId: player.userId,
          username: player.username,
          typedLength: 0,
          correctChars: 0,
          mistakes: 0,
          accuracy: 0,
          cpm: 0,
          wpm: 0,
          updatedAt: Date.now(),
        }
      );
    });
  }

  finishDuelByUser(data: FinishDuelDto) {
    const duel = this.activeDuels.get(data.duelId);

    if (!duel) {
      return {
        status: 'error' as const,
        message: 'Duel not found',
      };
    }

    if (!duel.players.some((player) => player.userId === data.userId)) {
      return {
        status: 'error' as const,
        message: 'You are not a player of this duel',
      };
    }

    if (!duel.startedAt) {
      return {
        status: 'error' as const,
        message: 'Duel has not started yet',
      };
    }

    if (duel.status !== 'active' && duel.status !== 'finished') {
      return {
        status: 'error' as const,
        message: 'Duel is not active',
      };
    }

    const existingStats = duel.finalResults.get(data.userId);

    if (existingStats) {
      return {
        status: 'accepted' as const,
        stats: existingStats,
      };
    }

    const player = duel.players.find((item) => item.userId === data.userId)!;
    const finalStats = this.calculateFinalStats(duel, player, data.inputValue);
    duel.finalResults.set(data.userId, finalStats);

    const allPlayersFinished = duel.players.every((item) =>
      duel.finalResults.has(item.userId),
    );

    if (!allPlayersFinished) {
      return {
        status: 'accepted' as const,
        stats: finalStats,
      };
    }

    duel.status = 'finished';

    return {
      status: 'finished' as const,
      room: duel.room,
      payload: this.createFinishedPayload(
        data.duelId,
        duel,
        'all_players_finished',
      ),
    };
  }

  private fillMissingFinalResults(duelId: string, duel: ActiveDuel) {
    duel.players.forEach((player) => {
      if (duel.finalResults.has(player.userId)) return;

      const stats = this.userStats.get(duelId)?.get(player.userId);
      duel.finalResults.set(
        player.userId,
        this.createFinalStatsFromProgress(player, stats),
      );
    });
  }

  private createFinalStatsFromProgress(
    player: DuelPlayer,
    stats?: UserStats,
  ): DuelFinalStats {
    return {
      userId: player.userId,
      username: player.username,
      typedLength: stats?.typedLength ?? 0,
      correctChars: stats?.correctChars ?? 0,
      mistakes: stats?.mistakes ?? 0,
      accuracy: stats?.accuracy ?? 0,
      cpm: stats?.cpm ?? 0,
      wpm: stats?.wpm ?? 0,
      finishedAt: Date.now(),
    };
  }

  private calculateFinalStats(
    duel: ActiveDuel,
    player: DuelPlayer,
    inputValue: string,
  ): DuelFinalStats {
    const finishedAt = Date.now();
    const elapsedMs = Math.max(
      1,
      Math.min(finishedAt - duel.startedAt!, duel.durationMs),
    );
    const elapsedMinutes = elapsedMs / 60_000;
    const typedChars = inputValue.split('');
    let correctChars = 0;
    let mistakes = 0;

    typedChars.forEach((char, index) => {
      if (char === duel.text[index]) {
        correctChars += 1;
        return;
      }

      mistakes += 1;
    });

    const accuracy =
      typedChars.length > 0
        ? Math.round((correctChars / typedChars.length) * 100)
        : 0;

    return {
      userId: player.userId,
      username: player.username,
      typedLength: typedChars.length,
      correctChars,
      mistakes,
      accuracy,
      cpm: Math.round(correctChars / elapsedMinutes),
      wpm: Math.round(correctChars / 5 / elapsedMinutes),
      finishedAt,
    };
  }

  private createFinishedPayload(
    duelId: string,
    duel: ActiveDuel,
    reason: DuelFinishedPayload['reason'],
  ): DuelFinishedPayload {
    const results = Array.from(duel.finalResults.values());
    const winner = this.getWinner(results);

    return {
      duelId,
      reason,
      winnerId: winner?.userId ?? null,
      results,
    };
  }

  private getWinner(results: DuelFinalStats[]) {
    return [...results].sort((left, right) => {
      if (right.wpm !== left.wpm) return right.wpm - left.wpm;
      if (right.accuracy !== left.accuracy) {
        return right.accuracy - left.accuracy;
      }
      return right.typedLength - left.typedLength;
    })[0];
  }
}

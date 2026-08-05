import { Socket } from 'socket.io';

export type WaitingPlayer = {
  socket: Socket;
  userId: string;
  username: string;
};

export type DuelPlayer = {
  userId: string;
  username: string;
};

export type ActiveDuel = {
  room: string;
  players: DuelPlayer[];
  joinedPlayerIds: string[];
  text: string;
  durationMs: number;
  startedAt?: number;
  endsAt?: number;
  status: 'created' | 'countdown' | 'active' | 'finished';
  countdownStarted: boolean;
  finalResults: Map<string, DuelFinalStats>;
};

export type UserStats = {
  userId: string;
  username: string;
  typedLength: number;
  correctChars: number;
  mistakes: number;
  accuracy: number;
  cpm: number;
  wpm: number;
  updatedAt: number;
};

export type DuelFinalStats = {
  userId: string;
  username: string;
  typedLength: number;
  correctChars: number;
  mistakes: number;
  accuracy: number;
  cpm: number;
  wpm: number;
  finishedAt: number;
};

export type DuelFinishedPayload = {
  duelId: string;
  reason: 'time' | 'all_players_finished';
  winnerId: string | null;
  results: DuelFinalStats[];
};

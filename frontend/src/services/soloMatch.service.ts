import { instance } from "./instance";

type matchDto = {
  userId: string | null;
};

type matchStartDto = {
  matchId: string;
};

type matchFinishDto = {
  correctChars: number; //количество правильных букв в конце
  accuracy: number; //процент правильных букв
  mistakes: number; //количество ошибок
  cpm: number; //средний символ в секунду
  wpm: number; //средняя скорость набора слов
  userId: string;
};

export const soloMatchService = {
  createMatch(data: matchDto) {
    return instance.post("/match/create", data);
  },

  startMatch(data: matchStartDto) {
    return instance.patch(`/match/${data.matchId}/start`);
  },

  finishMatch(matchId: string, data: matchFinishDto) {
    return instance.patch(`/match/${matchId}/finish`, data);
  },
};

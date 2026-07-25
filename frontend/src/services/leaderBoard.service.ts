import { instance } from "./instance";

export const leaderBoardService = {
  getLeaderBoard() {
    return instance.get("/match/leaderboard");
  },
};

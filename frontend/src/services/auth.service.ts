import { instance } from "./instance";

type LoginDto = {
  username: string;
  password: string;
};

type matchDto = {
  userId: string | null;
};

export const authService = {
  login(data: LoginDto) {
    return instance.post("/auth/login", data);
  },

  register(data: LoginDto) {
    return instance.post("/auth/registration", data);
  },

  logout() {
    return instance.post("/auth/logout");
  },

  me() {
    return instance.get("/auth/me");
  },

  createMatch(data: matchDto) {
    return instance.post("/match/create", data);
  },

  startMatch(data: matchDto) {
    return instance.post(`/match/update&id=${data.userId}`);
  },
};

import { mapUserLogin, mapUserRegister } from "@/api/mappers/user.mapper";
import userLogin from "../../api/mocks/Users/userLogin.json";

function mockDelay<T>(data: T, delay = 500): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export const userMockSource = {
  async postUserRegister() {
    const mapped = mapUserRegister(userLogin);
    return mockDelay(mapped, 600);
  },

  async getUserLogin() {
    const mapped = mapUserLogin(userLogin);
    return mockDelay(mapped, 600);
  },
};

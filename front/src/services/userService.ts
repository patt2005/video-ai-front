import type { User } from '../types/user/user';
import type { UserRole } from '../types/user/user';
import type {AxiosInstance} from "axios";

export const userService = {
  async getUsers(api: AxiosInstance): Promise<User[]> {
      const response=await api.get('/api/User');
     return response.data;

    },


    updateUserRole(userId: number, role: UserRole): void {

    },
}
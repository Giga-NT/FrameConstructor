import { User } from '../types/types';
import { getUsers, saveUsers, getCurrentUser as getStoredUser, saveCurrentUser } from './storageService';

export const registerUser = async (userData: Omit<User, 'id' | 'projects'>): Promise<User> => {
  const users = getUsers();
  
  if (users.some(u => u.email === userData.email)) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    projects: []
  };

  saveUsers([...users, newUser]);
  saveCurrentUser(newUser);
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Неверный email или пароль');
  }

  saveCurrentUser(user);
  return user;
};

export const logoutUser = () => {
  saveCurrentUser(null);
};

export const getCurrentUser = (): User | null => {
  return getStoredUser();
};

export const saveUserProject = (userId: string, projectName: string, params: any): User => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }

const updatedUser: User = {
  ...user,
  projects: [
    ...user.projects,
    {
      id: Date.now().toString(),
      name: projectName,
      createdAt: new Date().toISOString(), // Используйте createdAt вместо date
      params
    }
  ]
};

  saveUsers(users.map(u => u.id === userId ? updatedUser : u));
  saveCurrentUser(updatedUser);
  return updatedUser;
};
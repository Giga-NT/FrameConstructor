import { User } from '../types/types';

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};
// src/utils/auth.ts
const users = [
  {
    email: 'admin@giga-nt.ru',
    password: '123456',
  },
  {
    email: 'user@example.com',
    password: 'password123',
  },
];

export const authenticateUser = (email: string, password: string): boolean => {
  return users.some(user => user.email === email && user.password === password);
};
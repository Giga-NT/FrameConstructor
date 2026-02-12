import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  AuthContainer, 
  AuthForm, 
  AuthTitle, 
  AuthInput, 
  AuthButton, 
  AuthLink, 
  AuthError 
} from './AuthStyles';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <AuthContainer>
      <AuthForm onSubmit={handleSubmit}>
        <AuthTitle>Вход</AuthTitle>
        {error && <AuthError>{error}</AuthError>}
        <AuthInput 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required
        />
        <AuthInput 
          type="password" 
          name="password"
          placeholder="Пароль" 
          value={formData.password}
          onChange={handleChange}
          required
        />
        <AuthButton type="submit">Войти</AuthButton>
        <AuthLink href="/register">Нет аккаунта? Зарегистрироваться</AuthLink>
      </AuthForm>
    </AuthContainer>
  );
};
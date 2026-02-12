import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormInput = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52,152,219,0.2);
  }
`;

const SubmitButton = styled.button`
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: -10px;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  font-size: 14px;
  margin-top: -10px;
`;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Введите имя');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Введите корректный email');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Регистрируем пользователя
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      // В реальном приложении здесь будет отправка кода на email
      // Для демо просто показываем код в интерфейсе
      setSuccess(`Код подтверждения отправлен на ${formData.email}. Для демо: код - ${user.verificationCode}`);
      
      // Переходим на страницу подтверждения
      navigate('/verify', { 
        state: { 
          email: formData.email,
          verificationCode: user.verificationCode // Для демо передаем код через state
        } 
      });
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>Регистрация</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        <FormInput
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Имя"
          required
        />
        <FormInput
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <FormInput
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Пароль (минимум 6 символов)"
          required
          minLength={6}
        />
        <FormInput
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Подтвердите пароль"
          required
        />
        <FormInput
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Телефон (необязательно)"
        />
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </SubmitButton>
      </StyledForm>
    </FormContainer>
  );
};
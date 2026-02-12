import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const VerifyAccount = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем email из location.state (передается при регистрации)
  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;
    
    try {
      setIsLoading(true);
      await verifyAccount(email, code);
      navigate('/login', { state: { message: 'Аккаунт успешно подтвержден!' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подтверждения');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div>
        <h2>Ошибка</h2>
        <p>Email не найден. Пожалуйста, завершите процесс регистрации.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Подтверждение аккаунта</h2>
      <p>На email {email} был отправлен код подтверждения</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Введите код из письма"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Проверка...' : 'Подтвердить'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
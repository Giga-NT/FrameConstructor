import styled from 'styled-components';

export const AuthContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
`;

export const AuthTitle = styled.h2`
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
  font-size: 1.8rem;
`;

export const AuthInput = styled.input`
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

export const AuthButton = styled.button`
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

export const AuthLink = styled.a`
  text-align: center;
  margin-top: 15px;
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #2980b9;
    text-decoration: underline;
  }
`;

export const AuthError = styled.div`
  color: #e74c3c;
  margin-bottom: 15px;
  padding: 10px;
  background: #fadbd8;
  border-radius: 4px;
  font-size: 14px;
`;

export const AuthSuccess = styled.div`
  color: #27ae60;
  margin-bottom: 15px;
  padding: 10px;
  background: #d5f5e3;
  border-radius: 4px;
  font-size: 14px;
`;

export const AuthFooter = styled.div`
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #7f8c8d;
`;

export const AuthDivider = styled.div`
  margin: 20px 0;
  text-align: center;
  position: relative;
  color: #95a5a6;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #ecf0f1;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
`;

export const SocialAuthButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: background 0.3s;

  &:hover {
    background: #f8f9fa;
  }

  svg {
    margin-right: 10px;
    font-size: 18px;
  }
`;
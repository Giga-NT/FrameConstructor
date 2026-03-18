import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ РЕГИСТРАЦИЯ SERVICE WORKER ДЛЯ PWA
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ PWA установлено успешно!');
  },
  onUpdate: (registration) => {
    console.log('🔄 Доступно обновление PWA');
    // Здесь можно показать уведомление пользователю
    if (window.confirm('Доступна новая версия приложения. Обновить?')) {
      window.location.reload();
    }
  }
});

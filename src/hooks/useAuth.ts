import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// ============ ТИПЫ ============
export interface Project {
  id: string;
  name: string;
  params: any;
  type: 'canopy' | 'greenhouse' | 'gazebo';
  createdAt: Date;
}

export interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  comments: string;
}

export interface Order {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'canopy' | 'greenhouse' | 'gazebo';
  orderDate: Date;
  status: 'new' | 'processing' | 'completed' | 'cancelled' | 'archived';
  totalAmount: number;
  customerData: OrderFormData;
  costCalculation: CostCalculation;
  projectParams: GreenhouseParams | CanopyParams | GazeboParams;
  isArchived?: boolean;
}

export interface GazeboParams {
  width: number;
  length: number;
  height: number;
  railingHeight: number;
  pillarSize: '100x100' | '80x80' | '60x60';
  color: string;
  materialType: 'wood' | 'metal';
  roofType: 'flat' | 'gable';
}

export interface CostCalculation {
  materials: {
    roof: number;
    frame: number;
    foundation: number;
    fasteners: number;
  };
  works: {
    roofInstallation: number;
    frameAssembly: number;
    painting: number;
    foundation: number;
  };
  totalMaterials: number;
  totalWorks: number;
  totalAmount: number;
}

export interface GreenhouseParams {
  width: number;
  length: number;
  height: number;
  trussCount: number;
  wallHeight: number;
  type: 'arched' | 'gable';
  frameMaterial: 'metal' | 'pvc' | 'wood';
  coverMaterial: 'polycarbonate' | 'glass' | 'film';
  foundationType: 'none' | 'wood' | 'concrete' | 'piles';
  groundType: 'grass' | 'wood' | 'concrete';
  hasVentilation: boolean;
  hasDoors: boolean;
  color: string;
  frameColor: string;
  coverColor: string;
  roofColor?: string;
  wallColor?: string;
  archHeight: number;
  archSegments: number;
  roofAngle: number;
  partitionCount: number;
  shelving: boolean;
  postCount: number;
  rafterCount: number;
  doorSide: 'front' | 'back' | 'side';
  hasVents: boolean;
  ventSide: 'front' | 'back' | 'side' | 'roof';
  vent: {
    count: number;
    side: string;
    heightOffset: number;
    lengthOffset: number;
    width: number;
    height: number;
    zOffset: number;
  };
}

export interface CanopyParams {
  length: number;
  width: number;
  height: number;
  roofHeight: number;
  overhang: number;
  pillarCount: number;
  trussCount: number;
  roofType: 'gable' | 'arch' | 'shed' | 'flat';
  trussType: 'simple' | 'reinforced' | 'lattice';
  constructionType: 'truss' | 'beam';
  beamSize: 'small' | 'medium' | 'large';
  lathingStep: number;
  materialType: 'metal' | 'wood' | 'plastic';
  frameColor: string;
  roofMaterial: 'polycarbonate' | 'metal' | 'tile';
  roofColor: string | null;
  groundType: 'grass' | 'concrete';
  showRidgeBeam: boolean;
  showFoundations: boolean;
  foundationType: 'pillars' | 'slab' | 'surface';
  foundationColor: string;
  slabThickness: number;
  rebarRows: number;
  showPaving: boolean;
  pavingColor: 'red' | 'gray' | 'yellow';
  slabExtension: number;
  rebarDiameter: number;
  rebarSpacing: number;
  showBackgroundHouse: boolean;
  showBackgroundGarage: boolean;
  showWindowDetails: boolean;
  showFence: boolean;
  showScrews?: boolean;
  screwColor?: string;
  metalColor?: string;
  pillarTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  roofTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  trussTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  lathingTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  hasInsulation?: boolean;
  doubleRebar?: boolean;
  showMaterialInfo?: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  phone: string;
  name?: string;
  address?: string;
  projects?: Project[];
  orders?: Order[];
  isVerified: boolean;
  verificationCode?: string;
  createdAt: Date;
}

// ============ ОПРЕДЕЛЕНИЕ СРЕДЫ ============
// ПРОСТОЙ СПОСОБ - всегда используем браузерный режим
const isElectron = false; // Всегда false - работаем в браузере
const isBrowser = true;   // Всегда true - используем localStorage
// ============================================

// ============ ХРАНИЛИЩЕ ДЛЯ БРАУЗЕРА (localStorage) ============
const USERS_STORAGE_KEY = 'giga-nt-users';
const CURRENT_USER_KEY = 'giga-nt-current-user';

const browserStorage = {
  getUsers: () => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  },
  saveUsers: (users: any[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },
  getCurrentUser: () => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  saveCurrentUser: (user: any) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
};

// ============ ХУК АВТОРИЗАЦИИ ============
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Инициализация - загрузка текущего пользователя
  useEffect(() => {
    const loadUser = () => {
      try {
        // Всегда используем localStorage
        const user = browserStorage.getCurrentUser();
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to load user data', e);
        localStorage.removeItem(CURRENT_USER_KEY);
      } finally {
        setIsInitialized(true);
      }
    };

    loadUser();
  }, []);

  // Регистрация
  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const users = browserStorage.getUsers();
      
      if (users.some((u: any) => u.email === userData.email)) {
        throw new Error('Пользователь с таким email уже существует');
      }

      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        projects: [],
        orders: [],
        isVerified: false,
        verificationCode,
        createdAt: new Date()
      };

      users.push(newUser);
      browserStorage.saveUsers(users);
      
      console.log(`Код подтверждения для ${newUser.email}: ${verificationCode}`);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Подтверждение аккаунта
  const verifyAccount = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.email === email);
      
      if (userIndex === -1) {
        throw new Error('Пользователь не найден');
      }

      if (users[userIndex].verificationCode !== code) {
        throw new Error('Неверный код подтверждения');
      }

      users[userIndex].isVerified = true;
      delete users[userIndex].verificationCode;
      
      browserStorage.saveUsers(users);
      
      return users[userIndex];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подтверждения');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Вход
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const users = browserStorage.getUsers();
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Неверный email или пароль');
      }

      if (!user.isVerified) {
        throw new Error('Аккаунт не подтвержден. Проверьте вашу почту');
      }

      browserStorage.saveCurrentUser(user);
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Выход
  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    browserStorage.saveCurrentUser(null);
    setCurrentUser(null);
    navigate('/login');
  };

  // Сохранение проекта
  const saveProject = (name: string, params: any, type: 'canopy' | 'greenhouse' | 'gazebo' = 'greenhouse') => {
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) return;
      
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        params,
        type,
        createdAt: new Date()
      };

      users[userIndex].projects = [...(users[userIndex].projects || []), newProject];
      
      browserStorage.saveUsers(users);
      browserStorage.saveCurrentUser(users[userIndex]);
      setCurrentUser(users[userIndex]);
      
      return users[userIndex];
    } catch (err) {
      console.error('Failed to save project', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Получение проектов
  const getUserProjects = (): Project[] => {
    if (!currentUser) return [];
    return currentUser.projects || [];
  };

  // Создание заказа
  const createOrder = (orderData: any) => {
    if (!currentUser) return null;

    setIsLoading(true);
    
    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) return null;
      
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        orderDate: new Date()
      };

      users[userIndex].orders = [...(users[userIndex].orders || []), newOrder];
      
      browserStorage.saveUsers(users);
      browserStorage.saveCurrentUser(users[userIndex]);
      setCurrentUser(users[userIndex]);
      
      return newOrder;
    } catch (err) {
      console.error('Failed to create order', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Получение заказов
  const getUserOrders = (): Order[] => {
    if (!currentUser) return [];
    return currentUser.orders || [];
  };

  // Обновление статуса заказа
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    if (!currentUser) return null;

    setIsLoading(true);
    
    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) return null;
      
      const updatedOrders = users[userIndex].orders?.map((order: Order) => 
        order.id === orderId ? { ...order, status } : order
      ) || [];
      
      users[userIndex].orders = updatedOrders;
      
      browserStorage.saveUsers(users);
      browserStorage.saveCurrentUser(users[userIndex]);
      setCurrentUser(users[userIndex]);
      
      return updatedOrders.find((order: Order) => order.id === orderId);
    } catch (err) {
      console.error('Failed to update order status', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление профиля
  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return null;

    setIsLoading(true);
    
    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) return null;
      
      const updatedUser = { 
        ...users[userIndex], 
        ...updates 
      };
      
      users[userIndex] = updatedUser;
      
      browserStorage.saveUsers(users);
      browserStorage.saveCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Архивация заказа
  const archiveOrder = (orderId: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) return null;
      
      const updatedOrders = users[userIndex].orders?.map((order: Order) => {
        if (order.id === orderId) {
          return {
            ...order,
            isArchived: true,
            status: 'archived' as const
          };
        }
        return order;
      }) || [];
      
      users[userIndex].orders = updatedOrders;
      
      browserStorage.saveUsers(users);
      browserStorage.saveCurrentUser(users[userIndex]);
      setCurrentUser(users[userIndex]);
      
      return updatedOrders.find((order: Order) => order.id === orderId);
    } catch (err) {
      console.error('Failed to archive order', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Восстановление заказа
  const restoreOrder = (orderId: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) return null;
      
      const updatedOrders = users[userIndex].orders?.map((order: Order) => {
        if (order.id === orderId) {
          return {
            ...order,
            isArchived: false,
            status: 'new' as const
          };
        }
        return order;
      }) || [];
      
      users[userIndex].orders = updatedOrders;
      
      browserStorage.saveUsers(users);
      browserStorage.saveCurrentUser(users[userIndex]);
      setCurrentUser(users[userIndex]);
      
      return updatedOrders.find((order: Order) => order.id === orderId);
    } catch (err) {
      console.error('Failed to restore order', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление заказа
  const deleteOrder = (orderId: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const users = browserStorage.getUsers();
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) return null;
      
      const updatedOrders = users[userIndex].orders?.filter((order: Order) => order.id !== orderId) || [];
      
      users[userIndex].orders = updatedOrders;
      
      browserStorage.saveUsers(users);
      browserStorage.saveCurrentUser(users[userIndex]);
      setCurrentUser(users[userIndex]);
      
      return true;
    } catch (err) {
      console.error('Failed to delete order', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Создание тестового пользователя
  const createTestUser = async () => {
    try {
      const testUser = {
        email: 'test@test.com',
        password: '123456',
        name: 'Тестовый Пользователь',
        phone: '+79991234567',
        address: 'ул. Тестовая, д. 1'
      };
      
      const user = await register(testUser);
      await verifyAccount(testUser.email, user.verificationCode!);
      console.log('✅ Тестовый пользователь создан');
      
      return user;
    } catch (err) {
      console.error('Failed to create test user:', err);
    }
  };

  return {
    currentUser,
    isInitialized,
    isLoading,
    error,
    register,
    verifyAccount,
    login,
    logout,
    saveProject,
    getUserProjects,
    createOrder,
    getUserOrders,
    updateOrderStatus,
    updateProfile,
    archiveOrder,
    restoreOrder,
    deleteOrder,
    createTestUser,
    setError
  };
};


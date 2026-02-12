import db from './db';
import { v4 as uuidv4 } from 'uuid';

export const UserModel = {
  // Создать пользователя
  create: (userData: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, phone, address, isVerified, verificationCode, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userData.email,
      userData.password,
      userData.name || '',
      userData.phone || '',
      userData.address || '',
      userData.isVerified ? 1 : 0,
      userData.verificationCode || null,
      new Date().toISOString()
    );
    
    return { ...userData, id };
  },

  // Найти по email
  findByEmail: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Найти по id
  findById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Обновить пользователя
  update: (id: string, updates: any) => {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
    stmt.run(...values);
    
    return UserModel.findById(id);
  }
};

export const ProjectModel = {
  // Создать проект
  create: (userId: string, projectData: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO projects (id, userId, name, type, params, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userId,
      projectData.name,
      projectData.type,
      JSON.stringify(projectData.params),
      new Date().toISOString()
    );
    
    return {
      id,
      ...projectData,
      createdAt: new Date()
    };
  },

  // Получить проекты пользователя
  getUserProjects: (userId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `);
    
    const projects = stmt.all(userId);
    return projects.map((p: any) => ({
      ...p,
      params: JSON.parse(p.params),
      createdAt: new Date(p.createdAt)
    }));
  }
};

export const OrderModel = {
  // Создать заказ
  create: (userId: string, orderData: any) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, userId, projectId, projectName, projectType, 
        status, totalAmount, customerData, costCalculation, 
        projectParams, isArchived, orderDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userId,
      orderData.projectId,
      orderData.projectName,
      orderData.projectType,
      orderData.status || 'new',
      orderData.totalAmount,
      JSON.stringify(orderData.customerData),
      JSON.stringify(orderData.costCalculation),
      JSON.stringify(orderData.projectParams),
      orderData.isArchived ? 1 : 0,
      new Date().toISOString()
    );
    
    return { ...orderData, id, orderDate: new Date() };
  },

  // Получить заказы пользователя
  getUserOrders: (userId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM orders 
      WHERE userId = ? 
      ORDER BY orderDate DESC
    `);
    
    const orders = stmt.all(userId);
    return orders.map((o: any) => ({
      ...o,
      customerData: JSON.parse(o.customerData),
      costCalculation: JSON.parse(o.costCalculation),
      projectParams: JSON.parse(o.projectParams),
      orderDate: new Date(o.orderDate),
      isArchived: Boolean(o.isArchived)
    }));
  },

  // Обновить статус
  updateStatus: (orderId: string, status: string) => {
    const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    stmt.run(status, orderId);
  }
};
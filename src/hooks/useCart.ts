import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  params: any;
  cost: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('canopyCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (params: any, cost: number) => {
    const item = {
      id: Date.now().toString(),
      name: `Навес ${params.width}x${params.length}`,
      params,
      cost,
    };
    const newCart = [...cart, item];
    setCart(newCart);
    localStorage.setItem('canopyCart', JSON.stringify(newCart));
  };

  const removeFromCart = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('canopyCart', JSON.stringify(newCart));
  };

  return { cart, addToCart, removeFromCart };
};
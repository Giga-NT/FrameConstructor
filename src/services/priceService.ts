// src/services/priceService.ts

// Типы для каждого изделия
export interface MaterialWork {
  material: number;
  work: number;
}

// Цены для беседки (уже есть)
export interface GazeboPrices {
  wood: MaterialWork;
  metal: MaterialWork;
  combined: MaterialWork;
  tile: MaterialWork;
  concrete: MaterialWork;
  none: MaterialWork;
  foundation: {
    wood: MaterialWork;
    concrete: MaterialWork;
    piles: MaterialWork;
    none: MaterialWork;
  };
  furniture: {
    bench: number;
    table: { small: number; medium: number; large: number };
  };
  roofing: {
    shingles: number;
    metal: number;
    polycarbonate: number;
  };
}

// Цены для навеса (упрощённая, но гибкая структура)
export interface CanopyPrices {
  roofMaterial: {
    polycarbonate: MaterialWork;
    metal: MaterialWork;
    tile: MaterialWork;
  };
  frame: MaterialWork;            // стоимость каркаса за погонный метр
  pillar: MaterialWork;           // стоимость одной стойки
  truss: MaterialWork;            // стоимость одной фермы
  lathing: MaterialWork;          // стоимость обрешётки за погонный метр
  painting: MaterialWork;         // покраска за м²
  foundation: {
    pillars: MaterialWork;
    slab: MaterialWork;
    surface: MaterialWork;
  };
  screws: MaterialWork;           // крепеж (за штуку)
}

// Цены для теплицы (из greenhouseCalculator.ts, адаптированные)
export interface GreenhousePrices {
  cover: {
    polycarbonate: MaterialWork;
    glass: MaterialWork;
    film: MaterialWork;
  };
  frame: {
    metal: {
      '40x20': number;
      '60x60': number;
      '80x80': number;
      '100x100': number;
    };
    pvc: number;
    wood: number;
  };
  foundation: {
    wood: MaterialWork;
    concrete: MaterialWork;
    piles: MaterialWork;
    none: MaterialWork;
  };
  additional: {
    ventilation: MaterialWork;
    doors: MaterialWork;
    partition: MaterialWork;
    shelving: MaterialWork; // за метр
  };
  screws: MaterialWork;
  painting: MaterialWork;
}

// Дефолтные цены для навеса (взяты из canopyCalculator.ts и дополнены)
export const defaultCanopyPrices: CanopyPrices = {
  roofMaterial: {
    polycarbonate: { material: 600, work: 400 },
    metal: { material: 800, work: 400 },
    tile: { material: 1500, work: 700 },
  },
  frame: { material: 500, work: 300 },   // за п.м.
  pillar: { material: 2000, work: 1000 }, // за столб
  truss: { material: 500, work: 300 },    // за ферму
  lathing: { material: 300, work: 150 },  // за п.м.
  painting: { material: 200, work: 100 }, // за м²
  foundation: {
    pillars: { material: 2000, work: 1000 },
    slab: { material: 3500, work: 1500 },
    surface: { material: 1000, work: 500 },
  },
  screws: { material: 10, work: 0.5 },
};

// Дефолтные цены для теплицы (из greenhouseCalculator.ts)
export const defaultGreenhousePrices: GreenhousePrices = {
  cover: {
    polycarbonate: { material: 600, work: 400 },
    glass: { material: 1500, work: 700 },
    film: { material: 200, work: 100 },
  },
  frame: {
    metal: {
      '40x20': 500,
      '60x60': 700,
      '80x80': 900,
      '100x100': 1200,
    },
    pvc: 800,
    wood: 600,
  },
  foundation: {
    wood: { material: 1000, work: 500 },
    concrete: { material: 2500, work: 1500 },
    piles: { material: 3000, work: 2000 },
    none: { material: 0, work: 0 },
  },
  additional: {
    ventilation: { material: 2000, work: 1000 },
    doors: { material: 5000, work: 2000 },
    partition: { material: 3000, work: 1500 },
    shelving: { material: 4000, work: 2000 },
  },
  screws: { material: 10, work: 0.5 },
  painting: { material: 150, work: 100 },
};

// Дефолтные цены для беседки (уже есть)
export const defaultGazeboPrices: GazeboPrices = {
  wood: { material: 1500, work: 800 },
  metal: { material: 1200, work: 600 },
  combined: { material: 1800, work: 1000 },
  tile: { material: 2000, work: 1000 },
  concrete: { material: 1800, work: 700 },
  none: { material: 0, work: 0 },
  foundation: {
    wood: { material: 2500, work: 1200 },
    concrete: { material: 3500, work: 1500 },
    piles: { material: 3000, work: 1300 },
    none: { material: 0, work: 0 },
  },
  furniture: {
    bench: 3000,
    table: { small: 5000, medium: 7000, large: 9000 },
  },
  roofing: {
    shingles: 800,
    metal: 600,
    polycarbonate: 400,
  },
};

// Универсальная функция получения цен из localStorage
export const getPrices = async <T>(type: string, defaultPrices: T): Promise<T> => {
  const saved = localStorage.getItem(`prices_${type}`);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch {
      return defaultPrices;
    }
  }
  return defaultPrices;
};

export const savePrices = async (type: string, data: any) => {
  localStorage.setItem(`prices_${type}`, JSON.stringify(data));
};

// Удобные обёртки для конкретных типов
export const getCanopyPrices = () => getPrices('canopy', defaultCanopyPrices);
export const getGreenhousePrices = () => getPrices('greenhouse', defaultGreenhousePrices);
export const getGazeboPrices = () => getPrices('gazebo', defaultGazeboPrices);
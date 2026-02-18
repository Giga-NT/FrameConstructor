// src/utils/gazeboCostCalculation.ts
import { GazeboParams } from '../types/gazeboTypes';

export interface MaterialPrices {
  material: number;
  work: number;
}

export interface Prices {
  wood: MaterialPrices;
  metal: MaterialPrices;
  combined: MaterialPrices;
  tile: { material: number; work: number };
  concrete: MaterialPrices;
  none: MaterialPrices;
  foundation: {
    wood: MaterialPrices;
    concrete: MaterialPrices;
    piles: MaterialPrices;
    none: MaterialPrices;
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

export const defaultPrices: Prices = {
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
    none: { material: 0, work: 0 }
  },
  furniture: {
    bench: 3000,
    table: { small: 5000, medium: 7000, large: 9000 }
  },
  roofing: {
    shingles: 800,
    metal: 600,
    polycarbonate: 400
  }
};

export const calculateGazeboCost = (params: GazeboParams, customPrices?: Prices) => {
  const prices = customPrices || defaultPrices;

  const perimeter = (params.width + params.length) * 2;
  let roofArea = params.width * params.length;
  if (params.roofType === 'gable') roofArea *= 1.2;
  else if (params.roofType === 'arched') roofArea *= 1.3;

  const frameMaterialCost = perimeter * params.height * prices[params.materialType].material;
  const roofMaterialCost = roofArea * prices.roofing[params.materialType === 'wood' ? 'shingles' : 'metal'];

  const foundationPerimeter = perimeter;
  const foundationMaterialCost = foundationPerimeter * prices.foundation[params.foundationType].material;
  const foundationWorkCost = foundationPerimeter * prices.foundation[params.foundationType].work;

  const floorArea = params.width * params.length;
  const floorMaterialCost = floorArea * prices[params.floorType].material;
  const floorWorkCost = floorArea * prices[params.floorType].work;

  const furnitureMaterialCost =
    params.benchCount * prices.furniture.bench +
    prices.furniture.table[params.tableSize];
  const furnitureWorkCost = furnitureMaterialCost * 0.3;

  const materialsCost =
    frameMaterialCost +
    roofMaterialCost +
    foundationMaterialCost +
    floorMaterialCost +
    (params.hasFurniture ? furnitureMaterialCost : 0);
  const workCost =
    perimeter * params.height * prices[params.materialType].work +
    foundationWorkCost +
    floorWorkCost +
    (params.hasFurniture ? furnitureWorkCost : 0);
  const totalCost = materialsCost + workCost;

  return {
    frame: {
      name: 'Каркас беседки',
      cost: frameMaterialCost,
      details: `Периметр: ${perimeter.toFixed(1)} м × Высота: ${params.height.toFixed(1)} м × ${prices[params.materialType].material} ₽/м²`
    },
    roof: {
      name: 'Крыша',
      cost: roofMaterialCost,
      details: `${roofArea.toFixed(1)} м² × ${prices.roofing[params.materialType === 'wood' ? 'shingles' : 'metal']} ₽/м²`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationMaterialCost,
      work: foundationWorkCost,
      details: `Периметр: ${foundationPerimeter.toFixed(1)} м × ${prices.foundation[params.foundationType].material} ₽/м`
    },
    floor: {
      name: 'Пол',
      cost: floorMaterialCost,
      work: floorWorkCost,
      details: `${floorArea.toFixed(1)} м² × ${prices[params.floorType].material} ₽/м²`
    },
    furniture: {
      name: 'Мебель',
      cost: furnitureMaterialCost,
      work: furnitureWorkCost,
      details: `Скамейки: ${params.benchCount} × ${prices.furniture.bench} ₽\nСтол: 1 × ${prices.furniture.table[params.tableSize]} ₽`
    },
    totalCost,
    perimeter,
    roofArea,
    floorArea
  };
};
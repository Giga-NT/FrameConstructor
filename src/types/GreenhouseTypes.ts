import * as THREE from 'three';

interface VentParams {
  count?: number;
  side?: string;  // существующее свойство
  sides?: string[]; // новое свойство для множественного выбора
  width?: number;
  height?: number;
  heightOffset?: number;
  lengthOffset?: number;
  color?: string;
  opacity?: number;
  zOffset?: number;
  transparent?: boolean;
}

// ====== Общий тип для проекта ======
export interface ProjectParams {
  width: number;
  length: number;
  height: number;
  roofType: 'arched' | 'gable';
  roofMaterial: 'polycarbonate' | 'glass' | 'film';
  trussCount: number;
  lathingStep?: number;
  pillarCount?: number;
  pillarTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  roofTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  trussTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  lathingTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  foundationType?: 'none' | 'wood' | 'concrete' | 'piles';
  groundType?: 'grass' | 'wood' | 'concrete';
  hasVentilation?: boolean;
  hasDoors?: boolean;
  color?: string;
  frameColor?: string;
  coverColor?: string;
  roofColor?: string;
  wallColor?: string;
  archHeight?: number;
  archSegments?: number;
  roofAngle?: number;
  partitionCount?: number;
  shelving?: boolean;
  postCount?: number;
  rafterCount?: number;
  doorSide?: 'front' | 'back' | 'both';
  hasVents?: boolean;
  ventSide?: 'front' | 'back' | 'both';
  vent?: VentParams;
}

// ====== Типы для теплицы ======
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
  doorSide: 'front' | 'back' | 'both';
  hasVents: boolean;
  ventSide: 'front' | 'back' | 'both';
  vent: VentParams;
}

// ====== Типы для навеса ======
export interface CanopyParams {
  width: number;
  length: number;
  height: number;
  roofType: 'arched' | 'gable';
  roofMaterial: 'polycarbonate' | 'glass' | 'metal';
  pillarCount: number;
  pillarTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  roofTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  trussTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  lathingTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  lathingStep: number;
  foundationType: 'none' | 'piles' | 'concrete';
  slabExtension?: number;
  slabThickness?: number;
  rebarSpacing?: number;
  rebarDiameter?: number;
  groundType: 'grass' | 'wood' | 'concrete';
  hasDoors?: boolean;
  color?: string;
  frameColor?: string;
  coverColor?: string;
  vent?: VentParams;
  hasVents?: boolean;
  ventSide?: 'front' | 'back' | 'both';
}

// ====== Типы для стоимости ======
export interface CostItem {
  name: string;
  cost: number;
  work?: number;
  details?: string;
}

export interface GreenhouseCostData {
  coverMaterial: CostItem;
  coverWork: CostItem;
  frame: CostItem;
  frameWork: CostItem;
  foundation: CostItem & { work: number };
  additional: CostItem & { work: number };
  painting: CostItem;
  totalCost: number;
  frameLength: number;
  coverArea: number;
}

// ====== Пример начальных параметров ======
export const initialGreenhouseParams: GreenhouseParams = {
  width: 3,
  length: 6,
  height: 2.5,
  wallHeight: 2,
  trussCount: 4,
  type: 'arched',
  frameMaterial: 'metal',
  coverMaterial: 'polycarbonate',
  foundationType: 'wood',
  groundType: 'grass',
  hasVentilation: true,
  hasDoors: true,
  color: '#4CAF50',
  frameColor: '#555555',
  coverColor: '#A5D6A7',
  archHeight: 1,
  archSegments: 16,
  roofAngle: 30,
  partitionCount: 0,
  shelving: false,
  postCount: 5,
  rafterCount: 5,
  doorSide: 'front',
  hasVents: true,
  ventSide: 'front',
  vent: {
    count: 0,
    side: 'front', // Меняем 'left' на 'front'
    heightOffset: 0.5,
    lengthOffset: 0.5,
    width: 1,
    height: 0.5,
   zOffset: -0.01
  }
};

// ====== Дополнительные типы ======
export interface CostCalculation {
  totalCost: number;
  totalMaterials: number;
  totalWorks: number;
  frameWork: number;
  foundation: number;
  painting: number;
  coverMaterial: number;
  coverWork: number;
  screws: number;
  doors: number;
  roofWork: number;
}

export interface Order {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'canopy' | 'greenhouse';
  orderDate: Date;
  status: string;
  totalAmount: number;
  customerData: OrderFormData;
  costCalculation: CostCalculation;
  projectParams: GreenhouseParams | CanopyParams;
}

export interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  comments: string;
  projectParams?: ProjectParams;
}


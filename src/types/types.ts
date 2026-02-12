import * as THREE from 'three';
import { GreenhouseParams, CostItem, GreenhouseCostData } from './GreenhouseTypes';
import { GazeboParams } from './gazeboTypes';  // ← Добавить эту строку

export type { GreenhouseParams } from './GreenhouseTypes';
export type { GazeboParams } from './gazeboTypes';

export function isGreenhouseParams(params: any): params is GreenhouseParams {
  return params.wallHeight !== undefined;
}
export function isCanopyParams(params: any): params is CanopyParams {
  return params.pillarCount !== undefined && params.trussCount !== undefined;
}

export interface Project {
  id: string;
  name: string;
  type?: 'canopy' | 'greenhouse';
  createdAt: string | Date;
  params?: CanopyParams | GreenhouseParams;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  projects: Project[];
}

export interface TubeSize {
  width: number;
  height: number;
}

export interface TubeSizes {
  [key: string]: TubeSize;
  '80x80x3': TubeSize;
  '100x100x3': TubeSize;
  '50x50x2': TubeSize;
  '60x60x2': TubeSize;
  '40x20x2': TubeSize;
  '50x25x2': TubeSize;
}

export interface ProfileTubeProps {
  size: TubeSize;
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  color?: string;
}

export interface ArchProps {
  width: number;
  height: number;
  overhang: number;
  position: [number, number, number];
  tubeSize: TubeSize;
}

export interface TubeLineProps {
  curve: THREE.Curve<THREE.Vector3>;
  tubeSize: TubeSize;
  color?: string;
  position?: [number, number, number];
}

export interface FrameParams {
  length: number;
  width: number;
  height: number;
  numColumns: number;
  columnSection: number;
  trussSection: number;
  purlinSection: number;
  trussHeightLeft: number;
  trussHeightRight: number;
  bayLengthLeft: number;
  bayLengthRight: number;
  numBaysLeft?: number;
  numBaysRight?: number;
  trussCount: number;
  frontOverhang: number;
  rearOverhang: number;
  leftSideOverhang: number;
  rightSideOverhang: number;
  topPurlinSpacing: number;
  roofType: string;
  roofMaterial: string;
  roofColor: string;
  roofOpacity: number;
  roofThickness: number;
  archHeight?: number;
}



export interface FoundationParams {
  showFoundation: boolean;
  showEnvironment?: boolean;
  slabThickness: number;
  slabExtension: number;
  rebarThickness: number;
  rebarRows: number;
  rebarSpacing: number;
  gravelThickness: number;
  smallGravelThickness: number;
  sandThickness: number;
}

export interface WeldingParams {
  weldType: number;
  weldCost: number;
  showWelds: boolean;
}

export interface FrameModelProps {
  frameParams: FrameParams;
  foundationParams: FoundationParams;
  weldingParams: WeldingParams;
}

export interface TubeDimensions {
  width: number;
  thickness: number;
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
  slabThickness: number; // 100-300 мм
  rebarRows: number; // Количество рядов арматуры
  showPaving: boolean;
  pavingColor: 'red' | 'gray' | 'yellow';
  slabExtension: number; // Выступ плиты (0.1-1 м)
  rebarDiameter: number; // Диаметр арматуры (6-20 мм)
  rebarSpacing: number; // Шаг арматуры (100-500 мм)
  showBackgroundHouse: boolean; // Показывать фоновый дом
  showBackgroundGarage: boolean; // Показывать фоновый гараж
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

export interface ControlProps {
  params: CanopyParams;
  onChange: (name: keyof CanopyParams, value: any) => void;
}

export interface MaterialPrices {
  profileTubes: {
    [key: string]: number;
  };
  // другие материалы
}

// src/types/orderTypes.ts
export interface ProjectParams {
  width: number;
  length: number;
  height: number;
  pillarCount: number;
  trussCount: number;
  roofType: 'gable' | 'single';
  roofMaterial: 'polycarbonate' | 'metal' | 'tile';
  
  // Добавляем новые поля (опциональные, но с дефолтами в коде)
  lathingStep?: number;
  pillarTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  roofTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  trussTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  lathingTubeSize?: '100x100' | '80x80' | '60x60' | '40x20';
  foundationType?: 'pillars' | 'slab';
  slabExtension?: number;
  slabThickness?: number;
  rebarSpacing?: number;
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
  totalCost?: number;
}

export interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  comments: string;
  projectParams?: ProjectParams; // Добавляем как опциональное поле
}

export interface Order {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'canopy' | 'greenhouse' | 'gazebo';
  orderDate: Date | string;
  status: 'new' | 'processing' | 'completed' | 'cancelled' | 'archived';
  totalAmount: number;
  customerData: OrderFormData;
  costCalculation: CostCalculation;
  projectParams: GreenhouseParams | CanopyParams | GazeboParams; // Теперь GazeboParams будет распознан
  isArchived?: boolean; 
}

export interface OrderDetailsProps {
  order: Order;
}

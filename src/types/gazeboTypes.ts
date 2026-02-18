// src/types/gazeboTypes.ts
import * as THREE from 'three';

export interface CostItem {
  name: string;
  cost: number;
  work?: number;
  details?: string;
}

export interface MaterialPrices {
  material: number;
  work: number;
}

export interface GazeboParams {
  width: number;
  length: number;
  height: number;
  roofHeight: number;
  roofType: 'gable' | 'arched' | 'single';
  pillarType: 'straight' | 'curved';
  pillarSpacing: number;          // шаг стоек (м)
  pillarCount?: number;            // опционально, может вычисляться
  pillarSize: '100x100' | '80x80' | '60x60';
  beamSize: '100x100' | '80x80' | '60x60';
  railingHeight: number;
  hasFurniture: boolean;
  benchCount: number;
  tableSize: 'small' | 'medium' | 'large';
  foundationType: 'wood' | 'concrete' | 'piles' | 'none';
  floorType: 'wood' | 'tile' | 'concrete' | 'none';
  materialType: 'wood' | 'metal' | 'combined';
  color: string;
  roofColor: string;
  floorColor: string;
  groundType: 'grass' | 'wood' | 'concrete';
  showBackground: boolean;
  benchLength?: number;
  benchSeatWidth?: number;
  benchHeight?: number;
  tableCount: number;
  tableLegsColor: string;
  tableTopColor: string;
  tableWidth?: number;
  tableDepth?: number;
  tableHeight?: number;
  tableType?: 'simple' | 'model';
  overhang: number;
  tableRotation?: 0 | 90;

  // Поля для каркаса крыши
  constructionType: 'truss' | 'beam';
  trussType: 'simple' | 'reinforced' | 'lattice';
  trussCount: number;
  lathingStep: number;

  // Размеры труб для разных элементов
  pillarTubeSize: string;   // для стоек
  roofTubeSize: string;     // для верхнего пояса ферм
  trussTubeSize: string;    // для раскосов ферм
  lathingTubeSize: string;  // для обрешётки

  showRoofCover: boolean;
  showGables: boolean;
  pillarBendDirection: 'inward' | 'outward';
}

export const initialGazeboParams: GazeboParams = {
  width: 3,
  length: 3,
  height: 2.5,
  roofHeight: 1,
  roofType: 'gable',
  pillarType: 'straight',
  pillarSpacing: 2.0,          // шаг стоек 2 метра
  pillarSize: '100x100',
  beamSize: '80x80',
  railingHeight: 0.9,
  hasFurniture: true,
  benchCount: 2,
  tableSize: 'medium',
  foundationType: 'wood',
  floorType: 'wood',
  materialType: 'wood',
  color: '#4682B4',
  roofColor: '#4682B4',
  floorColor: '#ec9a74',
  groundType: 'grass',
  showBackground: true,
  tableCount: 1,
  tableLegsColor: '#1d1c21',
  tableTopColor: '#2105f5',
  benchSeatWidth: 0.4,
  benchHeight: 0.45,
  tableType: 'simple',
  overhang: 0.2,
  tableRotation: 0,

  constructionType: 'truss',
  trussType: 'simple',
  trussCount: 3,
  lathingStep: 0.5,
  pillarTubeSize: '100x100',
  roofTubeSize: '80x80',
  trussTubeSize: '60x60',
  lathingTubeSize: '40x20',
  showRoofCover: true,
  showGables: false,
  pillarBendDirection: 'outward',
};

export interface GazeboWallsProps {
  params: GazeboParams;
}

export interface GazeboCostData {
  frame: CostItem;
  roof: CostItem;
  foundation: CostItem & { work: number };
  floor: CostItem & { work: number };
  furniture?: CostItem & { work: number };
  totalCost: number;
  perimeter: number;
  roofArea: number;
  floorArea: number;
}
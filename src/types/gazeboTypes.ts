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
  pillarCount: number;
  pillarSize: '100x100' | '80x80' | '60x60';
  beamSize: '100x100' | '80x80' | '60x60';
  railingHeight: number;
  hasFurniture: boolean;
  benchCount: number;
  tableSize: 'small' | 'medium' | 'large';
  foundationType: 'wood' | 'concrete' | 'piles' | 'none';
  floorType: 'wood' | 'tile' | 'concrete';
  materialType: 'wood' | 'metal' | 'combined';
  color: string;
  roofColor: string;
  floorColor: string;
  groundType: 'grass' | 'wood' | 'concrete';
  showBackground: boolean;
}

export const initialGazeboParams: GazeboParams = {
  width: 3,
  length: 3,
  height: 2.5,
  roofHeight: 1,
  roofType: 'gable',
  pillarType: 'straight',
  pillarCount: 4,
  pillarSize: '100x100',
  beamSize: '80x80',
  railingHeight: 0.9,
  hasFurniture: true,
  benchCount: 2,
  tableSize: 'medium',
  foundationType: 'wood',
  floorType: 'wood',
  materialType: 'wood',
  color: '#8B4513',
  roofColor: '#A0522D',
  floorColor: '#D2B48C',
  groundType: 'grass',
  showBackground: true
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
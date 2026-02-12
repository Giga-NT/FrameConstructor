import { ProjectParams, GreenhouseParams } from '../types/GreenhouseTypes';

export const convertToGreenhouseParams = (params: ProjectParams): GreenhouseParams => {
  return {
    width: params.width,
    length: params.length,
    height: params.height,
    trussCount: params.trussCount,
    wallHeight: params.height * 0.8,
    type: params.roofType === 'gable' ? 'gable' : 'arched',
    frameMaterial: 'metal',
    coverMaterial: params.roofMaterial === 'polycarbonate' ? 'polycarbonate' : 'glass',
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
      side: 'front', // Изменено с 'left' на 'front'
      heightOffset: 0.5,
      lengthOffset: 0.5,
      width: 1,
      height: 0.5,
      zOffset: -0.01
    }
  };
};
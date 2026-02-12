import { ProjectParams } from '../types/types';

export const calculateCanopyCost = (params: ProjectParams) => {
  const roofArea = params.length * params.width * (params.roofType === 'gable' ? 1.2 : 1);
  
  return {
    materials: {
      roof: roofArea * (params.roofMaterial === 'polycarbonate' ? 600 : 800),
      frame: (params.length * 2 + params.width * 2) * 500,
      foundation: params.pillarCount * 2000,
      fasteners: params.trussCount * 500
    },
    works: {
      roofInstallation: roofArea * 400,
      frameAssembly: (params.length * 2 + params.width * 2) * 300,
      painting: (params.length * 2 + params.width * 2 + roofArea) * 200,
      foundation: params.pillarCount * 1000
    },
    totalMaterials: 0, // Будет вычислено
    totalWorks: 0,     // Будет вычислено
    totalAmount: 0     // Будет вычислено
  };
};
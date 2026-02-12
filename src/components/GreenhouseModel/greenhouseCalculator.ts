import { GreenhouseParams } from '../../types/GreenhouseTypes';

export const calculateGreenhouseCost = (params: GreenhouseParams) => {
  // Цены в рублях
  const prices = {
    frame: {
      metal: 1200, // руб/м.п.
      pvc: 800,
      wood: 600
    },
    cover: {
      polycarbonate: 500, // руб/м²
      glass: 1500,
      film: 100
    },
    foundation: {
      none: 0,
      wood: 1000, // руб/м.п.
      concrete: 2500,
      piles: 3000
    },
    additional: {
      ventilation: 2000, // руб/шт
      doors: 5000, // руб/шт
      partition: 3000, // руб/шт
      shelving: 4000 // руб/м.п.
    }
  };

  // Расчеты
  const frameLength = calculateFrameLength(params);
  const coverArea = calculateCoverArea(params);
  
  const frameCost = frameLength * prices.frame[params.frameMaterial];
  const coverCost = coverArea * prices.cover[params.coverMaterial];
  const foundationCost = params.length * 2 + params.width * 2 * prices.foundation[params.foundationType];
  
  let additionalCost = 0;
  if (params.hasVentilation) additionalCost += prices.additional.ventilation;
  if (params.hasDoors) additionalCost += prices.additional.doors;
  additionalCost += params.partitionCount * prices.additional.partition;
  if (params.shelving) additionalCost += params.length * prices.additional.shelving;

  const totalCost = frameCost + coverCost + foundationCost + additionalCost;

  return {
    frameCost,
    coverCost,
    foundationCost,
    additionalCost,
    totalCost,
    frameLength,
    coverArea
  };
};

// Вспомогательные функции расчетов
function calculateFrameLength(params: GreenhouseParams): number {
  // Расчет общей длины каркаса в метрах
  // Упрощенный расчет (реализуйте точный расчет в зависимости от типа теплицы)
  return params.length * 4 + params.width * 4 + params.height * 8;
}

function calculateCoverArea(params: GreenhouseParams): number {
  // Расчет площади покрытия в м²
  // Упрощенный расчет
  return params.length * params.width * 1.5;
}
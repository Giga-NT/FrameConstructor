import { GreenhouseParams } from '../types/GreenhouseTypes';

export const calculateGreenhouseCost = (params: GreenhouseParams) => {
  // Цены в рублях
  const prices = {
    cover: {
      polycarbonate: { material: 600, work: 400 },
      glass: { material: 1500, work: 700 },
      film: { material: 200, work: 100 }
    },
    frame: {
      metal: {
        '40x20': 500,
        '60x60': 700,
        '80x80': 900,
        '100x100': 1200
      },
      pvc: 800,
      wood: 600
    },
    foundation: {
      wood: { material: 1000, work: 500 },
      concrete: { material: 2500, work: 1500 },
      piles: { material: 3000, work: 2000 },
      none: { material: 0, work: 0 }
    },
    additional: {
      ventilation: { material: 2000, work: 1000 },
      doors: { material: 5000, work: 2000 },
      partition: { material: 3000, work: 1500 },
      shelving: { material: 4000, work: 2000 } // за метр погонный
    },
    screws: { material: 10, work: 0.5 },
    painting: { material: 150, work: 100 }
  };

  // Расчет площади покрытия
  let coverArea = 0;
  if (params.type === 'arched') {
    // Примерный расчет для арочной теплицы
    const archLength = Math.PI * params.height / 2;
    coverArea = (params.length * archLength) + (params.width * params.length * 2);
  } else {
    // Расчет для двускатной теплицы
    const roofHeight = params.width * Math.tan(params.roofAngle * Math.PI / 180);
    const roofSide = Math.sqrt(Math.pow(params.width/2, 2) + Math.pow(roofHeight, 2));
    coverArea = (params.length * roofSide * 2) + (params.width * params.length * 2);
  }

  // Расчет длины каркаса
  let frameLength = 0;
  if (params.type === 'arched') {
    // Вертикальные стойки
    frameLength += params.wallHeight * 4 * 2;
    // Горизонтальные элементы
    frameLength += (params.length * 2 * 2) + (params.width * 2 * 2);
    // Арочные элементы
    frameLength += params.length * 4 * 2;
  } else {
    // Вертикальные стойки
    frameLength += params.wallHeight * 4 * 2;
    // Горизонтальные элементы
    frameLength += (params.length * 2 * 2) + (params.width * 2 * 2);
    // Стропила
    frameLength += params.width * params.trussCount * 2;
  }

  // Расчет стоимости материалов
  const coverMaterialCost = coverArea * prices.cover[params.coverMaterial].material;
  const frameMaterialCost = frameLength * prices.frame.metal[params.frameMaterial === 'metal' ? '40x20' : '60x60'];
  
  // Расчет фундамента
  const foundationPerimeter = (params.length * 2) + (params.width * 2);
  const foundationMaterialCost = foundationPerimeter * prices.foundation[params.foundationType].material;
  const foundationWorkCost = foundationPerimeter * prices.foundation[params.foundationType].work;

  // Дополнительные элементы
  let additionalMaterialCost = 0;
  let additionalWorkCost = 0;
  
  if (params.hasVentilation) {
    additionalMaterialCost += prices.additional.ventilation.material;
    additionalWorkCost += prices.additional.ventilation.work;
  }
  
  if (params.hasDoors) {
    additionalMaterialCost += prices.additional.doors.material;
    additionalWorkCost += prices.additional.doors.work;
  }
  
  additionalMaterialCost += params.partitionCount * prices.additional.partition.material;
  additionalWorkCost += params.partitionCount * prices.additional.partition.work;
  
  if (params.shelving) {
    additionalMaterialCost += params.length * prices.additional.shelving.material;
    additionalWorkCost += params.length * prices.additional.shelving.work;
  }

  // Крепеж
  const screwCount = Math.ceil(coverArea * 8); // 8 шурупов на м²
  const screwsMaterialCost = screwCount * prices.screws.material;
  const screwsWorkCost = screwCount * prices.screws.work;

  // Монтаж
  const coverWorkCost = coverArea * prices.cover[params.coverMaterial].work;
  const frameWorkCost = frameLength * 200; // 200 руб/м.п. за сборку каркаса
  
  // Покраска
  const paintingArea = frameLength * 0.2; // Условная площадь для покраски
  const paintingCost = paintingArea * (prices.painting.material + prices.painting.work);

  // Итоги
  const materialsCost = coverMaterialCost + frameMaterialCost + foundationMaterialCost + 
                       additionalMaterialCost + screwsMaterialCost;
  const workCost = coverWorkCost + frameWorkCost + foundationWorkCost + 
                  additionalWorkCost + screwsWorkCost + paintingCost;
  const totalCost = materialsCost + workCost;

  return {
    coverMaterial: {
      name: 'Материал покрытия',
      cost: coverMaterialCost,
      details: `${coverArea.toFixed(1)} м² × ${prices.cover[params.coverMaterial].material} ₽/м²`
    },
    frame: {
      name: 'Каркас',
      cost: frameMaterialCost,
      details: `${frameLength.toFixed(1)} м × ${prices.frame.metal[params.frameMaterial === 'metal' ? '40x20' : '60x60']} ₽/м.п.`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationMaterialCost,
      work: foundationWorkCost,
      details: `${foundationPerimeter.toFixed(1)} м.п. (${params.foundationType})`
    },
    additional: {
      name: 'Дополнительные элементы',
      cost: additionalMaterialCost,
      work: additionalWorkCost,
      details: [
        params.hasVentilation ? 'Вентиляция: 1 шт' : '',
        params.hasDoors ? 'Двери: 1 шт' : '',
        params.partitionCount > 0 ? `Перегородки: ${params.partitionCount} шт` : '',
        params.shelving ? `Полки: ${params.length} м.п.` : ''
      ].filter(Boolean).join(', ')
    },
    screws: {
      name: 'Крепеж',
      cost: screwsMaterialCost,
      work: screwsWorkCost,
      details: `${screwCount} шт × ${prices.screws.material} ₽`
    },
    coverWork: {
      name: 'Монтаж покрытия',
      cost: coverWorkCost,
      details: `${coverArea.toFixed(1)} м² × ${prices.cover[params.coverMaterial].work} ₽/м²`
    },
    frameWork: {
      name: 'Сборка каркаса',
      cost: frameWorkCost,
      details: `${frameLength.toFixed(1)} м × 200 ₽/м.п.`
    },
    painting: {
      name: 'Покраска',
      cost: paintingCost,
      details: `${paintingArea.toFixed(1)} м² × ${prices.painting.material + prices.painting.work} ₽/м²`
    },
    totalCost,
    coverArea,
    frameLength
  };
};
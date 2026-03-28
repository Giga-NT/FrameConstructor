import * as THREE from 'three';

// ============================================================================
// Типы и интерфейсы
// ============================================================================

export type RoofType = 'gable' | 'arched' | 'single' | 'flat';

export interface TubeDimensions {
  width: number;
  thickness: number;
}

export interface RoofProfilePoint {
  x: number;
  y: number;
}

// ============================================================================
// Размеры труб и балок
// ============================================================================

/**
 * Получение размеров профильной трубы по её названию
 * @param size - Размер трубы в формате "ШxВ" (например, '40x40', '60x60')
 * @returns Объект с шириной и толщиной в метрах
 */
export function getTubeDimensions(size: string): TubeDimensions {
  const dims: Record<string, TubeDimensions> = {
    // Трубы для ферм и обрешётки
    '40x20': { width: 0.04, thickness: 0.02 },
    '40x40': { width: 0.04, thickness: 0.04 },
    '50x50': { width: 0.05, thickness: 0.05 },
    '60x60': { width: 0.06, thickness: 0.06 },
    // Стойки (большие размеры)
    '80x80': { width: 0.08, thickness: 0.08 },
    '100x100': { width: 0.1, thickness: 0.1 },
  };
  return dims[size] || { width: 0.04, thickness: 0.04 };
}

/**
 * Получение размеров балки (алиас для getTubeDimensions)
 */
export function getBeamDimensions(size: string): TubeDimensions {
  return getTubeDimensions(size);
}

/**
 * Алиас для совместимости со старым кодом
 */
export function getBeamDimensionsFromSize(size: string): TubeDimensions {
  return getTubeDimensions(size);
}

// ============================================================================
// Геометрия крыши
// ============================================================================

/**
 * Расчёт точек профиля крыши для заданного типа
 * Использует единую математическую формулу для всех типов
 * 
 * @param type - Тип крыши: 'gable' (двускатная), 'arched' (арочная), 'single' (односкатная), 'flat' (плоская)
 * @param totalWidth - Полная ширина крыши с учётом свесов
 * @param roofHeight - Высота крыши в коньке (максимальная)
 * @param segments - Количество сегментов для аппроксимации кривых (по умолчанию 16)
 * @returns Массив точек профиля
 */
export function getRoofProfilePoints(
  type: RoofType,
  totalWidth: number,
  roofHeight: number,
  segments: number = 16
): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  const halfWidth = totalWidth / 2;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // 0 to 1
    const x = -halfWidth + t * totalWidth;
    let y = 0;

    switch (type) {
      case 'arched':
        // Параболическая арка: y = roofHeight * (1 - ((x + halfWidth) / totalWidth * 2 - 1)^2)
        // Альтернативная формула через синус: y = roofHeight * sin(π * t)
        // Используем параболу для более "острой" арки
        y = roofHeight * (1 - Math.pow(2 * t - 1, 2));
        break;

      case 'gable':
        // Двускатная крыша: треугольник с вершиной в центре
        if (t <= 0.5) {
          y = 2 * t * roofHeight;
        } else {
          y = 2 * (1 - t) * roofHeight;
        }
        break;

      case 'single':
        // Односкатная крыша: линейный наклон от 0 до roofHeight
        y = t * roofHeight;
        break;

      case 'flat':
      default:
        // Плоская крыша: минимальный уклон для стока воды
        y = 0.05;
        break;
    }

    points.push(new THREE.Vector2(x, y));
  }

  return points;
}

/**
 * Расчёт 3D точек для арки на заданной позиции Z
 */
export function getArchPoints3D(
  type: RoofType,
  totalWidth: number,
  roofHeight: number,
  zPosition: number,
  baseHeight: number,
  segments: number = 16
): THREE.Vector3[] {
  const profilePoints = getRoofProfilePoints(type, totalWidth, roofHeight, segments);
  return profilePoints.map(p => new THREE.Vector3(p.x, baseHeight + p.y, zPosition));
}

// ============================================================================
// Позиции конструктивных элементов
// ============================================================================

/**
 * Расчёт позиций ферм вдоль крыши
 * @param length - Длина конструкции
 * @param trussCount - Количество ферм
 * @returns Массив Z-координат для каждой фермы
 */
export function calculateTrussPositions(length: number, trussCount: number): number[] {
  if (trussCount < 2) return [0];
  
  const positions: number[] = [];
  const step = length / (trussCount - 1);
  
  for (let i = 0; i < trussCount; i++) {
    positions.push(-length / 2 + i * step);
  }
  
  return positions;
}

/**
 * Расчёт позиций стоек вдоль стен
 * @param width - Ширина конструкции
 * @param length - Длина конструкции
 * @param spacing - Шаг между стойками
 * @returns Массив позиций стоек (Vector3)
 */
export function calculatePillarPositions(
  width: number,
  length: number,
  spacing: number
): THREE.Vector3[] {
  const pillarCount = Math.max(2, Math.ceil(length / spacing) + 1);
  const positions: THREE.Vector3[] = [];
  const step = length / (pillarCount - 1);

  for (let i = 0; i < pillarCount; i++) {
    const zPos = -length / 2 + i * step;
    // Левая стена
    positions.push(new THREE.Vector3(-width / 2, 0, zPos));
    // Правая стена
    positions.push(new THREE.Vector3(width / 2, 0, zPos));
  }

  return positions;
}

/**
 * Расчёт количества стоек на основе длины и шага
 */
export function calculatePillarCount(length: number, spacing: number): number {
  return Math.max(2, Math.ceil(length / spacing) + 1);
}

// ============================================================================
// Материалы
// ============================================================================

/**
 * Создание стандартного материала для поликарбонатного покрытия крыши
 * @param color - Цвет материала
 * @param opacity - Прозрачность (по умолчанию 0.6)
 * @returns MeshStandardMaterial
 */
export function createRoofMaterial(
  color: string,
  opacity: number = 0.6
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    roughness: 0.2,
    metalness: 0.1,
  });
}

/**
 * Создание материала для деревянных/металлических балок
 * @param color - Цвет материала
 * @param materialType - Тип материала: 'wood' или 'metal'
 * @param roughness - Шероховатость (по умолчанию 0.7)
 * @returns MeshStandardMaterial
 */
export function createBeamMaterial(
  color: string,
  materialType: 'wood' | 'metal' = 'wood',
  roughness: number = 0.7
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: materialType === 'metal' ? 0.5 : 0.1,
  });
}

/**
 * Создание материала для стоек и каркаса
 */
export function createPillarMaterial(
  color: string,
  roughness: number = 0.7,
  metalness: number = 0.1
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

// ============================================================================
// Вспомогательные геометрические функции
// ============================================================================

/**
 * Расчёт общих размеров с учётом свесов
 */
export function calculateTotalDimensions(
  width: number,
  length: number,
  overhang: number
): { totalWidth: number; totalLength: number } {
  return {
    totalWidth: width + overhang * 2,
    totalLength: length + overhang * 2,
  };
}

/**
 * Интерполяция Y-координаты на профиле крыши для заданной X
 * @param x - X-координата для поиска
 * @param points - Точки профиля крыши
 * @returns Y-координата на профиле
 */
export function findYOnProfile(x: number, points: THREE.Vector2[]): number {
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i + 1].x) {
      const t = (x - points[i].x) / (points[i + 1].x - points[i].x);
      return points[i].y + t * (points[i + 1].y - points[i].y);
    }
  }
  return 0;
}

/**
 * Интерполяция Y-координаты на 3D профиле крыши
 */
export function findYOnProfile3D(x: number, points: THREE.Vector3[]): number {
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i + 1].x) {
      const t = (x - points[i].x) / (points[i + 1].x - points[i].x);
      return points[i].y + t * (points[i + 1].y - points[i].y);
    }
  }
  return 0;
}

/**
 * Расчёт длины ската крыши для двускатной конструкции
 */
export function calculateRafterLength(
  halfWidth: number,
  roofHeight: number
): number {
  return Math.sqrt(halfWidth ** 2 + roofHeight ** 2);
}

/**
 * Расчёт угла наклона ската крыши
 */
export function calculateRoofAngle(
  halfWidth: number,
  roofHeight: number
): number {
  return Math.atan2(roofHeight, halfWidth);
}

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFlatRoof } from './FlatRoof';


interface FrameParams {
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
  numBaysLeft: number;
  numBaysRight: number;
  trussCount: number;
  topPurlinSpacing: number;
  frontOverhang: number;
  rearOverhang: number;
  leftSideOverhang: number;
  rightSideOverhang: number;
  roofType: 'flat' | 'gable' | 'arched';
  roofMaterial: 'polycarbonate' | 'metal' | 'tile';
  roofColor: string;
  roofOpacity: number;
  roofThickness: number;
  archHeight?: number;
}

interface FoundationParams {
  showFoundation: boolean;
  slabThickness: number;
  slabExtension: number;
  rebarThickness: number;
  rebarRows: number;
  rebarSpacing: number;
  gravelThickness: number;
  smallGravelThickness: number;
  sandThickness: number;
}

interface WeldingParams {
  showWelds: boolean;
}

const FrameModel: React.FC<{
  frameParams: FrameParams;
  foundationParams: FoundationParams;
  weldingParams: WeldingParams;
}> = ({ frameParams, foundationParams, weldingParams }) => {
  const modelGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Reusable geometries
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(), []);
  const cylinderGeometry = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16), []);

  // Materials
  const materials = useMemo(() => ({
    column: new THREE.MeshStandardMaterial({ color: 0x4682B4, metalness: 0.7, roughness: 0.3 }),
    truss: new THREE.MeshStandardMaterial({ color: 0x5D8AA8, metalness: 0.7, roughness: 0.3 }),
    purlin: new THREE.MeshStandardMaterial({ color: 0x72A0C1, metalness: 0.7, roughness: 0.3 }),
    weld: new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0xFFFFFF,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      metalness: 0.7
    }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xAAAAAA, metalness: 0.1, roughness: 0.8 }),
    rebar: new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0.8, roughness: 0.3 }),
    gravel: new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.1, roughness: 0.9 }),
    smallGravel: new THREE.MeshStandardMaterial({ color: 0xA0522D, metalness: 0.1, roughness: 0.9 }),
    sand: new THREE.MeshStandardMaterial({ color: 0xF4A460, metalness: 0.1, roughness: 0.9 }),
  }), []);

  const BEAM_LIFT = 0.001;

  const createSquareBeam = useCallback((
    start: THREE.Vector3,
    end: THREE.Vector3,
    size: number,
    material: THREE.Material,
    alignToGround = false
  ) => {
    const length = start.distanceTo(end);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const mesh = new THREE.Mesh(boxGeometry, material);
    mesh.scale.set(size, size, length);
    mesh.position.copy(start.clone().lerp(end, 0.5));
    if (alignToGround) {
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(up, direction).normalize();
      const normal = new THREE.Vector3().crossVectors(direction, right).normalize();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
      mesh.quaternion.multiply(quaternion);
    } else {
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    }
    mesh.castShadow = true;
    return mesh;
  }, [boxGeometry]);

  const createFlatBeam = useCallback((
    start: THREE.Vector3,
    end: THREE.Vector3,
    width: number,
    height: number,
    material: THREE.Material
  ) => {
    const length = start.distanceTo(end);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const mesh = new THREE.Mesh(boxGeometry, material);
    mesh.scale.set(width, height, length);
    mesh.position.copy(start.clone().lerp(end, 0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    mesh.castShadow = true;
    return mesh;
  }, [boxGeometry]);

  const createWeld = useCallback((position: THREE.Vector3, size: number, rotation: THREE.Euler) => {
    const mesh = new THREE.Mesh(cylinderGeometry, materials.weld);
    mesh.scale.set(size, size / 3, size);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    return mesh;
  }, [cylinderGeometry, materials.weld]);

  const createColumn = useCallback((x: number, z: number, height: number, size: number) => {
    const mesh = new THREE.Mesh(boxGeometry, materials.column);
    mesh.scale.set(size, height, size);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    return mesh;
  }, [boxGeometry, materials.column]);

  const createInclinedTruss = useCallback((
    totalLength: number,
    heightLeft: number,
    heightRight: number,
    minBayLength: number,
    sectionSize: number,
    zPosition: number,
    columnPositionsZ: number[],
    frontOverhang = 0,
    rearOverhang = 0
  ) => {
    const trussGroup = new THREE.Group();
    const lowerPoints: THREE.Vector3[] = [];
    const upperPoints: THREE.Vector3[] = [];
    const mainLength = totalLength;
    const numBays = Math.max(2, Math.ceil(mainLength / minBayLength));
    const exactBayLength = mainLength / numBays;
    let currentX = 0;

    lowerPoints.push(new THREE.Vector3(currentX, 0, zPosition));

    for (let i = 0; i < numBays; i++) {
      currentX += exactBayLength;
      lowerPoints.push(new THREE.Vector3(currentX, 0, zPosition));
    }

    const slope = (heightRight - heightLeft) / mainLength;

    lowerPoints.forEach(point => {
      const y = heightLeft + slope * point.x;
      upperPoints.push(new THREE.Vector3(point.x, y, zPosition));
    });

    if (frontOverhang > 0) {
      const firstPoint = upperPoints[0];
      const frontY = firstPoint.y - slope * frontOverhang;
      upperPoints.unshift(new THREE.Vector3(-frontOverhang, frontY, zPosition));
    }

    if (rearOverhang > 0) {
      const lastPoint = upperPoints[upperPoints.length - 1];
      const rearY = lastPoint.y + slope * rearOverhang;
      upperPoints.push(new THREE.Vector3(totalLength + rearOverhang, rearY, zPosition));
    }

    // Нижний пояс
    for (let i = 0; i < lowerPoints.length - 1; i++) {
      trussGroup.add(createSquareBeam(
        lowerPoints[i],
        lowerPoints[i + 1],
        sectionSize,
        materials.truss
      ));
    }

    // Верхний пояс
    for (let i = 0; i < upperPoints.length - 1; i++) {
      const beam = createSquareBeam(
        upperPoints[i],
        upperPoints[i + 1],
        sectionSize,
        materials.truss
      );
      const euler = new THREE.Euler(0, 0, -0.05);
      const quaternion = new THREE.Quaternion().setFromEuler(euler);
      beam.quaternion.multiply(quaternion);
      trussGroup.add(beam);
    }

    // Вертикальные стойки
    for (let i = 0; i < lowerPoints.length; i++) {
      const upperIndex = frontOverhang > 0 ? i + 1 : i;
      if (upperIndex < upperPoints.length) {
        trussGroup.add(createSquareBeam(
          lowerPoints[i],
          upperPoints[upperIndex],
          sectionSize,
          materials.truss
        ));
      }
    }

    // Раскосы
    for (let i = 0; i < lowerPoints.length - 1; i++) {
      const upperIndex = frontOverhang > 0 ? i + 1 : i;
      if (i % 2 === 0 && upperIndex + 1 < upperPoints.length) {
        trussGroup.add(createSquareBeam(
          lowerPoints[i],
          upperPoints[upperIndex + 1],
          sectionSize,
          materials.truss,
          true
        ));
      } else if (upperIndex < upperPoints.length) {
        trussGroup.add(createSquareBeam(
          upperPoints[upperIndex],
          lowerPoints[i + 1],
          sectionSize,
          materials.truss,
          true
        ));
      }
    }

    return trussGroup;
  }, [createSquareBeam, materials.truss]);

  const createArchedTruss = useCallback((
    totalLength: number,
    heightLeft: number,
    heightRight: number,
    minBayLength: number,
    sectionSize: number,
    zPosition: number,
    columnPositionsZ: number[],
    frontOverhang = 0,
    rearOverhang = 0,
    archHeight = 1.5
  ) => {
    const trussGroup = new THREE.Group();
    const lowerPoints: THREE.Vector3[] = [];
    const upperPoints: THREE.Vector3[] = [];
    const mainLength = totalLength;
    const numBays = Math.max(2, Math.ceil(mainLength / minBayLength));
    const exactBayLength = mainLength / numBays;
    let currentX = 0;

    // Нижний пояс (прямой)
    lowerPoints.push(new THREE.Vector3(currentX, 0, zPosition));
    for (let i = 0; i < numBays; i++) {
      currentX += exactBayLength;
      lowerPoints.push(new THREE.Vector3(currentX, 0, zPosition));
    }

    // Верхний пояс (арочный)
    for (let x = 0; x <= totalLength; x += exactBayLength) {
      const t = x / totalLength;
      const y = 4 * archHeight * t * (1 - t); // Параболическая форма
      upperPoints.push(new THREE.Vector3(
        x,
        heightLeft + y,
        zPosition
      ));
    }

    // Добавляем свесы
    if (frontOverhang > 0) {
      upperPoints.unshift(new THREE.Vector3(
        -frontOverhang,
        heightLeft,
        zPosition
      ));
    }

    if (rearOverhang > 0) {
      upperPoints.push(new THREE.Vector3(
        totalLength + rearOverhang,
        heightRight,
        zPosition
      ));
    }

    // Создаем элементы фермы
    // Нижний пояс
    for (let i = 0; i < lowerPoints.length - 1; i++) {
      trussGroup.add(createSquareBeam(
        lowerPoints[i],
        lowerPoints[i + 1],
        sectionSize,
        materials.truss
      ));
    }

    // Верхний пояс (арочный)
    for (let i = 0; i < upperPoints.length - 1; i++) {
      trussGroup.add(createSquareBeam(
        upperPoints[i],
        upperPoints[i + 1],
        sectionSize,
        materials.truss
      ));
    }

    // Вертикальные стойки
    for (let i = 0; i < lowerPoints.length; i++) {
      const upperIndex = frontOverhang > 0 ? i + 1 : i;
      if (upperIndex < upperPoints.length) {
        trussGroup.add(createSquareBeam(
          lowerPoints[i],
          upperPoints[upperIndex],
          sectionSize,
          materials.truss
        ));
      }
    }

    // Раскосы
    for (let i = 0; i < lowerPoints.length - 1; i++) {
      const upperIndex = frontOverhang > 0 ? i + 1 : i;
      if (i % 2 === 0 && upperIndex + 1 < upperPoints.length) {
        trussGroup.add(createSquareBeam(
          lowerPoints[i],
          upperPoints[upperIndex + 1],
          sectionSize,
          materials.truss,
          true
        ));
      } else if (upperIndex < upperPoints.length) {
        trussGroup.add(createSquareBeam(
          upperPoints[upperIndex],
          lowerPoints[i + 1],
          sectionSize,
          materials.truss,
          true
        ));
      }
    }

    return trussGroup;
  }, [createSquareBeam, materials.truss]);

  const createFoundation = useCallback((
    length: number,
    width: number,
    slabThickness: number,
    slabExtension: number,
    rebarThickness: number,
    rebarRows: number,
    rebarSpacing: number,
    gravelThickness: number,
    smallGravelThickness: number,
    sandThickness: number
  ) => {
    const foundationGroup = new THREE.Group();

    const slabLength = length + 2 * slabExtension;
    const slabWidth = width + 2 * slabExtension;
    const totalPillowThickness = gravelThickness + smallGravelThickness + sandThickness;

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(slabLength * 1.2, 0.1, slabWidth * 1.2),
      new THREE.MeshStandardMaterial({ color: 0x5D4037 })
    );
    ground.position.set(length / 2, -totalPillowThickness - 0.05, 0);
    foundationGroup.add(ground);

    const sand = new THREE.Mesh(
      new THREE.BoxGeometry(slabLength, sandThickness, slabWidth),
      materials.sand
    );
    sand.position.set(length / 2, -totalPillowThickness + sandThickness / 2, 0);
    foundationGroup.add(sand);

    const gravel = new THREE.Mesh(
      new THREE.BoxGeometry(slabLength, gravelThickness, slabWidth),
      materials.gravel
    );
    gravel.position.set(length / 2, -totalPillowThickness + sandThickness + gravelThickness / 2, 0);
    foundationGroup.add(gravel);

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(slabLength, slabThickness, slabWidth),
      materials.concrete
    );
    slab.position.set(length / 2, -totalPillowThickness + sandThickness + gravelThickness + slabThickness / 2, 0);
    foundationGroup.add(slab);

    const rebarSize = rebarThickness / 1000;
    const rebarOffset = 0.05;

    for (let y = rebarOffset; y <= slabThickness - rebarOffset; y += (slabThickness - 2 * rebarOffset) / (rebarRows - 1)) {
      for (let x = -slabExtension + rebarSpacing / 2; x < length + slabExtension; x += rebarSpacing) {
        for (let z = -width / 2 - slabExtension + rebarSpacing / 2; z < width / 2 + slabExtension; z += rebarSpacing) {
          foundationGroup.add(createFlatBeam(
            new THREE.Vector3(x, y - slabThickness / 2, z),
            new THREE.Vector3(x + rebarSpacing * 0.9, y - slabThickness / 2, z),
            rebarSize,
            rebarSize,
            materials.rebar
          ));
          foundationGroup.add(createFlatBeam(
            new THREE.Vector3(x, y - slabThickness / 2, z),
            new THREE.Vector3(x, y - slabThickness / 2, z + rebarSpacing * 0.9),
            rebarSize,
            rebarSize,
            materials.rebar
          ));
        }
      }
    }

    return foundationGroup;
  }, [createFlatBeam, materials]);

  const createRoofPurlins = useCallback((
    length: number,
    width: number,
    height: number,
    trussHeightLeft: number,
    trussHeightRight: number,
    purlinSection: number,
    purlinSpacing: number,
    frontOverhang: number,
    rearOverhang: number,
    leftSideOverhang: number,
    rightSideOverhang: number,
    columnPositionsZ: number[],
    trussCount: number
  ) => {
    const purlinGroup = new THREE.Group();

    const startX = -frontOverhang;
    const endX = length + rearOverhang;
    const startZ = columnPositionsZ[0];
    const endZ = columnPositionsZ[columnPositionsZ.length - 1];
    const slope = (trussHeightRight - trussHeightLeft) / length;

    const positions: number[] = [];

    for (let x = 0; x <= length; x += purlinSpacing) {
      positions.push(x);
    }

    if (positions[positions.length - 1] < length) {
      positions.push(length);
    }

    if (frontOverhang > 0) {
      positions.unshift(-frontOverhang);
    }

    if (rearOverhang > 0) {
      positions.push(length + rearOverhang);
    }

    positions.forEach((x, index) => {
      let y;
      if (x < 0) {
        y = height + trussHeightLeft - slope * frontOverhang + slope * (x + frontOverhang);
      } else if (x > length) {
        y = height + trussHeightRight + slope * (x - length);
      } else {
        y = height + trussHeightLeft + slope * x;
      }

      y += purlinSection * 1;

      if (x === length) {
        y = height + trussHeightRight;
      }

      purlinGroup.add(createFlatBeam(
        new THREE.Vector3(x, y, startZ),
        new THREE.Vector3(x, y, endZ),
        purlinSection,
        purlinSection * 0.5,
        materials.purlin
      ));

      if (leftSideOverhang > 0) {
        purlinGroup.add(createFlatBeam(
          new THREE.Vector3(x, y, startZ),
          new THREE.Vector3(x, y, startZ - leftSideOverhang),
          purlinSection,
          purlinSection * 0.5,
          materials.purlin
        ));
      }

      if (rightSideOverhang > 0) {
        purlinGroup.add(createFlatBeam(
          new THREE.Vector3(x, y, endZ),
          new THREE.Vector3(x, y, endZ + rightSideOverhang),
          purlinSection,
          purlinSection * 0.5,
          materials.purlin
        ));
      }
    });

    return purlinGroup;
  }, [createFlatBeam, materials.purlin]);

  const createArchedRoof = ({
    length,
    width,
    height,
    trussHeightLeft,
    trussHeightRight,
    frontOverhang,
    rearOverhang,
    leftSideOverhang,
    rightSideOverhang,
    columnPositionsZ,
    roofMaterial,
    roofThickness,
    archHeight = 1.5
  }: {
    length: number;
    width: number;
    height: number;
    trussHeightLeft: number;
    trussHeightRight: number;
    frontOverhang: number;
    rearOverhang: number;
    leftSideOverhang: number;
    rightSideOverhang: number;
    columnPositionsZ: number[];
    roofMaterial: THREE.Material;
    roofThickness: number;
    archHeight?: number;
  }) => {
    const roofGroup = new THREE.Group();
    const segments = 16;
    
    const curve = new THREE.EllipseCurve(
      0, 0,
      length / 2, archHeight,
      0, Math.PI,
      false,
      1.57
    );

    const points = curve.getPoints(segments);
    const shape = new THREE.Shape(points);

    const extrudeSettings = {
      steps: 1,
      depth: width + leftSideOverhang + rightSideOverhang,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, roofMaterial);

    mesh.rotation.x = Math.PI / 1;
    mesh.rotation.z = Math.PI / 2;
    mesh.position.x = length / 2;
    mesh.position.y = height + (trussHeightLeft + trussHeightRight) / 2;
    mesh.position.z = columnPositionsZ[0] - leftSideOverhang + (width + leftSideOverhang + rightSideOverhang) / 2+5.25;

    roofGroup.add(mesh);
    return roofGroup;
  };


// Добавляем новую функцию для создания двускатной крыши
const createGableRoof = ({
  length,
  width,
  height,
  trussHeightLeft,
  trussHeightRight,
  frontOverhang,
  rearOverhang,
  leftSideOverhang,
  rightSideOverhang,
  columnPositionsZ,
  roofMaterial,
  roofThickness
}: {
  length: number;
  width: number;
  height: number;
  trussHeightLeft: number;
  trussHeightRight: number;
  frontOverhang: number;
  rearOverhang: number;
  leftSideOverhang: number;
  rightSideOverhang: number;
  columnPositionsZ: number[];
  roofMaterial: THREE.Material;
  roofThickness: number;
}) => {
  const roofGroup = new THREE.Group();
  const slope = (trussHeightRight - trussHeightLeft) / length;

  // Создаем геометрию для двускатной крыши
  const roofWidth = width + leftSideOverhang + rightSideOverhang;
  const roofLength = length + frontOverhang + rearOverhang;
  
  // Вершины для крыши
  const peakHeight = Math.max(trussHeightLeft, trussHeightRight) + height;
  const startX = -frontOverhang;
  const endX = length + rearOverhang;
  
  // Создаем форму крыши
  const shape = new THREE.Shape();
  shape.moveTo(startX, 0);
  shape.lineTo(length / 2, peakHeight - height);
  shape.lineTo(endX, 0);
  
  // Экструдируем форму
  const extrudeSettings = {
    steps: 1,
    depth: roofWidth,
    bevelEnabled: false
  };
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mesh = new THREE.Mesh(geometry, roofMaterial);
  
  // Позиционируем крышу
  mesh.position.y = height;
  mesh.position.z = columnPositionsZ[0] - leftSideOverhang + roofWidth / 2;
  mesh.rotation.y = Math.PI / 2;
  
  roofGroup.add(mesh);
  return roofGroup;
};

// Модифицируем функцию createRoof для обработки gable типа
const createRoof = useCallback((
  length: number,
  width: number,
  height: number,
  trussHeightLeft: number,
  trussHeightRight: number,
  frontOverhang: number,
  rearOverhang: number,
  leftSideOverhang: number,
  rightSideOverhang: number,
  columnPositionsZ: number[],
  roofType: 'flat' | 'arched' | 'gable',
  roofMaterialType: 'polycarbonate' | 'metal' | 'tile',
  roofColor: string,
  roofOpacity: number,
  roofThickness: number,
  archHeight?: number
) => {
  let material: THREE.Material;
  
  switch(roofMaterialType) {
    case 'polycarbonate':
      material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(roofColor),
        transmission: roofOpacity * 0.8,
        roughness: 0.1,
        metalness: 0.05,
        thickness: roofThickness,
        ior: 1.4,
      });
      break;
      
    case 'metal':
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(roofColor),
        metalness: 0.8,
        roughness: 0.2
      });
      break;
      
    case 'tile':
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(roofColor),
        metalness: 0.1,
        roughness: 0.7
      });
      break;
      
    default:
      material = new THREE.MeshStandardMaterial({ color: 0x888888 });
  }

  const roofGroup = new THREE.Group();
  roofGroup.name = 'roof';

  if (roofType === 'flat') {
    const flatRoof = createFlatRoof({
      length,
      width,
      height,
      trussHeightLeft,
      trussHeightRight,
      frontOverhang,
      rearOverhang,
      leftSideOverhang,
      rightSideOverhang,
      columnPositionsZ,
      roofMaterial: material,
      roofThickness
    });
    roofGroup.add(flatRoof);
  } else if (roofType === 'arched') {
    const archedRoof = createArchedRoof({
      length,
      width,
      height,
      trussHeightLeft,
      trussHeightRight,
      frontOverhang,
      rearOverhang,
      leftSideOverhang,
      rightSideOverhang,
      columnPositionsZ,
      roofMaterial: material,
      roofThickness,
      archHeight
    });
    roofGroup.add(archedRoof);
  } else if (roofType === 'gable') {
    const gableRoof = createGableRoof({
      length,
      width,
      height,
      trussHeightLeft,
      trussHeightRight,
      frontOverhang,
      rearOverhang,
      leftSideOverhang,
      rightSideOverhang,
      columnPositionsZ,
      roofMaterial: material,
      roofThickness
    });
    roofGroup.add(gableRoof);
  }

  return roofGroup;
}, [createFlatRoof]);

  const buildBaseModel = useCallback(() => {
    const modelGroup = new THREE.Group();

    const {
      length, width, height, numColumns, columnSection, trussSection, purlinSection,
      trussHeightLeft, trussHeightRight, bayLengthLeft, bayLengthRight, numBaysLeft, numBaysRight,
      trussCount, topPurlinSpacing, frontOverhang, rearOverhang, leftSideOverhang, rightSideOverhang,
      roofType, archHeight
    } = frameParams;

    const {
      showFoundation, slabThickness, slabExtension, rebarThickness,
      rebarRows, rebarSpacing, gravelThickness, smallGravelThickness, sandThickness
    } = foundationParams;

    const { showWelds } = weldingParams;

    if (showFoundation) {
      modelGroup.add(createFoundation(
        length, width, slabThickness, slabExtension,
        rebarThickness, rebarRows, rebarSpacing,
        gravelThickness, smallGravelThickness, sandThickness
      ));
    }

    const columnPositionsX: number[] = [];
    const columnPositionsZ: number[] = [];
    const columnStepX = length / (numColumns - 1);
    const columnStepZ = width / (trussCount - 1);

    for (let i = 0; i < numColumns; i++) {
      columnPositionsX.push(i * columnStepX);
    }

    for (let i = 0; i < trussCount; i++) {
      columnPositionsZ.push(i * columnStepZ - width / 2);
    }

    columnPositionsX.forEach(x => {
      modelGroup.add(createColumn(x, columnPositionsZ[0], height, columnSection));
      modelGroup.add(createColumn(x, columnPositionsZ[columnPositionsZ.length - 1], height, columnSection));
    });

    modelGroup.add(createFlatBeam(
      new THREE.Vector3(0, height + BEAM_LIFT, columnPositionsZ[0]),
      new THREE.Vector3(length, height + BEAM_LIFT, columnPositionsZ[0]),
      columnSection * 0.8,
      columnSection * 0.8,
      materials.column
    ));

    columnPositionsX.forEach(x => {
      modelGroup.add(createFlatBeam(
        new THREE.Vector3(x, height + BEAM_LIFT, columnPositionsZ[0]),
        new THREE.Vector3(x, height + BEAM_LIFT, columnPositionsZ[columnPositionsZ.length - 1]),
        columnSection * 0.8,
        columnSection * 0.8,
        materials.column
      ));
    });

    columnPositionsZ.forEach(z => {
      let truss;
      if (roofType === 'arched') {
        truss = createArchedTruss(
          length,
          trussHeightLeft,
          trussHeightRight,
          Math.min(bayLengthLeft, bayLengthRight),
          trussSection,
          z,
          columnPositionsZ,
          frontOverhang,
          rearOverhang,
          archHeight
        );
      } else {
        truss = createInclinedTruss(
          length,
          trussHeightLeft,
          trussHeightRight,
          Math.min(bayLengthLeft, bayLengthRight),
          trussSection,
          z,
          columnPositionsZ,
          frontOverhang,
          rearOverhang
        );
      }
      truss.position.y = height;
      modelGroup.add(truss);
    });

    const purlinGroup = createRoofPurlins(
      length,
      width,
      height,
      trussHeightLeft,
      trussHeightRight,
      purlinSection,
      topPurlinSpacing,
      frontOverhang,
      rearOverhang,
      leftSideOverhang,
      rightSideOverhang,
      columnPositionsZ,
      trussCount
    );

    modelGroup.add(purlinGroup);


    return { modelGroup, columnPositionsZ };
  }, [
    frameParams, foundationParams, weldingParams, createColumn, createFlatBeam,
    createInclinedTruss, createArchedTruss, createFoundation, createRoofPurlins
  ]);

  useEffect(() => {
    const { modelGroup, columnPositionsZ } = buildBaseModel();

    const existingRoof = modelGroup.getObjectByName('roof');
    if (existingRoof) {
      modelGroup.remove(existingRoof);
    }

    if (frameParams.roofType) {
      const roofGroup = createRoof(
        frameParams.length,
        frameParams.width,
        frameParams.height,
        frameParams.trussHeightLeft,
        frameParams.trussHeightRight,
        frameParams.frontOverhang,
        frameParams.rearOverhang,
        frameParams.leftSideOverhang,
        frameParams.rightSideOverhang,
        columnPositionsZ,
        frameParams.roofType,
        frameParams.roofMaterial,
        frameParams.roofColor,
        frameParams.roofOpacity,
        frameParams.roofThickness,
        frameParams.archHeight
      );
      
      roofGroup.name = 'roof';
      modelGroup.add(roofGroup);
    }

    modelGroupRef.current.clear();
    modelGroupRef.current.add(modelGroup);
  }, [
    frameParams,
    foundationParams,
    weldingParams,
    createRoof,
    buildBaseModel
  ]);

  return <primitive object={modelGroupRef.current} />;
};

export default React.memo(FrameModel);
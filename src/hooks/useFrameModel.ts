import { useMemo } from 'react';
import * as THREE from 'three';
import { FrameParams, FoundationParams, WeldingParams } from '../types/types';

export const useFrameModel = (
    frameParams: FrameParams,
    foundationParams: FoundationParams,
    weldingParams: WeldingParams
) => {
    const BEAM_LIFT = 0.001;
    const bayLengthLeft = frameParams.bayLengthLeft ?? 1;
    const bayLengthRight = frameParams.bayLengthRight ?? 1;

    const createSquareBeam = (
        start: THREE.Vector3,
        end: THREE.Vector3,
        size: number,
        material: THREE.Material,
        alignToGround = false
    ) => {
        const length = start.distanceTo(end);
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, length), material);
        mesh.position.copy(start.clone().lerp(end, 0.5));
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

        if (!alignToGround) {
            const euler = new THREE.Euler(0.001, 0.002, 0.005, 'XYZ');
            mesh.quaternion.multiply(new THREE.Quaternion().setFromEuler(euler));
        }

        mesh.castShadow = true;
        return mesh;
    };

    const createFlatBeam = (
        start: THREE.Vector3,
        end: THREE.Vector3,
        width: number,
        height: number,
        material: THREE.Material
    ) => {
        const length = start.distanceTo(end);
        const geometry = new THREE.BoxGeometry(width, height, length);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(start.clone().lerp(end, 0.5));
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        mesh.castShadow = true;
        return mesh;
    };

    const createWeld = (
        position: THREE.Vector3,
        size: number,
        rotation: THREE.Euler
    ) => {
        const geometry = new THREE.CylinderGeometry(size / 2, size / 2, size / 3, 32);
        const mesh = new THREE.Mesh(geometry, materials.weld);
        mesh.position.copy(position);
        mesh.rotation.copy(rotation);
        return mesh;
    };

    const createColumn = (
        x: number,
        z: number,
        height: number,
        size: number
    ) => {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size, height, size),
            materials.column
        );
        mesh.position.set(x, height / 2, z);
        mesh.castShadow = true;
        return mesh;
    };

    const createInclinedTruss = (
        totalLength: number,
        heightLeft: number,
        heightRight: number,
        minBayLength: number,
        sectionSize: number,
        zPosition: number,
        columnPositionsZ: number[],
        frontOverhang = 0,
        rearOverhang = 0,
        leftSideOverhang = 0,
        rightSideOverhang = 0
    ) => {
        const trussGroup = new THREE.Group();
        const lowerPoints: THREE.Vector3[] = [];
        const upperPoints: THREE.Vector3[] = [];

        const isLeftMostTruss = zPosition === columnPositionsZ[0];
        const isRightMostTruss = zPosition === columnPositionsZ[columnPositionsZ.length - 1];

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
            upperPoints.push(new THREE.Vector3(mainLength + rearOverhang, rearY, zPosition));
        }

        if (isLeftMostTruss && leftSideOverhang > 0) {
            const firstLowerPoint = lowerPoints[0];
            const firstUpperPoint = upperPoints[0];
            trussGroup.add(createSquareBeam(
                firstLowerPoint,
                new THREE.Vector3(firstLowerPoint.x, firstLowerPoint.y, zPosition - leftSideOverhang),
                sectionSize,
                materials.truss
            ));
            trussGroup.add(createSquareBeam(
                firstUpperPoint,
                new THREE.Vector3(firstUpperPoint.x, firstUpperPoint.y, zPosition - leftSideOverhang),
                sectionSize,
                materials.truss
            ));
        }

        if (isRightMostTruss && rightSideOverhang > 0) {
            const lastLowerPoint = lowerPoints[lowerPoints.length - 1];
            const lastUpperPoint = upperPoints[upperPoints.length - 1];
            trussGroup.add(createSquareBeam(
                lastLowerPoint,
                new THREE.Vector3(lastLowerPoint.x, lastLowerPoint.y, zPosition + rightSideOverhang),
                sectionSize,
                materials.truss
            ));
            trussGroup.add(createSquareBeam(
                lastUpperPoint,
                new THREE.Vector3(lastUpperPoint.x, lastUpperPoint.y, zPosition + rightSideOverhang),
                sectionSize,
                materials.truss
            ));
        }

        for (let i = 0; i < lowerPoints.length - 1; i++) {
            trussGroup.add(createSquareBeam(
                lowerPoints[i],
                lowerPoints[i + 1],
                sectionSize,
                materials.truss
            ));
        }

        for (let i = 0; i < upperPoints.length - 1; i++) {
            trussGroup.add(createSquareBeam(
                upperPoints[i],
                upperPoints[i + 1],
                sectionSize,
                materials.truss
            ));
        }

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
    };

    const createFoundation = (
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
    };

    const createRoofPurlins = (
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

        for (let x = startX; x <= endX; x += purlinSpacing) {
            let y;
            if (x < 0) {
                y = height + trussHeightLeft - slope * frontOverhang + slope * (x + frontOverhang);
            } else if (x > length) {
                y = height + trussHeightRight;
            } else {
                y = height + trussHeightLeft + slope * x;
            }
            y += (purlinSection * 0.5) + BEAM_LIFT;

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
        }

        return purlinGroup;
    };

    const materials = useMemo(() => ({
        column: new THREE.MeshStandardMaterial({
            color: 0x4682B4, metalness: 0.7, roughness: 0.3
        }),
        truss: new THREE.MeshStandardMaterial({
            color: 0x5D8AA8, metalness: 0.7, roughness: 0.3
        }),
        purlin: new THREE.MeshStandardMaterial({
            color: 0x72A0C1, metalness: 0.7, roughness: 0.3
        }),
        weld: new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.3,
            roughness: 0.5,
            metalness: 0.7
        }),
        concrete: new THREE.MeshStandardMaterial({
            color: 0xAAAAAA, metalness: 0.1, roughness: 0.8
        }),
        rebar: new THREE.MeshStandardMaterial({
            color: 0xFF0000, metalness: 0.8, roughness: 0.3
        }),
        gravel: new THREE.MeshStandardMaterial({
            color: 0x8B4513, metalness: 0.1, roughness: 0.9
        }),
        smallGravel: new THREE.MeshStandardMaterial({
            color: 0xA0522D, metalness: 0.1, roughness: 0.9
        }),
        sand: new THREE.MeshStandardMaterial({
            color: 0xF4A460, metalness: 0.1, roughness: 0.9
        })
    }), []);

    const model = useMemo(() => {
        const modelGroup = new THREE.Group();
        const {
            length, width, height, numColumns, columnSection, trussSection, purlinSection,
            trussHeightLeft, trussHeightRight, bayLengthLeft, bayLengthRight,
            numBaysLeft, numBaysRight, trussCount, topPurlinSpacing,
            frontOverhang, rearOverhang, leftSideOverhang, rightSideOverhang
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

        modelGroup.add(createFlatBeam(
            new THREE.Vector3(0, height + BEAM_LIFT, columnPositionsZ[columnPositionsZ.length - 1]),
            new THREE.Vector3(length, height + BEAM_LIFT, columnPositionsZ[columnPositionsZ.length - 1]),
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
            const truss = createInclinedTruss(
                length, 
                trussHeightLeft, 
                trussHeightRight,
                Math.min(bayLengthLeft, bayLengthRight),
                trussSection, 
                z,
                columnPositionsZ,
                frontOverhang, 
                rearOverhang,
                z === columnPositionsZ[0] ? leftSideOverhang : 0,
                z === columnPositionsZ[columnPositionsZ.length - 1] ? rightSideOverhang : 0
            );
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

        if (showWelds) {
            const weldSize = columnSection * 0.5;
            columnPositionsX.forEach(x => {
                modelGroup.add(createWeld(
                    new THREE.Vector3(x, height, columnPositionsZ[0]),
                    weldSize,
                    new THREE.Euler(Math.PI / 2, 0, 0)
                ));
                modelGroup.add(createWeld(
                    new THREE.Vector3(x, height, columnPositionsZ[columnPositionsZ.length - 1]),
                    weldSize,
                    new THREE.Euler(Math.PI / 2, 0, 0)
                ));
            });

            columnPositionsZ.forEach(z => {
                modelGroup.add(createWeld(
                    new THREE.Vector3(0, height + trussHeightLeft, z),
                    weldSize * 0.8,
                    new THREE.Euler(0, Math.PI / 4, 0)
                ));
                modelGroup.add(createWeld(
                    new THREE.Vector3(length, height + trussHeightRight, z),
                    weldSize * 0.8,
                    new THREE.Euler(0, Math.PI / 4, 0)
                ));
            });
        }

        return modelGroup;
    }, [frameParams, foundationParams, weldingParams, materials, bayLengthLeft, bayLengthRight]);

    return model;
};
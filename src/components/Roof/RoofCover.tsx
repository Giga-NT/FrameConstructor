import React, { useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';

interface TextureMaps {
    map?: THREE.Texture | null;
    alphaMap?: THREE.Texture | null;
}

interface MaterialProps {
    metalness: number;
    roughness: number;
    envMapIntensity: number;
    transparent?: boolean;
    opacity?: number;
    color?: THREE.Color;
    map?: THREE.Texture | null;
    alphaMap?: THREE.Texture | null;
}

const RoofCover: React.FC<{ params: CanopyParams }> = ({ params }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const extraWidth = 0.1;
    const roofWidth = params.width + params.overhang * 2 + extraWidth;
    const roofLength = params.length + 0.2;

    const texturePaths = useMemo(() => {
        const paths = {
            metal: { map: '/textures/metal_roof.jpeg' },
            polycarbonate: { 
                map: '/textures/polycarbonate.png',
                alphaMap: '/textures/polycarbonate_alpha.png'
            },
            tile: { map: '/textures/tile.jpg' }
        };
        return paths[params.roofMaterial as keyof typeof paths] || { map: null };
    }, [params.roofMaterial]);

    const loadedTextures = useTexture(texturePaths) as TextureMaps;

	const getMaterialProps = useMemo((): MaterialProps => {
		const basePropsMap = {
			metal: {
				metalness: 0.95,
				roughness: 0.3,
				envMapIntensity: 1.2,
				transparent: false,
				opacity: 1.0,
				color: params.roofColor ? new THREE.Color(params.roofColor) : new THREE.Color(0x666666)
			},
			polycarbonate: {
				metalness: 0.3,
				roughness: 0.25,
				transparent: true,
				opacity: 0.85,
				envMapIntensity: 1.5,
				color: params.roofColor ? new THREE.Color(params.roofColor) : new THREE.Color(0xffffff)
			},
			tile: {
				metalness: 0.4,
				roughness: 0.7,
				envMapIntensity: 0.5,
				transparent: false,
				opacity: 1.0,
				color: new THREE.Color(0x333333) // Черепица обычно имеет фиксированный цвет
			}
		};

		const baseProps = basePropsMap[params.roofMaterial as keyof typeof basePropsMap] || {};

		// Для металла и поликарбоната всегда применяем цвет, если он задан
		if (params.roofColor && params.roofMaterial !== 'tile') {
			return {
				...baseProps,
				color: new THREE.Color(params.roofColor),
				map: params.roofMaterial === 'metal' ? loadedTextures.map : null,
				alphaMap: null
			};
		}

		return {
			...baseProps,
			...loadedTextures
		};
	}, [params.roofMaterial, params.roofColor, loadedTextures]);

    const roofGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const segments = 24;
        
        switch(params.roofType) {
            case 'gable':
                shape.moveTo(-roofWidth/2, 0);
                shape.lineTo(0, params.roofHeight);
                shape.lineTo(roofWidth/2, 0);
                break;
                
            case 'arch':
                for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * Math.PI;
                    const x = -roofWidth/2 + (roofWidth * i/segments);
                    const y = params.roofHeight * Math.sin(angle);
                    
                    if (i === 0) shape.moveTo(x, y);
                    else shape.lineTo(x, y);
                }
                break;
                
            case 'shed':
                shape.moveTo(roofWidth/2, 0);
                shape.lineTo(-roofWidth/2, params.roofHeight);
                break;
                
            case 'flat':
            default:
                shape.moveTo(-roofWidth/2, 0);
                shape.lineTo(roofWidth/2, 0);
        }

        const profileGeometry = new THREE.ShapeGeometry(shape);
        
        const position = profileGeometry.attributes.position;
        const vertices = [];
        const indices = [];
        
        for (let i = 0; i < position.count; i++) {
            vertices.push(position.getX(i), position.getY(i), -roofLength/2);
            vertices.push(position.getX(i), position.getY(i), roofLength/2);
        }

        for (let i = 0; i < position.count - 1; i++) {
            const base = i * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        geometry.rotateX(Math.PI/5 + 5.65);
        geometry.rotateY(Math.PI/-1);
        geometry.translate(0, params.height+0.07, 0);
        
        return geometry;
    }, [params.width, params.length, params.height, params.roofHeight, params.overhang, params.roofType]);

    return (
        <mesh 
            ref={meshRef} 
            geometry={roofGeometry}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial 
                {...getMaterialProps}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

export default RoofCover;
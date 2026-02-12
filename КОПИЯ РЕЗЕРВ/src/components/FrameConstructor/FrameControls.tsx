// FrameControls.tsx
import React from 'react';
import ControlGroup from '../UI/ControlGroup';
import { FrameParams } from '../../types/types';
import RoofControls from './RoofControls';

interface FrameControlsProps {
    params: FrameParams;
    onChange: (params: FrameParams) => void;
}

const FrameControls: React.FC<FrameControlsProps> = React.memo(({ params, onChange }) => {
    const handleChange = (field: keyof FrameParams, value: any) => {
        onChange({
            ...params,
            [field]: value
        });
    };

    return (
        <div className="frame-controls">
            <h2>Основные параметры</h2>

            <ControlGroup label="Длина здания (м):">
                <input
                    type="number"
                    value={params.length}
                    step="0.1"
                    min="1"
                    onChange={(e) => handleChange('length', parseFloat(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Ширина здания (м):">
                <input
                    type="number"
                    value={params.width}
                    step="0.1"
                    min="1"
                    onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Высота колонн (м):">
                <input
                    type="number"
                    value={params.height}
                    step="0.1"
                    min="1"
                    onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Количество колонн по длине:">
                <input
                    type="number"
                    value={params.numColumns}
                    step="1"
                    min="2"
                    onChange={(e) => handleChange('numColumns', parseInt(e.target.value))}
                />
            </ControlGroup>

            <h2>Параметры профилей</h2>

            <ControlGroup label="Стойки:">
                <select
                    value={params.columnSection}
                    onChange={(e) => handleChange('columnSection', parseFloat(e.target.value))}
                >
                    <option value="0.1">100 × 100 × 3 мм</option>
                    <option value="0.08">80 × 80 × 2 мм</option>
                    <option value="0.12">120 × 120 × 4 мм</option>
                </select>
            </ControlGroup>

            <ControlGroup label="Фермы:">
                <select
                    value={params.trussSection}
                    onChange={(e) => handleChange('trussSection', parseFloat(e.target.value))}
                >
                    <option value="0.08">80 × 80 × 2 мм</option>
                    <option value="0.1">100 × 100 × 3 мм</option>
                    <option value="0.06">60 × 60 × 2 мм</option>
                </select>
            </ControlGroup>

            <ControlGroup label="Ригели:">
                <select
                    value={params.purlinSection}
                    onChange={(e) => handleChange('purlinSection', parseFloat(e.target.value))}
                >
                    <option value="0.04">40 × 20 × 2 мм</option>
                    <option value="0.05">50 × 25 × 2 мм</option>
                    <option value="0.06">60 × 30 × 2 мм</option>
                </select>
            </ControlGroup>

            <h2>Параметры ферм</h2>

            <ControlGroup label="Высота фермы слева (м):">
                <input
                    type="number"
                    value={params.trussHeightLeft}
                    step="0.1"
                    min="0.5"
                    onChange={(e) => handleChange('trussHeightLeft', parseFloat(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Высота фермы справа (м):">
                <input
                    type="number"
                    value={params.trussHeightRight}
                    step="0.1"
                    min="0.5"
                    onChange={(e) => handleChange('trussHeightRight', parseFloat(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Количество ферм:">
                <input
                    type="number"
                    value={params.trussCount}
                    min="2"
                    max="20"
                    onChange={(e) => handleChange('trussCount', parseInt(e.target.value))}
                />
            </ControlGroup>

            <RoofControls params={params} onChange={onChange} />
        </div>
    );
});

export default FrameControls;
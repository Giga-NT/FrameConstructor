import React from 'react';
import ControlGroup from '../UI/ControlGroup';
import { FoundationParams } from '../../types/types';

interface FoundationControlsProps {
    params: FoundationParams;
    onChange: (params: FoundationParams) => void;
}

const FoundationControls: React.FC<FoundationControlsProps> = React.memo(({ params, onChange }) => {
    const handleChange = (field: keyof FoundationParams, value: any) => {
        onChange({
            ...params,
            [field]: value
        });
    };

    return (
        <div className="foundation-controls">
            <h2>Фундамент</h2>
            
            <ControlGroup label="Толщина плиты (м):">
                <input
                    type="number"
                    value={params.slabThickness}
                    step="0.05"
                    min="0.1"
                    max="1.0"
                    onChange={(e) => handleChange('slabThickness', parseFloat(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Выступ плиты (м):">
                <input
                    type="number"
                    value={params.slabExtension}
                    step="0.1"
                    min="0"
                    max="2"
                    onChange={(e) => handleChange('slabExtension', parseFloat(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Толщина арматуры (мм):">
                <input
                    type="number"
                    value={params.rebarThickness}
                    step="1"
                    min="6"
                    max="20"
                    onChange={(e) => handleChange('rebarThickness', parseInt(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Количество рядов арматуры:">
                <input
                    type="number"
                    value={params.rebarRows}
                    step="1"
                    min="1"
                    max="5"
                    onChange={(e) => handleChange('rebarRows', parseInt(e.target.value))}
                />
            </ControlGroup>

            <ControlGroup label="Шаг арматуры (м):">
                <input
                    type="number"
                    value={params.rebarSpacing}
                    step="0.05"
                    min="0.1"
                    max="0.5"
                    onChange={(e) => handleChange('rebarSpacing', parseFloat(e.target.value))}
                />
            </ControlGroup>
        </div>
    );
});

export default FoundationControls;
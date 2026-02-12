import React from 'react';
import ControlGroup from '../UI/ControlGroup';
import { WeldingParams } from '../../types/types';

interface WeldingControlsProps {
    params: WeldingParams;
    onChange: (params: WeldingParams) => void;
}

const WeldingControls: React.FC<WeldingControlsProps> = React.memo(({ params, onChange }) => {
    const handleChange = (field: keyof WeldingParams, value: any) => {
        onChange({
            ...params,
            [field]: value
        });
    };

    return (
        <div className="welding-controls" style={{ padding: '10px' }}>
            <h2 style={{ marginBottom: '15px' }}>⚡ Параметры сварки</h2>
            
            <ControlGroup label="Тип сварного соединения:">
                <select
                    value={params.weldType}
                    onChange={(e) => handleChange('weldType', parseInt(e.target.value))}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    <option value={1}>🤖 Автоматическая</option>
                    <option value={2}>✋ Ручная</option>
                    <option value={4}>Четырехсторонний шов</option>
                </select>
            </ControlGroup>

            <ControlGroup label="Стоимость сварки (₽/м):">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={params.weldCost}
                        onChange={(e) => handleChange('weldCost', Number(e.target.value))}
                        style={{ flexGrow: 1, marginRight: '10px' }}
                    />
                    <span style={{ width: '40px' }}>{params.weldCost} ₽</span>
                </div>
            </ControlGroup>

            <ControlGroup label="Видимость швов:">
                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="showWelds"
                        checked={params.showWelds}
                        onChange={(e) => handleChange('showWelds', e.target.checked)}
                    />
                    <label htmlFor="showWelds">Показывать сварные швы в 3D</label>
                </div>
            </ControlGroup>
        </div>
    );
});

export default WeldingControls;
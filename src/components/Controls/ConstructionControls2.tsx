import React from 'react';
import { GazeboParams } from '../../types/gazeboTypes';
import { InputGroup, Label, Select, Input } from './GazeboStyles';

interface ConstructionControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}

const ConstructionControls: React.FC<ConstructionControlsProps> = ({ params, onChange }) => {
  return (
    <>
      <InputGroup>
        <Label>Тип стоек</Label>
        <Select
          value={params.pillarType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('pillarType', e.target.value)}
        >
          <option value="straight">Прямые</option>
          <option value="curved">Гнутые</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Количество стоек</Label>
        <Input
          type="number"
          value={params.pillarCount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('pillarCount', parseInt(e.target.value))}
          min="4"
          max="12"
          step="1"
        />
      </InputGroup>

      <InputGroup>
        <Label>Количество ферм (стропил)</Label>
        <Input
          type="number"
          value={params.trussCount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('trussCount', parseInt(e.target.value))}
          min="2"
          max="10"
          step="1"
        />
      </InputGroup>

      <InputGroup>
        <Label>Тип фермы</Label>
        <Select
          value={params.trussType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('trussType', e.target.value)}
        >
          <option value="simple">Простая</option>
          <option value="reinforced">Усиленная</option>
          <option value="lattice">Решётчатая</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Шаг обрешётки (м)</Label>
        <Input
          type="number"
          value={params.lathingStep}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('lathingStep', parseFloat(e.target.value))}
          min="0.3"
          max="1.0"
          step="0.1"
        />
      </InputGroup>

      <InputGroup>
        <Label>Высота перил (м)</Label>
        <Input
          type="number"
          value={params.railingHeight}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('railingHeight', parseFloat(e.target.value))}
          min="0"
          max="1.2"
          step="0.1"
        />
      </InputGroup>
    </>
  );
};

export default React.memo(ConstructionControls);
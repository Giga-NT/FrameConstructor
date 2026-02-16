import React from 'react';
import { GazeboParams } from '../../types/gazeboTypes';
import { InputGroup, Label, Select } from './GazeboStyles';

interface TubeControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}

const TubeControls: React.FC<TubeControlsProps> = ({ params, onChange }) => {
  return (
    <>
      <InputGroup>
        <Label>Размер стоек</Label>
        <Select
          value={params.pillarSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('pillarSize', e.target.value)}
        >
          <option value="100x100">100x100 мм</option>
          <option value="80x80">80x80 мм</option>
          <option value="60x60">60x60 мм</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Размер балок (верхний пояс)</Label>
        <Select
          value={params.roofTubeSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('roofTubeSize', e.target.value)}
        >
          <option value="100x100">100x100 мм</option>
          <option value="80x80">80x80 мм</option>
          <option value="60x60">60x60 мм</option>
          <option value="40x40">40x40 мм</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Размер раскосов (фермы)</Label>
        <Select
          value={params.trussTubeSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('trussTubeSize', e.target.value)}
        >
          <option value="80x80">80x80 мм</option>
          <option value="60x60">60x60 мм</option>
          <option value="40x40">40x40 мм</option>
          <option value="50x50">50x50 мм</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Размер обрешётки</Label>
        <Select
          value={params.lathingTubeSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('lathingTubeSize', e.target.value)}
        >
          <option value="40x20">40x20 мм</option>
          <option value="40x40">40x40 мм</option>
          <option value="50x50">50x50 мм</option>
          <option value="60x60">60x60 мм</option>
        </Select>
      </InputGroup>
    </>
  );
};

export default React.memo(TubeControls);
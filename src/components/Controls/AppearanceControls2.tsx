import React, { useState } from 'react';
import { GazeboParams } from '../../types/gazeboTypes';
import { HexColorPicker } from 'react-colorful';
import {
  InputGroup,
  Label,
  Select,
  ColorPickerWrapper,
  ColorPickerButton,
  ColorPickerPopup
} from './GazeboStyles';

interface AppearanceControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}

const AppearanceControls: React.FC<AppearanceControlsProps> = ({ params, onChange }) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const toggleColorPicker = (pickerName: string) => {
    setActiveColorPicker(activeColorPicker === pickerName ? null : pickerName);
  };

  return (
    <>
      <InputGroup>
        <Label>Основной материал</Label>
        <Select
          value={params.materialType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('materialType', e.target.value)}
        >
          <option value="wood">Дерево</option>
          <option value="metal">Металл</option>
          <option value="combined">Комбинированный</option>
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Цвет конструкции</Label>
        <ColorPickerWrapper>
          <ColorPickerButton
            color={params.color}
            onClick={() => toggleColorPicker('main')}
          />
          {activeColorPicker === 'main' && (
            <ColorPickerPopup>
              <HexColorPicker
                color={params.color}
                onChange={(color) => {
                  onChange('color', color);
                  setActiveColorPicker(null);
                }}
              />
            </ColorPickerPopup>
          )}
        </ColorPickerWrapper>
      </InputGroup>

      <InputGroup>
        <Label>Цвет крыши</Label>
        <ColorPickerWrapper>
          <ColorPickerButton
            color={params.roofColor}
            onClick={() => toggleColorPicker('roof')}
          />
          {activeColorPicker === 'roof' && (
            <ColorPickerPopup>
              <HexColorPicker
                color={params.roofColor}
                onChange={(color) => {
                  onChange('roofColor', color);
                  setActiveColorPicker(null);
                }}
              />
            </ColorPickerPopup>
          )}
        </ColorPickerWrapper>
      </InputGroup>

      <InputGroup>
        <Label>Цвет пола</Label>
        <ColorPickerWrapper>
          <ColorPickerButton
            color={params.floorColor}
            onClick={() => toggleColorPicker('floor')}
          />
          {activeColorPicker === 'floor' && (
            <ColorPickerPopup>
              <HexColorPicker
                color={params.floorColor}
                onChange={(color) => {
                  onChange('floorColor', color);
                  setActiveColorPicker(null);
                }}
              />
            </ColorPickerPopup>
          )}
        </ColorPickerWrapper>
      </InputGroup>
    </>
  );
};

export default React.memo(AppearanceControls);
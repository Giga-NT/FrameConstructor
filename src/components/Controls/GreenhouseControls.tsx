import React, { useState } from 'react';
import { GreenhouseParams } from '../../types/GreenhouseTypes';
import { HexColorPicker } from 'react-colorful';
import styled from 'styled-components';

// Стилизованные компоненты
const Container = styled.div`
  padding: 24px;
  background: #f5f7fa;
  font-family: 'Segoe UI', sans-serif;
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  margin: 0 0 24px;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
`;

const ControlSection = styled.div`
  margin-bottom: 28px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: background 0.3s ease;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #34495e;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border 0.3s ease;

  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  background: #fff;
  transition: border 0.3s ease;

  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ColorPickerButton = styled.button<{ color: string }>`
  width: 40px;
  height: 28px;
  background: ${props => props.color};
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 6px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ColorPickerPopup = styled.div`
  position: absolute;
  z-index: 100;
  top: 100%;
  left: 0;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: #fff;
  padding: 12px;
`;

const Button = styled.button<{ isActive: boolean }>`
  padding: 10px 15px;
  background: ${props => props.isActive ? '#4CAF50' : '#f39c12'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RangeValue = styled.span`
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: #555;
`;

interface GreenhouseControlsProps {
  params: GreenhouseParams;
  onChange: (name: keyof GreenhouseParams, value: any) => void;
  ventsOpen: boolean;
  setVentsOpen: (open: boolean) => void;
}

const GreenhouseControls: React.FC<GreenhouseControlsProps> = ({ 
  params, 
  onChange,
  ventsOpen,
  setVentsOpen
}) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const toggleColorPicker = (pickerName: string) => {
    setActiveColorPicker(activeColorPicker === pickerName ? null : pickerName);
  };

  const handleVentChange = (field: string, value: any) => {
    onChange('vent', {
      ...params.vent,
      [field]: value
    });
  };

  const handleVentSideToggle = (side: string) => {
    const currentSides = params.vent?.side?.split(',') || [];
    const newSides = currentSides.includes(side)
      ? currentSides.filter(s => s !== side)
      : [...currentSides, side];
    
    handleVentChange('side', newSides.join(','));
  };

  const isSideSelected = (side: string) => {
    return params.vent?.side?.includes(side) || false;
  };

  const ventSides = [
    { value: 'front', label: 'Спереди' },
    { value: 'back', label: 'Сзади' },
    { value: 'left', label: 'Слева' },
    { value: 'right', label: 'Справа' }
  ];

  return (
    <Container>
      <Title>Конструктор теплицы</Title>

      {/* Основные параметры */}
      <ControlSection>
        <SectionTitle>Основные параметры</SectionTitle>
        <InputGroup>
          <Label>Длина (м)</Label>
          <Input
            type="number"
            value={params.length}
            onChange={(e) => onChange('length', parseFloat(e.target.value))}
            min="2"
            max="24"
            step="0.1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Ширина (м)</Label>
          <Input
            type="number"
            value={params.width}
            onChange={(e) => onChange('width', parseFloat(e.target.value))}
            min="2"
            max="12"
            step="0.1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Высота стен (м)</Label>
          <Input
            type="number"
            value={params.wallHeight}
            onChange={(e) => onChange('wallHeight', parseFloat(e.target.value))}
            min="1"
            max="3"
            step="0.1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Тип теплицы</Label>
          <Select
            value={params.type}
            onChange={(e) => onChange('type', e.target.value)}
          >
            <option value="arched">Арочная</option>
            <option value="gable">Двускатная</option>
          </Select>
        </InputGroup>
      </ControlSection>

      {/* Материалы */}
      <ControlSection>
        <SectionTitle>Материалы</SectionTitle>
        <InputGroup>
          <Label>Каркас</Label>
          <Select
            value={params.frameMaterial}
            onChange={(e) => onChange('frameMaterial', e.target.value)}
          >
            <option value="metal">Металл</option>
            <option value="pvc">ПВХ</option>
            <option value="wood">Дерево</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Цвет каркаса</Label>
          <ColorPickerWrapper>
            <ColorPickerButton
              color={params.frameColor}
              onClick={() => toggleColorPicker('frame')}
            />
            {activeColorPicker === 'frame' && (
              <ColorPickerPopup>
                <HexColorPicker
                  color={params.frameColor}
                  onChange={(color) => {
                    onChange('frameColor', color);
                    setActiveColorPicker(null);
                  }}
                />
              </ColorPickerPopup>
            )}
          </ColorPickerWrapper>
        </InputGroup>
      </ControlSection>

      {/* Крыша */}
      <ControlSection>
        <SectionTitle>Крыша</SectionTitle>
        {params.type === 'arched' && (
          <InputGroup>
            <Label>Высота арки (м)</Label>
            <Input
              type="number"
              value={params.archHeight}
              onChange={(e) => onChange('archHeight', parseFloat(e.target.value))}
              min="0.5"
              max="3"
              step="0.1"
            />
          </InputGroup>
        )}
        {params.type === 'gable' && (
          <InputGroup>
            <Label>Угол наклона (°)</Label>
            <Input
              type="number"
              value={params.roofAngle}
              onChange={(e) => onChange('roofAngle', parseFloat(e.target.value))}
              min="5"
              max="20"
              step="1"
            />
          </InputGroup>
        )}
        <InputGroup>
          <Label>Покрытие</Label>
          <Select
            value={params.coverMaterial}
            onChange={(e) => onChange('coverMaterial', e.target.value)}
          >
            <option value="polycarbonate">Поликарбонат</option>
            <option value="glass">Стекло</option>
            <option value="film">Пленка</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Цвет покрытия</Label>
          <ColorPickerWrapper>
            <ColorPickerButton
              color={params.coverColor}
              onClick={() => toggleColorPicker('cover')}
            />
            {activeColorPicker === 'cover' && (
              <ColorPickerPopup>
                <HexColorPicker
                  color={params.coverColor}
                  onChange={(color) => {
                    onChange('coverColor', color);
                    setActiveColorPicker(null);
                  }}
                />
              </ColorPickerPopup>
            )}
          </ColorPickerWrapper>
        </InputGroup>
      </ControlSection>


      {/* Двери */}
      <ControlSection>
        <SectionTitle>Двери</SectionTitle>
        <CheckboxContainer>
          <CheckboxItem onClick={() => onChange('hasDoors', !params.hasDoors)}>
            <StyledCheckbox
              checked={params.hasDoors || false}
              onChange={(e) => onChange('hasDoors', e.target.checked)}
            />
            <Label>Двери</Label>
          </CheckboxItem>
        </CheckboxContainer>
        {params.hasDoors && (
          <InputGroup>
            <Label>Сторона дверей</Label>
            <Select
              value={params.doorSide}
              onChange={(e) => onChange('doorSide', e.target.value)}
            >
              <option value="front">Только спереди</option>
              <option value="back">Только сзади</option>
              <option value="both">С обеих сторон</option>
            </Select>
          </InputGroup>
        )}
      </ControlSection>
    </Container>
  );
};

export default GreenhouseControls;
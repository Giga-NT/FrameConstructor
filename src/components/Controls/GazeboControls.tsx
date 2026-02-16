import React, { useState } from 'react';
import { GazeboParams } from '../../types/gazeboTypes';
import { HexColorPicker } from 'react-colorful';
import {
  Container,
  Title,
  ControlSection,
  SectionTitle,
  InputGroup,
  Label,
  Input,
  Select,
  ColorPickerWrapper,
  ColorPickerButton,
  ColorPickerPopup,
  CheckboxContainer,
  CheckboxItem,
  StyledCheckbox
} from './GazeboStyles';

import TubeControls from './TubeControls2';
import AppearanceControls from './AppearanceControls2';
import ConstructionControls from './GazeboConstructionControls';

interface GazeboControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
}

const GazeboControls: React.FC<GazeboControlsProps> = ({ params, onChange }) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const toggleColorPicker = (pickerName: string) => {
    setActiveColorPicker(activeColorPicker === pickerName ? null : pickerName);
  };

  return (
    <Container>
      <Title>Конструктор беседки</Title>

      {/* Основные параметры */}
      <ControlSection>
        <SectionTitle>Основные параметры</SectionTitle>
        <InputGroup>
          <Label>Длина (м)</Label>
          <Input
            type="number"
            value={params.length}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('length', parseFloat(e.target.value))}
            min="2"
            max="10"
            step="0.1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Ширина (м)</Label>
          <Input
            type="number"
            value={params.width}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('width', parseFloat(e.target.value))}
            min="2"
            max="10"
            step="0.1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Высота (м)</Label>
          <Input
            type="number"
            value={params.height}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('height', parseFloat(e.target.value))}
            min="1.5"
            max="4"
            step="0.1"
          />
        </InputGroup>
		<InputGroup>
		  <Label>Тип крыши</Label>
		  <Select
			value={params.roofType}
			onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('roofType', e.target.value)}
		  >
			<option value="gable">Двухскатная</option>
			<option value="arched">Арочная</option>
			<option value="single">Односкатная</option>
		  </Select>
		</InputGroup>

		{(params.roofType === 'gable' || params.roofType === 'single' || params.roofType === 'arched') && (
		  <InputGroup>
			<Label>Высота крыши (м)</Label>
			<Input
			  type="number"
			  value={params.roofHeight}
			  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('roofHeight', parseFloat(e.target.value))}
			  min="0.3"
			  max="3"
			  step="0.1"
			/>
		  </InputGroup>
		)}

		<InputGroup>
		  <Label>Свес кровли (м)</Label>
		  <Input
			type="number"
			value={params.overhang}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('overhang', parseFloat(e.target.value))}
			min="0"
			max="0.5"
			step="0.05"
		  />
		</InputGroup>
		<CheckboxContainer>
		  <CheckboxItem onClick={() => onChange('showRoofCover', !params.showRoofCover)}>
			<StyledCheckbox
			  checked={params.showRoofCover || false}
			  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('showRoofCover', e.target.checked)}
			/>
			<Label>Показать поликарбонатное покрытие</Label>
		  </CheckboxItem>
		</CheckboxContainer>		

      </ControlSection>

      {/* Конструкция */}
      <ControlSection>
        <SectionTitle>Конструкция</SectionTitle>
        <ConstructionControls params={params} onChange={onChange} />
      </ControlSection>

      {/* Размеры труб */}
      <ControlSection>
        <SectionTitle>Размеры труб</SectionTitle>
        <TubeControls params={params} onChange={onChange} />
      </ControlSection>

      {/* Внешний вид */}
      <ControlSection>
        <SectionTitle>Внешний вид</SectionTitle>
        <AppearanceControls params={params} onChange={onChange} />
      </ControlSection>

      {/* Фундамент и пол */}
      <ControlSection>
        <SectionTitle>Фундамент и пол</SectionTitle>
        <InputGroup>
          <Label>Тип фундамента</Label>
          <Select
            value={params.foundationType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('foundationType', e.target.value)}
          >
            <option value="wood">Деревянный</option>
            <option value="concrete">Бетонный</option>
            <option value="piles">Свайный</option>
            <option value="none">Без фундамента</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Покрытие пола</Label>
          <Select
            value={params.floorType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('floorType', e.target.value)}
          >
            <option value="wood">Дерево</option>
            <option value="tile">Плитка</option>
            <option value="concrete">Бетон</option>
            <option value="none">Без пола</option>
          </Select>
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
      </ControlSection>

      {/* Мебель */}
      <ControlSection>
        <SectionTitle>Мебель</SectionTitle>
        <CheckboxContainer>
          <CheckboxItem onClick={() => onChange('hasFurniture', !params.hasFurniture)}>
            <StyledCheckbox
              checked={params.hasFurniture || false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('hasFurniture', e.target.checked)}
            />
            <Label>Добавить мебель</Label>
          </CheckboxItem>
        </CheckboxContainer>
        {params.hasFurniture && (
          <>
            <InputGroup>
              <Label>Количество скамеек</Label>
              <Input
                type="number"
                value={params.benchCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('benchCount', parseInt(e.target.value))}
                min="1"
                max="8"
                step="1"
              />
            </InputGroup>

            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Параметры скамеек (опционально)</SectionTitle>
            <InputGroup>
              <Label>Длина скамейки (м)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                max={Math.max(params.width, params.length)}
                value={params.benchLength ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  onChange('benchLength', val);
                }}
                placeholder="Авто (по стене)"
              />
            </InputGroup>
            <InputGroup>
              <Label>Ширина сиденья (м)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.2"
                max="0.8"
                value={params.benchSeatWidth ?? 0.4}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('benchSeatWidth', parseFloat(e.target.value))}
              />
            </InputGroup>
            <InputGroup>
              <Label>Высота скамейки (м)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.2"
                max="0.8"
                value={params.benchHeight ?? 0.45}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('benchHeight', parseFloat(e.target.value))}
              />
            </InputGroup>

            <InputGroup>
              <Label>Количество столов</Label>
              <Input
                type="number"
                value={params.tableCount ?? 1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('tableCount', parseInt(e.target.value))}
                min="1"
                max="6"
                step="1"
              />
            </InputGroup>

            <InputGroup>
              <Label>Ориентация стола</Label>
              <Select
                value={params.tableRotation ?? 0}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('tableRotation', parseInt(e.target.value) as 0 | 90)}
              >
                <option value={0}>Вдоль ширины (стандартно)</option>
                <option value={90}>Вдоль длины (повёрнутый)</option>
              </Select>
            </InputGroup>

            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Размер стола</SectionTitle>
            <InputGroup>
              <Label>Предустановка</Label>
              <Select
                value={params.tableSize}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('tableSize', e.target.value)}
              >
                <option value="small">Маленький (0.6×0.6×0.75)</option>
                <option value="medium">Средний (0.8×0.8×0.75)</option>
                <option value="large">Большой (1.0×1.0×0.75)</option>
              </Select>
            </InputGroup>

            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Цвета стола</SectionTitle>
            <InputGroup>
              <Label>Цвет столешницы</Label>
              <ColorPickerWrapper>
                <ColorPickerButton
                  color={params.tableTopColor || '#D2B48C'}
                  onClick={() => toggleColorPicker('tableTop')}
                />
                {activeColorPicker === 'tableTop' && (
                  <ColorPickerPopup>
                    <HexColorPicker
                      color={params.tableTopColor || '#D2B48C'}
                      onChange={(color) => {
                        onChange('tableTopColor', color);
                        setActiveColorPicker(null);
                      }}
                    />
                  </ColorPickerPopup>
                )}
              </ColorPickerWrapper>
            </InputGroup>
            <InputGroup>
              <Label>Цвет ножек стола</Label>
              <ColorPickerWrapper>
                <ColorPickerButton
                  color={params.tableLegsColor || '#8B4513'}
                  onClick={() => toggleColorPicker('tableLegs')}
                />
                {activeColorPicker === 'tableLegs' && (
                  <ColorPickerPopup>
                    <HexColorPicker
                      color={params.tableLegsColor || '#8B4513'}
                      onChange={(color) => {
                        onChange('tableLegsColor', color);
                        setActiveColorPicker(null);
                      }}
                    />
                  </ColorPickerPopup>
                )}
              </ColorPickerWrapper>
            </InputGroup>

            <SectionTitle style={{ fontSize: '0.95rem', color: '#555', marginTop: '8px' }}>Ручные размеры (заполните для переопределения)</SectionTitle>
            <InputGroup>
              <Label>Ширина стола (м)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.4"
                max={params.width}
                value={params.tableWidth ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  onChange('tableWidth', val);
                }}
                placeholder={params.tableSize === 'small' ? '0.6' : params.tableSize === 'medium' ? '0.8' : '1.0'}
              />
            </InputGroup>
            <InputGroup>
              <Label>Глубина стола (м)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.4"
                max={params.length}
                value={params.tableDepth ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  onChange('tableDepth', val);
                }}
                placeholder={params.tableSize === 'small' ? '0.6' : params.tableSize === 'medium' ? '0.8' : '1.0'}
              />
            </InputGroup>
            <InputGroup>
              <Label>Высота стола (м)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.5"
                max="1.2"
                value={params.tableHeight ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  onChange('tableHeight', val);
                }}
                placeholder="0.75"
              />
            </InputGroup>
          </>
        )}
      </ControlSection>

      {/* Окружение */}
      <ControlSection>
        <SectionTitle>Окружение</SectionTitle>
        <InputGroup>
          <Label>Покрытие земли</Label>
          <Select
            value={params.groundType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('groundType', e.target.value)}
          >
            <option value="grass">Трава</option>
            <option value="wood">Дерево</option>
            <option value="concrete">Бетон</option>
          </Select>
        </InputGroup>
        <CheckboxContainer>
          <CheckboxItem onClick={() => onChange('showBackground', !params.showBackground)}>
            <StyledCheckbox
              checked={params.showBackground || false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('showBackground', e.target.checked)}
            />
            <Label>Показать окружение</Label>
          </CheckboxItem>
        </CheckboxContainer>
      </ControlSection>
    </Container>
  );
};

export default GazeboControls;
import React, { useState } from 'react';
import { GazeboParams, initialGazeboParams, GazeboCostData } from '../../types/gazeboTypes';
import { HexColorPicker } from 'react-colorful';
import styled from 'styled-components';

// Стили (можно использовать те же, что и в GreenhouseControls)
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

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
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
            onChange={(e) => onChange('length', parseFloat(e.target.value))}
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
            onChange={(e) => onChange('width', parseFloat(e.target.value))}
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
            onChange={(e) => onChange('height', parseFloat(e.target.value))}
            min="1.5"
            max="4"
            step="0.1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Тип крыши</Label>
          <Select
            value={params.roofType}
            onChange={(e) => onChange('roofType', e.target.value)}
          >
            <option value="gable">Двухскатная</option>
            <option value="arched">Арочная</option>
            <option value="single">Односкатная</option>
          </Select>
        </InputGroup>
        {params.roofType === 'gable' || params.roofType === 'single' ? (
          <InputGroup>
            <Label>Высота крыши (м)</Label>
            <Input
              type="number"
              value={params.roofHeight}
              onChange={(e) => onChange('roofHeight', parseFloat(e.target.value))}
              min="0.5"
              max="2"
              step="0.1"
            />
          </InputGroup>
        ) : null}
      </ControlSection>

      {/* Конструкция */}
      <ControlSection>
        <SectionTitle>Конструкция</SectionTitle>
        <InputGroup>
          <Label>Тип стоек</Label>
          <Select
            value={params.pillarType}
            onChange={(e) => onChange('pillarType', e.target.value)}
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
            onChange={(e) => onChange('pillarCount', parseInt(e.target.value))}
            min="4"
            max="12"
            step="1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Размер стоек</Label>
          <Select
            value={params.pillarSize}
            onChange={(e) => onChange('pillarSize', e.target.value)}
          >
            <option value="100x100">100x100 мм</option>
            <option value="80x80">80x80 мм</option>
            <option value="60x60">60x60 мм</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Размер балок</Label>
          <Select
            value={params.beamSize}
            onChange={(e) => onChange('beamSize', e.target.value)}
          >
            <option value="100x100">100x100 мм</option>
            <option value="80x80">80x80 мм</option>
            <option value="60x60">60x60 мм</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <Label>Высота перил (м)</Label>
          <Input
            type="number"
            value={params.railingHeight}
            onChange={(e) => onChange('railingHeight', parseFloat(e.target.value))}
            min="0"
            max="1.2"
            step="0.1"
          />
        </InputGroup>
      </ControlSection>

      {/* Материалы и цвета */}
      <ControlSection>
        <SectionTitle>Материалы и цвета</SectionTitle>
        <InputGroup>
          <Label>Основной материал</Label>
          <Select
            value={params.materialType}
            onChange={(e) => onChange('materialType', e.target.value)}
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
      </ControlSection>

      {/* Фундамент и пол */}
      <ControlSection>
        <SectionTitle>Фундамент и пол</SectionTitle>
        <InputGroup>
          <Label>Тип фундамента</Label>
          <Select
            value={params.foundationType}
            onChange={(e) => onChange('foundationType', e.target.value)}
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
			onChange={(e) => onChange('floorType', e.target.value)}
		  >
			<option value="wood">Дерево</option>
			<option value="tile">Плитка</option>
			<option value="concrete">Бетон</option>
			<option value="none">Без пола</option>  {/* новый пункт */}
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
              onChange={(e) => onChange('hasFurniture', e.target.checked)}
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
                onChange={(e) => onChange('benchCount', parseInt(e.target.value))}
                min="1"
                max="8"
                step="1"
              />
            </InputGroup>

            {/* Ручные размеры скамеек */}
            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Параметры скамеек (опционально)</SectionTitle>
            <InputGroup>
              <Label>Длина скамейки (м)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                max={Math.max(params.width, params.length)}
                value={params.benchLength ?? ''}
                onChange={(e) => {
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
                onChange={(e) => onChange('benchSeatWidth', parseFloat(e.target.value))}
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
                onChange={(e) => onChange('benchHeight', parseFloat(e.target.value))}
              />
            </InputGroup>

			{/* Количество столов */}
			<InputGroup>
			  <Label>Количество столов</Label>
			  <Input
				type="number"
				value={params.tableCount ?? 1}
				onChange={(e) => onChange('tableCount', parseInt(e.target.value))}
				min="1"
				max="6"
				step="1"
			  />
			</InputGroup>

			<InputGroup>
			  <Label>Ориентация стола</Label>
			  <Select
				value={params.tableRotation ?? 0}
				onChange={(e) => onChange('tableRotation', parseInt(e.target.value) as 0 | 90)}
			  >
				<option value={0}>Вдоль ширины (стандартно)</option>
				<option value={90}>Вдоль длины (повёрнутый)</option>
			  </Select>
			</InputGroup>
			
            {/* Размер стола */}
            <SectionTitle style={{ fontSize: '1rem', marginTop: '16px' }}>Размер стола</SectionTitle>
            <InputGroup>
              <Label>Предустановка</Label>
              <Select
                value={params.tableSize}
                onChange={(e) => onChange('tableSize', e.target.value)}
              >
                <option value="small">Маленький (0.6×0.6×0.75)</option>
                <option value="medium">Средний (0.8×0.8×0.75)</option>
                <option value="large">Большой (1.0×1.0×0.75)</option>
              </Select>
            </InputGroup>

			{/* Цвета стола */}
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

			<InputGroup>
			  <Label>Тип стола</Label>
			  <Select
				value={params.tableType || 'simple'}
				onChange={(e) => onChange('tableType', e.target.value)}
			  >
				<option value="simple">Простой (настраиваемый)</option>
				<option value="model">Детальная модель</option>
			  </Select>
			</InputGroup>

            {/* Ручные размеры стола (переопределяют предустановку) */}
            <SectionTitle style={{ fontSize: '0.95rem', color: '#555', marginTop: '8px' }}>Ручные размеры (заполните для переопределения)</SectionTitle>
            <InputGroup>
              <Label>Ширина стола (м)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.4"
                max={params.width}
                value={params.tableWidth ?? ''}
                onChange={(e) => {
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
                onChange={(e) => {
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
                onChange={(e) => {
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
            onChange={(e) => onChange('groundType', e.target.value)}
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
              onChange={(e) => onChange('showBackground', e.target.checked)}
            />
            <Label>Показать окружение</Label>
          </CheckboxItem>
        </CheckboxContainer>
      </ControlSection>
    </Container>
  );
};

export default GazeboControls;
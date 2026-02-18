import React, { useState, useRef, useEffect } from 'react';
import { GazeboParams } from '../../types/gazeboTypes';
import { HexColorPicker } from 'react-colorful';
import { Tooltip } from 'react-tooltip';
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
import ConstructionControls from './ConstructionControls2';
import TubeControls from './TubeControls2';
import AppearanceControls from './AppearanceControls2';
import styled from 'styled-components';

// Новые стили для улучшенного мобильного интерфейса
const CollapseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const CollapsibleContent = styled.div<{ $isCollapsed: boolean; $isMobile: boolean }>`
  transition: all 0.4s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    display: ${({ $isCollapsed, $isMobile }) => 
      $isCollapsed && $isMobile ? 'none' : 'block'};
    max-height: ${({ $isCollapsed, $isMobile }) => 
      $isCollapsed && $isMobile ? '0' : '1000px'};
    margin-top: ${({ $isCollapsed, $isMobile }) => 
      $isCollapsed && $isMobile ? '0' : '20px'};
  }
`;

const MobileHeader = styled.div`
  display: none;
  position: relative;
  padding: 15px 10px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileTitle = styled.h2`
  font-size: 18px;
  margin: 0;
  color: #2c3e50;
  text-align: center;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #7f8c8d;
  cursor: pointer;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &:hover {
    background: #e9ecef;
    color: #3498db;
  }
`;

const MobileControlsWrapper = styled.div`
  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 0 5px;
  }
`;

const PricePreview = styled.div`
  background: #e8f4f8;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  font-size: 14px;
  border-left: 4px solid #3498db;
  transition: all 0.3s ease;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  color: #2c3e50;
`;

const TotalPrice = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #bdc3c7;
`;

// Добавлено для перетаскивания панели
const PanelDragHandle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;
  cursor: move;
  z-index: 100;
  background: transparent;
  user-select: none;
`;

const PanelContainer = styled.div<{ $isMobile: boolean }>`
  position: relative;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const PanelContent = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

interface GazeboControlsProps {
  params: GazeboParams;
  onChange: (name: keyof GazeboParams, value: any) => void;
  costData?: any;
}

const GazeboControls: React.FC<GazeboControlsProps> = ({ params, onChange, costData }) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, y: 0, isDragging: false });
  const containerRef = useRef<HTMLDivElement>(null);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsCollapsed(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обработчики для перетаскивания
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (isMobile || !panelRef.current) return;
      
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        isDragging: true
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging || !panelRef.current || isMobile) return;
      
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      
      // Ограничиваем перемещение внутри окна
      const rect = panelRef.current!.getBoundingClientRect();
      const newX = Math.min(
        Math.max(0, rect.left + dx),
        window.innerWidth - rect.width
      );
      const newY = Math.min(
        Math.max(0, rect.top + dy),
        window.innerHeight - rect.height
      );
      
      panelRef.current!.style.left = `${newX}px`;
      panelRef.current!.style.top = `${newY}px`;
      
      dragRef.current = {
        ...dragRef.current,
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    if (!isMobile && panelRef.current) {
      panelRef.current.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (!isMobile && panelRef.current) {
        panelRef.current!.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMobile]);

  const toggleColorPicker = (pickerName: string) => {
    setActiveColorPicker(activeColorPicker === pickerName ? null : pickerName);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Скрытие панели при клике вне её
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveColorPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Container style={{ position: 'relative' }} ref={containerRef}>
      <PanelContainer $isMobile={isMobile}>
        <MobileHeader>
          <MobileTitle>Конструктор беседки</MobileTitle>
          <ToggleButton onClick={toggleCollapse}>
            {isCollapsed ? '▶' : '▼'}
          </ToggleButton>
        </MobileHeader>

        {/* Добавлен хендлер для перетаскивания (на десктопе) */}
        {!isMobile && (
          <PanelDragHandle 
            onMouseDown={(e) => {
              if (isMobile) return;
              dragRef.current = {
                x: e.clientX,
                y: e.clientY,
                isDragging: true
              };
            }}
          />
        )}

        <PanelContent>
          <CollapsibleContent $isCollapsed={isCollapsed} $isMobile={isMobile}>
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
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Длина беседки от 2 до 10 метров"
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
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Ширина беседки от 2 до 10 метров"
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
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Высота от пола до крыши"
                />
              </InputGroup>
              <InputGroup>
                <Label>Тип крыши</Label>
                <Select
                  value={params.roofType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('roofType', e.target.value)}
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Выберите тип крыши: двускатная, арочная или односкатная"
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
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Высота конька или арки"
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
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Выступ крыши за стены"
                />
              </InputGroup>
              <CheckboxContainer>
                <CheckboxItem onClick={() => onChange('showRoofCover', !params.showRoofCover)}>
                  <StyledCheckbox
                    checked={params.showRoofCover || false}
                    onChange={(e) => onChange('showRoofCover', e.target.checked)}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('benchCount', parseInt(e.target.value))}
                      min="1"
                      max="8"
                      step="1"
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
                    <Label>Размер стола</Label>
                    <Select
                      value={params.tableSize}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('tableSize', e.target.value)}
                    >
                      <option value="small">Маленький (0.6×0.6×0.75)</option>
                      <option value="medium">Средний (0.8×0.8×0.75)</option>
                      <option value="large">Большой (1.0×1.0×0.75)</option>
                    </Select>
                  </InputGroup>
                  <InputGroup>
                    <Label>Ориентация стола</Label>
                    <Select
                      value={params.tableRotation ?? 0}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('tableRotation', parseInt(e.target.value) as 0 | 90)}
                    >
                      <option value={0}>Вдоль ширины</option>
                      <option value={90}>Вдоль длины</option>
                    </Select>
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
                    onChange={(e) => onChange('showBackground', e.target.checked)}
                  />
                  <Label>Показать окружение</Label>
                </CheckboxItem>
              </CheckboxContainer>
            </ControlSection>
          </CollapsibleContent>
        </PanelContent>
      </PanelContainer>



      {/* Глобальный тултип */}
      <Tooltip id="tooltip" place="top" />
    </Container>
  );
};

export default GazeboControls;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  getPrices,
  savePrices,
  defaultGazeboPrices,
  defaultCanopyPrices,
  defaultGreenhousePrices,
} from '../services/priceService';

// --- Стили ---
const Container = styled.div`
  padding: 30px 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin: 0;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #5a6268;
  }
`;

const TypeSelector = styled.select`
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 30px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  &:hover {
    border-color: #3498db;
  }
`;

const Section = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: relative;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
  word-break: break-word;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const IconButton = styled.button<{ color?: string }>`
  background: ${props => props.color || '#3498db'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;

const DeleteButton = styled(IconButton)`
  background: #e74c3c;
`;

const AddButton = styled(IconButton)`
  background: #2ecc71;
`;

const RenameButton = styled(IconButton)`
  background: #f39c12;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  &:hover {
    border-color: #3498db;
  }
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  min-width: 120px;
  word-break: break-word;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  color: #2c3e50;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;

const ModalCancelButton = styled(ModalButton)`
  background: #f5f5f5;
  color: #333;
`;

const ModalConfirmButton = styled(ModalButton)`
  background: #2ecc71;
  color: white;
`;

const SaveButton = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  transition: background 0.2s;
  &:hover {
    background: #27ae60;
  }
`;

// Словарь для перевода ключей (можно расширять)
const materialNames: Record<string, string> = {
  wood: 'Дерево',
  metal: 'Металл',
  combined: 'Комбинированный',
  tile: 'Плитка',
  concrete: 'Бетон',
  none: 'Без покрытия',
  foundation: 'Фундамент',
  furniture: 'Мебель',
  roofing: 'Кровля',
  bench: 'Скамейка',
  table: 'Стол',
  small: 'Маленький',
  medium: 'Средний',
  large: 'Большой',
  shingles: 'Гибкая черепица',
  polycarbonate: 'Поликарбонат',
  work: 'Работа',
  material: 'Материал',
  woodF: 'Деревянный',
  concreteF: 'Бетонный',
  piles: 'Свайный',
  // для навеса
  roofMaterial: 'Материал кровли',
  frame: 'Каркас',
  pillar: 'Стойка',
  truss: 'Ферма',
  lathing: 'Обрешетка',
  painting: 'Покраска',
  screws: 'Крепеж',
  // для теплицы
  cover: 'Покрытие',
  additional: 'Дополнительно',
  ventilation: 'Вентиляция',
  doors: 'Двери',
  partition: 'Перегородка',
  shelving: 'Стеллажи',
  pvc: 'ПВХ',
  glass: 'Стекло',
  film: 'Пленка',
};

// --- Типы ---
interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (key: string, type: 'object' | 'number') => void;
  existingKeys: string[];
}

const AddItemModal: React.FC<AddModalProps> = ({ isOpen, onClose, onAdd, existingKeys }) => {
  const [keyName, setKeyName] = useState('');
  const [itemType, setItemType] = useState<'object' | 'number'>('number');

  const handleSubmit = () => {
    if (!keyName.trim()) {
      alert('Введите название');
      return;
    }
    if (existingKeys.includes(keyName)) {
      alert('Раздел с таким названием уже существует');
      return;
    }
    onAdd(keyName, itemType);
    setKeyName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Добавить новый элемент</ModalTitle>
        <ModalInput
          type="text"
          placeholder="Название (можно на русском)"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
        />
        <ModalSelect value={itemType} onChange={(e) => setItemType(e.target.value as any)}>
          <option value="number">Число (цена)</option>
          <option value="object">Раздел (группа)</option>
        </ModalSelect>
        <ModalButtons>
          <ModalCancelButton onClick={onClose}>Отмена</ModalCancelButton>
          <ModalConfirmButton onClick={handleSubmit}>Добавить</ModalConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

// --- Компонент для рекурсивного отображения и редактирования ---
interface PriceNodeProps {
  data: any;
  path: string;            // путь для обновления
  itemKey: string;         // ключ на текущем уровне
  onUpdate: (path: string, value: any) => void;
  onDelete: (path: string) => void;
  onAdd: (path: string, key: string, type: 'object' | 'number') => void;
  onRename: (path: string, newKey: string) => void;
  level?: number;
  existingKeys: string[];  // ключи на текущем уровне для проверки дубликатов
}

const PriceNode: React.FC<PriceNodeProps> = ({
  data,
  path,
  itemKey,
  onUpdate,
  onDelete,
  onAdd,
  onRename,
  level = 0,
  existingKeys,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newKey, setNewKey] = useState('');
  const isRoot = path === '';

  const handleRename = () => {
    if (!newKey.trim()) return;
    if (existingKeys.includes(newKey)) {
      alert('Ключ с таким именем уже существует');
      return;
    }
    onRename(path, newKey);
    setIsRenaming(false);
  };

  // Определяем тип: объект или число
  const isObject = data && typeof data === 'object' && !Array.isArray(data);
  // Отображаемое имя
  const displayName = materialNames[itemKey] || itemKey;

  if (!isObject) {
    // Лист – число
    return (
      <InputGroup>
        <Label>{displayName}</Label>
        <Input
          type="number"
          value={data ?? 0}
          onChange={(e) => onUpdate(path, parseFloat(e.target.value))}
        />
        <DeleteButton onClick={() => onDelete(path)}>Удалить</DeleteButton>
      </InputGroup>
    );
  }

  // Объект – раздел
  const currentKeys = Object.keys(data);

  return (
    <Section style={{ marginLeft: level * 20 }}>
      <SectionHeader>
        {isRenaming ? (
          <Input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Новое название"
            autoFocus
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        ) : (
          <SectionTitle>{displayName}</SectionTitle>
        )}
        <ButtonGroup>
          {!isRoot && (
            <>
              <RenameButton onClick={() => { setNewKey(itemKey); setIsRenaming(true); }}>
                Переименовать
              </RenameButton>
              <DeleteButton onClick={() => onDelete(path)}>Удалить раздел</DeleteButton>
            </>
          )}
          <AddButton onClick={() => setIsAdding(true)}>+ Добавить</AddButton>
        </ButtonGroup>
      </SectionHeader>

      <AddItemModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onAdd={(key, type) => onAdd(path, key, type)}
        existingKeys={currentKeys}
      />

      {currentKeys.map((key) => (
        <PriceNode
          key={key}
          data={data[key]}
          path={path ? `${path}.${key}` : key}
          itemKey={key}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAdd={onAdd}
          onRename={onRename}
          level={level + 1}
          existingKeys={currentKeys}
        />
      ))}
    </Section>
  );
};

// --- Основной компонент ---
const PriceEditor: React.FC = () => {
  const [prices, setPrices] = useState<any>(null);
  const [type, setType] = useState<'canopy' | 'greenhouse' | 'gazebo'>('gazebo');
  const navigate = useNavigate();

  useEffect(() => {
    loadPrices();
  }, [type]);

  const loadPrices = async () => {
    let defaultPrices;
    if (type === 'gazebo') defaultPrices = defaultGazeboPrices;
    else if (type === 'canopy') defaultPrices = defaultCanopyPrices;
    else defaultPrices = defaultGreenhousePrices;
    const data = await getPrices(type, defaultPrices);
    setPrices(data);
  };

  const handleUpdate = (path: string, value: any) => {
    const newPrices = { ...prices };
    const keys = path.split('.');
    let current = newPrices;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setPrices(newPrices);
  };

  const handleDelete = (path: string) => {
    if (!window.confirm(`Удалить элемент "${path}"?`)) return;
    const keys = path.split('.');
    const newPrices = { ...prices };
    let current = newPrices;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    delete current[keys[keys.length - 1]];
    setPrices(newPrices);
  };

  const handleAdd = (parentPath: string, key: string, type: 'object' | 'number') => {
    const newPrices = { ...prices };
    const keys = parentPath ? parentPath.split('.') : [];
    let current = newPrices;
    for (const k of keys) {
      current = current[k];
    }
    if (type === 'object') {
      current[key] = {};
    } else {
      current[key] = 0;
    }
    setPrices(newPrices);
  };

  const handleRename = (path: string, newKey: string) => {
    const keys = path.split('.');
    const parentPath = keys.slice(0, -1).join('.');
    const oldKey = keys[keys.length - 1];

    const newPrices = { ...prices };
    let parent = newPrices;
    if (parentPath) {
      for (const k of parentPath.split('.')) {
        parent = parent[k];
      }
    }
    parent[newKey] = parent[oldKey];
    delete parent[oldKey];
    setPrices(newPrices);
  };

  const handleSave = async () => {
    await savePrices(type, prices);
    alert('Цены сохранены');
  };

  if (!prices) return <Container>Загрузка...</Container>;

  return (
    <Container>
      <Header>
        <Title>Редактор цен</Title>
        <BackButton onClick={() => navigate('/dashboard')}>← В личный кабинет</BackButton>
      </Header>

      <TypeSelector value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="gazebo">Беседка</option>
        <option value="canopy">Навес</option>
        <option value="greenhouse">Теплица</option>
      </TypeSelector>

      <PriceNode
        data={prices}
        path=""
        itemKey="Корень"
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onRename={handleRename}
        existingKeys={Object.keys(prices)}
      />

      <SaveButton onClick={handleSave}>Сохранить</SaveButton>
    </Container>
  );
};

export default PriceEditor;
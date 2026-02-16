import styled from 'styled-components';

export const Container = styled.div`
  padding: 24px;
  background: #f5f7fa;
  font-family: 'Segoe UI', sans-serif;
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h2`
  margin: 0 0 24px;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
`;

export const ControlSection = styled.div`
  margin-bottom: 28px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: background 0.3s ease;
`;

export const SectionTitle = styled.h3`
  margin: 0 0 16px;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
`;

export const InputGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #34495e;
  font-weight: 500;
`;

export const Input = styled.input`
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

export const Select = styled.select`
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

export const ColorPickerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const ColorPickerButton = styled.button<{ color: string }>`
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

export const ColorPickerPopup = styled.div`
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

export const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

export const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;
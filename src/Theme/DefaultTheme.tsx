import styled from 'styled-components';

export const Container = styled.div<{ isMobile: boolean }>`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  overflow: hidden;
`;

export const ControlsPanel = styled.div<{ isMobile: boolean }>`
  width: ${({ isMobile }) => (isMobile ? '100%' : '380px')};
  padding: 20px;
  background: #ffffff;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: ${({ isMobile }) => (isMobile ? 'none' : '2px 0 10px rgba(0,0,0,0.1)')};
  z-index: 10;
`;

export const ModelView = styled.div<{ isMobile: boolean }>`
  flex: 1;
  position: relative;
  min-height: ${({ isMobile }) => (isMobile ? '60vh' : '100vh')};
  width: 100%;
  background: #f0f2f5;
`;

export const CostPanel = styled.div<{ isMobile: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: ${({ isMobile }) => (isMobile ? '20px' : 'auto')};
  background: rgba(255, 255, 255, 0.95);
  color: #2c3e50;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-size: 14px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DetailsButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 8px;
  &:hover {
    background: #2980b9;
  }
`;
import styled from 'styled-components';

export const Container = styled.div<{ isMobile: boolean }>`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  font-family: 'Courier New', monospace;
  background-color: #1e1e1e;
  color: #f5f5f5;
`;

export const ControlsPanel = styled.div<{ isMobile: boolean }>`
  width: ${({ isMobile }) => (isMobile ? '100%' : '380px')};
  padding: 20px;
  background: #2a2a2a;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: ${({ isMobile }) => (isMobile ? 'none' : '2px 0 10px rgba(255,255,255,0.1)')};
  z-index: 10;
`;

export const ModelView = styled.div<{ isMobile: boolean }>`
  flex: 1;
  position: relative;
  min-height: ${({ isMobile }) => (isMobile ? '60vh' : '100vh')};
  width: 100%;
  background: #121212;
`;

export const CostPanel = styled.div<{ isMobile: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: ${({ isMobile }) => (isMobile ? '20px' : 'auto')};
  background: rgba(40, 40, 40, 0.9);
  color: #f0f0f0;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255,255,255,0.05);
  font-size: 14px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DetailsButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 8px;
  &:hover {
    background: #388e3c;
  }
`;
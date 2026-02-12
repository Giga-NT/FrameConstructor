import styled from 'styled-components';

export const LandingContainer = styled.div`
  min-height: 100vh;
  background-color: #f9f9f9;
  font-family: 'Roboto', sans-serif;
  color: #333;
`;

export const LandingHeader = styled.header`
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 5%;
  max-width: 1400px;
  margin: 0 auto;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const Logo = styled.div`
  width: 100px;
  height: 80px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #0056b3;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);

  small {
    font-size: 10px;
    margin-top: 2px;
  }
`;

export const CompanyInfo = styled.div`
  h3 {
    font-size: 18px;
    margin-bottom: 5px;
    color: #0056b3;
  }

  p {
    font-size: 14px;
    color: #666;
  }
`;

export const ContactsBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  
  .work-time {
    color: #666;
    font-size: 14px;
  }
  
  .phone a {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
      color: #0056b3;
    }
  }
`;

export const HeaderBottom = styled.div`
  background: #0056b3;
`;

export const MainMenu = styled.nav`
  display: flex;
  justify-content: center;
  max-width: 1400px;
  margin: 0 auto;
`;

export const MenuItem = styled.div<{ active?: boolean }>`
  padding: 15px 25px;
  color: white;
  cursor: pointer;
  font-weight: ${props => props.active ? '700' : '500'};
  background: ${props => props.active ? '#003d82' : 'transparent'};
  transition: all 0.3s;
  
  &:hover {
    background: #003d82;
  }
`;

export const AuthButton = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #f57c00;
    transform: translateY(-2px);
  }
`;

export const MainBanner = styled.section`
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/banner-bg.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 100px 5%;
  text-align: center;
  
  .banner-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
    
    button {
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      
      &.primary {
        background: #ff9800;
        color: white;
        border: none;
        
        &:hover {
          background: #f57c00;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      }
      
      &.secondary {
        background: transparent;
        color: white;
        border: 2px solid white;
        
        &:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
      }
    }
  }
`;

export const BannerTitle = styled.h1`
  font-size: 36px;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

export const BannerSubtitle = styled.p`
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const LandingContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const FeaturesContainer = styled.section`
  padding: 80px 0;
  
  h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 50px;
    color: #0056b3;
  }
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

export const FeatureBlock = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: all 0.3s;
  text-align: center;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  .icon {
    font-size: 50px;
    margin-bottom: 20px;
    color: #0056b3;
  }
  
  h3 {
    font-size: 22px;
    margin-bottom: 15px;
    color: #0056b3;
  }
  
  ul {
    text-align: left;
    list-style: none;
    padding: 0;
    
    li {
      padding: 5px 0;
      position: relative;
      padding-left: 20px;
      
      &:before {
        content: '•';
        position: absolute;
        left: 0;
        color: #ff9800;
      }
    }
  }
`;

export const PriceSection = styled.section`
  padding: 80px 0;
  background: #f5f9ff;
  
  h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 50px;
    color: #0056b3;
  }
`;

export const PriceContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const PriceCard = styled.div<{ highlight?: boolean }>`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: all 0.3s;
  border: ${props => props.highlight ? '2px solid #ff9800' : '2px solid transparent'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  h3 {
    font-size: 22px;
    margin-bottom: 15px;
    color: #0056b3;
    text-align: center;
  }
  
  .price {
    font-size: 24px;
    font-weight: 700;
    color: #ff9800;
    text-align: center;
    margin: 20px 0;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      padding: 8px 0;
      position: relative;
      padding-left: 25px;
      
      &:before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #0056b3;
      }
    }
  }
`;

export const GallerySection = styled.section`
  padding: 80px 0;
  
  h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 50px;
    color: #0056b3;
  }
`;

export const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const GalleryItem = styled.div`
  height: 250px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  }
  
  h3 {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: white;
    font-size: 18px;
    z-index: 1;
  }
`;

export const ContactSection = styled.section`
  padding: 80px 0;
  background: #f5f9ff;
  
  h2 {
    text-align: center;
    font-size: 32px;
    margin-bottom: 50px;
    color: #0056b3;
  }
`;

export const ContactContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ContactInfo = styled.div`
  h3 {
    font-size: 20px;
    color: #0056b3;
    margin-bottom: 15px;
  }
  
  p, a {
    margin-bottom: 12px;
    color: #444;
    display: block;
  }
  
  a {
    text-decoration: none;
    transition: color 0.3s;
    
    &:hover {
      color: #0056b3;
    }
  }
`;

export const MapContainer = styled.div`
  height: 300px;
  background: #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
`;

export const Footer = styled.footer`
  background: #0056b3;
  color: white;
  padding: 30px 5%;
  text-align: center;
  
  .copyright {
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .requisites {
    font-size: 14px;
    opacity: 0.8;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const AuthContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const AuthTitle = styled.h2`
  font-size: 24px;
  color: #0056b3;
  text-align: center;
  margin-bottom: 20px;
`;

export const AuthInput = styled.input`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #0056b3;
    outline: none;
  }
`;

export const AuthError = styled.div`
  color: #d32f2f;
  background: #ffebee;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
`;
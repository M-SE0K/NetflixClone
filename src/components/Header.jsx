import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth.jsx';
import { useWishlist } from '../hooks/useWishlist.jsx';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: 0 4%;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.$isScrolled 
    ? 'rgba(20, 20, 20, 0.95)' 
    : 'linear-gradient(180deg, rgba(0,0,0,0.7) 10%, transparent)'};
  transition: background 0.3s ease;

  @media (max-width: 768px) {
    padding: 0 3%;
    height: 56px;
  }
`;

const Logo = styled(Link)`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #e50914;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: 40px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.$isActive ? '#fff' : '#b3b3b3'};
  font-size: 14px;
  font-weight: ${props => props.$isActive ? '600' : '400'};
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const WishlistButton = styled(Link)`
  position: relative;
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const WishlistBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #e50914;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
`;

const DropdownArrow = styled.span`
  font-size: 10px;
  transition: transform 0.2s;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  min-width: 150px;
  padding: 8px 0;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  background: rgba(20, 20, 20, 0.98);
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

const MobileNavLink = styled(Link)`
  color: ${props => props.$isActive ? '#fff' : '#b3b3b3'};
  font-size: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 모바일 메뉴 닫기 (라우트 변경 시)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/popular', label: '대세 콘텐츠' },
    { path: '/search', label: '찾아보기' },
    { path: '/wishlist', label: '내가 찜한 리스트' }
  ];

  return (
    <>
      <HeaderContainer $isScrolled={isScrolled}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo to="/">NETFLEX</Logo>
          <Nav>
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path}
                $isActive={location.pathname === item.path}
              >
                {item.label}
              </NavLink>
            ))}
          </Nav>
        </div>

        <RightSection>
          <SearchButton onClick={() => navigate('/search')}>
            🔍
          </SearchButton>
          
          <WishlistButton to="/wishlist">
            ❤️
            {wishlistCount > 0 && (
              <WishlistBadge>{wishlistCount}</WishlistBadge>
            )}
          </WishlistButton>

          <UserMenu>
            <UserButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <UserAvatar>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </UserAvatar>
              <DropdownArrow $isOpen={isDropdownOpen}>▼</DropdownArrow>
            </UserButton>
            
            <Dropdown $isOpen={isDropdownOpen}>
              <DropdownItem disabled style={{ color: '#fff', cursor: 'default' }}>
                {user?.email || '사용자'}
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                로그아웃
              </DropdownItem>
            </Dropdown>
          </UserMenu>

          <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </MobileMenuButton>
        </RightSection>
      </HeaderContainer>

      <MobileMenu $isOpen={isMobileMenuOpen}>
        {navItems.map(item => (
          <MobileNavLink 
            key={item.path} 
            to={item.path}
            $isActive={location.pathname === item.path}
          >
            {item.label}
          </MobileNavLink>
        ))}
        <MobileNavLink as="button" onClick={handleLogout} style={{ color: '#e50914' }}>
          로그아웃
        </MobileNavLink>
      </MobileMenu>
    </>
  );
};

export default Header;


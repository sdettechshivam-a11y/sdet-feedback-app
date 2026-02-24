import logo from '../assets/sdet_logo.png';

export default function AppHeader() {
  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '0.875rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <img
        src={logo}
        alt="SDET Tech"
        style={{ height: 48, width: 'auto', display: 'block' }}
      />
    </header>
  );
}
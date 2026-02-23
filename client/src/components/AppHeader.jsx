import logo from '../assets/sdet_logo.png';

export default function AppHeader() {
  return (
    <header className="app-header" role="banner">
      <a href="https://sdettech.com" target="_blank" rel="noopener noreferrer"
        aria-label="SDET Tech - opens in new tab">
        <img src={logo} alt="SDET Tech" className="logo" />
      </a>
      <div>
        <div className="brand-name">SDET Tech</div>
        <div className="brand-tag">Software Testing Company</div>
      </div>
    </header>
  );
}

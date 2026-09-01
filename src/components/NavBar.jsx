import React from 'react';
import './NavBar.css';
import logo from '../images/logo.png'; // Coloca aquí el logo: src/images/logo.png

export default function NavBar() {
  return (
    <a className="brand" href="/">
      Ropero <img src={logo} alt="Colegio Saint George" className="logo" />
    </a>
  );
}

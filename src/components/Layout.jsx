import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Layout() {
  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar__inner">
          <NavLink to="/feed" className="nav-logo">
            <img src={logo} alt="TopVibe" className="nav-logo-img" />
            <span>TopVibe</span>
          </NavLink>
          <div className="nav-links">
            <NavLink to="/feed" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Feed
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Leaderboard
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Profile
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

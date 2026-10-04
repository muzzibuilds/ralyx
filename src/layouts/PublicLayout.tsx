/**
 * PublicLayout
 * Used for customer-facing pages (Home, Register, Results, etc)
 */

import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './Layout.css';

export default function PublicLayout() {
  return (
    <div className="layout layout--public">
      <Navigation />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

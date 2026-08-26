import { Link, Outlet } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Layout = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Personal Dashboard</h1>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Dashboard</Link>
          <Link to="/subscriptions" style={{ textDecoration: 'none', color: '#333' }}>Subscriptions</Link>
          <Link to="/assignments" style={{ textDecoration: 'none', color: '#333' }}>Assignments</Link>
          <Link to="/finances" style={{ textDecoration: 'none', color: '#333' }}>Finances</Link>
          <Link to="/passwords" style={{ textDecoration: 'none', color: '#333' }}>Passwords</Link>
          <UserButton />
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

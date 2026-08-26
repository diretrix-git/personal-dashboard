import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { LayoutDashboard, Calendar, FileText, PieChart, KeyRound } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Subscriptions', path: '/subscriptions', icon: Calendar },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Finances', path: '/finances', icon: PieChart },
    { name: 'Passwords', path: '/passwords', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-20 pb-safe shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary-600' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-primary-50' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

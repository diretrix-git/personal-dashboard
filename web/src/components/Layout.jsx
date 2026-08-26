import { Link, Outlet, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { LayoutDashboard, Calendar, FileText, PieChart, KeyRound } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
    <div className="min-h-screen bg-stone-50 md:flex">
      {/* Desktop Floating Pill Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-6 top-6 bottom-6 z-10 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md shadow-primary-500/20 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">Antigravity</h1>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="block relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-50 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div 
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors ${
                    isActive
                      ? 'text-primary-700'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  whileHover={!isActive ? { x: 4 } : {}}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-stone-400'}`} />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-stone-100 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
             <LayoutDashboard className="w-3 h-3 text-white" />
          </div>
          <h1 className="text-lg font-extrabold text-stone-800 tracking-tight">Antigravity</h1>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-76 lg:ml-80 p-4 md:p-8 md:pt-10 pb-24 md:pb-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex justify-around items-center h-16 z-20 pb-safe shadow-[0_-8px_20px_-1px_rgb(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary-600' : 'text-stone-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

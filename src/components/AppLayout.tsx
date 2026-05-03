import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

type AppLayoutProps = {
  children: ReactNode;
};

type NavIcon = 'home' | 'inbox' | 'clipboard' | 'clock';

const navItems = [
  { to: '/workspace', label: '主工作台', icon: 'home' },
  { to: '/quick-capture', label: '快速收集', icon: 'inbox' },
  { to: '/task-pool', label: '任务池', icon: 'clipboard' },
  { to: '/focus-clock', label: '雨夜时钟', icon: 'clock' },
] satisfies Array<{ to: string; label: string; icon: NavIcon }>;

const navIconPaths: Record<NavIcon, ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 5h16l2 9v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5l2-9Z" />
      <path d="M2 14h6l2 3h4l2-3h6" />
    </>
  ),
  clipboard: (
    <>
      <path d="M8 4h8" />
      <path d="M9 3h6a2 2 0 0 1 2 2v1H7V5a2 2 0 0 1 2-2Z" />
      <path d="M6 6h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
};

function NavItemIcon({ icon }: { icon: NavIcon }) {
  return (
    <svg
      aria-hidden="true"
      className="nav-link-icon"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      {navIconPaths[icon]}
    </svg>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">个人待办计划器</p>
          <h1>新的一天</h1>
        </div>
        <nav aria-label="主导航">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <NavItemIcon icon={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="page-content">{children}</main>
    </div>
  );
}

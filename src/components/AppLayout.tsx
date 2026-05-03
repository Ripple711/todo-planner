import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

type AppLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: '/workspace', label: '主工作台' },
  { to: '/quick-capture', label: '快速收集' },
  { to: '/task-pool', label: '任务池' },
];

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">个人待办计划器</p>
          <h1>雨山计划</h1>
        </div>
        <nav aria-label="主导航">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="page-content">{children}</main>
    </div>
  );
}

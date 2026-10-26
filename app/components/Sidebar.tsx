
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/assets', icon: '🔧', label: 'Assets' },
  { href: '/work-orders', icon: '📋', label: 'Work Orders' },
  { href: '/checklists-meters', icon: '✅', label: 'Checklists & Meters' },
  { href: '/pm-schedules', icon: '📅', label: 'PM Schedules' },
  { href: '/parts', icon: '📦', label: 'Parts & Inventory' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } h-full shrink-0 bg-white border-r border-gray-200
      flex flex-col justify-between transition-all duration-300 ease-in-out`}
    >
      <div>
        {/* Logo and Toggle */}
        <div
          className={`p-4 border-b border-gray-200 ${
            collapsed ? 'flex flex-col items-center gap-3' : ''
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'justify-between'
            } gap-3`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-black text-white p-2 rounded-md font-bold text-sm shrink-0">
                ⚙️
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <h1 className="font-bold text-black">CMMS</h1>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    by Eng. Fewaz S Adem
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
              >
                ◀
              </button>
            )}
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              ▶
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md
                  transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-black font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="text-lg shrink-0">{item.icon}</span>

                {!collapsed && (
                  <span className="text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div
        className={`p-4 border-t border-gray-200 text-xs text-gray-400 ${
          collapsed ? 'text-center' : ''
        }`}
      >
        {collapsed ? 'v3.0' : 'Manufacturing CMMS v3.0'}
      </div>
    </aside>
  );
}

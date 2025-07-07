import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, TrendingUp, History, Newspaper, Target } from 'lucide-react';

const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/news', icon: Newspaper, label: 'News' },
  { path: '/goals', icon: Target, label: 'Goals' }
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-spotify-dark-gray/50 backdrop-blur-sm border-r border-gray-700 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Stock Dashboard</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-spotify-green text-white'
                      : 'text-gray-400 hover:text-white hover:bg-spotify-gray/50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Stock Dashboard v2.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PenTool,
  LayoutDashboard,
  Users,
  Swords,
  BarChart3,
  Globe,
  Trophy,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import type { RootState } from '../../store';
import { useAppDispatch } from '../../hooks/useAppDispatch';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/editor', icon: PenTool, label: '剧本编辑器' },
  { path: '/characters', icon: Users, label: '角色锻造' },
  { path: '/conflict', icon: Swords, label: '冲突实验室' },
  { path: '/analytics', icon: BarChart3, label: '数据分析' },
  { path: '/community', icon: Globe, label: '社区广场' },
  { path: '/achievements', icon: Trophy, label: '成就中心' },
  { path: '/settings', icon: Settings, label: 'AI 配置' },
];

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-64 bg-midnightLight border-r border-slate/30 z-50 flex flex-col"
    >
      <div className="p-6 border-b border-slate/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber rounded-lg flex items-center justify-center">
            <PenTool className="w-6 h-6 text-midnight" />
          </div>
          <div>
            <h1 className="text-xl font-display text-textPrimary">灵感剧本</h1>
            <p className="text-xs text-textMuted">AI辅助创作</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-amber/10 text-amber border border-amber/30'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-midnight'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate/30">
        <div className="flex items-center gap-3 mb-4 p-3 bg-midnight rounded-lg">
          <div className="w-10 h-10 bg-purple rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-textPrimary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-textPrimary font-medium truncate">{user?.nickname}</p>
            <p className="text-xs text-textMuted">{user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-amber text-sm font-semibold">{user?.points}</p>
            <p className="text-xs text-textMuted">积分</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-textSecondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

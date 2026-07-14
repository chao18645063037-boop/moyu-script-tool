import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Calendar,
  Flame,
  Sparkles,
  CheckCircle2,
  Lock,
  TrendingUp,
  Gift,
} from 'lucide-react';
import { api } from '../api/client';
import type { Achievement, UserAchievement } from '../types';

const achievementCategories = [
  { id: 'beginner', name: '新手起步', icon: Star },
  { id: 'milestone', name: '里程碑', icon: Trophy },
  { id: 'streak', name: '坚持创作', icon: Flame },
  { id: 'popular', name: '人气之星', icon: Sparkles },
];

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    api.achievements.getAll().then(setAchievements);
    api.achievements.getUserAchievements('user-1').then(setUserAchievements);
  }, []);

  useEffect(() => {
    const unlocked = userAchievements.filter(ua => ua.unlockedAt).length;
    setUnlockedCount(unlocked);
    const points = userAchievements
      .filter(ua => ua.unlockedAt)
      .reduce((sum, ua) => {
        const achievement = achievements.find(a => a.id === ua.achievementId);
        return sum + (achievement?.points || 0);
      }, 0);
    setTotalPoints(points);
  }, [userAchievements, achievements]);

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievementId === achievementId);
  };

  const isUnlocked = (achievementId: string) => {
    return getUserAchievement(achievementId)?.unlockedAt !== undefined;
  };

  const getProgress = (achievementId: string) => {
    return getUserAchievement(achievementId)?.progress || 0;
  };

  const getUnlockedDate = (achievementId: string) => {
    const ua = getUserAchievement(achievementId);
    return ua?.unlockedAt ? new Date(ua.unlockedAt).toLocaleDateString() : null;
  };

  const getLevel = () => {
    if (totalPoints >= 5000) return { name: '传奇编剧', icon: '👑', color: 'text-amber' };
    if (totalPoints >= 2000) return { name: '资深创作者', icon: '🏆', color: 'text-purple' };
    if (totalPoints >= 1000) return { name: '潜力新秀', icon: '⭐', color: 'text-forest' };
    if (totalPoints >= 500) return { name: '初出茅庐', icon: '🎯', color: 'text-blue-400' };
    return { name: '编剧学徒', icon: '📝', color: 'text-textMuted' };
  };

  const level = getLevel();

  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = isUnlocked(a.id) ? 0 : 1;
    const bUnlocked = isUnlocked(b.id) ? 0 : 1;
    return aUnlocked - bUnlocked || getProgress(b.id) - getProgress(a.id);
  });

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-display text-textPrimary mb-2">成就中心</h1>
          <p className="text-textSecondary">追踪你的创作旅程，解锁专属荣誉</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Trophy, label: '解锁成就', value: `${unlockedCount}/${achievements.length}`, color: 'bg-amber', textColor: 'text-midnight' },
          { icon: Star, label: '当前等级', value: level.name, iconEmoji: level.icon, color: 'bg-purple', textColor: 'text-textPrimary' },
          { icon: Gift, label: '累计积分', value: totalPoints, color: 'bg-forest', textColor: 'text-textPrimary' },
          { icon: Flame, label: '连续创作', value: '12天', color: 'bg-red-500', textColor: 'text-textPrimary' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card flex items-center justify-between"
          >
            <div>
              <p className="text-textSecondary text-sm">{stat.label}</p>
              <div className="flex items-center gap-2 mt-1">
                {stat.iconEmoji && <span className="text-xl">{stat.iconEmoji}</span>}
                <p className="text-2xl font-display font-semibold text-textPrimary">{stat.value}</p>
              </div>
            </div>
            <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-8"
      >
        <h2 className="section-title flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber" />
          等级进度
        </h2>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-textSecondary text-sm">编剧学徒</span>
            <span className="text-textSecondary text-sm">传奇编剧</span>
          </div>
          <div className="h-4 bg-midnight rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalPoints / 5000) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber via-purple to-forest"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-textMuted">
            <span>0</span>
            <span>1000</span>
            <span>2000</span>
            <span>5000</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        {achievementCategories.map((category, catIndex) => {
          const Icon = category.icon;
          const categoryAchievements = sortedAchievements.filter((_, idx) => idx % achievementCategories.length === catIndex);
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h2 className="section-title flex items-center gap-2">
                <Icon className="w-6 h-6 text-amber" />
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement, index) => {
                  const unlocked = isUnlocked(achievement.id);
                  const progress = getProgress(achievement.id);
                  const unlockedDate = getUnlockedDate(achievement.id);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: catIndex * 0.1 + index * 0.05 }}
                      className={`relative p-6 rounded-xl border transition-all duration-300 ${
                        unlocked
                          ? 'bg-gradient-to-br from-amber/10 to-purple/10 border-amber/30'
                          : 'bg-midnightLight border-slate/30 opacity-70'
                      }`}
                    >
                      {unlocked && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle2 className="w-5 h-5 text-amber" />
                        </div>
                      )}

                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-3xl ${
                        unlocked ? 'bg-amber/20' : 'bg-slate/20'
                      }`}>
                        {achievement.icon}
                      </div>

                      <h3 className={`text-lg font-display mb-2 ${
                        unlocked ? 'text-textPrimary' : 'text-textMuted'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-textSecondary text-sm mb-4">{achievement.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Gift className="w-4 h-4 text-amber" />
                          <span className="text-sm text-amber">{achievement.points} 积分</span>
                        </div>
                        {!unlocked && (
                          <Lock className="w-4 h-4 text-textMuted" />
                        )}
                      </div>

                      {!unlocked && progress > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-textMuted mb-1">
                            <span>进度</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 bg-midnight rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-amber to-purple"
                            />
                          </div>
                        </div>
                      )}

                      {unlocked && unlockedDate && (
                        <div className="mt-4 flex items-center gap-1 text-xs text-textMuted">
                          <Calendar className="w-3 h-3" />
                          <span>已于 {unlockedDate} 解锁</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 card"
      >
        <h2 className="section-title flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber" />
          积分兑换商城
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: '高级AI创作模型', points: 500, icon: '🚀', description: '解锁更智能的AI辅助创作能力' },
            { name: '专属剧本封面模板', points: 300, icon: '🎨', description: '获得精美剧本封面设计模板' },
            { name: '剧本排版服务', points: 200, icon: '📄', description: '专业剧本格式排版优化' },
            { name: '创作课程兑换', points: 800, icon: '📚', description: '解锁精品编剧课程' },
            { name: '社区推荐位', points: 1000, icon: '⭐', description: '作品获得社区首页推荐' },
            { name: '定制角色头像', points: 400, icon: '👤', description: '为角色生成专属头像' },
          ].map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 bg-midnight rounded-lg border border-slate/30 hover:border-amber/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-display text-textPrimary">{item.name}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Gift className="w-4 h-4 text-amber" />
                    <span className="text-amber">{item.points} 积分</span>
                  </div>
                </div>
              </div>
              <p className="text-textSecondary text-sm mb-4">{item.description}</p>
              <button
                disabled={totalPoints < item.points}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  totalPoints >= item.points
                    ? 'bg-amber text-midnight hover:bg-amberLight'
                    : 'bg-slate text-textMuted cursor-not-allowed'
                }`}
              >
                {totalPoints >= item.points ? '立即兑换' : '积分不足'}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Achievements;
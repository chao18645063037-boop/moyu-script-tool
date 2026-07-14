import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Award,
  Flame,
} from 'lucide-react';
import { api } from '../api/client';
import { fetchProjects, createProject } from '../store/projectSlice';
import type { RootState } from '../store';
import type { Genre, Structure, PlotSuggestion } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';

const genreOptions: { value: Genre; label: string; color: string }[] = [
  { value: 'commercial', label: '商业片', color: 'bg-amber' },
  { value: 'artistic', label: '文艺片', color: 'bg-purple' },
  { value: 'short', label: '短剧', color: 'bg-forest' },
];

const structureOptions: { value: Structure; label: string }[] = [
  { value: 'three_act', label: '经典三幕式' },
  { value: 'five_act', label: '五幕剧作结构' },
  { value: 'save_the_cat', label: '救猫咪节拍表' },
  { value: 'multi_line', label: '多线叙事网' },
  { value: 'short_video', label: '黄金3秒钩子' },
];

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre>('commercial');
  const [selectedStructure, setSelectedStructure] = useState<Structure>('three_act');
  const [plotSuggestions, setPlotSuggestions] = useState<PlotSuggestion[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, currentProject } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (currentProject) {
      api.ai.getPlotSuggestions(currentProject.id).then(setPlotSuggestions);
    }
  }, [currentProject]);

  const handleCreateProject = async () => {
    const title = newProjectTitle.trim();
    if (!title) return;
    setIsCreating(true);
    setCreateError('');
    try {
      const result = await dispatch(createProject({ title, genre: selectedGenre, structure: selectedStructure }));
      if (createProject.fulfilled.match(result)) {
        setShowCreateModal(false);
        setNewProjectTitle('');
        setSelectedGenre('commercial');
        setSelectedStructure('three_act');
      } else {
        setCreateError((result.payload as string) || '创建失败');
      }
    } catch {
      setCreateError('创建失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };

  const totalWords = projects.reduce((sum, p) => sum + p.wordCount, 0);
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display text-textPrimary mb-2">欢迎回来，编剧大师</h1>
        <p className="text-textSecondary">今天也是充满灵感的一天</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: FileText, label: '总项目数', value: projects.length, color: 'bg-amber', textColor: 'text-midnight' },
          { icon: TrendingUp, label: '完成作品', value: completedProjects, color: 'bg-forest', textColor: 'text-textPrimary' },
          { icon: Clock, label: '进行中', value: inProgressProjects, color: 'bg-purple', textColor: 'text-textPrimary' },
          { icon: Sparkles, label: '累计字数', value: `${(totalWords / 1000).toFixed(1)}k`, color: 'bg-blue-500', textColor: 'text-textPrimary' },
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
              <p className="text-3xl font-display font-semibold text-textPrimary mt-1">{stat.value}</p>
            </div>
            <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">我的项目</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新建项目
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-textMuted mx-auto mb-4" />
                <p className="text-textSecondary">还没有项目，开始你的第一部作品吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => navigate(`/editor/${project.id}`)}
                    className="p-4 bg-midnight rounded-lg border border-slate/30 hover:border-amber/30 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-display text-textPrimary">{project.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            project.status === 'completed' ? 'bg-forest/20 text-forestLight' :
                            project.status === 'in_progress' ? 'bg-amber/20 text-amber' :
                            'bg-slate/20 text-textMuted'
                          }`}>
                            {project.status === 'completed' ? '已完成' :
                             project.status === 'in_progress' ? '进行中' : '草稿'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-textSecondary">
                          <span>{genreOptions.find(g => g.value === project.genre)?.label}</span>
                          <span>{structureOptions.find(s => s.value === project.structure)?.label}</span>
                          <span>{project.wordCount} 字</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-textMuted" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber" />
              灵感推荐
            </h2>
            {plotSuggestions.length > 0 ? (
              <div className="space-y-3">
                {plotSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="p-3 bg-midnight rounded-lg border border-slate/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${
                        suggestion.type === 'surprise' ? 'bg-amber' :
                        suggestion.type === 'emotional' ? 'bg-purple' : 'bg-red-400'
                      }`} />
                      <span className="text-sm font-medium text-textPrimary">{suggestion.title}</span>
                    </div>
                    <p className="text-xs text-textSecondary line-clamp-2">{suggestion.description}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-textSecondary text-sm">选择一个项目查看灵感推荐</p>
            )}
          </div>

          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-400" />
              热门话题
            </h2>
            <div className="space-y-3">
              {['#悬疑反转', '#情感共鸣', '#角色成长', '#视觉盛宴'].map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-2 bg-midnight rounded-lg"
                >
                  <span className="text-textPrimary">{tag}</span>
                  <span className="text-xs text-textMuted">{Math.floor(Math.random() * 1000)} 讨论</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Award className="w-6 h-6 text-amber" />
              近期成就
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-midnight rounded-lg">
                <div className="w-8 h-8 bg-amber/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🎬</span>
                </div>
                <div>
                  <p className="text-sm text-textPrimary">处女作完成</p>
                  <p className="text-xs text-textMuted">已解锁</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-midnight rounded-lg">
                <div className="w-8 h-8 bg-slate/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">📖</span>
                </div>
                <div>
                  <p className="text-sm text-textPrimary">百场达人</p>
                  <p className="text-xs text-textMuted">35% 完成</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-midnightLight rounded-xl p-6 border border-slate/30"
          >
            <h2 className="text-xl font-display text-textPrimary mb-6">新建项目</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-textSecondary text-sm mb-2">项目标题</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="输入项目标题"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-textSecondary text-sm mb-2">创作类型</label>
                <div className="flex gap-2">
                  {genreOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedGenre(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedGenre === option.value
                          ? `${option.color} text-midnight`
                          : 'bg-midnight border border-slate text-textSecondary hover:border-amber'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-textSecondary text-sm mb-2">结构模板</label>
                <select
                  value={selectedStructure}
                  onChange={(e) => setSelectedStructure(e.target.value as Structure)}
                  className="input-field"
                >
                  {structureOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                className="btn-secondary flex-1"
                disabled={isCreating}
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectTitle.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating && <div className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />}
                {isCreating ? '创建中...' : '创建'}
              </button>
            </div>

            {createError && (
              <p className="mt-3 text-sm text-red-400 text-center">{createError}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

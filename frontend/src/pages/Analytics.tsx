import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../api/client';
import { fetchProjectById, setCurrentProject } from '../store/projectSlice';
import type { RootState } from '../store';
import type { AnalyticsData } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject } = useSelector((state: RootState) => state.projects);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(setCurrentProject({ id, title: '', genre: 'commercial', structure: 'three_act', status: 'draft', wordCount: 0, createdAt: new Date(), updatedAt: new Date() }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentProject) {
      setIsLoading(true);
      api.analytics.getByProject(currentProject.id).then(data => {
        setAnalyticsData(data);
        setIsLoading(false);
      });
    }
  }, [currentProject]);

  if (!currentProject) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-10 h-10 text-amber" />
          </div>
          <h2 className="text-xl font-display text-textPrimary mb-2">选择一个项目查看数据分析</h2>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            返回仪表盘
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber/30 border-t-amber rounded-full animate-spin" />
          <span className="text-textSecondary">正在分析剧本...</span>
        </div>
      </div>
    );
  }

  const progressData = {
    labels: ['第一幕', '第二幕', '第三幕'],
    datasets: [{
      data: analyticsData?.actProgress || [0, 0, 0],
      backgroundColor: ['#D4A574', '#6B4E71', '#2D5A4E'],
      borderWidth: 0,
    }],
  };

  const characterData = {
    labels: analyticsData?.characterLineCounts.map(c => c.name) || [],
    datasets: [{
      label: '台词占比',
      data: analyticsData?.characterLineCounts.map(c => c.count) || [],
      backgroundColor: ['#D4A574', '#6B4E71', '#2D5A4E', '#8B6B94', '#4A7B6A'],
      borderRadius: 8,
    }],
  };

  const sceneData = {
    labels: analyticsData?.sceneFrequency.map(s => s.title) || [],
    datasets: [{
      label: '出场次数',
      data: analyticsData?.sceneFrequency.map(s => s.count) || [],
      backgroundColor: '#112240',
      borderColor: '#D4A574',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const completionPercentage = analyticsData
    ? Math.round((analyticsData.completedScenes / analyticsData.totalScenes) * 100)
    : 0;

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-display text-textPrimary mb-2">数据分析中心</h1>
          <p className="text-textSecondary">深入洞察你的剧本结构与节奏</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: FileText, label: '总场景数', value: analyticsData?.totalScenes || 0, color: 'bg-amber' },
          { icon: CheckCircle2, label: '已完成', value: analyticsData?.completedScenes || 0, color: 'bg-forest' },
          { icon: Clock, label: '累计字数', value: `${((analyticsData?.totalWords || 0) / 1000).toFixed(1)}k`, color: 'bg-purple' },
          { icon: TrendingUp, label: '完成度', value: `${completionPercentage}%`, color: 'bg-blue-500' },
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
              <stat.icon className="w-7 h-7 text-textPrimary" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber" />
            幕进度分布
          </h2>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <Doughnut
                data={progressData}
                options={{
                  cutout: '70%',
                  plugins: { legend: { position: 'bottom' as const } },
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-display text-amber">{completionPercentage}%</p>
                  <p className="text-xs text-textMuted">完成度</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="section-title flex items-center gap-2">
            <Users className="w-6 h-6 text-purple" />
            角色台词占比
          </h2>
          <div className="h-64">
            <Bar
              data={characterData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(51, 65, 85, 0.5)' }, ticks: { color: '#94A3B8' } },
                  x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {analyticsData?.characterLineCounts.map((char, index) => (
              <div key={char.characterId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${['bg-amber', 'bg-purple', 'bg-forest', 'bg-purpleLight', 'bg-forestLight'][index % 5]}`} />
                  <span className="text-textSecondary">{char.name}</span>
                </div>
                <span className="text-textPrimary">{char.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="section-title flex items-center gap-2">
            <FileText className="w-6 h-6 text-forest" />
            场景频次
          </h2>
          <div className="h-64">
            <Bar
              data={sceneData}
              options={{
                indexAxis: 'y' as const,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { beginAtZero: true, grid: { color: 'rgba(51, 65, 85, 0.5)' }, ticks: { color: '#94A3B8' } },
                  y: { grid: { display: false }, ticks: { color: '#94A3B8' } },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 card"
      >
        <h2 className="section-title flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          节奏诊断
        </h2>
        {analyticsData && analyticsData.flatPassages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-forest" />
              <span className="text-textSecondary">剧本节奏健康，没有平淡段落</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {analyticsData && analyticsData.flatPassages.map((passage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-textPrimary">场景 {passage.sceneId}</span>
                      <span className="text-xs text-textMuted">第 {passage.startLine}-{passage.endLine} 行</span>
                    </div>
                    <p className="text-sm text-textSecondary">{passage.reason}</p>
                    <button className="mt-2 text-xs text-amber hover:underline">查看详情</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 card"
      >
        <h2 className="section-title flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber" />
          优化建议
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '角色戏份均衡',
              content: '主角李明的台词占比达到45%，建议适当增加其他角色的戏份，使故事更加丰富立体。',
              type: 'warning',
            },
            {
              title: '场景多样性',
              content: '警察局场景出现5次，考虑增加更多不同场景，提升视觉多样性。',
              type: 'info',
            },
            {
              title: '节奏调整',
              content: '第二幕完成度为70%，第三幕进度较慢，建议加快第三幕的创作节奏。',
              type: 'info',
            },
            {
              title: '冲突密度',
              content: '检测到一处连续16行缺乏冲突描写的段落，建议增加动作或对话冲突。',
              type: 'warning',
            },
          ].map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 bg-midnight rounded-lg border ${
                suggestion.type === 'warning' ? 'border-amber/30' : 'border-slate/30'
              }`}
            >
              <h3 className={`font-medium mb-2 ${suggestion.type === 'warning' ? 'text-amber' : 'text-textPrimary'}`}>
                {suggestion.title}
              </h3>
              <p className="text-textSecondary text-sm">{suggestion.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;

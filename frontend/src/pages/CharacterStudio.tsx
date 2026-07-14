import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Sparkles,
  User,
  BookOpen,
  Target,
  TrendingUp,
  Quote,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { fetchProjectById, fetchCharacters, createCharacter, updateCharacter, setCurrentProject } from '../store/projectSlice';
import type { RootState } from '../store';
import type { Character } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';

const CharacterStudio = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject, characters } = useSelector((state: RootState) => state.projects);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 30,
    gender: 'male',
    occupation: '',
    personality: '',
    backstory: '',
    motivation: '',
    arc: '',
    catchphrase: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(setCurrentProject({ id, title: '', genre: 'commercial', structure: 'three_act', status: 'draft', wordCount: 0, createdAt: new Date(), updatedAt: new Date() }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchCharacters(currentProject.id));
    }
  }, [currentProject, dispatch]);

  const handleCreateCharacter = async () => {
    if (!formData.name.trim()) return;
    await dispatch(createCharacter({
      projectId: currentProject?.id || '',
      charData: {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        occupation: formData.occupation,
        personality: formData.personality,
      },
    }));
    setShowCreateModal(false);
    setFormData({
      name: '',
      age: 30,
      gender: 'male',
      occupation: '',
      personality: '',
      backstory: '',
      motivation: '',
      arc: '',
      catchphrase: '',
    });
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    const result = await api.ai.generateCharacter({
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      occupation: formData.occupation,
      personality: formData.personality,
    });
    setFormData(prev => ({
      ...prev,
      backstory: result.backstory,
      motivation: result.motivation,
      arc: result.arc,
      catchphrase: result.catchphrase,
    }));
    setIsGenerating(false);
  };

  const handleUpdateCharacter = async () => {
    if (!selectedCharacter) return;
    await dispatch(updateCharacter({
      id: selectedCharacter.id,
      charData: formData,
    }));
    setShowEditModal(false);
    setSelectedCharacter(null);
  };

  if (!currentProject) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-amber" />
          </div>
          <h2 className="text-xl font-display text-textPrimary mb-2">选择一个项目开始创作角色</h2>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            返回仪表盘
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-display text-textPrimary mb-2">角色锻造室</h1>
          <p className="text-textSecondary">为你的故事创造鲜活的人物</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新建角色
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card">
            <h2 className="section-title">角色列表</h2>
            {characters.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-textMuted mx-auto mb-3" />
                <p className="text-textSecondary text-sm">还没有角色，开始创造吧！</p>
              </div>
            ) : (
              <div className="space-y-3">
                {characters.map((character, index) => (
                  <motion.div
                    key={character.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedCharacter(character);
                      setFormData({
                        name: character.name,
                        age: character.age,
                        gender: character.gender,
                        occupation: character.occupation,
                        personality: character.personality,
                        backstory: character.backstory,
                        motivation: character.motivation,
                        arc: character.arc,
                        catchphrase: character.catchphrase,
                      });
                    }}
                    className={`p-4 bg-midnight rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedCharacter?.id === character.id
                        ? 'border-amber/50 bg-amber/5'
                        : 'border-slate/30 hover:border-amber/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple to-purpleLight rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-textPrimary" />
                      </div>
                      <div>
                        <h3 className="font-display text-textPrimary">{character.name}</h3>
                        <p className="text-xs text-textMuted">{character.occupation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          {selectedCharacter ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple to-purpleLight rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-textPrimary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display text-textPrimary">{selectedCharacter.name}</h2>
                    <p className="text-textSecondary">{selectedCharacter.age}岁 · {selectedCharacter.gender === 'male' ? '男' : '女'} · {selectedCharacter.occupation}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  编辑
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-midnight rounded-lg p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-amber" />
                    <h3 className="font-medium text-textPrimary">人物小传</h3>
                  </div>
                  <p className="text-textSecondary text-sm leading-relaxed">
                    {selectedCharacter.backstory || '点击编辑添加人物背景故事'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-midnight rounded-lg p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-forest" />
                    <h3 className="font-medium text-textPrimary">核心动机</h3>
                  </div>
                  <p className="text-textSecondary text-sm leading-relaxed">
                    {selectedCharacter.motivation || '点击编辑添加角色动机'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-midnight rounded-lg p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple" />
                    <h3 className="font-medium text-textPrimary">人物弧光</h3>
                  </div>
                  <p className="text-textSecondary text-sm leading-relaxed">
                    {selectedCharacter.arc || '点击编辑添加人物成长弧线'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-midnight rounded-lg p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Quote className="w-5 h-5 text-amber" />
                    <h3 className="font-medium text-textPrimary">口头禅</h3>
                  </div>
                  <p className="text-amber text-sm italic">
                    "{selectedCharacter.catchphrase || '点击编辑添加口头禅'}"
                  </p>
                </motion.div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-textPrimary mb-3">性格标签</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacter.personality.split('、').map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber/10 text-amber rounded-full text-xs"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-purple" />
                </div>
                <h3 className="text-xl font-display text-textPrimary mb-2">选择一个角色</h3>
                <p className="text-textSecondary text-sm">从左侧列表选择角色查看详情，或创建新角色</p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {(showCreateModal || showEditModal) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-midnightLight rounded-xl p-6 border border-slate/30 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-textPrimary">
                {showCreateModal ? '新建角色' : '编辑角色'}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="p-2 text-textSecondary hover:text-amber transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary text-sm mb-2">角色名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入角色名称"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-textSecondary text-sm mb-2">年龄</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-textSecondary text-sm mb-2">性别</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="input-field"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-textSecondary text-sm mb-2">职业</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  placeholder="输入职业"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-textSecondary text-sm mb-2">性格特点（用顿号分隔）</label>
                <input
                  type="text"
                  value={formData.personality}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="例如：冷静、敏锐、固执"
                  className="input-field"
                />
              </div>
            </div>

            <button
              onClick={handleAIGenerate}
              disabled={!formData.name || isGenerating}
              className="w-full mt-4 mb-6 btn-secondary flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isGenerating ? 'AI正在生成...' : 'AI生成人物小传'}
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-textSecondary text-sm mb-2">人物小传</label>
                <textarea
                  value={formData.backstory}
                  onChange={(e) => setFormData(prev => ({ ...prev, backstory: e.target.value }))}
                  rows={4}
                  placeholder="描述角色的背景故事..."
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-textSecondary text-sm mb-2">核心动机</label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                  rows={3}
                  placeholder="角色追求什么？为什么？"
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-textSecondary text-sm mb-2">人物弧光</label>
                <textarea
                  value={formData.arc}
                  onChange={(e) => setFormData(prev => ({ ...prev, arc: e.target.value }))}
                  rows={3}
                  placeholder="角色如何成长和变化？"
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-textSecondary text-sm mb-2">口头禅</label>
                <input
                  type="text"
                  value={formData.catchphrase}
                  onChange={(e) => setFormData(prev => ({ ...prev, catchphrase: e.target.value }))}
                  placeholder="角色的标志性台词"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={showCreateModal ? handleCreateCharacter : handleUpdateCharacter}
                disabled={!formData.name}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {showCreateModal ? '创建角色' : '保存修改'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CharacterStudio;

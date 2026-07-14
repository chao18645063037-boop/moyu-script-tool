import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Swords,
  Sparkles,
  ArrowUp,
  Users,
  GitBranch,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../api/client';
import { fetchProjectById, fetchCharacters, setCurrentProject } from '../store/projectSlice';
import type { RootState } from '../store';
import type { CharacterRelationship, RelationshipType } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';

const relationshipTypes: { value: RelationshipType; label: string; color: string }[] = [
  { value: 'friend', label: '朋友', color: 'bg-forest' },
  { value: 'enemy', label: '敌人', color: 'bg-red-500' },
  { value: 'family', label: '家人', color: 'bg-amber' },
  { value: 'lover', label: '恋人', color: 'bg-pink-500' },
  { value: 'colleague', label: '同事', color: 'bg-blue-500' },
];

const ConflictLab = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject, characters } = useSelector((state: RootState) => state.projects);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [aiConflicts, setAiConflicts] = useState<string[]>([]);
  const [escalationPath, setEscalationPath] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [relationshipFrom, setRelationshipFrom] = useState<string | null>(null);
  const [relationshipTo, setRelationshipTo] = useState<string | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType>('friend');
  const [characterRelationships, setCharacterRelationships] = useState<CharacterRelationship[]>([]);

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

  const toggleCharacterSelection = (charId: string) => {
    setSelectedCharacters(prev =>
      prev.includes(charId)
        ? prev.filter(id => id !== charId)
        : [...prev, charId]
    );
  };

  const handleGenerateConflicts = async () => {
    if (selectedCharacters.length < 2) return;
    setIsGenerating(true);
    const result = await api.ai.suggestConflict({ characterIds: selectedCharacters });
    setAiConflicts(result.conflicts);
    setEscalationPath(result.escalationPath);
    setIsGenerating(false);
  };

  const handleSetRelationship = () => {
    if (!relationshipFrom || !relationshipTo) return;
    setCharacterRelationships(prev => [
      ...prev,
      {
        id: `rel-${Date.now()}`,
        characterId1: relationshipFrom,
        characterId2: relationshipTo,
        type: selectedRelationship,
        createdAt: new Date(),
      },
    ]);
    setShowRelationshipModal(false);
    setRelationshipFrom(null);
    setRelationshipTo(null);
  };

  const getCharacterById = (id: string) => characters.find(c => c.id === id);

  const getRelationshipsForCharacter = (charId: string) => {
    return characterRelationships.filter(
      r => r.characterId1 === charId || r.characterId2 === charId
    );
  };

  if (!currentProject) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Swords className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-display text-textPrimary mb-2">选择一个项目开始设计冲突</h2>
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
          <h1 className="text-3xl font-display text-textPrimary mb-2">冲突实验室</h1>
          <p className="text-textSecondary">为角色关系设计精彩的冲突与升级路径</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Users className="w-6 h-6 text-amber" />
              角色选择
            </h2>
            <p className="text-textSecondary text-sm mb-4">选择2个或更多角色来分析冲突</p>
            
            {characters.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-textMuted mx-auto mb-3" />
                <p className="text-textSecondary text-sm">还没有角色</p>
              </div>
            ) : (
              <div className="space-y-3">
                {characters.map((character, index) => {
                  const relationships = getRelationshipsForCharacter(character.id);
                  return (
                    <motion.div
                      key={character.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => toggleCharacterSelection(character.id)}
                      className={`p-4 bg-midnight rounded-lg border cursor-pointer transition-all duration-300 ${
                        selectedCharacters.includes(character.id)
                          ? 'border-amber bg-amber/5'
                          : 'border-slate/30 hover:border-amber/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple to-purpleLight rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-textPrimary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-textPrimary">{character.name}</h3>
                          <p className="text-xs text-textMuted">{character.occupation}</p>
                        </div>
                        {selectedCharacters.includes(character.id) && (
                          <div className="w-5 h-5 bg-amber rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {relationships.length > 0 && (
                        <div className="flex flex-wrap gap-1 ml-13">
                          {relationships.map((rel) => {
                            const otherChar = getCharacterById(
                              rel.characterId1 === character.id ? rel.characterId2 : rel.characterId1
                            );
                            const relType = relationshipTypes.find(r => r.value === rel.type);
                            return (
                              <span
                                key={rel.id}
                                className={`px-2 py-0.5 ${relType?.color} text-xs rounded-full text-textPrimary`}
                              >
                                {otherChar?.name}: {relType?.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleGenerateConflicts}
              disabled={selectedCharacters.length < 2 || isGenerating}
              className={`w-full mt-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                selectedCharacters.length >= 2
                  ? 'bg-amber text-midnight hover:bg-amberLight'
                  : 'bg-slate text-textMuted cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {isGenerating ? 'AI分析中...' : '分析冲突'}
            </button>
          </div>

          <div className="card mt-6">
            <h2 className="section-title flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-purple" />
              设置关系
            </h2>
            <p className="text-textSecondary text-sm mb-4">点击两个角色设置他们的关系</p>
            
            <div className="grid grid-cols-2 gap-2">
              {characters.slice(0, 4).map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    if (!relationshipFrom) {
                      setRelationshipFrom(char.id);
                    } else if (relationshipFrom !== char.id) {
                      setRelationshipTo(char.id);
                      setShowRelationshipModal(true);
                    } else {
                      setRelationshipFrom(null);
                    }
                  }}
                  className={`p-3 rounded-lg text-sm text-left transition-all duration-300 ${
                    relationshipFrom === char.id
                      ? 'bg-amber/20 border border-amber text-amber'
                      : 'bg-midnight border border-slate/30 text-textSecondary hover:border-amber/30'
                  }`}
                >
                  {char.name}
                </button>
              ))}
            </div>
            
            {relationshipFrom && (
              <p className="text-xs text-amber mt-3 text-center">
                已选择: {getCharacterById(relationshipFrom)?.name}，点击另一个角色建立关系
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          {aiConflicts.length > 0 ? (
            <div className="space-y-6">
              <div className="card">
                <h2 className="section-title flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  冲突推荐
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiConflicts.map((conflict, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="p-4 bg-midnight rounded-lg border border-red-500/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-xs text-red-400">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-textPrimary">冲突节点</span>
                      </div>
                      <p className="text-textSecondary text-sm">{conflict}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="section-title flex items-center gap-2">
                  <ArrowUp className="w-6 h-6 text-amber" />
                  升级路径
                </h2>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber via-purple to-red-500" />
                  <div className="space-y-6">
                    {escalationPath.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                          index === 0 ? 'bg-amber text-midnight' :
                          index === escalationPath.length - 1 ? 'bg-red-500 text-textPrimary' :
                          'bg-purple text-textPrimary'
                        }`}>
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1 pt-2">
                          <h3 className={`font-medium ${
                            index === 0 ? 'text-amber' : 'text-textPrimary'
                          }`}>
                            {index === 0 ? '起点' : index === escalationPath.length - 1 ? '高潮' : `升级 ${index}`}
                          </h3>
                          <p className="text-textSecondary text-sm">{step}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="section-title flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-forest" />
                  节奏建议
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: '节奏把控', content: '建议每隔3-5场设置一个小冲突，保持观众注意力' },
                    { title: '情感起伏', content: '在激烈冲突后安排情感戏，形成张弛有度的节奏' },
                    { title: '角色成长', content: '每次冲突都应推动角色成长或关系变化' },
                    { title: '悬念设置', content: '在冲突升级时埋下新的悬念钩子' },
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-4 bg-midnight rounded-lg border border-forest/30"
                    >
                      <h3 className="font-medium text-forest mb-1">{tip.title}</h3>
                      <p className="text-textSecondary text-sm">{tip.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-96 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Swords className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-xl font-display text-textPrimary mb-2">选择角色分析冲突</h3>
                <p className="text-textSecondary text-sm">从左侧选择2个或更多角色，AI将为你分析潜在的冲突点和升级路径</p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {showRelationshipModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowRelationshipModal(false); setRelationshipFrom(null); setRelationshipTo(null); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-midnightLight rounded-xl p-6 border border-slate/30"
          >
            <h2 className="text-xl font-display text-textPrimary mb-4">设置角色关系</h2>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-textPrimary" />
                </div>
                <p className="text-textPrimary font-medium">
                  {getCharacterById(relationshipFrom!)?.name}
                </p>
              </div>
              <div className="text-2xl text-amber">↔</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-textPrimary" />
                </div>
                <p className="text-textPrimary font-medium">
                  {getCharacterById(relationshipTo!)?.name}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-textSecondary text-sm mb-3">关系类型</label>
              <div className="grid grid-cols-3 gap-2">
                {relationshipTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedRelationship(type.value)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedRelationship === type.value
                        ? `${type.color} text-textPrimary`
                        : 'bg-midnight border border-slate text-textSecondary hover:border-amber/30'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowRelationshipModal(false); setRelationshipFrom(null); setRelationshipTo(null); }}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button onClick={handleSetRelationship} className="btn-primary flex-1">
                确认
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ConflictLab;

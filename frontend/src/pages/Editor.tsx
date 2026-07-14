import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Save,
  Eye,
  Sparkles,
  Palette,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Users,
  Moon,
  Sun,
  Wand2,
  Loader2,
  Play,
  ListChecks,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { api } from '../api/client';
import {
  fetchProjectById, fetchScenes, createScene, updateScene,
} from '../store/projectSlice';
import type { RootState } from '../store';
import type { LocationType, DialogStyle } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';

const structureTemplates: Record<string, { name: string; acts: string[] }> = {
  three_act: { name: '经典三幕式', acts: ['第一幕：铺垫', '第二幕：对抗', '第三幕：解决'] },
  five_act: { name: '五幕剧作结构', acts: ['第一幕：开端', '第二幕：上升', '第三幕：高潮', '第四幕：下降', '第五幕：结局'] },
  save_the_cat: { name: '救猫咪节拍表', acts: ['开场', '主题呈现', '铺垫', '催化时刻', '争执', '第二幕衔接点', 'B故事', '游戏', '中点', '坏蛋逼近', '一无所有', '灵魂黑夜', '第三幕衔接点', '结局'] },
  multi_line: { name: '多线叙事网', acts: ['主线A', '主线B', '主线C', '交织点'] },
  short_video: { name: '黄金3秒钩子', acts: ['钩子（0-3秒）', '发展（3-15秒）', '高潮（15-25秒）', '收尾（25-30秒）'] },
};

const dialogStyles: { value: DialogStyle; label: string; icon: string }[] = [
  { value: 'humorous', label: '诙谐', icon: '😄' },
  { value: 'subtle', label: '含蓄', icon: '😌' },
  { value: 'powerful', label: '爆发力强', icon: '💥' },
  { value: 'professional', label: '专业术语', icon: '🎯' },
];

const atmosphereKeywords = ['废弃医院', '雨天咖啡馆', '繁华都市夜景', '宁静乡村'];

const genreLabel: Record<string, string> = { commercial: '商业片', artistic: '文艺片', short: '短剧' };

type OutlineScene = { title: string; location: string; timeOfDay: string; characters: string[]; content: string; order: number };

const Editor = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject, scenes } = useSelector((state: RootState) => state.projects);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [showSceneList, setShowSceneList] = useState(true);
  const [showAITools, setShowAITools] = useState(false);
  const [showPolishModal, setShowPolishModal] = useState(false);
  const [showAtmosphereModal, setShowAtmosphereModal] = useState(false);
  const [showOutlinePanel, setShowOutlinePanel] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [outlineScenes, setOutlineScenes] = useState<OutlineScene[]>([]);
  const [generatingSceneIndex, setGeneratingSceneIndex] = useState(-1);
  const [premise, setPremise] = useState('');
  const [sceneContent, setSceneContent] = useState('');
  const [showCreateSceneModal, setShowCreateSceneModal] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newSceneLocation, setNewSceneLocation] = useState<LocationType>('interior');
  const [newSceneTime, setNewSceneTime] = useState('day');
  const [newSceneCharacters, setNewSceneCharacters] = useState('');
  const [dialogText, setDialogText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<DialogStyle>('subtle');
  const [atmoKeywords, setAtmoKeywords] = useState<string[]>(['废弃医院']);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchScenes(currentProject.id));
    }
  }, [currentProject, dispatch]);

  useEffect(() => {
    const sel = scenes.find(s => s.id === selectedSceneId);
    if (sel) setSceneContent(sel.content);
  }, [selectedSceneId, scenes]);

  const handleSaveScene = async () => {
    if (selectedSceneId && sceneContent !== scenes.find(s => s.id === selectedSceneId)?.content) {
      await dispatch(updateScene({ id: selectedSceneId, sceneData: { content: sceneContent } }));
    }
  };

  const handleCreateScene = async () => {
    if (!newSceneTitle.trim()) return;
    const chars = newSceneCharacters.split(',').map(c => c.trim()).filter(Boolean);
    const header = newSceneLocation === 'interior' ? '【内景' : '【外景';
    const timeLabel = newSceneTime === 'day' ? '白天' : newSceneTime === 'night' ? '夜晚' : '黄昏';
    await dispatch(createScene({
      projectId: currentProject?.id || '',
      sceneData: {
        title: newSceneTitle,
        location: newSceneLocation,
        timeOfDay: newSceneTime,
        characters: chars,
        content: `${header} - ${newSceneTitle} - ${timeLabel}】\n\n——待创作——`,
        order: scenes.length + 1,
      },
    }));
    setShowCreateSceneModal(false);
    setNewSceneTitle('');
    setNewSceneCharacters('');
  };

  const handleGenerateOutline = async () => {
    if (!currentProject) return;
    setIsGenerating(true);
    setGeneratingStatus('正在为您的故事设计场景大纲...');
    setOutlineScenes([]);
    try {
      console.log('[Outline] calling generateOutline...');
      const result = await api.ai.generateOutline({
        title: currentProject.title,
        genre: currentProject.genre,
        structure: currentProject.structure,
        premise: premise || undefined,
      });
      console.log('[Outline] result:', result);
      setOutlineScenes(result);
      setGeneratingStatus('');
    } catch (err) {
      console.error('[Outline] error:', err);
      setGeneratingStatus('生成失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateScene = async (outline: OutlineScene, index: number) => {
    if (!currentProject) return;
    setGeneratingSceneIndex(index);
    const prevTitle = index > 0 ? outlineScenes[index - 1]?.content || '' : '';
    const nextTitle = index < outlineScenes.length - 1 ? outlineScenes[index + 1]?.content || '' : '';
    try {
      const content = await api.ai.generateSceneContent({
        title: currentProject.title,
        genre: currentProject.genre,
        sceneTitle: outline.title,
        location: outline.location,
        timeOfDay: outline.timeOfDay,
        characters: outline.characters,
        summary: outline.content,
        previousScene: prevTitle,
        nextScene: nextTitle,
      });
      const result = await dispatch(createScene({
        projectId: currentProject.id,
        sceneData: {
          title: outline.title,
          location: outline.location as LocationType,
          timeOfDay: outline.timeOfDay,
          characters: outline.characters,
          content: content,
          order: scenes.length + index + 1,
        },
      }));
      if (createScene.fulfilled.match(result)) {
        setSelectedSceneId(result.payload.id);
        setSceneContent(content);
      }
    } catch (err) {
      alert('生成失败：' + (err instanceof Error ? err.message : ''));
    } finally {
      setGeneratingSceneIndex(-1);
    }
  };

  const handleGenerateAllScenes = async () => {
    for (let i = 0; i < outlineScenes.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      await handleGenerateScene(outlineScenes[i], i);
    }
  };

  const handleDialogPolish = async () => {
    if (!dialogText.trim()) return;
    setIsGenerating(true);
    setShowPolishModal(true);
    try {
      const result = await api.ai.polishDialog({ text: dialogText, style: selectedStyle });
      setAiResult(result.rewrittenText);
    } catch (err) {
      setAiResult('润色失败：' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAtmosphere = async () => {
    setIsGenerating(true);
    setShowAtmosphereModal(true);
    try {
      const result = await api.ai.generateAtmosphere({ keywords: atmoKeywords });
      setAiResult(result.description + '\n\n——' + result.visualMetaphor);
    } catch (err) {
      setAiResult('生成失败：' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertText = (text: string) => {
    setSceneContent(prev => prev + '\n\n' + text);
    setShowPolishModal(false);
    setShowAtmosphereModal(false);
  };

  const selectedScene = scenes.find(s => s.id === selectedSceneId);

  if (!currentProject) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-amber" />
          </div>
          <h2 className="text-xl font-display text-textPrimary mb-2">选择一个项目开始编辑</h2>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">返回仪表盘</button>
        </motion.div>
      </div>
    );
  }

  const template = structureTemplates[currentProject.structure] || structureTemplates.three_act;

  return (
    <div className="flex h-screen">
      {/* Left sidebar — scene list */}
      <div className={`flex flex-col w-64 bg-midnightLight border-r border-slate/30 transition-all duration-300 ${showSceneList ? '' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-slate/30">
          <h2 className="text-lg font-display text-textPrimary mb-1">{currentProject.title}</h2>
          <p className="text-xs text-textMuted">{template.name} · {genreLabel[currentProject.genre] || currentProject.genre}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {template.acts.map((act, actIndex) => (
              <div key={actIndex}>
                <button className="w-full flex items-center justify-between p-2 text-textSecondary hover:text-amber transition-colors">
                  <span className="text-sm font-medium">{act}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="ml-4 space-y-1">
                  {scenes.filter((_, idx) => Math.floor(idx / 4) === actIndex).map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => setSelectedSceneId(scene.id)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-all duration-300 ${
                        selectedSceneId === scene.id
                          ? 'bg-amber/10 text-amber border border-amber/30'
                          : 'text-textSecondary hover:text-textPrimary hover:bg-midnight'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${scene.location === 'interior' ? 'bg-forest' : 'bg-purple'}`} />
                        <span className="truncate">{scene.title}</span>
                      </div>
                      <div className="text-xs text-textMuted mt-1">
                        {scene.location === 'interior' ? '内景' : '外景'} · {scene.timeOfDay === 'day' ? '白天' : scene.timeOfDay === 'night' ? '夜晚' : '黄昏'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate/30 space-y-2">
          <button onClick={() => setShowOutlinePanel(true)} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            <Wand2 className="w-5 h-5" /> AI全自动生成
          </button>
          <button onClick={() => setShowCreateSceneModal(true)} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> 手动新建场景
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-midnightLight border-b border-slate/30">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSceneList(!showSceneList)} className="p-2 text-textSecondary hover:text-amber transition-colors">
              {showSceneList ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowAITools(!showAITools)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                showAITools ? 'bg-purple text-textPrimary' : 'bg-midnight border border-slate text-textSecondary hover:border-amber'
              }`}
            >
              <Sparkles className="w-4 h-4" /> AI辅助工具
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost flex items-center gap-2"><Eye className="w-5 h-5" />预览</button>
            <button onClick={handleSaveScene} className="btn-secondary flex items-center gap-2"><Save className="w-5 h-5" />保存</button>
          </div>
        </div>

        {/* AI tool panel */}
        <AnimatePresence>
          {showAITools && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-midnight border-b border-slate/30 overflow-hidden">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dialog polish panel */}
                <div className="p-4 bg-midnightLight rounded-lg border border-slate/30">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-amber" /><span className="text-sm font-medium text-textPrimary">对话润色</span>
                  </div>
                  <textarea value={dialogText} onChange={(e) => setDialogText(e.target.value)}
                    placeholder="输入需要润色的台词..." className="w-full h-20 bg-midnight border border-slate rounded-lg p-3 text-textPrimary text-sm mb-3 resize-none" />
                  <div className="flex flex-wrap gap-2 mb-3">
                    {dialogStyles.map((s) => (
                      <button key={s.value} onClick={() => setSelectedStyle(s.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedStyle === s.value ? 'bg-amber/20 text-amber border border-amber/30' : 'bg-midnight border border-slate text-textSecondary hover:border-amber'}`}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleDialogPolish} disabled={isGenerating || !dialogText.trim()}
                    className="btn-primary w-full text-sm">润色台词</button>
                </div>

                {/* Atmosphere panel */}
                <div className="p-4 bg-midnightLight rounded-lg border border-slate/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-5 h-5 text-purple" /><span className="text-sm font-medium text-textPrimary">氛围描摹</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {atmosphereKeywords.map((kw) => (
                      <button key={kw} onClick={() => setAtmoKeywords(prev => prev[0] === kw ? prev : [kw])}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${atmoKeywords[0] === kw ? 'bg-purple/20 text-purple border border-purple/30' : 'bg-midnight border border-slate text-textSecondary hover:border-purple'}`}>
                        {kw}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleAtmosphere} disabled={isGenerating}
                    className="btn-primary w-full text-sm">生成氛围描写</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor body */}
        <div className="flex-1 flex">
          <div className="flex-1 p-8">
            {selectedScene ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedScene.location === 'interior' ? 'bg-forest/20 text-forestLight' : 'bg-purple/20 text-purpleLight'}`}>
                    {selectedScene.location === 'interior' ? '内景' : '外景'}
                  </span>
                  <span className="px-3 py-1 bg-midnightLight rounded-full text-xs text-textSecondary">
                    {selectedScene.timeOfDay === 'day' ? '白天' : selectedScene.timeOfDay === 'night' ? '夜晚' : '黄昏'}
                  </span>
                  <div className="flex items-center gap-2 text-textSecondary">
                    <Users className="w-4 h-4" /><span className="text-sm">{selectedScene.characters.join(', ')}</span>
                  </div>
                </div>
                <textarea ref={textareaRef} value={sceneContent} onChange={(e) => setSceneContent(e.target.value)}
                  className="w-full h-[calc(100%-80px)] bg-transparent text-textPrimary text-lg leading-relaxed resize-none focus:outline-none font-body"
                  placeholder="开始编写剧本内容..." />
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <div className="w-16 h-16 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="w-8 h-8 text-amber" />
                  </div>
                  <h3 className="text-lg font-display text-textPrimary mb-2">开始你的创作</h3>
                  <p className="text-textSecondary text-sm mb-6">点击左侧「AI全自动生成」由AI自动创建场景大纲并生成内容<br />或点击「手动新建场景」自行创建</p>
                  <button onClick={() => setShowOutlinePanel(true)} className="btn-primary flex items-center gap-2 mx-auto">
                    <Wand2 className="w-5 h-5" /> AI全自动生成
                  </button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Right info panel */}
          <div className="w-72 bg-midnightLight border-l border-slate/30 p-4 overflow-y-auto">
            <h3 className="font-display text-textPrimary mb-4">场景信息</h3>
            {selectedScene && (
              <div className="space-y-4">
                <div><label className="block text-textSecondary text-xs mb-1">场景标题</label><input type="text" value={selectedScene.title} className="input-field text-sm" readOnly /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-textSecondary text-xs mb-1">场景类型</label>
                    <div className={`p-2 rounded-lg text-xs text-center ${selectedScene.location === 'interior' ? 'bg-forest/20 text-forestLight' : 'bg-purple/20 text-purpleLight'}`}>{selectedScene.location === 'interior' ? '内景' : '外景'}</div>
                  </div>
                  <div><label className="block text-textSecondary text-xs mb-1">时间</label>
                    <div className="p-2 rounded-lg text-xs text-center bg-midnight text-textSecondary">{selectedScene.timeOfDay === 'day' ? '白天' : selectedScene.timeOfDay === 'night' ? '夜晚' : '黄昏'}</div>
                  </div>
                </div>
                <div><label className="block text-textSecondary text-xs mb-1">出场角色</label>
                  <div className="flex flex-wrap gap-1">{selectedScene.characters.map((c) => (<span key={c} className="px-2 py-1 bg-midnight rounded text-xs text-textSecondary">{c}</span>))}</div>
                </div>
                <div><label className="block text-textSecondary text-xs mb-1">字数统计</label>
                  <div className="p-3 bg-midnight rounded-lg"><p className="text-2xl font-display text-amber">{sceneContent.length}</p><p className="text-xs text-textMuted">字符</p></div>
                </div>
              </div>
            )}

            {/* Writer's block rescue */}
            <div className="mt-8">
              <h3 className="font-display text-textPrimary mb-4 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-amber" /> 卡文救援</h3>
              <div className="space-y-3">
                {['意外干扰', '情感爆发', '秘密揭露'].map((type, index) => (
                  <motion.button key={type} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        const suggestions = await api.ai.getPlotSuggestions(currentProject.genre, '');
                        const suggestion = suggestions.find(s => s.type === (type === '意外干扰' ? 'surprise' : type === '情感爆发' ? 'emotional' : 'reveal'));
                        if (suggestion) {
                          setAiResult(suggestion.description);
                          setShowPolishModal(true);
                        }
                      } finally { setIsGenerating(false); }
                    }}
                    className="w-full p-3 bg-midnight border border-slate/30 rounded-lg text-left hover:border-amber/30 transition-all">
                    <p className="text-sm text-textPrimary">{type}</p>
                    <p className="text-xs text-textMuted mt-1">点击获取剧情发展建议</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outline panel */}
      {showOutlinePanel && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOutlinePanel(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] bg-midnightLight rounded-xl border border-slate/30 flex flex-col">
            <div className="p-6 border-b border-slate/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple/20 rounded-xl flex items-center justify-center"><Wand2 className="w-5 h-5 text-purpleLight" /></div>
                  <div>
                    <h2 className="text-xl font-display text-textPrimary">AI 自动生成</h2>
                    <p className="text-xs text-textMuted">为《{currentProject.title}》生成完整的场次大纲</p>
                  </div>
                </div>
                <button onClick={() => setShowOutlinePanel(false)} className="text-textMuted hover:text-textPrimary p-2">✕</button>
              </div>
            </div>

              <div className="flex-1 overflow-y-auto p-6">
                {!isGenerating && outlineScenes.length === 0 && !generatingStatus && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-textSecondary text-sm mb-2">故事前提（可选，留空则由AI自由发挥）</label>
                      <textarea value={premise} onChange={(e) => setPremise(e.target.value)}
                        placeholder="例：一个被冤枉的警察为了洗清罪名，不得不在24小时内找到真凶..."
                        className="input-field h-24 resize-none text-sm" />
                    </div>
                    <button onClick={handleGenerateOutline} disabled={isGenerating}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
                      <Wand2 className="w-5 h-5" /> 生成完整大纲
                    </button>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-amber animate-spin mb-4" />
                    <p className="text-textSecondary">{generatingStatus || 'AI 正在思考...'}</p>
                  </div>
                )}

                {outlineScenes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-amber" />
                        <span className="text-textPrimary font-medium">共 {outlineScenes.length} 个场次</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleGenerateOutline} disabled={isGenerating}
                          className="btn-ghost text-sm flex items-center gap-1"><RefreshCw className="w-4 h-4" />重新生成</button>
                        <button onClick={handleGenerateAllScenes} disabled={isGenerating || generatingSceneIndex >= 0}
                          className="btn-primary text-sm flex items-center gap-2"><Play className="w-4 h-4" />一键生成全部</button>
                      </div>
                    </div>

                    {outlineScenes.map((scene, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-3 bg-midnight rounded-lg border border-slate/30 hover:border-amber/30 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${scene.location === 'interior' ? 'bg-forest' : 'bg-purple'}`} />
                              <span className="text-sm font-medium text-textPrimary truncate">{scene.order}. {scene.title}</span>
                              <span className="text-xs text-textMuted shrink-0">
                                {scene.location === 'interior' ? '内景' : '外景'} · {scene.timeOfDay}
                              </span>
                            </div>
                            <p className="text-xs text-textSecondary line-clamp-2 mb-1">{scene.content}</p>
                            <span className="text-xs text-textMuted">人物：{scene.characters.join('、')}</span>
                          </div>
                          <button
                            onClick={() => handleGenerateScene(scene, i)}
                            disabled={generatingSceneIndex >= 0 || scenes.some(s => s.title === scene.title)}
                            className="btn-primary text-xs px-3 py-1.5 shrink-0 flex items-center gap-1 disabled:opacity-50"
                          >
                            {generatingSceneIndex === i ? (
                              <><Loader2 className="w-3 h-3 animate-spin" />生成中</>
                            ) : scenes.some(s => s.title === scene.title) ? (
                              <><FileText className="w-3 h-3" />已生成</>
                            ) : (
                              <><Play className="w-3 h-3" />生成此场</>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!isGenerating && generatingStatus && outlineScenes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-red-400">{generatingStatus}</p>
                    <button onClick={() => setGeneratingStatus('')} className="btn-secondary mt-4 text-sm">返回重试</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Create scene modal */}
      {showCreateSceneModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateSceneModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-midnightLight rounded-xl p-6 border border-slate/30">
            <h2 className="text-xl font-display text-textPrimary mb-6">新建场景</h2>
            <div className="space-y-4">
              <div><label className="block text-textSecondary text-sm mb-2">场景标题</label><input type="text" value={newSceneTitle} onChange={(e) => setNewSceneTitle(e.target.value)} placeholder="例如：咖啡馆内" className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-textSecondary text-sm mb-2">场景类型</label>
                  <div className="flex gap-2">
                    <button onClick={() => setNewSceneLocation('interior')} className={`flex-1 py-2 rounded-lg text-sm ${newSceneLocation === 'interior' ? 'bg-forest text-textPrimary' : 'bg-midnight border border-slate text-textSecondary'}`}>内景</button>
                    <button onClick={() => setNewSceneLocation('exterior')} className={`flex-1 py-2 rounded-lg text-sm ${newSceneLocation === 'exterior' ? 'bg-purple text-textPrimary' : 'bg-midnight border border-slate text-textSecondary'}`}>外景</button>
                  </div>
                </div>
                <div><label className="block text-textSecondary text-sm mb-2">时间</label>
                  <div className="flex gap-2">
                    <button onClick={() => setNewSceneTime('day')} className={`flex-1 py-2 rounded-lg text-sm ${newSceneTime === 'day' ? 'bg-amber text-midnight' : 'bg-midnight border border-slate text-textSecondary'}`}><Sun className="w-4 h-4 mx-auto" /></button>
                    <button onClick={() => setNewSceneTime('night')} className={`flex-1 py-2 rounded-lg text-sm ${newSceneTime === 'night' ? 'bg-purple text-textPrimary' : 'bg-midnight border border-slate text-textSecondary'}`}><Moon className="w-4 h-4 mx-auto" /></button>
                  </div>
                </div>
              </div>
              <div><label className="block text-textSecondary text-sm mb-2">出场角色（逗号分隔）</label><input type="text" value={newSceneCharacters} onChange={(e) => setNewSceneCharacters(e.target.value)} placeholder="李明, 张强" className="input-field" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateSceneModal(false)} className="btn-secondary flex-1">取消</button>
              <button onClick={handleCreateScene} className="btn-primary flex-1">创建</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Results modal */}
      {(showPolishModal || showAtmosphereModal) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowPolishModal(false); setShowAtmosphereModal(false); }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-midnightLight rounded-xl p-6 border border-slate/30">
            <h2 className="text-xl font-display text-textPrimary mb-4">{showPolishModal ? 'AI对话润色结果' : 'AI氛围描摹结果'}</h2>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-amber animate-spin" />
                <span className="ml-4 text-textSecondary">AI正在思考...</span>
              </div>
            ) : (
              <>
                <div className="bg-midnight rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                  <pre className="text-textPrimary whitespace-pre-wrap text-sm leading-relaxed">{aiResult}</pre>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowPolishModal(false); setShowAtmosphereModal(false); }} className="btn-secondary flex-1">取消</button>
                  <button onClick={() => handleInsertText(aiResult)} className="btn-primary flex-1">插入到剧本</button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Editor;

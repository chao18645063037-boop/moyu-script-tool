import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Key, CheckCircle2, AlertTriangle, ExternalLink, Shield, Trash2, Eye, EyeOff } from 'lucide-react';
import type { RootState } from '../store';
import { getConfig, saveConfig, clearConfig, hasConfig } from '../utils/config';
import type { UserConfig } from '../utils/config';

const providers = [
  {
    value: 'deepseek' as const,
    label: 'DeepSeek',
    desc: '性价比最高，中文创作能力强，注册送500万token',
    url: 'https://platform.deepseek.com/api_keys',
    model: 'deepseek-chat',
  },
  {
    value: 'openai' as const,
    label: 'OpenAI',
    desc: '全球领先，创意写作出色',
    url: 'https://platform.openai.com/api-keys',
    model: 'gpt-4o-mini',
  },
  {
    value: 'qwen' as const,
    label: '通义千问',
    desc: '阿里出品，中文理解深入',
    url: 'https://dashscope.console.aliyun.com/apiKey',
    model: 'qwen-plus',
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [provider, setProvider] = useState<UserConfig['provider']>('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    const existing = getConfig();
    if (existing) {
      setProvider(existing.provider);
      setApiKey(existing.apiKey);
    }
  }, []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    if (!apiKey.trim()) return;
    saveConfig({ provider, apiKey: apiKey.trim() });
    setSaved(true);
    setTestResult('idle');
    setTestError('');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearConfig();
    setApiKey('');
    setProvider('deepseek');
    setTestResult('idle');
    setTestError('');
  };

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTestResult('testing');
    setTestError('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateAtmosphere',
          apiKey: apiKey.trim(),
          provider,
          params: { keywords: ['测试'] },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult('success');
      } else {
        setTestResult('fail');
        setTestError(data.error || '测试失败');
      }
    } catch (err) {
      setTestResult('fail');
      setTestError(err instanceof Error ? err.message : '网络错误');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-purple/20 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-purpleLight" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-textPrimary">AI 模型配置</h1>
            <p className="text-textSecondary text-sm mt-1">配置您的大模型 API Key，解锁全部 AI 创作能力</p>
          </div>
        </div>

        <div className="card mb-6 bg-amber/5 border-amber/30">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber mb-1">您的 API Key 绝对安全</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                API Key 仅存储在您浏览器的本地存储（localStorage）中，每次请求直接通过我们的转发服务器发送给大模型。
                服务器不记录、不存储您的任何密钥信息。
              </p>
            </div>
          </div>
        </div>

        <div className="card space-y-5">
          <div>
            <label className="block text-textSecondary text-sm mb-3">AI 服务商</label>
            <div className="grid grid-cols-1 gap-3">
              {providers.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setProvider(p.value); setTestResult('idle'); }}
                  className={`p-4 rounded-lg border text-left transition-all duration-300 ${
                    provider === p.value
                      ? 'border-amber bg-amber/5'
                      : 'border-slate/30 bg-midnight hover:border-slate'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-textPrimary font-medium">{p.label}</span>
                      <span className="text-textMuted text-xs ml-2">({p.model})</span>
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-amber hover:underline flex items-center gap-1"
                    >
                      获取 Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-textSecondary mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-textSecondary text-sm mb-2">API Key</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestResult('idle'); }}
                placeholder="请输入您的 API Key（如 sk-xxx...）"
                className="input-field pl-12 pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-amber transition-colors"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {testResult !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                testResult === 'testing' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' :
                testResult === 'success' ? 'bg-forest/10 border border-forest/30 text-forestLight' :
                'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {testResult === 'testing' && <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />}
              {testResult === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {testResult === 'fail' && <AlertTriangle className="w-4 h-4" />}
              {testResult === 'testing' && '正在测试连接...'}
              {testResult === 'success' && '连接成功！您的 API Key 配置正确。'}
              {testResult === 'fail' && `测试失败：${testError}`}
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={!apiKey.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saved ? <CheckCircle2 className="w-5 h-5" /> : null}
              {saved ? '已保存' : '保存配置'}
            </button>
            <button onClick={handleTest} disabled={!apiKey.trim() || testResult === 'testing'} className="btn-secondary flex items-center gap-2">
              测试连接
            </button>
            {hasConfig() && (
              <button onClick={handleClear} className="btn-ghost text-red-400 hover:text-red-300 flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
                清除
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

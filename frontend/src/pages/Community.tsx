import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Heart,
  Eye,
  Share2,
  Plus,
  User,
  Clock,
  Shield,
  GitBranch,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { api } from '../api/client';
import type { Post, Comment } from '../types';

const challengeThemes = [
  { id: 'challenge-1', title: '悬疑微短剧', description: '创作一个3分钟的悬疑短剧剧本', deadline: '2024-04-30', participants: 128 },
  { id: 'challenge-2', title: '情感独白', description: '写一段触动人心的角色独白', deadline: '2024-04-25', participants: 89 },
];

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.community.getPosts().then(setPosts);
  }, []);

  useEffect(() => {
    if (selectedPost) {
      api.community.getComments(selectedPost.id).then(setComments);
    }
  }, [selectedPost]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    setIsLoading(true);
    const newPost = await api.community.createPost({
      title: newPostTitle,
      content: newPostContent,
      isAnonymous,
    });
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
    setNewPostTitle('');
    setNewPostContent('');
    setIsAnonymous(false);
    setIsLoading(false);
  };

  const handleCreateComment = async () => {
    if (!newCommentContent.trim() || !selectedPost) return;
    const newComment = await api.community.createComment(selectedPost.id, {
      content: newCommentContent,
      isAnonymous,
    });
    setComments(prev => [...prev, newComment]);
    setNewCommentContent('');
  };

  const getRandomUser = () => {
    const users = ['编剧小王', '故事匠人', '灵感捕手', '文字魔法师'];
    return users[Math.floor(Math.random() * users.length)];
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-display text-textPrimary mb-2">社区广场</h1>
          <p className="text-textSecondary">与其他创作者分享作品，互相学习成长</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          发布作品
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber" />
              季度创作挑战赛
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challengeThemes.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-amber/10 to-purple/10 rounded-lg border border-amber/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-textPrimary">{challenge.title}</h3>
                    <Sparkles className="w-5 h-5 text-amber" />
                  </div>
                  <p className="text-textSecondary text-sm mb-3">{challenge.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-textMuted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {challenge.deadline}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {challenge.participants}人参与
                      </span>
                    </div>
                    <button className="text-amber hover:underline">立即参与</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-purple" />
              剧本接龙
            </h2>
            <div className="p-6 bg-gradient-to-br from-purple/10 to-forest/10 rounded-lg border border-purple/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple rounded-full flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-textPrimary" />
                </div>
                <div>
                  <h3 className="font-display text-textPrimary">《雨夜迷踪》接龙中</h3>
                  <p className="text-sm text-textSecondary">已有12位创作者参与</p>
                </div>
              </div>
              <p className="text-textSecondary text-sm mb-4 line-clamp-3">
                李明推开门，一股潮湿的气息扑面而来。走廊尽头的灯光忽明忽暗，仿佛在诉说着什么不可告人的秘密...
              </p>
              <div className="flex items-center gap-3">
                <button className="btn-primary flex-1">继续接龙</button>
                <button className="btn-secondary">查看完整剧情</button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="section-title flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-amber" />
              最新动态
            </h2>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPost(post)}
                  className="card cursor-pointer hover:border-amber/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber to-amberLight rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-midnight" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-textPrimary">{getRandomUser()}</h3>
                        {post.isAnonymous && (
                          <Shield className="w-4 h-4 text-textMuted" />
                        )}
                      </div>
                      <p className="text-xs text-textMuted">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-display text-textPrimary mb-2">{post.title}</h3>
                  <p className="text-textSecondary text-sm line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate/30">
                    <button className="flex items-center gap-2 text-textSecondary hover:text-amber transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{Math.floor(Math.random() * 50)}</span>
                    </button>
                    <button className="flex items-center gap-2 text-textSecondary hover:text-amber transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{comments.length}</span>
                    </button>
                    <button className="flex items-center gap-2 text-textSecondary hover:text-amber transition-colors">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{Math.floor(Math.random() * 200)}</span>
                    </button>
                    <button className="flex items-center gap-2 text-textSecondary hover:text-amber transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">分享</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber" />
              热门话题
            </h2>
            <div className="space-y-3">
              {['#悬疑反转', '#情感共鸣', '#角色成长', '#视觉盛宴', '#对话技巧'].map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-midnight rounded-lg hover:bg-midnightLight cursor-pointer transition-colors"
                >
                  <span className="text-textPrimary">{tag}</span>
                  <span className="text-xs text-textMuted">{Math.floor(Math.random() * 500) + 100} 讨论</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber" />
              积分兑换
            </h2>
            <div className="space-y-3">
              {[
                { name: '高级AI模型', points: 500, icon: '🚀' },
                { name: '专属封面模板', points: 300, icon: '🎨' },
                { name: '剧本排版服务', points: 200, icon: '📄' },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-midnight rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm text-textPrimary">{item.name}</p>
                      <p className="text-xs text-textMuted">{item.points} 积分</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-amber/20 text-amber rounded-lg text-xs hover:bg-amber/30 transition-colors">
                    兑换
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {selectedPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display text-textPrimary">评论详情</h2>
                <button onClick={() => setSelectedPost(null)} className="text-textMuted hover:text-amber">
                  关闭
                </button>
              </div>
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-midnight rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-textPrimary" />
                      </div>
                      <span className="text-sm text-textSecondary">匿名用户</span>
                    </div>
                    <p className="text-textPrimary text-sm">{comment.content}</p>
                  </motion.div>
                ))}
                {comments.length === 0 && (
                  <p className="text-textMuted text-sm text-center py-4">暂无评论，来发表第一条吧！</p>
                )}
                <div className="pt-4 border-t border-slate/30">
                  <textarea
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="写下你的评论..."
                    className="input-field text-sm mb-3"
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-textSecondary text-sm">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-slate bg-midnight text-amber focus:ring-amber"
                      />
                      匿名发表
                    </label>
                    <button
                      onClick={handleCreateComment}
                      disabled={!newCommentContent.trim()}
                      className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-midnightLight rounded-xl p-6 border border-slate/30"
          >
            <h2 className="text-xl font-display text-textPrimary mb-6">发布作品</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-textSecondary text-sm mb-2">标题</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="输入作品标题"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-textSecondary text-sm mb-2">内容</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="分享你的作品片段或创作心得..."
                  className="input-field resize-none"
                  rows={8}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-textSecondary">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate bg-midnight text-amber focus:ring-amber"
                  />
                  <Shield className="w-4 h-4" />
                  匿名发布
                </label>
                <span className="text-xs text-textMuted flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  发布优质内容可获得积分奖励
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                取消
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || isLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isLoading && <div className="w-5 h-5 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />}
                {isLoading ? '发布中...' : '发布'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Community;
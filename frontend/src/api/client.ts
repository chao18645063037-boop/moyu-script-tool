import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Project,
  Scene,
  Character,
  AICharacterRequest,
  AICharacterResponse,
  AIDialogRequest,
  AIDialogResponse,
  AIAtmosphereRequest,
  AIAtmosphereResponse,
  AIConflictRequest,
  AIConflictResponse,
  Post,
  Comment,
  Achievement,
  UserAchievement,
  PlotSuggestion,
  AnalyticsData,
  Genre,
  Structure,
} from '../types';
import { getConfig } from '../utils/config';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockUser = {
  id: 'user-1',
  email: 'writer@example.com',
  nickname: '编剧大师',
  points: 1250,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
};

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    userId: 'user-1',
    title: '暗夜追逐',
    genre: 'commercial',
    structure: 'three_act',
    status: 'in_progress',
    wordCount: 15680,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
  },
  {
    id: 'proj-2',
    userId: 'user-1',
    title: '咖啡馆的时光',
    genre: 'artistic',
    structure: 'five_act',
    status: 'draft',
    wordCount: 3200,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
  },
  {
    id: 'proj-3',
    userId: 'user-1',
    title: '外卖小哥',
    genre: 'short',
    structure: 'short_video',
    status: 'completed',
    wordCount: 850,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
  },
];

const mockScenes: Record<string, Scene[]> = {
  'proj-1': [
    {
      id: 'scene-1',
      projectId: 'proj-1',
      title: '废弃仓库',
      location: 'exterior',
      timeOfDay: 'night',
      characters: ['李明', '张强'],
      content: '【废弃仓库外】\n\n雨夜。废弃仓库的铁皮门在风中吱呀作响。\n\n李明：（压低声音）他就在里面。\n\n张强：确定吗？\n\n李明：我亲眼看见的。',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'scene-2',
      projectId: 'proj-1',
      title: '仓库内部',
      location: 'interior',
      timeOfDay: 'night',
      characters: ['李明', '张强', '神秘人'],
      content: '【仓库内部】\n\n昏暗的灯光下，神秘人背对着门口站着。\n\n神秘人：你们不该来的。\n\n李明：把东西交出来！',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

const mockCharacters: Record<string, Character[]> = {
  'proj-1': [
    {
      id: 'char-1',
      projectId: 'proj-1',
      name: '李明',
      age: 32,
      gender: 'male',
      occupation: '侦探',
      personality: '冷静、敏锐、固执',
      backstory: '曾是警队精英，因调查一起冤案被开除，如今以私人侦探为生。',
      motivation: '查明真相，为自己正名',
      arc: '从孤独的复仇者成长为懂得信任他人的守护者',
      catchphrase: '真相总会浮出水面',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'char-2',
      projectId: 'proj-1',
      name: '张强',
      age: 28,
      gender: 'male',
      occupation: '前警察',
      personality: '热血、冲动、忠诚',
      backstory: '李明的前搭档，一直相信李明是无辜的，暗中帮助他。',
      motivation: '帮助好友，维护正义',
      arc: '从冲动的愣头青成长为成熟的战士',
      catchphrase: '我罩着你！',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

const mockPosts: Post[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    title: '分享我的悬疑短片剧本',
    content: '这是我花了三个月写的悬疑短片剧本，希望能得到大家的点评...',
    isAnonymous: false,
    createdAt: new Date(),
  },
  {
    id: 'post-2',
    userId: 'user-3',
    title: '求助：如何写好对话？',
    content: '写对话总是显得很生硬，有没有什么技巧可以分享？',
    isAnonymous: true,
    createdAt: new Date(Date.now() - 86400000),
  },
];

const mockComments: Record<string, Comment[]> = {
  'post-1': [
    {
      id: 'comment-1',
      postId: 'post-1',
      userId: 'user-4',
      content: '开头的悬念设置得很好！',
      isAnonymous: false,
      createdAt: new Date(),
    },
  ],
};

const mockAchievements: Achievement[] = [
  { id: 'ach-1', name: '处女作完成', description: '完成你的第一个剧本', icon: '🎬', condition: '完成一个项目', points: 100 },
  { id: 'ach-2', name: '百场达人', description: '创作超过100场戏', icon: '📖', condition: '创建100个场景', points: 200 },
  { id: 'ach-3', name: '百万字里程碑', description: '累计创作超过100万字', icon: '🏆', condition: '累计字数1000000', points: 500 },
  { id: 'ach-4', name: '连续30天日更', description: '连续30天每天更新', icon: '🔥', condition: '连续更新30天', points: 300 },
  { id: 'ach-5', name: '最受欢迎角色', description: '创建的角色获得最多点赞', icon: '⭐', condition: '角色获赞100+', points: 400 },
];

const mockUserAchievements: UserAchievement[] = [
  { id: 'ua-1', userId: 'user-1', achievementId: 'ach-1', unlockedAt: new Date('2024-02-15'), progress: 100 },
  { id: 'ua-2', userId: 'user-1', achievementId: 'ach-2', unlockedAt: undefined, progress: 35 },
  { id: 'ua-3', userId: 'user-1', achievementId: 'ach-4', unlockedAt: undefined, progress: 12 },
];

async function callAI(action: string, params: Record<string, unknown>): Promise<unknown> {
  const config = getConfig();
  if (!config) {
    throw new Error('请先在设置页面配置 AI 模型 API Key');
  }

  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      apiKey: config.apiKey,
      provider: config.provider,
      params,
    }),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || 'AI 请求失败');
  }

  return data.data;
}

export const api = {
  auth: {
    login: async (_data: LoginRequest): Promise<AuthResponse> => {
      await delay(800);
      return { accessToken: 'mock-token-123', user: mockUser };
    },
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      await delay(800);
      return { accessToken: 'mock-token-456', user: { ...mockUser, email: data.email, nickname: data.nickname } };
    },
    getProfile: async (): Promise<typeof mockUser> => {
      await delay(300);
      return mockUser;
    },
  },
  projects: {
    getAll: async (): Promise<Project[]> => {
      await delay(500);
      return mockProjects;
    },
    getById: async (id: string): Promise<Project | undefined> => {
      await delay(300);
      return mockProjects.find(p => p.id === id);
    },
    create: async (data: { title: string; genre: Genre; structure: Structure }): Promise<Project> => {
      await delay(500);
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        userId: 'user-1',
        title: data.title,
        genre: data.genre,
        structure: data.structure,
        status: 'draft',
        wordCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProjects.unshift(newProject);
      return newProject;
    },
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      await delay(300);
      const project = mockProjects.find(p => p.id === id);
      if (project) {
        return { ...project, ...data, updatedAt: new Date() };
      }
      throw new Error('Project not found');
    },
    delete: async (_id: string): Promise<void> => {
      await delay(300);
    },
  },
  scenes: {
    getByProject: async (projectId: string): Promise<Scene[]> => {
      await delay(300);
      return mockScenes[projectId] || [];
    },
    create: async (projectId: string, data: Omit<Scene, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<Scene> => {
      await delay(300);
      const newScene: Scene = {
        id: `scene-${Date.now()}`,
        projectId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (!mockScenes[projectId]) mockScenes[projectId] = [];
      mockScenes[projectId].push(newScene);
      return newScene;
    },
    update: async (id: string, data: Partial<Scene>): Promise<Scene> => {
      await delay(300);
      for (const scenes of Object.values(mockScenes)) {
        const scene = scenes.find(s => s.id === id);
        if (scene) {
          return { ...scene, ...data, updatedAt: new Date() };
        }
      }
      throw new Error('Scene not found');
    },
    delete: async (_id: string): Promise<void> => {
      await delay(300);
    },
  },
  characters: {
    getByProject: async (projectId: string): Promise<Character[]> => {
      await delay(300);
      return mockCharacters[projectId] || [];
    },
    create: async (projectId: string, data: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'backstory' | 'motivation' | 'arc' | 'catchphrase'>): Promise<Character> => {
      await delay(300);
      const newChar: Character = {
        id: `char-${Date.now()}`,
        projectId,
        ...data,
        backstory: '',
        motivation: '',
        arc: '',
        catchphrase: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (!mockCharacters[projectId]) mockCharacters[projectId] = [];
      mockCharacters[projectId].push(newChar);
      return newChar;
    },
    update: async (id: string, data: Partial<Character>): Promise<Character> => {
      await delay(300);
      for (const chars of Object.values(mockCharacters)) {
        const char = chars.find(c => c.id === id);
        if (char) {
          return { ...char, ...data, updatedAt: new Date() };
        }
      }
      throw new Error('Character not found');
    },
    delete: async (_id: string): Promise<void> => {
      await delay(300);
    },
  },
  ai: {
    generateCharacter: async (data: AICharacterRequest): Promise<AICharacterResponse> => {
      return await callAI('generateCharacter', {
        name: data.name,
        age: data.age,
        gender: data.gender,
        occupation: data.occupation,
        personality: data.personality,
      }) as AICharacterResponse;
    },
    polishDialog: async (data: AIDialogRequest): Promise<AIDialogResponse> => {
      const result = await callAI('polishDialog', {
        text: data.text,
        style: data.style,
      }) as { content: string };
      return { rewrittenText: result.content || '' };
    },
    generateAtmosphere: async (data: AIAtmosphereRequest): Promise<AIAtmosphereResponse> => {
      return await callAI('generateAtmosphere', {
        keywords: data.keywords,
      }) as AIAtmosphereResponse;
    },
    suggestConflict: async (data: AIConflictRequest): Promise<AIConflictResponse> => {
      return await callAI('suggestConflict', {
        characters: data.characters.map((c: { name: string; relationship: string }) => ({
          name: c.name,
          relationship: c.relationship,
        })),
      }) as AIConflictResponse;
    },
    getPlotSuggestions: async (genre: string, currentPlot: string): Promise<PlotSuggestion[]> => {
      const result = await callAI('suggestPlot', { genre, currentPlot }) as Array<{ type: string; title: string; description: string }>;
      return result.map((item, index) => ({
        id: `plot-${Date.now()}-${index}`,
        type: item.type as PlotSuggestion['type'],
        title: item.title,
        description: item.description,
        probability: 0.7,
      }));
    },
    generateOutline: async (data: { title: string; genre: string; structure: string; premise?: string }): Promise<Array<{
      title: string; location: string; timeOfDay: string; characters: string[]; content: string; order: number;
    }>> => {
      return await callAI('generateOutline', data) as Array<{
        title: string; location: string; timeOfDay: string; characters: string[]; content: string; order: number;
      }>;
    },
    generateSceneContent: async (data: {
      title: string; genre: string; sceneTitle: string; location: string;
      timeOfDay: string; characters: string[]; summary: string; previousScene?: string; nextScene?: string;
    }): Promise<string> => {
      const result = await callAI('generateSceneContent', data) as { content: string };
      return result.content || '';
    },
  },
  analytics: {
    getByProject: async (_projectId: string): Promise<AnalyticsData> => {
      await delay(500);
      return {
        totalScenes: 12,
        completedScenes: 8,
        totalWords: 15680,
        actProgress: [95, 70, 40],
        characterLineCounts: [
          { characterId: 'char-1', name: '李明', count: 124, percentage: 45 },
          { characterId: 'char-2', name: '张强', count: 89, percentage: 32 },
          { characterId: 'char-3', name: '神秘人', count: 64, percentage: 23 },
        ],
        sceneFrequency: [
          { sceneId: 'scene-1', title: '废弃仓库', count: 3 },
          { sceneId: 'scene-2', title: '警察局', count: 5 },
          { sceneId: 'scene-3', title: '咖啡馆', count: 2 },
        ],
        flatPassages: [
          { sceneId: 'scene-5', startLine: 12, endLine: 28, reason: '连续16行缺乏冲突描写' },
        ],
      };
    },
  },
  community: {
    getPosts: async (): Promise<Post[]> => {
      await delay(500);
      return mockPosts;
    },
    createPost: async (data: Omit<Post, 'id' | 'userId' | 'createdAt'>): Promise<Post> => {
      await delay(300);
      return {
        id: `post-${Date.now()}`,
        userId: 'user-1',
        ...data,
        createdAt: new Date(),
      };
    },
    getComments: async (postId: string): Promise<Comment[]> => {
      await delay(300);
      return mockComments[postId] || [];
    },
    createComment: async (postId: string, data: Omit<Comment, 'id' | 'postId' | 'userId' | 'createdAt'>): Promise<Comment> => {
      await delay(300);
      return {
        id: `comment-${Date.now()}`,
        postId,
        userId: 'user-1',
        ...data,
        createdAt: new Date(),
      };
    },
  },
  achievements: {
    getAll: async (): Promise<Achievement[]> => {
      await delay(300);
      return mockAchievements;
    },
    getUserAchievements: async (_userId: string): Promise<UserAchievement[]> => {
      await delay(300);
      return mockUserAchievements;
    },
  },
};

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export type Genre = 'commercial' | 'artistic' | 'short';
export type Structure = 'three_act' | 'five_act' | 'save_the_cat' | 'multi_line' | 'short_video';
export type ProjectStatus = 'draft' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  userId: string;
  title: string;
  genre: Genre;
  structure: Structure;
  status: ProjectStatus;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type LocationType = 'interior' | 'exterior';

export interface Scene {
  id: string;
  projectId: string;
  title: string;
  location: LocationType;
  timeOfDay: string;
  characters: string[];
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
  backstory: string;
  motivation: string;
  arc: string;
  catchphrase: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RelationshipType = 'friend' | 'enemy' | 'family' | 'lover' | 'colleague';

export interface CharacterRelationship {
  id: string;
  characterId1: string;
  characterId2: string;
  type: RelationshipType;
  createdAt: Date;
}

export interface AICharacterRequest {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
}

export interface AICharacterResponse {
  backstory: string;
  motivation: string;
  arc: string;
  catchphrase: string;
}

export type DialogStyle = 'humorous' | 'subtle' | 'powerful' | 'professional';

export interface AIDialogRequest {
  text: string;
  style: DialogStyle;
}

export interface AIDialogResponse {
  rewrittenText: string;
}

export interface AIAtmosphereRequest {
  keywords: string[];
}

export interface AIAtmosphereResponse {
  description: string;
  visualMetaphor: string;
}

export interface AIConflictRequest {
  characterIds: string[];
  characters: { name: string; relationship: string }[];
}

export interface AIConflictResponse {
  conflicts: string[];
  escalationPath: string[];
}

export interface Post {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt?: Date;
  progress: number;
}

export interface PlotSuggestion {
  id: string;
  type: 'surprise' | 'emotional' | 'reveal';
  title: string;
  description: string;
  probability: number;
}

export interface AnalyticsData {
  totalScenes: number;
  completedScenes: number;
  totalWords: number;
  actProgress: number[];
  characterLineCounts: { characterId: string; name: string; count: number; percentage: number }[];
  sceneFrequency: { sceneId: string; title: string; count: number }[];
  flatPassages: { sceneId: string; startLine: number; endLine: number; reason: string }[];
}

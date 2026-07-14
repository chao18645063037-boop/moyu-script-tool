import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { Project, Scene, Character, Genre, Structure } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  scenes: Scene[];
  characters: Character[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  scenes: [],
  characters: [],
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await api.projects.getAll();
    } catch (error) {
      return rejectWithValue('获取项目失败');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await api.projects.getById(id);
    } catch (error) {
      return rejectWithValue('获取项目失败');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (data: { title: string; genre: Genre; structure: Structure }, { rejectWithValue }) => {
    try {
      console.log('[createProject] dispatching with data:', data);
      const result = await api.projects.create(data);
      console.log('[createProject] result:', result);
      return result;
    } catch (error) {
      console.error('[createProject] error:', error);
      return rejectWithValue(error instanceof Error ? error.message : '创建项目失败');
    }
  }
);

export const fetchScenes = createAsyncThunk(
  'scenes/fetchByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await api.scenes.getByProject(projectId);
    } catch (error) {
      return rejectWithValue('获取场景失败');
    }
  }
);

export const createScene = createAsyncThunk(
  'scenes/create',
  async (data: { projectId: string; sceneData: Omit<Scene, 'id' | 'projectId' | 'createdAt' | 'updatedAt'> }, { rejectWithValue }) => {
    try {
      return await api.scenes.create(data.projectId, data.sceneData);
    } catch (error) {
      return rejectWithValue('创建场景失败');
    }
  }
);

export const updateScene = createAsyncThunk(
  'scenes/update',
  async (data: { id: string; sceneData: Partial<Scene> }, { rejectWithValue }) => {
    try {
      return await api.scenes.update(data.id, data.sceneData);
    } catch (error) {
      return rejectWithValue('更新场景失败');
    }
  }
);

export const fetchCharacters = createAsyncThunk(
  'characters/fetchByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await api.characters.getByProject(projectId);
    } catch (error) {
      return rejectWithValue('获取角色失败');
    }
  }
);

export const createCharacter = createAsyncThunk(
  'characters/create',
  async (data: { projectId: string; charData: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'backstory' | 'motivation' | 'arc' | 'catchphrase'> }, { rejectWithValue }) => {
    try {
      return await api.characters.create(data.projectId, data.charData);
    } catch (error) {
      return rejectWithValue('创建角色失败');
    }
  }
);

export const updateCharacter = createAsyncThunk(
  'characters/update',
  async (data: { id: string; charData: Partial<Character> }, { rejectWithValue }) => {
    try {
      return await api.characters.update(data.id, data.charData);
    } catch (error) {
      return rejectWithValue('更新角色失败');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.currentProject = action.payload || null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(fetchScenes.fulfilled, (state, action) => {
        state.scenes = action.payload;
      })
      .addCase(createScene.fulfilled, (state, action) => {
        state.scenes.push(action.payload);
      })
      .addCase(updateScene.fulfilled, (state, action) => {
        const index = state.scenes.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.scenes[index] = action.payload;
        }
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.characters = action.payload;
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.characters.push(action.payload);
      })
      .addCase(updateCharacter.fulfilled, (state, action) => {
        const index = state.characters.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.characters[index] = action.payload;
        }
      });
  },
});

export const { setCurrentProject, clearError } = projectSlice.actions;

export default projectSlice.reducer;

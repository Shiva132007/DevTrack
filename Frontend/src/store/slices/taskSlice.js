import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status, note });
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${id}`, updates);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    total: 0,
    stats: { byStatus: [], byPriority: [], total: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    addTaskFromSocket: (state, action) => {
      const exists = state.tasks.find(
    (t) => t._id.toString() === action.payload._id.toString()
  );
  if (!exists) {
    state.tasks.unshift(action.payload);
  }
    },
    updateTaskFromSocket: (state, action) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTaskFromSocket: (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
      })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = {
          byStatus: action.payload.byStatus,
          byPriority: action.payload.byPriority,
          total: action.payload.total,
        };
      });
  },
});

export const {
  addTaskFromSocket,
  updateTaskFromSocket,
  removeTaskFromSocket,
  clearTaskError,
} = taskSlice.actions;

export default taskSlice.reducer;
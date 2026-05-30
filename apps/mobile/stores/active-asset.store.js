import { create } from 'zustand';
import { assetsService } from '../services/assets.service';

export const useActiveAssetStore = create((set, get) => ({
  assignment: null,
  activeAsset: null,
  isLoading: false,
  error: null,

  loadCurrentAssignment: async () => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await assetsService.getCurrentAssignment();
      set({
        assignment,
        activeAsset: assignment?.asset || null,
        isLoading: false,
      });
      return assignment;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to load assigned asset' });
      throw error;
    }
  },

  assignAsset: async (assetId) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await assetsService.assignToMe(assetId);
      set({
        assignment,
        activeAsset: assignment?.asset || null,
        isLoading: false,
      });
      return assignment;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to assign asset' });
      throw error;
    }
  },

  unassignAsset: async () => {
    set({ isLoading: true, error: null });
    try {
      await assetsService.unassignFromMe();
      set({
        assignment: null,
        activeAsset: null,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to unassign asset' });
      throw error;
    }
  },

  setActiveAssetLocal: (asset) => set({ activeAsset: asset }),

  hasActiveAsset: () => !!get().activeAsset?.id,
}));


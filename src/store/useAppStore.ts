import { create } from 'zustand';
import { CollectionId } from '../types';

interface AppState {
  appStage: 'landing' | 'collections';
  currentCollection: CollectionId;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  
  setAppStage: (stage: 'landing' | 'collections') => void;
  setCurrentCollection: (collection: CollectionId) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  
  selectCollectionLine: (lineId: CollectionId) => void;
  handleEnterCollection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  appStage: 'landing',
  currentCollection: 'origins',
  isCartOpen: false,
  isMenuOpen: false,

  setAppStage: (stage) => set({ appStage: stage }),
  setCurrentCollection: (collection) => set({ currentCollection: collection }),
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  setIsMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),

  selectCollectionLine: (lineId) => {
    set({ appStage: 'collections', currentCollection: lineId, isMenuOpen: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  handleEnterCollection: () => {
    set({ appStage: 'collections', currentCollection: 'origins' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));

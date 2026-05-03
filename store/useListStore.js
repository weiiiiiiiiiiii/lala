import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useListStore = create(
  persist(
    (set) => ({
      favorites: [],
      myLists: [],

      toggleFavorite: (item) => set((state) => {
        const isFav = state.favorites.find((fav) => fav.id === item.id);
        return {
          favorites: isFav
            ? state.favorites.filter((fav) => fav.id !== item.id)
            : [...state.favorites, item],
        };
      }),

      addList: (name, selectedActions) => set((state) => ({
        myLists: [...(state.myLists || []), {
          id: Date.now().toString(),
          title: name,
          actions: selectedActions
        }]
      })),

      removeList: (id) => set((state) => ({
        myLists: state.myLists.filter((list) => list.id !== id)
      })),

      deleteActionFromList: (listId, actionId) => set((state) => ({
        myLists: state.myLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              actions: list.actions.filter(act => act.id !== actionId)
            };
          }
          return list;
        })
      })),

      // 👈 補上這一行：修正 updateActionOrder 報錯的問題
      updateActionOrder: (listId, newActions) => set((state) => ({
        myLists: state.myLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              actions: newActions
            };
          }
          return list;
        })
      })),
    }),
    {
      name: 'lala-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useListStore;
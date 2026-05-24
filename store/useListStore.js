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

      // 💡 補上核心功能 1：將多選的喜愛動作真正寫入全域資料庫中！
      addActionsToList: (listId, newActions) => set((state) => ({
        myLists: state.myLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              // 確保新加入的動作不會與舊動作共享同一個記憶體參考（深拷貝），並合併進 actions 陣列
              actions: [
                ...(list.actions || []), 
                ...newActions.map(act => ({ ...act }))
              ]
            };
          }
          return list;
        })
      })),

      // 💡 補上核心功能 2：長按修改秒數時，同步更新全域資料庫！
      updateActionTimeInList: (listId, actionId, newTime) => set((state) => ({
        myLists: state.myLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              actions: list.actions.map(act => 
                act.id === actionId ? { ...act, time: newTime } : act
              )
            };
          }
          return list;
        })
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
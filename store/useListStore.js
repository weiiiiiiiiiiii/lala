import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";



const useListStore = create(
    persist(
        (set, get) => ({
            lists: [],
            favoriyes: [],

            // 刪除特定的一筆 (根據 id)
            removeList: (id) => set((state) => ({
                lists: state.lists.filter((list) => list.id !== id)
            })),

            // 清空所有清單 (重置)
            clearAll: () => set({ lists: [] }),

            //新增清單
            addList: (title) => set((state) => ({
                lists: [...state.lists, { id: Date.now(), title: title, action: [] }]
            })),

            //更新清單
            updteList: (id, title) => set((state) => ({
                lists: state.lists.map(list =>
                    list.id === id ? { ...list, title: title } : list
                )
            })),

            //點擊愛心
            toggleFavorite: (action) => {
                const currentFavorites = get().favorites || [];
                const isExist = currentFavorites.find((fav) => fav.id === action.id);

                if (isExist) {
                    //從喜愛移除
                    set({
                        favorites: currentFavorites.filter((fav) => fav.id !== action.id)
                    });
                    return 'removed';
                } else {
                    //加入喜愛
                    set({
                        favorites: [...currentFavorites, action]
                    });
                    return 'added';
                }
            },
        }),

        {
            name: 'list-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)

export default useListStore;
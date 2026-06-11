import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const updateToFirebase = async (myLists) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  try {
    const userCustomLists = myLists.filter(list => list.id !== 'recommend_01');
    const userFavorites = useListStore.getState().favorites || [];
    await setDoc(doc(db, 'users', currentUser.uid), {
      myLists: userCustomLists,
      favorites: userFavorites,
    }, { merge: true });
    console.log('雲端自創清單同步成功');
  } catch (error) {
    console.log('同步雲端失敗', error);
  }
}

const useListStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      myLists: [],

      setMyListFirebase: (cloudList = [], cloudFavorites = []) => set((state) => {
        const currentLists = state.myLists || [];

        // 1. 先從本地現有清單中，找出內建的推薦清單 (recommend_01)
        const defaultRecommend = currentLists.find(l => l.id === 'recommend_01');

        // 2. 組裝清單：若原本有推薦清單，就把它放在最前面，後面再接上雲端拉下來的自創清單
        const updated = defaultRecommend ? [defaultRecommend, ...cloudList] : [...cloudList];

        return {
          myLists: updated,
          favorites: cloudFavorites
        };
      }),

      settings: {
        defaultWorkoutTime: '00:30',
        restTime: '00:15',
        countdownTime: '00:08',
      },

      updateSettings: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
      })),


      // 確保使用者第一次打開 App 時，myLists 裡只有內建推薦清單，乾淨純潔！
      initializeDefaultLists: (recommendActions) => set((state) => {
        const currentLists = state.myLists || [];
        const hasRecommend = currentLists.some(l => l.id === 'recommend_01');

        let updatedLists = [...currentLists];

        if (!hasRecommend) {
          updatedLists.push({
            id: 'recommend_01',
            title: '推薦清單',
            actions: recommendActions || [] // 預設帶入傳進來的靜態動作庫
          });
        }

        return { myLists: updatedLists };
      }),

      //點擊愛心
      toggleFavorite: (item) => set((state) => {
        const isFav = state.favorites.find((fav) => fav.id === item.id);
        const updatedFavorites = isFav
          ? state.favorites.filter((fav) => fav.id !== item.id)
          : [...state.favorites, item];

        // 觸發雲端同步
        setTimeout(() => updateToFirebase(get().myLists), 0);
        return { favorites: updatedFavorites };
      }),

      //自創清單
      addList: (name, selectedActions) => set((state) => {
        const updatedLists = [...(state.myLists || []), {
          id: Date.now().toString(),
          title: name,
          actions: selectedActions
        }];
        // 觸發雲端同步
        updateToFirebase(updatedLists, state.favorites);
        return { myLists: updatedLists };
      }),

      //移除清單
      removeList: (id) => set((state) => {
        const updatedLists = state.myLists.filter((list) => list.id !== id);
        //觸發雲端同步
        updateToFirebase(updatedLists, state.favorites);
        return { myLists: updatedLists };
      }),

      //動作加入清單
      addActionToSpecificList: (listId, actionItem) => {
        const { myLists } = get();
        const targetList = myLists.find(l => l.id === listId);

        if (!targetList) return false;

        //防止重複動作加入
        const isDuplicate = targetList.actions?.some(
          act => act.name.trim() === actionItem.name.trim()
        );

        if (isDuplicate) {
          return false; // 告訴前端：重複了！
        }

        // 🚨 防線二：置入清單前，強制執行「ID 洗牌」，切斷與原始庫的記憶體連結
        const uniqueAction = {
          ...actionItem,
          id: `${actionItem.id}_custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        };

        const updatedLists = myLists.map(list =>
          list.id === listId
            ? { ...list, actions: [...(list.actions || []), uniqueAction] }
            : list
        );

        set({ myLists: updatedLists });
        updateToFirebase(updatedLists);

        return true; // 成功加入！
      },

      // 複製整份清單
      copyBulkActionsToList: (targetListId, incomingActions) => {
        const { myLists } = get();
        const targetList = myLists.find(l => l.id === targetListId);

        if (!targetList) return { successCount: 0, duplicateCount: incomingActions.length };

        let successCount = 0;
        let duplicateCount = 0;
        const newUniqueActions = [];

        incomingActions.forEach((incomingAct, idx) => {
          // 比對名稱防重複
          const isDuplicate = targetList.actions?.some(
            existingAct => existingAct.name.trim() === incomingAct.name.trim()
          );

          if (isDuplicate) {
            duplicateCount++;
          } else {
            successCount++;
            newUniqueActions.push({
              ...incomingAct,
              id: `${incomingAct.id}_bulk_${Date.now()}_${idx}_${Math.floor(Math.random() * 100)}`
            });
          }
        });

        if (newUniqueActions.length > 0) {
          const updatedLists = myLists.map(list =>
            list.id === targetListId
              ? { ...list, actions: [...(list.actions || []), ...newUniqueActions] }
              : list
          );
          set({ myLists: updatedLists });
          // 💡 觸發雲端同步
          updateToFirebase(updatedLists);
        }

        return { successCount, duplicateCount };
      },

      addActionsToList: (listId, newActions) => set((state) => {
        const updatedLists = state.myLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              actions: [...(list.actions || []), ...newActions.map(act => ({ ...act }))]
            };
          }
          return list;
        });
        // 💡 觸發雲端同步
        updateToFirebase(updatedLists);
        return { myLists: updatedLists };
      }),

      updateActionTimeInList: (listId, actionId, newTime) => set((state) => {
        const updatedLists = state.myLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              actions: list.actions.map(act =>
                act.id === actionId ? { ...act, time: newTime } : act
              )
            };
          }
          return list;
        });
        // 💡 觸發雲端同步
        updateToFirebase(updatedLists);
        return { myLists: updatedLists };
      }),

      deleteActionFromList: (listId, actionId) => set((state) => {
        const updatedLists = state.myLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              actions: list.actions.filter(act => act.id !== actionId)
            };
          }
          return list;
        });
        // 💡 觸發雲端同步
        updateToFirebase(updatedLists);
        return { myLists: updatedLists };
      }),

      updateActionOrder: (listId, newActions) => set((state) => {
        const updatedLists = state.myLists.map(list => {
          if (list.id === listId) {
            return { ...list, actions: newActions };
          }
          return list;
        });
        // 💡 觸發雲端同步
        updateToFirebase(updatedLists);
        return { myLists: updatedLists };
      }),
    }),
    {
      // 因為把今日清單移除所以做個改版
      name: 'lala-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState, version) => {
        //  當使用者的手機發現本地版本比 1 還舊時，自動觸發一次全域格式化
        if (version < 1) {
          console.log("🚨 偵測到舊版資料庫，自動為使用者清除舊快取！");
          return {
            favorites: [],
            myLists: []
          };
        }
        return persistedState;
      }
    }
  )
);


export default useListStore;
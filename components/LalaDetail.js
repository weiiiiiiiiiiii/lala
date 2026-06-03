import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 引入自訂 SVG 圖示
import TurnBackIcon from '../assets/images/TurnBack.svg';
import LoveIcon from '../assets/images/LoveIcon.svg';
import LoveIconActive from '../assets/images/LoveIcon_active.svg';
import AddToList from '../assets/images/addtolist.svg';

// 引入全域 Store 與 靜態資料
import useListStore from '../store/useListStore';
import { ALL_STRETCHES } from './stretchData';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D';

export default function LalaDetail({ title, onBack }) {
  const router = useRouter();

  // 從 Store 取得全域愛心狀態、我的清單、以及複製與新建方法
  const toggleFavoriteStore = useListStore((state) => state.toggleFavorite);
  const favorites = useListStore((state) => state.favorites) || [];
  const myLists = useListStore((state) => state.myLists) || [];
  const copyBulkActionsToList = useListStore((state) => state.copyBulkActionsToList);
  const addList = useListStore((state) => state.addList);

  // 本地清單狀態與控制右上角彈出選單的狀態
  const [actionList, setActionList] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // 監聽標題與愛心清單變動，更新顯示內容
  useEffect(() => {
    if (title === '喜愛清單') {
      const listWithState = favorites.map(item => ({ ...item, isFavorite: true }));
      setActionList(listWithState);
    } else {
      const list = ALL_STRETCHES[title] || [];
      const listWithState = list.map(item => ({
        ...item,
        isFavorite: favorites.some(fav => fav.id === item.id)
      }));
      setActionList(listWithState);
    }
  }, [title, favorites]);

  // 處理愛心點擊
  const handleToggleFavorite = (item) => {
    const isCurrentlyFavorite = favorites.some((fav) => fav.id === item.id);
    toggleFavoriteStore(item);

    if (isCurrentlyFavorite) {
      Alert.alert('提示', '已從喜愛清單移除');
    } else {
      Alert.alert('提示', '已加入喜愛清單');
    }
  };

  const isItemFavorite = (id) => favorites.some(fav => fav.id === id);

  const handleOpenActionDetail = (item) => {
    router.push({
      pathname: '/actionPage',
      params: {
        actionId: item.id,
        parentTitle: title
      }
    });
  };

  const handleCopyEntireList = () => {
    setIsMenuVisible(true);
  };

  // 執行批次複製到指定自創清單
  const handleSelectTargetList = (targetList) => {
    setIsMenuVisible(false);
    if (!copyBulkActionsToList) return;

    const { successCount, duplicateCount } = copyBulkActionsToList(targetList.id, actionList);

    if (successCount > 0) {
      if (duplicateCount > 0) {
        Alert.alert('已加入清單', `成功匯入 ${successCount} 個新動作！`);
      } else {
        Alert.alert('已加入清單', `成功匯入 ${successCount} 個新動作！`);
      }
    } else if (duplicateCount > 0) {
      Alert.alert('提示', `這些動作已在「${targetList.title}」清單裡`);
    }
  };

  // 回歸原本成功的 Alert.prompt 邏輯
  const handleCreateNewList = () => {
    setIsMenuVisible(false);

    Alert.prompt(
      '建立新清單',
      '請輸入新清單的名稱：',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '建立並匯入',
          onPress: (text) => {
            if (!text || text.trim() === '') {
              Alert.alert('提示', '清單名稱不能為空！');
              return;
            }

            const uniqueNewActions = actionList.map((act, idx) => ({
              ...act,
              id: `${act.id}_bulk_${Date.now()}_${idx}_${Math.floor(Math.random() * 100)}`
            }));

            if (addList) {
              addList(text.trim(), uniqueNewActions);
              Alert.alert('成功', `已建立「${text.trim()}」並成功匯入整份動作！`);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // 🧼 乾淨優雅：因為全域已經沒有今日清單了，這裡只需要單純防禦並過濾 rec_ 推薦清單即可
  const userCustomLists = myLists.filter(list => !list.id.toString().startsWith('rec_'));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>

          <Text style={styles.headText}>{title}</Text>

          {title === '喜愛清單' ? (
            <View style={{ width: 40 }} />
          ) : (
            <Pressable onPress={handleCopyEntireList} style={styles.rightHeaderButton}>
              <AddToList width={28} height={28} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            actionList.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
        >
          {actionList.length > 0 ? (
            actionList.map((item) => (
              <Pressable
                key={item.id}
                style={styles.actionListItem}
                onPress={() => handleOpenActionDetail(item)}
              >
                <View style={styles.infoArea}>
                  <Pressable
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item);
                    }}
                  >
                    {isItemFavorite(item.id) ? (
                      <LoveIconActive width={24} height={24} />
                    ) : (
                      <LoveIcon width={24} height={24} />
                    )}
                  </Pressable>

                  <View style={styles.textGroup}>
                    <Text style={styles.actionTitle}>{item.name}</Text>
                    <Text style={styles.actionDesc}>{item.detail}</Text>
                  </View>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>

                <View style={styles.imageContainer}>
                  <Image source={item.img} style={styles.actionImage} resizeMode="cover" />
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>目前沒有運動項目在此清單</Text>
            </View>
          )}

          <View style={{ height: title === '喜愛清單' ? 20 : 120 }} />
        </ScrollView>

        {title !== '喜愛清單' && (
          <View style={styles.bottomContainer}>
            <Pressable style={styles.startBtn}>
              <Text style={styles.startBtnText}>開始</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 右上角懸浮下拉彈出選單 */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {userCustomLists.length > 0 ? (
                userCustomLists.map((list) => (
                  <View key={list.id}>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => handleSelectTargetList(list)}
                    >
                      <Text style={styles.menuItemText}>{list.title}</Text>
                    </Pressable>

                    {/* 🚨 物理控制閥：清單之間的垂直留白距離 */}
                    <View style={{ height: 16, backgroundColor: 'transparent' }} />
                  </View>
                ))
              ) : (
                <View style={styles.noListPlaceholder}>
                  <Text style={styles.noListText}>尚無自創清單</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.menuDivider} />

            <Pressable
              style={styles.menuItem}
              onPress={handleCreateNewList}
            >
              <Text style={[styles.menuItemText, styles.createNewText]}>建立新的清單...</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  headerWrapper: { backgroundColor: THEME_COLOR, height: 95, justifyContent: 'center' },
  /* 💡 修正點：修復被我污染的 justifyContent，按鈕一秒歸位 */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  rightHeaderButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headText: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingVertical: 10 },
  actionListItem: {
    width: '100%', flexDirection: 'row', paddingVertical: 25, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0', justifyContent: 'space-between',
  },
  infoArea: { flex: 1, justifyContent: 'space-between' },
  heartBtn: { marginBottom: 10, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  textGroup: { marginBottom: 15 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  actionDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  timeText: { fontSize: 16, fontWeight: '600' },
  imageContainer: { width: 110, height: 110, backgroundColor: 'transparent', marginLeft: 15, overflow: 'hidden' },
  actionImage: { width: '100%', height: '100%' },
  emptyContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 60 },
  emptyView: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', fontWeight: '500' },
  bottomContainer: {
    position: 'absolute', bottom: 0, width: '100%', height: 120,
    alignItems: 'center', justifyContent: 'center',
    paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    zIndex: 9999,
  },
  startBtn: {
    width: '85%',
    height: 80,
    backgroundColor: '#B2F6B1',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startBtnText: { fontSize: 32, fontWeight: 'bold', color: '#000', letterSpacing: 2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 130,
    right: 20,
    width: 200,
    maxHeight: 450,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  menuItem: {
    width: '100%',
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',

    // 🚨 【左側控制閥】：文字離左框框的距離
    marginLeft: 25,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#D1D1D1',
    marginTop: 4,
    marginBottom: 16,
    marginHorizontal: 6,
  },
  createNewText: {
    fontWeight: '600',
    color: '#333',
  },
  noListPlaceholder: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  noListText: {
    fontSize: 14,
    color: '#999',
  }
});
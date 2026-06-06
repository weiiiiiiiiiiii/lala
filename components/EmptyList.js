import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Alert, LayoutAnimation, Platform, UIManager, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 引入全域 Store 與靜態圖示
import useListStore from '../store/useListStore';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import EditIcon  from '../assets/images/pencil_icon.svg';
import CheckIcon from '../assets/images/OK_icon.svg';
import DragIcon from '../assets/images/drag_icon.svg';
import TrashIcon from '../assets/images/Trash.svg';

// 補上時間加減專用的 SVG 圖示
import PlusTimeIcon from '../assets/images/PlusTime.svg';
import MinusTimeIcon from '../assets/images/MinusTime.svg';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EmptyList() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();

  const myLists = useListStore((state) => state.myLists) || [];
  const deleteActionFromList = useListStore((state) => state.deleteActionFromList);
  const favorites = useListStore((state) => state.favorites) || [];
  const addActionsToList = useListStore((state) => state.addActionsToList);
  const updateActionTimeInList = useListStore((state) => state.updateActionTimeInList);

  // 根據路由傳過來的 id 進行精準匹配
  const currentList = myLists.find(list => list.id.toString() === id?.toString());

  const [actionsList, setActionsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // 彈出視窗（Modal）控制狀態
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [currentSeconds, setCurrentSeconds] = useState(30);

  // 控制「選擇喜愛動作」Modal 的顯示
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  // 暫存使用者在 Modal 裡勾選的動作項目
  const [tempSelectedActions, setTempSelectedActions] = useState([]);

  // 💡 🧼 監聽清單來源變動（已完全移除今日清單特例兜底邏輯）
  useEffect(() => {
    if (currentList && currentList.actions) {
      setActionsList(currentList.actions);
    } else {
      setActionsList([]); 
    }
  }, [currentList, myLists]);

  // 時間字串與秒數轉換輔助函式
  const timeStringToSeconds = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 30;
    const [min, sec] = timeStr.split(':').map(Number);
    return (min * 60) + sec;
  };

  const secondsToTimeString = (secs) => {
    const min = Math.floor(secs / 60).toString().padStart(2, '0');
    const sec = (secs % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 點擊動作跳轉詳情頁
  const handleActionPress = (item) => {
    if (isEditing) return;

    let originalId = item.id.toString();
    if (originalId.includes('_custom_')) {
      originalId = originalId.split('_custom_')[0];
    } else if (originalId.includes('_bulk_')) {
      originalId = originalId.split('_bulk_')[0];
    }

    router.push({
      pathname: '/actionPage',
      params: {
        actionId: originalId, 
        parentTitle: name || currentList?.title || '當前清單'
      }
    });
  };

  // 長按微調時間的彈出視窗
  const handleLongPressAction = (item) => {
    if (isEditing) return; 
    setSelectedAction(item);
    setCurrentSeconds(timeStringToSeconds(item.time));
    setIsModalVisible(true);
  };

  // 儲存時間修改
  const handleSaveTime = () => {
    if (!selectedAction) return;

    // 💡 🧼 移除今日清單三元判斷，直接精簡抓取
    const targetListId = currentList?.id || id;
    if (!targetListId) return;

    const newTimeStr = secondsToTimeString(currentSeconds);

    setActionsList(prev => prev.map(act =>
      act.id === selectedAction.id ? { ...act, time: newTimeStr } : act
    ));

    if (updateActionTimeInList) {
      updateActionTimeInList(targetListId, selectedAction.id, newTimeStr);
    }

    setIsModalVisible(false);
  };

  // 刪除動作與全域 Persist 強制同步
  const handleDeleteAction = (actionId, actionName, index) => {
    Alert.alert('刪除動作', `確定要從清單移除 ${actionName} 嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

          // 💡 🧼 移除今日清單特例
          const targetListId = currentList?.id || id;

          const updatedActions = actionsList.filter((_, i) => i !== index);
          setActionsList(updatedActions);

          if (deleteActionFromList && targetListId) {
            deleteActionFromList(targetListId, actionId);
          }

          const updateActionOrder = useListStore.getState().updateActionOrder;
          if (updateActionOrder && targetListId) {
            updateActionOrder(targetListId, updatedActions);
          }
        }
      }
    ]);
  };

  const moveAction = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === actionsList.length - 1) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newList = [...actionsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setActionsList(newList);

    // 💡 🧼 移除今日清單特例，乾淨同步
    const targetListId = currentList?.id || id;
    const updateActionOrder = useListStore.getState().updateActionOrder;
    if (updateActionOrder && targetListId) {
      updateActionOrder(targetListId, newList);
    }
  };

  const backList = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/list');
    }
  };

  // 點擊「+ 喜愛動作」彈出多選選單
  const handleOpenAddModal = () => {
    if (isEditing) return;

    const existingNames = actionsList.map(a => a.name.trim());
    const availableFavorites = favorites.filter(fav => !existingNames.includes(fav.name.trim()));

    if (availableFavorites.length === 0) {
      Alert.alert('提示', '目前所有喜愛動作都已經在這份清單中囉！');
      return;
    }

    setTempSelectedActions([]); 
    setIsAddModalVisible(true);
  };

  const handleToggleSelectFav = (item) => {
    setTempSelectedActions(prev => {
      const isExist = prev.find(a => a.id === item.id);
      if (isExist) {
        return prev.filter(a => a.id !== item.id); 
      } else {
        return [...prev, item]; 
      }
    });
  };

  // 多選確認選取寫入
  const handleConfirmAddActions = () => {
    if (tempSelectedActions.length === 0) {
      setIsAddModalVisible(false);
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // 1. 💡 🧼 智慧安全防線：直接精簡獲取 id 
    const targetListId = currentList?.id || id;

    // 2. ID 洗牌機制
    const uniqueNewActions = tempSelectedActions.map((act, idx) => ({
      ...act,
      id: `${act.id}_custom_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`
    }));

    // 3. 先更新本地畫面 state
    setActionsList(prev => [...prev, ...uniqueNewActions]);

    // 4. 同步寫入全域 Zustand Store
    if (targetListId) {
      const storeState = useListStore.getState();
      const listsInStore = storeState.myLists || [];
      const isListExistInStore = listsInStore.some(l => l.id.toString() === targetListId.toString());

      if (isListExistInStore) {
        if (addActionsToList) {
          addActionsToList(targetListId, uniqueNewActions);
        }
      } else {
        // 🚨 僅為一般新註冊的普通自創清單兜底，已澈底移除今日清單字眼
        useListStore.setState({
          myLists: [
            ...listsInStore,
            {
              id: targetListId,
              title: name || '新清單',
              actions: uniqueNewActions
            }
          ]
        });
      }
    }

    setIsAddModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header 區塊 */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={backList} style={styles.backButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headText}>{name || currentList?.title || '清單名字'}</Text>
          <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.backButton}>
            {isEditing ? (
              <CheckIcon width={24} height={24} />
            ) : (
              <EditIcon width={24} height={24} />
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            actionsList.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
        >
          {actionsList.length > 0 ? (
            actionsList.map((item, index) => (
              <Pressable
                key={item.id || index}
                onPress={() => handleActionPress(item)} 
                onLongPress={() => handleLongPressAction(item)} 
                delayLongPress={400}
                style={{
                  width: '100%',
                  flexDirection: 'row',       
                  alignItems: 'center',       
                  justifyContent: 'space-between',
                  paddingVertical: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E0E0E0',
                  backgroundColor: '#fff',
                  transform: isEditing ? [{ translateX: -25 }] : []
                }}
              >
                {/* A. 左側：排序控制鈕 */}
                <View style={styles.dragControls}>
                  <Pressable
                    onPress={() => moveAction(index, 'up')}
                    style={[styles.arrowButton, index === 0 && styles.disabledArrow]}
                    disabled={index === 0}
                  >
                    <Text style={styles.arrowText}>▲</Text>
                  </Pressable>

                  <View style={styles.dragHandleWrapper}>
                    <DragIcon width={20} height={20} fill="#666" />
                  </View>

                  <Pressable
                    onPress={() => moveAction(index, 'down')}
                    style={[styles.arrowButton, index === actionsList.length - 1 && styles.disabledArrow]}
                    disabled={index === actionsList.length - 1}
                  >
                    <Text style={styles.arrowText}>▼</Text>
                  </Pressable>
                </View>

                {/* B. 中間：文字區 */}
                <View style={styles.infoArea}>
                  <View style={styles.textGroup}>
                    <Text style={styles.actionTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.actionDesc} numberOfLines={2}>{item.detail}</Text>
                  </View>
                  <Text style={styles.timeText}>{item.time || '00:30'}</Text>
                </View>

                {/* C. 右側：圖片與垃圾桶 */}
                <View style={[styles.imageWrapper, { width: isEditing ? 165 : 110 }]}>
                  <View style={styles.imageContainer}>
                    {item.img ? (
                      <Image source={item.img} style={styles.actionImage} resizeMode="cover" />
                    ) : (
                      <Text style={{ fontSize: 12, color: '#999' }}>無圖</Text>
                    )}
                  </View>

                  {isEditing && (
                    <Pressable
                      onPress={() => handleDeleteAction(item.id, item.name, index)}
                      style={styles.trashBtn}
                    >
                      <TrashIcon width={24} height={24} />
                    </Pressable>
                  )}
                </View>

              </Pressable>
            ))
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>目前沒有運動項目在此清單</Text>
            </View>
          )}

          {/* 「+ 喜愛動作」按鈕 */}
          <Pressable
            style={styles.addActionButton}
            onPress={handleOpenAddModal}
          >
            <Text style={styles.addActionText}>+ 喜愛動作</Text>
          </Pressable>

          <View style={{ height: 160 }} />
        </ScrollView>

        {/* 底部「開始」按鈕區塊 */}
        <View style={styles.bottomContainer}>
          <Pressable style={styles.startBtn}>
            <Text style={styles.startBtnText}>開始</Text>
          </Pressable>
        </View>
      </View>

      {/* 💡 調整秒數的彈出視窗 (Modal) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>

            {/* 1. 動作縮圖 */}
            <View style={styles.modalImageContainer}>
              {selectedAction?.img ? (
                <Image source={selectedAction.img} style={styles.modalImage} resizeMode="cover" />
              ) : (
                <Text style={{ color: '#999' }}>無圖</Text>
              )}
            </View>

            {/* 2. 計時調整控制列 */}
            <View style={styles.counterRow}>
              <Pressable
                onPress={() => setCurrentSeconds(prev => Math.max(5, prev - 5))}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <MinusTimeIcon width={36} height={36} />
              </Pressable>

              <Text style={styles.modalTimeText}>
                {secondsToTimeString(currentSeconds)}
              </Text>

              <Pressable
                onPress={() => setCurrentSeconds(prev => prev + 5)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <PlusTimeIcon width={36} height={36} />
              </Pressable>
            </View>

            {/* 3. 恢復預設按鈕 */}
            <Pressable style={styles.resetBtn} onPress={() => setCurrentSeconds(30)}>
              <Text style={styles.resetBtnText}>恢復預設</Text>
            </Pressable>

            {/* 4. SAVE 儲存按鈕 */}
            <Pressable style={styles.modalSaveBtn} onPress={handleSaveTime}>
              <Text style={styles.modalSaveBtnText}>SAVE</Text>
            </Pressable>

          </Pressable>
        </Pressable>
      </Modal>

      {/* 💡 選擇喜愛動作彈出視窗 (Modal) */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalFullContainer}>
          <Text style={styles.modalTitle}>選擇喜愛動作</Text>
          <FlatList
            data={favorites.filter(fav =>
              !actionsList.some(act => act.name.trim() === fav.name.trim())
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => {
              const isSelected = tempSelectedActions.find(a => a.id === item.id);
              return (
                <Pressable
                  style={[styles.actionItem, isSelected && styles.selectedItem]}
                  onPress={() => handleToggleSelectFav(item)}
                >
                  <Text style={styles.actionName}>{item.name}</Text>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </Pressable>
              );
            }}
          />
          <Pressable style={styles.confirmButton} onPress={handleConfirmAddActions}>
            <Text style={styles.buttonText}>確認選取</Text>
          </Pressable>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// 樣式表保持原樣不變
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  headerWrapper: { backgroundColor: THEME_COLOR, height: 95, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headText: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingVertical: 10, paddingHorizontal: 20 },
  actionListItem: {
    width: '100%', flexDirection: 'row', paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
    justifyContent: 'space-between', alignItems: 'center',
  },
  dragControls: { flexDirection: 'column', alignItems: 'center', marginRight: 10 },
  dragHandleWrapper: { paddingVertical: 4 },
  arrowButton: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, backgroundColor: '#f1f1f1', marginVertical: 2 },
  disabledArrow: { opacity: 0.3 },
  arrowText: { fontSize: 9, fontWeight: 'bold', color: '#444' },
  infoArea: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 10 },
  textGroup: { marginBottom: 15 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  actionDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  timeText: { fontSize: 16, fontWeight: '600' },
  imageWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', height: 110 },
  imageContainer: { width: 110, height: 110, borderRadius: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  actionImage: { width: '100%', height: '100%' },
  trashBtn: { width: 55, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 60 },
  emptyView: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', fontWeight: '500' },
  addActionButton: { backgroundColor: '#D9D9D9', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 20, width: '100%' },
  addActionText: { fontSize: 16, fontWeight: 'bold' },
  bottomContainer: { position: 'absolute', bottom: 0, width: '100%', height: 120, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  startBtn: { width: width * 0.85, height: 80, backgroundColor: '#B2F6B1', borderRadius: 40, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4 },
  startBtnText: { fontSize: 32, fontWeight: 'bold', color: '#000', letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: width * 0.82, backgroundColor: '#FFF', borderRadius: 28, paddingVertical: 35, paddingHorizontal: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  modalImageContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  modalImage: { width: '100%', height: '100%' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 4 },
  modalTimeText: { fontSize: 32, fontWeight: 'bold', color: '#000', minWidth: 90, textAlign: 'center' },
  resetBtn: { paddingVertical: 6, marginBottom: 30 },
  resetBtnText: { fontSize: 14, color: '#999', fontWeight: '500' },
  modalSaveBtn: { width: '85%', height: 52, backgroundColor: '#D9D9D9', borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  modalSaveBtnText: { fontSize: 18, fontWeight: 'bold', color: '#000', letterSpacing: 1 },
  buttonText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  modalFullContainer: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  listPadding: { paddingBottom: 100 },
  actionItem: { padding: 20, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  selectedItem: { backgroundColor: '#E8F5E9' },
  actionName: { fontSize: 18 },
  checkMark: { color: '#2E7D32', fontWeight: 'bold', fontSize: 18 },
  confirmButton: { height: 60, backgroundColor: '#A2FFB0', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 30 }
});
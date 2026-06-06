import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_STRETCHES } from './stretchData';
import useListStore from '../store/useListStore'; 

import TurnBackIcon from '../assets/images/TurnBack.svg';
import PlusIcon from '../assets/images/Plus.svg';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D';

export default function ActionDetail({ actionId, parentTitle, onBack }) {
  // 從 Store 取得全域清單資料庫與操作入口
  const favorites = useListStore((state) => state.favorites) || [];
  const myLists = useListStore((state) => state.myLists) || [];
  const addActionToSpecificList = useListStore((state) => state.addActionToSpecificList);

  // 控制右上角彈出選單的狀態
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // 💡 1. 全域智慧大檢索
  let actionData;
  if (parentTitle === '喜愛清單') {
    actionData = favorites.find(item => item.id === actionId);
  } else {
    actionData = ALL_STRETCHES[parentTitle]?.find(item => item.id === actionId);
  }

  if (!actionData) {
    for (const key in ALL_STRETCHES) {
      const found = ALL_STRETCHES[key].find(item => item.id === actionId);
      if (found) {
        actionData = found;
        break;
      }
    }
  }

  // 💡 2. 右上角點擊按鈕，直接展開自訂 Modal
  const handleAddActionPress = () => {
    if (!actionData) return;
    setIsMenuVisible(true);
  };

  // 💡 3. 真正執行寫入與重複攔截提示
  const handleSelectTargetList = (targetList) => {
    setIsMenuVisible(false);
    if (!addActionToSpecificList) return;

    // 呼叫 Store 核心大腦（內部已包含防重複機制）
    const isSuccess = addActionToSpecificList(targetList.id, actionData);

    if (isSuccess) {
      // 🧼 移除今日清單特例判斷，直接讀取自創清單的 title
      Alert.alert('成功', `已將「${actionData.name}」成功加入 ${targetList.title || '未命名清單'}！`);
    } else {
      Alert.alert('系統提示', `動作已在該清單`);
    }
  };

  // 💡 4. 點擊「建立新的清單...」
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
            
            // 複製出一份帶有新唯一 ID 的動作資料
            const uniqueNewAction = {
              ...actionData,
              id: `${actionData.id}_bulk_${Date.now()}_0_${Math.floor(Math.random() * 100)}`
            };

            const addList = useListStore.getState().addList;
            if (addList) {
              addList(text.trim(), [uniqueNewAction]);
              Alert.alert('成功', `已建立「${text.trim()}」並成功匯入動作！`);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const validLists = myLists.filter(list => !list.id.toString().startsWith('rec_'));

  // 若真的找不到資料的防錯顯示
  if (!actionData) return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headText}>找不到資料</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center' }}>
        <Text style={{ textAlign: 'center', color: '#666' }}>動作 ID: {actionId} 找不到資料</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. 固定 Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headText}>{actionData.name}</Text>
          
          <Pressable onPress={handleAddActionPress} style={styles.iconButton}>
            <PlusIcon width={24} height={24} />
          </Pressable>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* 2. 固定圖片區域 */}
        <View style={styles.imageSection}>
          {actionData.img ? (
            <Image 
              source={actionData.img} 
              style={styles.mainImage} 
              resizeMode="contain" 
            />
          ) : (
            <Text style={{ color: '#999' }}>暫無動作圖片</Text>
          )}
        </View>

        {/* 3. 獨立捲動內容區塊 */}
        <View style={styles.contentWrapper}>
          <ScrollView 
            style={styles.contentScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollInside}
          >
            {/* 動作步驟 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.indicator} />
                <Text style={styles.sectionTitle}>動作步驟</Text>
              </View>
              <View style={styles.textBubble}>
                <Text style={styles.contentText}>{actionData.steps || "暫無詳細說明"}</Text>
              </View>
            </View>

            {/* 注意事項 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.indicator} />
                <Text style={styles.sectionTitle}>注意事項</Text>
              </View>
              <View style={styles.textBubble}>
                <Text style={styles.contentText}>{actionData.notice || "請保持呼吸，若感疼痛請停止。"}</Text>
              </View>
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>

      {/* 右上角懸浮下拉彈出選單（靜態穩定、去今日清單化版） */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {validLists.length > 0 ? (
                validLists.map((list) => (
                  <View key={list.id}>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => handleSelectTargetList(list)}
                    >
                      {/* 🧼 移除今日清單特例判斷，直接渲染 list.title */}
                      <Text style={styles.menuItemText}>
                        {list.title || '未命名清單'}
                      </Text>
                    </Pressable>
                    
                    {/* 清單項目物理上下間距 */}
                    <View style={{ height: 16, backgroundColor: 'transparent' }} />
                  </View>
                ))
              ) : (
                <View style={styles.noListPlaceholder}>
                  <Text style={styles.noListText}>尚無可用清單</Text>
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
  headerWrapper: { backgroundColor: THEME_COLOR, height: 95, justifyContent: 'center', zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  imageSection: { width: '100%', height: 400, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 30, zIndex: 1 },
  mainImage: { width: '100%', height: '100%' },
  contentWrapper: {
    flex: 1, backgroundColor: '#fff', marginTop: -20, borderTopLeftRadius: 35, borderTopRightRadius: 35,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 10,
    zIndex: 5, overflow: 'hidden', 
  },
  contentScroll: { flex: 1 },
  scrollInside: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 20 },
  section: { marginBottom: 35 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  indicator: { width: 4, height: 20, backgroundColor: THEME_COLOR, marginRight: 10, borderRadius: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  textBubble: { backgroundColor: '#F7F7F7', padding: 20, borderRadius: 18 },
  contentText: { fontSize: 16, color: '#555', lineHeight: 28 },

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
    zIndex: 9999,
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
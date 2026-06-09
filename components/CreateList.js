import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Modal, FlatList, Animated, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar'; 
import useListStore from '../store/useListStore';

// 引入萬能控色版返回鍵
import TurnBackIcon from '../assets/images/TurnBack.svg';

// ==========================================
// 統一更換為新版深夜藍灰配色變數
// ==========================================
const THEME_COLOR = '#2D3A48';      // Header 主色
const PAGE_BG = '#838D95';         // 主要大背景色
const BUTTON_COLOR = '#7F8CDA';    // 建立大按鈕色

export default function CreateList({ onBack }) {
  const [listname, setListname] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActions, setSelectedActions] = useState([]);
  
  const favorites = useListStore((state) => state.favorites) || [];
  const addList = useListStore((state) => state.addList);

  // ==========================================
  // 【方案 A】各個互動元件的獨立動態控制
  // ==========================================
  const backAnimScale = useRef(new Animated.Value(1)).current;
  const selectBoxAnimScale = useRef(new Animated.Value(1)).current;
  const createBtnAnimScale = useRef(new Animated.Value(1)).current;

  const animateScale = (animValue, toValue, isSpring = false) => {
    if (isSpring) {
      Animated.spring(animValue, { toValue, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(animValue, { toValue, duration: 100, useNativeDriver: true }).start();
    }
  };

  const toggleSelection = (action) => {
    if (selectedActions.find(a => a.id === action.id)) {
      setSelectedActions(selectedActions.filter(a => a.id !== action.id));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const handleCreate = () => {
    if (listname.trim() === '') return Alert.alert('提示', '請輸入清單名稱');
    if (selectedActions.length === 0) return Alert.alert('提示', '請至少選擇一個動作');
    console.log("建立清單時送出的動作資料:", selectedActions);
    addList(listname, selectedActions);
    Alert.alert('成功', '清單已建立！', [{ text: '確定', onPress: onBack }]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.container}>
        {/* 1. Header 增設返回鍵與新標題 */}
        <View style={styles.header}>
          <Pressable 
            onPressIn={() => animateScale(backAnimScale, 0.92)}
            onPressOut={() => animateScale(backAnimScale, 1, true)}
            onPress={onBack}
            style={styles.backBtnWrapper}
          >
            <Animated.View style={[styles.iconButton, { transform: [{ scale: backAnimScale }] }]}>
              <TurnBackIcon width={20} height={20} stroke="#fff" color="#fff" />
            </Animated.View>
          </Pressable>
          <Text style={styles.headText}>建立我的清單</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 2. 內容區域：【關鍵改動】將原本的 View 改為 Pressable，並指派點擊即收回鍵盤 */}
        <Pressable 
          style={styles.mainWrapper} 
          onPress={Keyboard.dismiss}
          accessible={false} // 確保輔助功能不會將大背景誤判為一個巨型按鈕
        >
          <View style={styles.content}>
            
            {/* 清單名字輸入框 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>清單名字</Text>
              <TextInput
                style={styles.input}
                placeholder="輸入名字..."
                placeholderTextColor="#A5A5A5" 
                value={listname}
                onChangeText={setListname}
              />
            </View>

            {/* 選擇喜愛動作按鈕 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>選擇喜愛動作加入</Text>
              <Pressable 
                onPressIn={() => animateScale(selectBoxAnimScale, 0.97)}
                onPressOut={() => animateScale(selectBoxAnimScale, 1, true)}
                onPress={() => setModalVisible(true)}
              >
                <Animated.View style={[styles.input, { transform: [{ scale: selectBoxAnimScale }] }]}>
                  <Text style={styles.inputText}>
                    {selectedActions.length > 0 ? `已選擇 ${selectedActions.length} 項動作` : "已選擇...項動作"}
                  </Text>
                </Animated.View>
              </Pressable>
            </View>
          </View>

          {/* 3. 底部單一「建立」大按鈕區域 */}
          <View style={styles.fixedBottomContainer}>
            <Pressable 
              onPressIn={() => animateScale(createBtnAnimScale, 0.95)}
              onPressOut={() => animateScale(createBtnAnimScale, 1, true)}
              onPress={handleCreate}
              style={{ width: '100%' }}
            >
              <Animated.View style={[styles.createButton, { transform: [{ scale: createBtnAnimScale }] }]}>
                <Text style={styles.buttonText}>建立</Text>
              </Animated.View>
            </Pressable>
          </View>
        </Pressable>
      </View>

      {/* 選擇動作 Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalFullContainer}>
          <Text style={styles.modalTitle}>選擇喜愛動作</Text>
          <FlatList 
            data={favorites}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <Pressable 
                style={[styles.actionItem, selectedActions.find(a => a.id === item.id) && styles.selectedItem]}
                onPress={() => toggleSelection(item)}
              >
                <Text style={styles.actionName}>{item.name}</Text>
                {selectedActions.find(a => a.id === item.id) && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
            )}
          />
          <Pressable style={styles.confirmButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.confirmButtonText}>確認選取</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  container: { flex: 1, backgroundColor: PAGE_BG }, 
  header: { height: 80, backgroundColor: THEME_COLOR, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  backBtnWrapper: { width: 40, height: 40 },
  iconButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.12)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headText: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  
  mainWrapper: { flex: 1 }, 
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 60 },
  
  inputGroup: { marginBottom: 35 },
  label: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#000', letterSpacing: 1 },
  input: { 
    backgroundColor: '#D9D9D9', 
    height: 60, 
    borderRadius: 20, 
    paddingHorizontal: 25, 
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  inputText: { fontSize: 18, color: '#A5A5A5', fontWeight: '500' },
  
  fixedBottomContainer: { 
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  
  createButton: { 
    width: '100%', 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: BUTTON_COLOR, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 3,
    shadowColor: BUTTON_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: { fontSize: 22, fontWeight: '700', color: '#000', letterSpacing: 4 },

  modalFullContainer: { flex: 1, paddingTop: 40, paddingHorizontal: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  listPadding: { paddingBottom: 100 },
  actionItem: { padding: 20, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  selectedItem: { backgroundColor: '#E8F5E9' },
  actionName: { fontSize: 18 },
  checkMark: { color: '#2E7D32', fontWeight: 'bold', fontSize: 18 },
  confirmButton: { height: 60, backgroundColor: BUTTON_COLOR, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  confirmButtonText: { fontSize: 20, fontWeight: '700', color: '#000' }
});
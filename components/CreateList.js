import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import useListStore from '../store/useListStore';

const THEME_COLOR = '#A79E8D';

export default function CreateList({ onBack }) {
  const [listname, setListname] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActions, setSelectedActions] = useState([]);
  
  const favorites = useListStore((state) => state.favorites) || [];
  const addList = useListStore((state) => state.addList);

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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headText}>建立你的清單</Text>
        </View>

        {/* 內容區域：設定為 flex: 1 填滿 */}
        <View style={styles.mainWrapper}>
          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>清單名稱</Text>
              <TextInput
                style={styles.input}
                placeholder="例如：早晨喚醒..."
                placeholderTextColor="#999"
                value={listname}
                onChangeText={setListname}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>選擇喜愛動作</Text>
              <Pressable style={styles.input} onPress={() => setModalVisible(true)}>
                <Text style={styles.inputText}>
                  {selectedActions.length > 0 ? `已選擇 ${selectedActions.length} 項動作` : "點擊選擇動作..."}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 按鈕區域：固定在最底部 */}
          <View style={styles.fixedBottomContainer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onBack}>
              <Text style={styles.buttonText}>取消</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.createButton]} onPress={handleCreate}>
              <Text style={styles.buttonText}>建立</Text>
            </Pressable>
          </View>
        </View>
      </View>

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
            <Text style={styles.buttonText}>確認選取</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 95, backgroundColor: THEME_COLOR, alignItems: 'center', justifyContent: 'center' },
  headText: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  
  mainWrapper: { flex: 1 }, // 核心修正：讓主區域充滿空間
  content: { flex: 1, paddingHorizontal: 40, paddingTop: 50 },
  
  inputGroup: { marginBottom: 30 },
  label: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { backgroundColor: '#F0F0F0', height: 60, borderRadius: 30, paddingHorizontal: 25, justifyContent: 'center' },
  inputText: { fontSize: 18, color: '#666' },
  
  // 底部固定容器
  fixedBottomContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 40,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  
  button: { width: '45%', height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: '#E5989B' },
  createButton: { backgroundColor: '#A2FFB0' },
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
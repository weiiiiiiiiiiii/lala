import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

// 引入全域 Store 與靜態圖示
import useListStore from '../store/useListStore';
import TurnBackIcon from '../assets/images/TurnBack.svg';

import EditIcon from '../assets/images/pencil_icon.svg'; 
import CheckIcon from '../assets/images/OK_icon.svg'; 
import DragIcon from '../assets/images/drag_icon.svg'; 
import TrashIcon from '../assets/images/Trash.svg'; 

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

  const currentList = myLists.find(list => list.id.toString() === id?.toString());
  
  const [actionsList, setActionsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentList && currentList.actions) {
      setActionsList(currentList.actions);
    } else {
      setActionsList([
        { id: "test1", name: "靠牆轉身拉伸", detail: "單手撐牆，身體向反方向轉", time: "00:30", img: null }
      ]);
    }
  }, [currentList]);

  const handleDeleteAction = (actionId, actionName) => {
    Alert.alert('刪除動作', `確定要從清單移除 ${actionName} 嗎？`, [
      { text: '取消', style: 'cancel' },
      { 
        text: '刪除', 
        style: 'destructive', 
        onPress: () => {
          deleteActionFromList(currentList.id, actionId);
          setActionsList(prev => prev.filter(act => act.id !== actionId));
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
  };

  const backList = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/list');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={backList} style={styles.backButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headText}>{name || '清單名字'}</Text>
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
              <View key={item.id || index} style={styles.actionListItem}>
                {/* A. 左側：排序控制鈕 (上下鍵) */}
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
                    <Text style={styles.actionTitle}>{item.name}</Text>
                    <Text style={styles.actionDesc}>{item.detail}</Text>
                  </View>
                  <Text style={styles.timeText}>{item.time || '00:30'}</Text>
                </View>

                {/* C. 右側：圖片與垃圾桶 */}
                <View style={styles.imageWrapper}>
                  <View style={styles.imageContainer}>
                    {item.img ? (
                      <Image source={item.img} style={styles.actionImage} resizeMode="cover" />
                    ) : (
                      <Text style={{ fontSize: 12, color: '#999' }}>無圖</Text>
                    )}
                  </View>

                  {isEditing && (
                    <Pressable 
                      onPress={() => handleDeleteAction(item.id, item.name)} 
                      style={styles.trashBtn}
                    >
                      <TrashIcon width={24} height={24} />
                    </Pressable>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>目前沒有運動項目在此清單</Text>
            </View>
          )}

          {actionsList.length > 0 && (
            <Pressable 
              style={styles.addActionButton} 
              onPress={() => console.log("新增更多喜愛動作")}
            >
              <Text style={styles.addActionText}>+ 喜愛動作</Text>
            </Pressable>
          )}

          <View style={{ height: 160 }} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Pressable style={styles.startBtn}>
            <Text style={styles.startBtnText}>開始</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  headerWrapper: { backgroundColor: THEME_COLOR, height: 95, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headText: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingVertical: 10, paddingHorizontal: 20 },
  actionListItem: {
    width: '100%', 
    flexDirection: 'row', 
    paddingVertical: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dragControls: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 10,
  },
  dragHandleWrapper: {
    paddingVertical: 4,
  },
  arrowButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#f1f1f1',
    marginVertical: 2,
  },
  disabledArrow: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#444'
  },
  infoArea: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 10 },
  textGroup: { marginBottom: 15 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  actionDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  timeText: { fontSize: 16, fontWeight: '600' },
  imageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: { 
    width: 110, 
    height: 110, 
    backgroundColor: '#D9D9D9', 
    borderRadius: 10, 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionImage: { width: '100%', height: '100%' },
  trashBtn: {
    padding: 6,
    marginLeft: 8,
  },
  emptyContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 60 },
  emptyView: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', fontWeight: '500' },
  addActionButton: {
    backgroundColor: '#D9D9D9',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  addActionText: { fontSize: 16, fontWeight: 'bold' },
  bottomContainer: {
    position: 'absolute', bottom: 0, width: '100%', height: 120,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  startBtn: {
    width: width * 0.85, height: 80, backgroundColor: '#B2F6B1', borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  startBtnText: { fontSize: 32, fontWeight: 'bold', color: '#000', letterSpacing: 2 },
});
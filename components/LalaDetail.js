import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import LoveIcon from '../assets/images/LoveIcon.svg';
import LoveIconActive from '../assets/images/LoveIcon_active.svg';
import PlusTimeIcon from '../assets/images/PlusTime.svg';
import MinusTimeIcon from '../assets/images/MinusTime.svg';
import useListStore from '../store/useListStore';
import { ALL_STRETCHES } from './stretchData';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#A79E8D';

export default function LalaDetail({ title, onBack }) {
  const toggleFavoriteStore = useListStore((state) => state.toggleFavorite);
  const favorites = useListStore((state) => state.favorites) || [];
  const [actionList, setActionList] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [modalTime, setModalTime] = useState(30);

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

  const handleToggleFavorite = (item) => {
    const result = toggleFavoriteStore(item);
    if (result === 'added') {
      Alert.alert('提示', '已加入喜愛清單');
    } else {
      Alert.alert('提示', '已從喜愛清單移除');
    }
  };

  const isItemFavorite = (id) => favorites && favorites.some(fav => fav.id === id);

  const handleOpenModal = (item) => {
    setSelectedAction(item);
    setModalTime(30);
    setModalVisible(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <TurnBackIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headText}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {actionList.map((item) => (
            <Pressable
              key={item.id}
              style={styles.actionListItem}
              onPress={() => handleOpenModal(item)}
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
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Pressable style={({ pressed }) => [styles.startBtn, { opacity: pressed ? 0.9 : 1 }]}>
            <Text style={styles.startBtnText}>開始</Text>
          </Pressable>
        </View>
      </View>

      {/* 加入清單彈窗 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <Text style={styles.modalHeaderTitle}>{selectedAction?.name || '動作詳情'}</Text>

            <View style={styles.modalImageWrapper}>
              {selectedAction && (
                <Image source={selectedAction.img} style={styles.modalImage} resizeMode="contain" />
              )}
            </View>

            {/* 時間調整區 */}
            <View style={styles.timerRow}>
              <Pressable onPress={() => setModalTime(prev => Math.max(5, prev - 5))} style={styles.timerIconBtn}>
                <MinusTimeIcon width={32} height={32} />
              </Pressable>
              <Text style={styles.timerDisplay}>{formatTime(modalTime)}</Text>
              <Pressable onPress={() => setModalTime(prev => prev + 5)} style={styles.timerIconBtn}>
                <PlusTimeIcon width={32} height={32} />
              </Pressable>
            </View>

            {/* --- 動態讀取動作說明與注意事項 --- */}
            <ScrollView style={styles.detailsSection} showsVerticalScrollIndicator={false}>
              <View style={styles.noteArea}>
                <Text style={styles.noteTitle}>動作說明：</Text>
                <Text style={styles.noteContent}>
                  {selectedAction?.steps || "暫無詳細步驟說明。"}
                </Text>
              </View>

              <View style={[styles.noteArea, { marginTop: 15 }]}>
                <Text style={styles.noteTitle}>注意事項：</Text>
                <Text style={styles.noteContent}>
                  {selectedAction?.notice || "保持呼吸平穩，不要過度勉強拉伸，若感到刺痛請立即停止。"}
                </Text>
              </View>
            </ScrollView>

            <Pressable style={styles.addSubmitBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.addSubmitText}>加入清單</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  imageContainer: { width: 110, height: 110, backgroundColor: '#D9D9D9', marginLeft: 15, overflow: 'hidden' },
  actionImage: { width: '100%', height: '100%' },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, maxHeight: '80%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 20, left: 20 },
  closeText: { fontSize: 20, color: '#333' },
  modalHeaderTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 10, textAlign: 'center' },
  modalImageWrapper: { width: '100%', height: 180, backgroundColor: '#D9D9D9', borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  modalImage: { width: '100%', height: '100%' },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timerIconBtn: { padding: 5 },
  timerDisplay: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 25 },
  
  // 這裡加了 ScrollView 容器樣式
  detailsSection: { width: '100%', marginBottom: 20 },
  noteArea: { width: '100%' },
  noteTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  noteContent: { fontSize: 14, color: '#666', lineHeight: 22 },
  
  addSubmitBtn: { width: '100%', height: 55, backgroundColor: '#D9D9D9', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addSubmitText: { fontSize: 22, fontWeight: 'bold', color: '#000' },
});
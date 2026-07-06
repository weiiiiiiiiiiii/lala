import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable, Animated,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../config/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { pickimg } from '../utlis/PhotoHandler';
import { useTheme } from '../context/ThemeContext';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import OKicon from '../assets/images/OK_icon.svg';
import EditIcon from '../assets/images/pencil_icon.svg';

const genderOption = ['男', '女', '其他', '不願透露'];

export default function EditProfile({ onBack }) {
  const { colors } = useTheme();
  const [userData, setUserData] = useState({ name: '', gender: '', phone: '', email: '', avatar: null });
  const [loading, setLoading] = useState(true);
  const originalDataRef = useRef(null);

  // 編輯 bottom sheet
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isEditModal, setIsEditModal] = useState(false);

  // 性別選擇
  const [isGenderModal, setIsGenderModal] = useState(false);

  // 動畫
  const backScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  const animScale = (anim, to, spring = false) => {
    if (spring) {
      Animated.spring(anim, { toValue: to, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: to, duration: 100, useNativeDriver: true }).start();
    }
  };

  // 是否有未儲存的變更（render 期間計算，userData 改變就自動重算）
  const orig = originalDataRef.current;
  const hasChanges = orig !== null && (
    userData.name !== orig.name ||
    userData.gender !== orig.gender ||
    userData.phone !== orig.phone ||
    userData.email !== orig.email ||
    userData.avatar !== orig.avatar
  );

  // 從 Firebase 讀取使用者資料
  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          const initial = {
            name: user.displayName || d.name || '',
            gender: d.gender || '',
            phone: d.phone || '',
            email: user.email || d.email || '',
            avatar: d.avatar || null,
          };
          setUserData(initial);
          originalDataRef.current = { ...initial };
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  // 電子郵件遮罩
  const maskEmail = (email) => {
    if (!email) return '';
    const atIdx = email.indexOf('@');
    if (atIdx <= 0) return email;
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx);
    if (local.length <= 2) return email;
    return local[0] + '***' + local[local.length - 1] + domain;
  };

  // 電話遮罩
  const maskPhone = (phone) => {
    if (!phone || phone === '未設定') return phone || '未設定';
    if (phone.length <= 1) return phone;
    return '*'.repeat(phone.length - 1) + phone[phone.length - 1];
  };

  // 選取頭像（暫存本地，未儲存至 Firebase）
  const handleSelectPhoto = async () => {
    const base64String = await pickimg();
    if (!base64String) return;
    setUserData(prev => ({ ...prev, avatar: base64String }));
  };

  // 開啟文字編輯視窗
  const openEdit = (fieldKey, fieldLabel) => {
    if (fieldKey === 'gender') {
      setIsGenderModal(true);
      return;
    }
    setEditField({ key: fieldKey, label: fieldLabel });
    const current = userData[fieldKey];
    setEditValue((!current || current === '未設定') ? '' : current);
    setIsEditModal(true);
  };

  // 確認文字編輯（暫存本地，未儲存至 Firebase）
  const handleConfirmEdit = () => {
    if (!editField) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      Alert.alert('提示', '欄位不能為空');
      return;
    }
    setUserData(prev => ({ ...prev, [editField.key]: trimmed }));
    setIsEditModal(false);
  };

  // 確認性別（暫存本地，未儲存至 Firebase）
  const handleSelectGender = (selected) => {
    setUserData(prev => ({ ...prev, gender: selected }));
    setIsGenderModal(false);
  };

  // 一次儲存全部至 Firebase
  const doSaveAll = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        gender: userData.gender,
        phone: userData.phone,
        email: userData.email,
        avatar: userData.avatar,
      });
      if (userData.name !== originalDataRef.current?.name) {
        await updateProfile(user, { displayName: userData.name });
      }
      originalDataRef.current = { ...userData };
      onBack();
    } catch (e) {
      console.error(e);
      Alert.alert('錯誤', '儲存失敗，請稍後再試');
    }
  };

  const handleSaveAll = () => {
    Alert.alert(
      '確定要更新個人資料？',
      '',
      [
        { text: '取消', style: 'cancel' },
        { text: '確定', onPress: doSaveAll },
      ]
    );
  };

  const rows = [
    { key: 'name',   label: '名稱',    display: userData.name || '未設定' },
    { key: 'gender', label: '性別',    display: userData.gender || '未設定' },
    { key: 'email',  label: '電子郵件', display: maskEmail(userData.email) },
    { key: 'phone',  label: '電話',    display: maskPhone(userData.phone) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.headerBg }]} edges={['top']}>
      <StatusBar style="light" />

      {/* Header：左返回 右儲存 */}
      <View style={styles.header}>
        <Pressable
          onPressIn={() => animScale(backScale, 0.92)}
          onPressOut={() => animScale(backScale, 1, true)}
          onPress={onBack}
        >
          <Animated.View style={{ transform: [{ scale: backScale }] }}>
            <TurnBackIcon width={22} height={22} stroke="#fff" color="#fff" />
          </Animated.View>
        </Pressable>

        <Pressable
          onPressIn={() => hasChanges && animScale(saveScale, 0.92)}
          onPressOut={() => hasChanges && animScale(saveScale, 1, true)}
          onPress={hasChanges ? handleSaveAll : undefined}
        >
          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <Text style={[styles.saveText, { opacity: hasChanges ? 1 : 0.35 }]}>儲存</Text>
          </Animated.View>
        </Pressable>
      </View>

      {/* 頭像 + 用戶名稱 */}
      <View style={styles.avatarSection}>
        <Pressable onPress={handleSelectPhoto} style={styles.imgCon}>
          <Image
            source={userData.avatar ? { uri: userData.avatar } : null}
            style={styles.avatarImg}
          />
          <View style={styles.smallEditBtn}>
            <EditIcon width={16} height={16} stroke="#000" color="#424E58" />
          </View>
        </Pressable>
        <Text style={styles.usernameText}>
          {loading ? '' : (userData.name || '用戶名稱')}
        </Text>
      </View>

      {/* 分隔線 */}
      <View style={styles.fullDivider} />

      {/* 資料列表 */}
      <View style={styles.rowList}>
        {rows.map((row, index) => (
          <View key={row.key}>
            <Pressable style={styles.rowItem} onPress={() => openEdit(row.key, row.label)}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue} numberOfLines={1}>{row.display}</Text>
                <TurnBackIcon
                  width={18} height={18}
                  stroke="rgba(255,255,255,0.6)" color="rgba(255,255,255,0.6)"
                  style={{ transform: [{ scaleX: -1 }] }}
                />
              </View>
            </Pressable>
            {index < rows.length - 1 && <View style={styles.rowDivider} />}
          </View>
        ))}
      </View>

      {/* 文字編輯 bottom sheet */}
      <Modal
        visible={isEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModal(false)}
      >
        <Pressable style={styles.modalBG} onPress={() => setIsEditModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable style={styles.bottomSheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>
                {editField ? `編輯${editField.label}` : ''}
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.sheetInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder={editField ? `輸入新的${editField.label}` : ''}
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  autoFocus
                  keyboardType={
                    editField?.key === 'phone' ? 'phone-pad' :
                    editField?.key === 'email' ? 'email-address' : 'default'
                  }
                  autoCapitalize="none"
                />
                <Pressable onPress={handleConfirmEdit} style={styles.confirmBtn}>
                  <OKicon width={22} height={22} stroke="#20C93F" color="#20C93F" />
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* 性別選擇 bottom sheet */}
      <Modal
        visible={isGenderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setIsGenderModal(false)}
      >
        <Pressable style={styles.modalBG} onPress={() => setIsGenderModal(false)}>
          <View style={styles.genderSheet}>
            <View style={styles.genderTitleRow}>
              <Text style={styles.genderTitleText}>選擇性別</Text>
            </View>
            {genderOption.map((item, index) => (
              <Pressable
                key={item}
                style={[
                  styles.optionBtn,
                  index === genderOption.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleSelectGender(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
                {userData.gender === item && (
                  <OKicon width={24} height={24} stroke="#20C93F" color="#20C93F" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  saveText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  imgCon: { position: 'relative', width: 100, height: 100 },
  avatarImg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#D9D9D9',
  },
  smallEditBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', opacity: 0.85,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 3,
  },
  usernameText: { marginTop: 14, fontSize: 18, fontWeight: '600', color: '#fff' },

  fullDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  rowList: { paddingTop: 4 },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  rowLabel: { fontSize: 16, color: '#fff', fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 200 },
  rowDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 24,
  },

  modalBG: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },

  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 22, paddingHorizontal: 24, paddingBottom: 44,
  },
  sheetTitle: {
    fontSize: 20, fontWeight: '600', color: '#111',
    textAlign: 'center', marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEBEB',
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  sheetInput: { flex: 1, fontSize: 16, color: '#111' },
  confirmBtn: { marginLeft: 8 },

  genderSheet: {
    backgroundColor: '#F4F4F4',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 10, paddingBottom: 40,
  },
  genderTitleRow: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 0.5, borderBottomColor: '#DDD',
  },
  genderTitleText: { fontSize: 24, fontWeight: '500', color: '#000' },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 25, paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  optionText: { fontSize: 18, color: '#000' },
});

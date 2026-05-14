import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

import TurnBackIcon from '../assets/images/TurnBack.svg';
import { useRouter } from 'expo-router';

export default function Profile() {

  //使用者狀態
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(true);

  //使用者登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInit(false);
    });
    return unsubscribe;
  }, []);

  //登出邏輯
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('已成功登出');
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  //偵測是否login
  const userLogin = !!user;

  if (init) return null;

  const router = useRouter();


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 登入頭像確認區 */}
      <View style={styles.Logincontent}>
        <View style={styles.Logincheck}>
          <Image style={styles.avatarPlaceholder} />
          <Text style={styles.Usertext}>登入/註冊</Text>
        </View>
        <Pressable
          onPress={()=>router.push('/loginsignup')}
        >
          <TurnBackIcon width={24} height={24} style={{ transform: [{ scaleX: -1 }] }} />
        </Pressable>
      </View>

      {/* 設定 */}
      <View style={styles.settingCon}>
        <View style={{ paddingHorizontal: 20, gap: 30, }}>
          {/* 運動設定 */}
          <View>
            <Text style={styles.settingText}>運動設定</Text>
            <View style={styles.hr1}></View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                <Text style={userLogin ? styles.setItemText : styles.setItemText2}>預設運動時間</Text>
                <Pressable>
                  <Text style={userLogin ? styles.setTimeText : styles.setTimeText2}>00:30</Text>
                </Pressable>
              </View>
              <View style={styles.hr2}></View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                <Text style={userLogin ? styles.setItemText : styles.setItemText2}>每次休息時間</Text>
                <Pressable>
                  <Text style={userLogin ? styles.setTimeText : styles.setTimeText2}>00:30</Text>
                </Pressable>
              </View>
              <View style={styles.hr2}></View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                <Text style={userLogin ? styles.setItemText : styles.setItemText2}>姿勢準備倒計時</Text>
                <Pressable>
                  <Text style={userLogin ? styles.setTimeText : styles.setTimeText2}>00:30</Text>
                </Pressable>
              </View>
              <View style={styles.hr2}></View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                <Text style={userLogin ? styles.setItemText : styles.setItemText2}>提示音量</Text>
                <Pressable>
                  <Text style={userLogin ? styles.setTimeText : styles.setTimeText2}>00:30</Text>
                </Pressable>
              </View>
            </View>
          </View>
          {/* 其他 */}
          <View>
            <Text style={styles.settingText}>其他</Text>
            <View style={styles.hr1}></View>
            <View>
              <Pressable>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                  <Text style={userLogin ? styles.setItemText : styles.setItemText2}>問題回報</Text>
                </View>
              </Pressable>
              <View style={styles.hr2}></View>
            </View>
            <View>
              <Pressable>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                  <Text style={userLogin ? styles.setItemText : styles.setItemText2}>聯絡我們</Text>
                </View>
              </Pressable>
            </View>

          </View>
        </View>


        {/* 登出按鈕 */}
        {userLogin && (
          <Pressable
            onPress={handleLogout}
            style={styles.logoutCon}
          >
            <View style={styles.logoutCon}>
              <Text style={styles.logoutText}>登出</Text>
            </View>
          </Pressable>
        )}


      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8D1B9', // 統一 LALA 的褐灰色底
  },
  Logincheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,

  },
  Logincontent: {
    flex: 1.5,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',

  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#EAE0D5',
    justifyContent: 'center',
    alignItems: 'center',
    // 增加一點點陰影感
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

  },
  settingCon: {
    flex: 5,
    backgroundColor: '#C1B69C',
    paddingVertical: 50,
    gap: 50,
  },
  hr1: {
    borderBottomColor: '#898170',
    borderBottomWidth: 1,
    marginVertical: 15,
    width: '100%'
  },
  hr2: {
    borderBottomColor: '#A79E8D',
    borderBottomWidth: 1,
    marginVertical: 15,
    width: '100%'
  },
  logoutCon: {
    backgroundColor: '#898170',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  Usertext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  settingText: {
    color: '#9E554D',
    fontSize: 18,
    fontWeight: 500
  },
  setItemText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 500
  },
  setTimeText: {
    color: '#FFFBDD',
    fontSize: 16,
    fontWeight: 500
  },
  setItemText2: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 500,
    opacity: 0.2
  },
  setTimeText2: {
    color: '#FFFBDD',
    fontSize: 16,
    fontWeight: 500,
    opacity: 0.5
  },
  logoutText: {
    color: '#F02A2A',
    fontSize: 16,
    fontWeight: 500
  }
});
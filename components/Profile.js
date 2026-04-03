import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>我的個人檔案</Text>
        
        {/* 大頭貼預留位置 */}
        <View style={styles.avatarPlaceholder}>
            <Text style={{ color: '#A09484' }}>Logo/Avatar</Text>
        </View>
        
        <Text style={styles.subText}>設定與個人資料開發中</Text>
        
        {/* 之後可以在這裡加按鈕，例如：登出、編輯資料等 */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2B39A', // 統一 LALA 的褐灰色底
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EAE0D5',
    marginVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // 增加一點點陰影感
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subText: {
    fontSize: 16,
    color: '#4A4A4A',
    letterSpacing: 0.5,
  },
});
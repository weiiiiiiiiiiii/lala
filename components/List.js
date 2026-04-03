import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// 使用正確的來源，避開 VS Code 的刪除線警告
import { SafeAreaView } from 'react-native-safe-area-context';

export default function List() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>這裡是清單頁面</Text>
        <Text style={styles.subText}>（包子嗨）</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2B39A', // 確保背景色填滿整個安全區域
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
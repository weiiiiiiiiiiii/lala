import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function List() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>這裡是清單頁面</Text>
      <Text style={styles.subText}>（包子嗨）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C2B39A', // 維持你的 LALA 主色
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
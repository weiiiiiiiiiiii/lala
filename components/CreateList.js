import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateList({ onBack }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headText}>建立你的清單</Text>
        </View>

        {/* 內容區塊 */}
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>清單名字</Text>
            <TextInput
              style={styles.input}
              placeholder="輸入名字..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>選擇喜愛動作加入</Text>
            <TextInput
              style={styles.input}
              placeholder="已選擇...項動作"
              placeholderTextColor="#999"
              editable={false}
            />
          </View>

          {/* 按鈕區域 */}
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.button, styles.cancelButton]} 
              onPress={onBack}
            >
              <Text style={styles.buttonText}>取消</Text>
            </Pressable>

            <Pressable 
              style={[styles.button, styles.createButton]} 
              onPress={onBack}
            >
              <Text style={styles.buttonText}>建立</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#A79E8D', // 確保狀態列填色正確
  },
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  header: {
    height: 95,
    backgroundColor: '#A79E8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  inputGroup: {
    marginBottom: 60,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    backgroundColor: '#E0E0E0',
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 25,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 50,
  },
  button: {
    width: '45%',
    height: 100,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: '#E5989B' },
  createButton: { backgroundColor: '#A2FFB0' },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
});
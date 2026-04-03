// 修改後
import { View, Text, StyleSheet } from 'react-native';
import List from '../../components/List'; // 引入你的清單元件

export default function ListPage() {
  return (
      <View style={styles.content}>
        <List />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2B39A', // 建議維持與主頁一致的背景色
  },
  content: {
    flex: 1,
  },
});
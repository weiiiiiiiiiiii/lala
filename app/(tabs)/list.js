// 修改後
import { View, StyleSheet } from 'react-native';
import MyList from '../../components/MyList'; // 引入你的清單元件

export default function ListPage() {
  return (
      <View style={styles.content}>
        <MyList />
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
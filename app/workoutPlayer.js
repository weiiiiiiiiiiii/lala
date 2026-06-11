import React, { memo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import WorkoutPlayerComponent from '../components/WorkoutPlayer';

// 💡 使用 React.memo 包裹核心核心組件，強行鎖死 React 的重繪判定
const MemoizedPlayer = memo(function MemoizedPlayer({ title, data }) {
  return <WorkoutPlayerComponent listTitle={title} actionsData={data} />;
}, (prevProps, nextProps) => {
  // 核心防禦機制：只有當傳進來的動作資料「真正改變」時才允許重繪，iOS 物理翻轉時一律無視、不准重繪！
  return prevProps.data === nextProps.data && prevProps.title === nextProps.title;
});

export default function WorkoutPlayerPage() {
  const params = useLocalSearchParams();

  // 進行基本的空值防禦
  const listTitle = params.listTitle || '伸展運動';
  const actionsData = params.actionsData || '[]';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* 透過 MemoizedPlayer 鋼鐵護盾，徹底隔離 iOS 翻轉時的 Remount 效應 */}
      <MemoizedPlayer 
        title={listTitle} 
        data={actionsData} 
      />
    </View>
  );
}
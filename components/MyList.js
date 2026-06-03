import React, { useState } from 'react';
import { FlatList, Pressable, View, Text, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // 引入路由
import ListScroll from './ListScroll';
import PlusIcon from '../assets/images/Plus.svg';
import useListStore from '../store/useListStore';
import TurnBackIcon from '../assets/images/TurnBack.svg';

// 💡 移除 require 圖片路徑，避免編譯報錯；未來直接對齊 Firestore Document 結構
const recommend = [
  {
    id: 'rec_full_body',
    name: '全身伸展',
    actions: [
      { id: 'm2', name: '眼鏡蛇式', detail: '骨盆保持貼地，下背部不要感到劇烈壓迫。', time: '00:30', img: null },
      { id: 'm3', name: '鳥犬式', detail: '專注於身體的平衡與穩定。', time: '00:30', img: null }
    ]
  },
  {
    id: 'rec_upper_limb',
    name: '上肢伸展',
    actions: [
      { id: 'b2', name: '背手下壓', detail: '過程中保持挺胸，不要駝背。', time: '00:30', img: null }
    ]
  },
  {
    id: 'rec_back',
    name: '背部伸展',
    actions: [
      { id: 'l1', name: '貓式伸展', detail: '動作隨著呼吸頻率進行，感受脊椎活動。', time: '00:30', img: null }
    ]
  },
  {
    id: 'rec_lower_limb',
    name: '下肢伸展',
    actions: [
      { id: 'f2', name: '反手撐地', detail: '手肘微彎避免鎖死。', time: '00:30', img: null }
    ]
  },
];

export default function MyList() {
  const router = useRouter();
  const [recommendItem] = useState(recommend);

  // 取得喜愛清單與我的清單
  const favorites = useListStore((state) => state.favorites) || [];
  const myLists = useListStore((state) => state.myLists) || [];

  const removeList = useListStore((state) => state.removeList);

  // 清單展開收合
  const [isShow, showed] = useState(false);
  const showNum = isShow ? recommendItem : recommendItem.slice(0, 0);

  const [isMyShow, Myshowed] = useState(false);


  const userCustomLists = myLists.filter(list => !list.id.toString().startsWith('rec_'));

  // 讓我的清單收合控制改為讀取過濾後的乾淨陣列
  const MyshowNum = isMyShow ? userCustomLists : userCustomLists.slice(0, 0);

  const handlongPress = (id, title) => {
    Alert.alert(
      '刪除清單',
      `確定要刪除 ${title} 清單嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '刪除', style: 'destructive', onPress: () => removeList(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#A79E8D' }]} edges={['top']}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headText}>我的清單</Text>
      </View>

      {/* 2. 內容區塊（只純粹包裹 ScrollView） */}
      <View style={{ flex: 1, backgroundColor: '#C1B69C' }}>
        <ScrollView contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
          <View style={styles.listCon}>

            {/* 💡 核心修改：移除今日清單，將喜愛清單調整為寬度大卡片，整體置中排版 */}
            <View style={{ paddingHorizontal: 15, alignItems: 'center', marginBottom: 10 }}>
              <View style={[styles.listitem, { width: '100%' }]}>
                <Text style={styles.listText}>喜愛</Text>
                <Pressable
                  style={[styles.card, { width: '100%', height: 120 }]} // 💡 高度稍微拉高到 120 更有大圖氣勢
                  onPress={() => {
                    router.push({
                      pathname: '/exerciseDetail',
                      params: { name_zh: '喜愛清單', mode: 'favorites' }
                    });
                  }}
                >
                  <Image
                    source={require('../assets/images/ListPic/Favorite.png')}
                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                    resizeMode="cover"
                  />
                </Pressable>
              </View>
            </View>

            {/* 推薦與我的 */}
            <View>
              {/* 推薦 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 15 }}>
                <Text style={styles.listText2}>推薦</Text>
                <Pressable onPress={() => showed(!isShow)}>
                  <View>
                    <TurnBackIcon
                      width={24}
                      height={24}
                      style={{ transform: [{ rotate: isShow ? '-90deg' : '90deg' }] }}
                    />
                  </View>
                </Pressable>
              </View>

              {/* 修正推薦清單渲染：回歸渲染 recommend 陣列（不與 userCustomLists 混淆） */}
              <View style={styles.listitem2}>
                {showNum.map((item) => (
                  <ListScroll
                    key={item.id}
                    part={{
                      id: item.id,
                      name: item.name,
                      pathname: '/exerciseDetail', // 指定跳轉去 LalaDetail 模板頁面
                      params: {
                        name_zh: item.name,        // 傳遞名稱（如「全身伸展」）讓 LalaDetail 順利至 stretchData 撈取動作
                        mode: 'recommend',         // 標記為推薦模式
                        id: item.id
                      }
                    }}
                  />
                ))}
              </View>

              {/* 我的清單 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 15 }}>
                <Text style={styles.listText2}>我的</Text>
                <Pressable onPress={() => Myshowed(!isMyShow)}>
                  <View>
                    <TurnBackIcon
                      width={24}
                      height={24}
                      style={{ transform: [{ rotate: isMyShow ? '-90deg' : '90deg' }] }}
                    />
                  </View>
                </Pressable>
              </View>

              {/* 修正我的清單渲染：正確比對與讀取 userCustomLists */}
              <View style={styles.listitem2}>
                {userCustomLists.length === 0 ? (
                  <View style={{ paddingVertical: 10 }}>
                    <Text style={styles.alertText}>點擊下方 + 建立你的清單</Text>
                  </View>
                ) : (
                  MyshowNum.map((item) => (
                    <ListScroll
                      key={item.id}
                      part={{
                        id: item.id,
                        name: item.title,
                        pathname: '/emptyList',
                        params: { id: item.id, name: item.title }
                      }}
                      onLongPress={() => handlongPress(item.id, item.title)}
                    />
                  ))
                )}
              </View>
            </View>

          </View>
        </ScrollView>
      </View>

      {/* 3. 加號建立清單按鈕 */}
      <Pressable
        onPress={() => router.push('/create')}
        style={styles.btn}
      >
        <PlusIcon width={35} height={35} stroke={'#000'} strokeWidth={2.5} fill="none" />
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    height: 95,
    backgroundColor: '#A79E8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCon: { paddingVertical: 20 },
  listitem: { gap: 10, height: 'auto' },
  listitem2: { gap: 10, height: 'auto', justifyContent: 'center', alignItems: 'center' },
  list: { gap: 20, paddingHorizontal: 15 },
  headText: { fontSize: 28, fontWeight: 'bold' },
  listText: { fontSize: 18, fontWeight: 'bold' },
  listText2: { fontSize: 18, fontWeight: 'bold', paddingLeft: 15, paddingVertical: 15 },
  btn: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FBFD97',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  card: {
    width: 190,
    height: 100,
    backgroundColor: '#FFF4EA',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  alertText: {
    fontSize: 14, color: '#666', fontWeight: '500'
  },
  scrollInner: {
    flexGrow: 1,
    gap: 15,
  }
});
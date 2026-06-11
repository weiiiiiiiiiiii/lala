import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

import HomeIcon from '../../assets/images/home_icon.svg';
import ListIcon from '../../assets/images/list_icon.svg';
import UserIcon from '../../assets/images/user_icon.svg';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const Colors = {
    bg: colors.navBg,
    active: colors.navActive,
    inactive: colors.navInactive,
    indicator: colors.navIndicator,
  };

  // 藥丸規格設定
  const BUTTON_WIDTH = 75;
  const TAB_BAR_HEIGHT = 60 + insets.bottom;
  const PADDING_TOP = 15;

  // 用於計算每個分頁中心的 X 軸位置 (總共 3 個分頁)
  const totalTabs = 3;
  const tabWidth = width / totalTabs;
  // 讓藥丸完美居中在每個分頁格子裡
  const getIndicatorX = (index) => {
    return tabWidth * index + (tabWidth - BUTTON_WIDTH) / 2;
  };

  // 動態動畫數值
  const translateX = useRef(new Animated.Value(getIndicatorX(0))).current;

  // 自訂客製化 TabBar 元件，完整保留 expo-router 傳進來的狀態與導覽邏輯
  const CustomTabBar = ({ state, descriptors, navigation }) => {
    
    // 監聽分頁切換，觸發平滑滑動動畫
    useEffect(() => {
      Animated.spring(translateX, {
        toValue: getIndicatorX(state.index),
        velocity: 10,
        tension: 60,
        friction: 9, // 微量彈性，讓滑動更有現代 UI 的 Q 彈律動感
        useNativeDriver: true, // 啟用原生驅動器，確保 60fps 絕不卡頓
      }).start();
    }, [state.index]);

    return (
      <View style={[styles.tabBarContainer, { height: TAB_BAR_HEIGHT, backgroundColor: Colors.bg, paddingBottom: insets.bottom > 0 ? insets.bottom : 6, paddingTop: PADDING_TOP }]}>
        
        {/* 【魔術核心】絕對定位的平滑滑動藥丸背景 */}
        <Animated.View
          style={[
            styles.animatedIndicator,
            {
              width: BUTTON_WIDTH,
              backgroundColor: Colors.indicator,
              transform: [{ translateX }],
              // 動態計算藥丸的頂部垂直居中位置
              top: PADDING_TOP,
            },
          ]}
        />

        {/* 渲染各個分頁按鈕 */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? Colors.active : Colors.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          // 根據分頁路由動態對應圖示與文字
          const renderIconAndLabel = () => {
            if (route.name === 'index') {
              return (
                <>
                  <HomeIcon key={`home-${isFocused}`} width={20} height={20} stroke={color} color={color} fill="none" />
                  <Text style={[styles.labelText, { color }]}>主頁</Text>
                </>
              );
            } else if (route.name === 'list') {
              return (
                <>
                  <ListIcon key={`list-${isFocused}`} width={20} height={20} stroke={color} color={color} fill="none" />
                  <Text style={[styles.labelText, { color }]}>清單</Text>
                </>
              );
            } else if (route.name === 'profile') {
              return (
                <>
                  <UserIcon key={`user-${isFocused}`} width={20} height={20} stroke={color} color={color} fill="none" />
                  <Text style={[styles.labelText, { color }]}>我的</Text>
                </>
              );
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrapper, { width: BUTTON_WIDTH }]}>
                {renderIconAndLabel()}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />} // 使用我們自訂的滑動動畫 TabBar
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: '主頁' }} />
      <Tabs.Screen name="list" options={{ title: '清單' }} />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    height: 48,             
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,     
  },
  animatedIndicator: {
    position: 'absolute',
    height: 48,             
    borderRadius: 25,       
  },
  labelText: {
    fontSize: 11,           
    fontWeight: '700',
    marginTop: 3,           
  },
});
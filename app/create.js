import React from 'react';
import CreateList from '../components/CreateList';
import { useRouter } from 'expo-router';

export default function CreateRoute() {
  const router = useRouter();

  // 使用 router.back() 讓取消或建立後能回到原本的清單頁
  return <CreateList onBack={() => router.back()} />;
}
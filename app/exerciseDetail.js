import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LalaDetail from '../components/LalaDetail';

export default function ExerciseDetailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <LalaDetail 
      title={params.name_zh || '拉伸動作'} 
      onBack={() => router.back()} 
    />
  );
}
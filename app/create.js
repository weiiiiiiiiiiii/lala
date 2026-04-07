import React from 'react';
import CreateList from '../components/CreateList';
import { useRouter } from 'expo-router';

export default function CreateRoute() {
  const router = useRouter();

  return <CreateList onBack={() => router.back()} />;
}
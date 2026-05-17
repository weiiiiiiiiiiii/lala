import React from 'react';
import EditProfile from '../components/EditProfile';
import { useRouter } from 'expo-router';

export default function EditProfileRoute() {
  const router = useRouter();

  return <EditProfile onBack={() => router.back()} />;
}
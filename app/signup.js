import React from 'react';
import SignUp from '../components/SignUp';
import { useRouter } from 'expo-router';

export default function CreateRoute() {
  const router = useRouter();

  return <SignUp onBack={() => router.back()} />;
}
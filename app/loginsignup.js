import React from 'react';
import LoginOrSignup from '../components/LoginOrSignup';
import { useRouter } from 'expo-router';

export default function LoginSignUPRoute() {
  const router = useRouter();

  return <LoginOrSignup onBack={() => router.back()} />;
}
import { useLocalSearchParams, useRouter } from 'expo-router';
import ActionDetail from '../components/ActionDetail';

export default function ActionDetailRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <ActionDetail 
      actionId={params.actionId}
      parentTitle={params.parentTitle}
      onBack={() => router.back()}
    />
  );
}
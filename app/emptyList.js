import { useLocalSearchParams, useRouter } from "expo-router";
import EmptyList from "../components/EmptyList";


export default function EmptyListRoute(){
    const router = useRouter();
      const params = useLocalSearchParams();
    
      return (
        <EmptyList 
          title={params.name_zh || '拉伸動作'} 
          onBack={() => router.back()} 
        />
      );
}
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const pickimg=async()=>{
    const {status}=await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=='granted'){
        Alert.alert('抱歉', '我們需要相簿權限');
        return;
    }

    let result=await ImagePicker.launchImageLibraryAsync({
        mediaTypes:['images'],
        allowsEditing:true,
        aspect:[4,3],
        quality:0.4,
        base64:true,
    });

    if(!result.canceled){
        const base64String=`data:image/jpeg;base64,${result.assets[0].base64}`;
        return base64String;
    }
    return null;
}

export {pickimg};
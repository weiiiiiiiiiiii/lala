import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator'; // 💡 1. 引入強大的圖片處理套件
import { Alert } from 'react-native';

const pickimg = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('抱歉', '我們需要相簿權限');
        return null; 
    }

    // 2. 讓 ImagePicker 純粹負責選照片和原生裁切
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1, // 這裡先給 1 沒關係，後面會強制壓縮
    });

    if (!result.canceled) {
        try {
            // 💡 3. 核心大招：強制將圖片調整為 200x200 像素，並壓縮畫質為 30%
            // 這一步會在底層生成一張真正的小圖，並轉出極小的 Base64 字串
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri, // 使用選取圖片的本地路徑
                [{ resize: { width: 200, height: 200 } }], // 強制縮圖尺寸
                { 
                    compress: 0.3, // 畫質壓縮到 30%
                    format: ImageManipulator.SaveFormat.JPEG, 
                    base64: true 
                }
            );

            const base64String = `data:image/jpeg;base64,${manipResult.base64}`;
            return base64String;
            
        } catch (error) {
            console.error('圖片壓縮失敗:', error);
            Alert.alert('錯誤', '圖片處理失敗，請換一張試試');
            return null;
        }
    }
    return null;
}

export { pickimg };
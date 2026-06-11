import { SafeAreaView } from 'react-native-safe-area-context';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import { Alert, Button, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Systrace, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { pickimg } from '../utlis/PhotoHandler';
import Edit from '../assets/images/pencil_icon.svg';
import { Modal } from 'react-native';
import OKicon from '../assets/images/OK_icon.svg';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

// ==========================================
// 統一更換為與登入頁面相同的設計圖配色變數
// ==========================================
const BG_COLOR = '#626C72';         // 滿版主要背景顏色
const INPUT_BG = '#424E58';         // 輸入欄背景顏色
const BTN_COLOR = '#9E554D';        // 註冊按鈕顏色

export default function SignUp({ onBack }) {
    const router = useRouter();

    //頭像圖片
    const [photo, setPhoto] = useState(null);
    const handleSelectPhoto = async () => {
        const base64String = await pickimg();
        setPhoto(base64String);
    }

    //性別選擇
    const [gender, setGender] = useState('');
    const [ismodal, setIsmodal] = useState(false);
    const genderOption = ['男', '女', '其他', '不便透露'];
    const handleSelectGender = (selected) => {
        setGender(selected);
        setIsmodal(false);
    }

    //資料
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [checkpass, setCheckpass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!mail || !password || !name) {
            Alert.alert('錯誤', '名稱、電子郵件、密碼為必填項目');
            return;
        }
        if (password !== checkpass) {
            Alert.alert('錯誤', '兩次密碼輸入不一致');
            return;
        }

        setLoading(true);
        try {
            const userAccount = await createUserWithEmailAndPassword(auth, mail.trim(), password);
            const uid = userAccount.user.uid;

            await updateProfile(userAccount.user, {
                displayName: name
            });

            await setDoc(doc(db, 'users', uid), {
                uid: uid,
                name: name,
                gender: gender || '未設定',
                phone: phone || '未設定',
                avatar: photo,
                workoutTime: '00:30',
                restTime: '00:30',
                countdownTime: '00:30',
                volume: '80',
                createdAt: new Date(),
            })

            await signOut(auth);

            Alert.alert('成功', '註冊成功!清輸入帳密進行登入', [
                { text: '確定', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            let errorMsg = '註冊失敗，請稍後再試';
            if (error.code === 'auth/email-already-in-use') {
                errorMsg = '此電子郵件已被註冊，請直接登入';
            } else if (error.code === 'auth/weak-password') {
                errorMsg = '密碼強度不足，長度至少需 6 個字元';
            }
            Alert.alert('註冊錯誤', errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (

        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
            >

                <Pressable
                    onPress={() => router.back()}
                    style={{ marginBottom: 10 }}
                >
                    {/* 💡 加上控色，讓返回按鈕在深夜藍灰底色下正常顯示 */}
                    <TurnBackIcon width={24} height={24} stroke="#fff" color="#fff" />
                </Pressable>
                <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
                    {/* 頭像區 */}
                    <View style={{ gap: 20 }}>
                        <View style={styles.signupCon}>
                            <Pressable onPress={handleSelectPhoto} style={styles.imgCon}>
                                <Image
                                    source={photo ? { uri: photo } : null}
                                    style={styles.img}
                                />
                                <View style={styles.smallEditBtn}>
                                    <Edit width={16} height={16} stroke="#000"/>
                                </View>
                            </Pressable>
                            <View style={styles.hr}></View>
                        </View>

                        {/* 輸入項目區 */}
                        <Pressable
                            onPress={Keyboard.dismiss}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.signItemCon}>
                                <View style={styles.itemCon}>
                                    <Text style={styles.nameText}>名稱</Text>
                                    <View style={styles.inputCon}>
                                        <TextInput
                                            style={styles.innerText}
                                            placeholder="請輸入名稱"
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)" // 💡 智慧優化：防深色底吞字
                                            value={name}
                                            onChangeText={setName}
                                        />
                                    </View>
                                </View>
                                <View style={styles.itemCon}>
                                    <Text style={styles.nameText}>性別</Text>

                                    <Pressable
                                        style={styles.inputCon}
                                        onPress={() => setIsmodal(true)}
                                    >
                                        <Text style={[styles.innerText, gender ? { opacity: 1 } : { opacity: 0.4 }]}>
                                            {gender || "請選擇性別"}
                                        </Text>
                                    </Pressable>

                                </View>
                                <View style={styles.itemCon}>
                                    <Text style={styles.nameText}>電話</Text>
                                    <View style={styles.inputCon}>
                                        <TextInput
                                            style={styles.innerText}
                                            placeholder="請輸入電話"
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)" // 💡 智慧優化：防深色底吞字
                                            value={phone}
                                            onChangeText={setPhone}
                                        />
                                    </View>
                                </View>
                                <View style={styles.itemCon}>
                                    <Text style={styles.nameText}>電子郵件</Text>
                                    <View style={styles.inputCon}>
                                        <TextInput
                                            style={styles.innerText}
                                            placeholder="請輸入電子郵件"
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)" // 💡 智慧優化：防深色底吞字
                                            autoCapitalize='none'
                                            keyboardType='email-address'
                                            value={mail}
                                            onChangeText={setMail}
                                        />
                                    </View>
                                </View>
                                <View style={styles.itemCon}>
                                    <Text style={styles.nameText}>密碼</Text>
                                    <View style={styles.inputCon}>
                                        <TextInput
                                            style={styles.innerText}
                                            placeholder="請輸入密碼"
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)" // 💡 智慧優化：防深色底吞字
                                            secureTextEntry={true}
                                            autoCapitalize='none'
                                            value={password}
                                            onChangeText={setPassword}
                                        />
                                    </View>
                                </View>
                                <View style={styles.itemCon}>
                                    <Text style={styles.nameText}>密碼確認</Text>
                                    <View style={styles.inputCon}>
                                        <TextInput
                                            style={styles.innerText}
                                            placeholder="請再次輸入密碼"
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)" // 💡 智慧優化：防深色底吞字
                                            secureTextEntry={true}
                                            autoCapitalize='none'
                                            value={checkpass}
                                            onChangeText={setCheckpass}
                                        />
                                    </View>
                                </View>

                            </View>
                        </Pressable>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
            <View style={{ alignItems: 'center' }}>
                <Pressable
                    style={styles.btn}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    <Text style={styles.signupText}>{loading ? '註冊中...' : '註冊'}</Text>
                </Pressable>
            </View>

            {/* 性別選擇視窗 */}
            <Modal
                visible={ismodal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsmodal(false)}
            >
                <Pressable
                    style={styles.modalBG}
                    onPress={() => setIsmodal(false)}
                >
                    <View style={styles.modal}>
                        <View style={styles.modalTitle}>
                            <Text style={styles.genderTitleText}>選擇性別</Text>
                        </View>
                        {genderOption.map((item, index) => (
                            <Pressable
                                key={item}
                                style={[
                                    styles.optionBtn,
                                    index === genderOption.length - 1 && { borderBottomWidth: 0 }
                                ]}
                                onPress={() => {
                                    setGender(item);
                                    setIsmodal(false)
                                }}
                            >
                                <Text style={styles.optionText}>{item}</Text>
                                {gender === item && (
                                    <OKicon size={24} stroke="#20C93F" color="#20C93F" />
                                )}
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR, // 💡 換上高級大背景色 626C72
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    signupCon: {
        alignItems: 'center',
        gap: 20
    },
    img: {
        width: 120,
        height: 120,
        borderRadius: 100,
        backgroundColor: '#D9D9D9'
    },
    imgCon: {
        position: 'relative',
        width: 120,
        height: 120,
    },
    smallEditBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        opacity: 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    hr: {
        borderBottomColor: 'rgba(255, 255, 255, 0.15)', // 💡 更換為具現代感的微透明白線
        borderBottomWidth: 1,
        width: '100%'
    },
    inputCon: {
        backgroundColor: INPUT_BG, // 💡 換上輸入框底色 424E58
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    itemCon: {
        gap: 10
    },
    signItemCon: {
        gap: 10
    },
    btn: {
        position: 'absolute',
        backgroundColor: BTN_COLOR, // 💡 綁定註冊按鈕顏色變數 9E554D
        bottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        paddingVertical: 15,
        borderRadius: 50
    },
    modalBG: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end'
    },
    modal: {
        paddingTop: 10,
        paddingBottom: 40,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#F4F4F4',
        width: '100%'
    },
    modalTitle: {
        paddingVertical: 20,
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DDD',
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee'
    },
    nameText: {
        paddingLeft: 10,
        color: '#fff', // 💡 更換為純白，與深色底框形成高對比
        fontSize: 16,
        fontWeight: '500'
    },
    innerText: {
        color: '#fff', // 💡 打字顏色換上純白，字體絕不被吞掉
        fontSize: 14,
        fontWeight: '400',
    },
    signupText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500'
    },
    genderTitleText: {
        color: '#000',
        fontSize: 24,
        fontWeight: '500'
    },
    optionText: {
        fontSize: 18,
        color: '#000'
    }
})
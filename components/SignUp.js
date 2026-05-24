import { SafeAreaView } from 'react-native-safe-area-context';
import TurnBackIcon from '../assets/images/TurnBack.svg';
import { Button, Image, Keyboard, Pressable, ScrollView, StyleSheet, Systrace, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { pickimg } from '../utlis/PhotoHandler';
import Edit from '../assets/images/pencil_icon.svg';
import { Modal } from 'react-native';
import OKicon from '../assets/images/OK_icon.svg';


export default function SignUp({ onBack }) {

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

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Pressable
                onPress={onBack}
            >
                <TurnBackIcon width={24} height={24} />
            </Pressable>
            <ScrollView>
                {/* 頭像區 */}
                <View style={{ gap: 20 }}>
                    <View style={styles.signupCon}>
                        <Pressable onPress={handleSelectPhoto} style={styles.imgCon}>
                            <Image
                                source={photo ? { uri: photo } : null}
                                style={styles.img}
                            />
                            <View style={styles.smallEditBtn}>
                                {/* 這裡可以放你的相機 SVG Icon，例如：<CameraIcon width={16} height={16} /> */}
                                <Edit width={16} height={16} />
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
                                        placeholderTextColor="#6B6B6B"
                                    />
                                </View>
                            </View>
                            <View style={styles.itemCon}>
                                <Text style={styles.nameText}>性別</Text>

                                <Pressable
                                    style={styles.inputCon}
                                    onPress={() => setIsmodal(true)}
                                >
                                    <Text style={[styles.innerText, gender ? { opacity: 1 } : { opacity: 0.5 }]}>
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
                                        placeholderTextColor="#6B6B6B"
                                    />
                                </View>
                            </View>
                            <View style={styles.itemCon}>
                                <Text style={styles.nameText}>電子郵件</Text>
                                <View style={styles.inputCon}>
                                    <TextInput
                                        style={styles.innerText}
                                        placeholder="請輸入電子郵件"
                                        placeholderTextColor="#6B6B6B"
                                    />
                                </View>
                            </View>
                            <View style={styles.itemCon}>
                                <Text style={styles.nameText}>密碼</Text>
                                <View style={styles.inputCon}>
                                    <TextInput
                                        style={styles.innerText}
                                        placeholder="請輸入密碼"
                                        placeholderTextColor="#6B6B6B"
                                    />
                                </View>
                            </View>
                            <View style={styles.itemCon}>
                                <Text style={styles.nameText}>密碼確認</Text>
                                <View style={styles.inputCon}>
                                    <TextInput
                                        style={styles.innerText}
                                        placeholder="請再次輸入密碼"
                                        placeholderTextColor="#6B6B6B"
                                    />
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </View>

            </ScrollView>
            <View style={{ alignItems: 'center' }}>
                <Pressable style={styles.btn}>
                    <Text style={styles.signupText}>註冊</Text>
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
        backgroundColor: '#C1B69C', // 統一 LALA 的褐灰色底
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
        // 加點陰影讓按鈕更立體
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    hr: {
        borderBottomColor: '#898170',
        borderBottomWidth: 1,
        width: '100%'
    },
    inputCon: {
        backgroundColor: '#B1A893',
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
        backgroundColor: '#9E554D',
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
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: 500
    },
    innerText: {
        color: '#1A1A1A',
        fontSize: 14,
        fontWeight: 300,
        opacity: 0.5
    },
    signupText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 500
    },
    genderTitleText: {
        color: '#000',
        fontSize: 24,
        fontWeight: 500
    },
    optionText: {
        fontSize: 18,
        color: '#000'
    }
})
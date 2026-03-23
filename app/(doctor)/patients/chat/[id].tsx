import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import {
    getOrCreateConversation,
    markConversationAsRead,
    sendMessage,
    subscribeToMessages,
} from '@/services/firebase/firestoreServices';
import { Message } from '@/types/message.type';

export default function DoctorChatScreen() {
    const { id: patientId, patientName } = useLocalSearchParams<{ id: string; patientName: string }>();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!patientId || !user) return;

        const init = async () => {
            const convId = await getOrCreateConversation(
                patientId,
                user.id,
                patientName || 'Patient',
                user.name
            );
            setConversationId(convId);
            markConversationAsRead(convId, 'doctor');
        };

        init();
    }, [patientId, user]);

    useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [conversationId]);

    const handleSend = async () => {
        if (!text.trim() || !user || !conversationId || sending) return;

        const messageText = text.trim();
        setText('');
        setSending(true);

        try {
            await sendMessage(conversationId, user.id, 'doctor', messageText);
        } catch (error) {
            console.error('Failed to send:', error);
            setText(messageText);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date: Date | any) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.senderId === user?.id;

        return (
            <View style={[styles.messageBubbleRow, isMe ? styles.myRow : styles.otherRow]}>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    <Text style={[styles.bubbleText, isMe ? styles.myText : styles.otherText]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.otherTimeText]}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                ListEmptyComponent={
                    <View style={styles.emptyChat}>
                        <Text style={styles.emptyChatText}>
                            Commencez la conversation avec {patientName}
                        </Text>
                    </View>
                }
            />

            <View style={styles.inputBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Écrire un message..."
                    placeholderTextColor="#9CA3AF"
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={1000}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!text.trim() || sending}
                >
                    <IconSymbol name="arrow.up" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    messagesList: { padding: 16, paddingBottom: 8 },
    messageBubbleRow: { flexDirection: 'row', marginBottom: 8 },
    myRow: { justifyContent: 'flex-end' },
    otherRow: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '75%', padding: 12, borderRadius: 18 },
    myBubble: { backgroundColor: Colors.light.tint, borderBottomRightRadius: 4 },
    otherBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
    bubbleText: { fontSize: 15, lineHeight: 20 },
    myText: { color: 'white' },
    otherText: { color: '#111827' },
    timeText: { fontSize: 11, marginTop: 4 },
    myTimeText: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
    otherTimeText: { color: '#9CA3AF' },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        color: '#111827',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.tint,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: { backgroundColor: '#D1D5DB' },
    emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyChatText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
});

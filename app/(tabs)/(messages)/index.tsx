import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import {
    getConversationsForUser,
    getDoctorForPatient,
    getOrCreateConversation,
} from '@/services/firebase/firestoreServices';
import { Conversation } from '@/types/message.type';

export default function MessagesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            let cancelled = false;

            const load = async () => {
                setLoading(true);
                const convs = await getConversationsForUser(user.id, user.role as 'patient' | 'doctor');
                if (!cancelled) {
                    setConversations(convs);
                    setLoading(false);
                }
            };

            load();
            return () => { cancelled = true; };
        }, [user])
    );

    const getOtherName = (conv: Conversation) => {
        return user?.role === 'patient' ? conv.doctorName : conv.patientName;
    };

    const getUnreadCount = (conv: Conversation) => {
        return user?.role === 'patient' ? conv.unreadByPatient : conv.unreadByDoctor;
    };

    const formatDate = (date: Date | any) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'À l\'instant';
        if (hours < 24) return `Il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Hier';
        if (days < 7) return `Il y a ${days}j`;
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const openChat = (conv: Conversation) => {
        router.push({
            pathname: '/(tabs)/(messages)/chat',
            params: {
                conversationId: conv.id,
                otherName: getOtherName(conv),
            },
        } as any);
    };

    const startNewConversation = async () => {
        if (!user || user.role !== 'patient') return;

        try {
            const doctor = await getDoctorForPatient(user.id);
            if (!doctor) {
                console.warn('No doctor found for this patient');
                return;
            }

            const convId = await getOrCreateConversation(
                user.id,
                doctor.id,
                user.name,
                doctor.name
            );

            router.push({
                pathname: '/(tabs)/(messages)/chat',
                params: {
                    conversationId: convId,
                    otherName: doctor.name,
                },
            } as any);
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    const renderConversation = ({ item }: { item: Conversation }) => {
        const unread = getUnreadCount(item);
        return (
            <TouchableOpacity style={styles.convItem} onPress={() => openChat(item)}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                        {getOtherName(item).charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.convContent}>
                    <View style={styles.convHeader}>
                        <Text style={[styles.convName, unread > 0 && styles.unreadName]}>
                            {getOtherName(item)}
                        </Text>
                        <Text style={styles.convTime}>{formatDate(item.lastMessageAt)}</Text>
                    </View>
                    <View style={styles.convFooter}>
                        <Text
                            style={[styles.convMessage, unread > 0 && styles.unreadMessage]}
                            numberOfLines={1}
                        >
                            {item.lastMessage || 'Aucun message'}
                        </Text>
                        {unread > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unread}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversation}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="bubble.left" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>Aucune conversation</Text>
                        <Text style={styles.emptySubtitle}>
                            Vos messages avec votre médecin apparaîtront ici.
                        </Text>
                    </View>
                }
            />

            {user?.role === 'patient' && (
                <TouchableOpacity style={styles.fab} onPress={startNewConversation}>
                    <IconSymbol name="paperplane.fill" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    list: { paddingVertical: 8 },
    convItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.light.tint + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: { fontSize: 20, fontWeight: '700', color: Colors.light.tint },
    convContent: { flex: 1 },
    convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    convName: { fontSize: 16, fontWeight: '600', color: '#111827' },
    unreadName: { fontWeight: '800' },
    convTime: { fontSize: 12, color: '#9CA3AF' },
    convFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    convMessage: { fontSize: 14, color: '#6B7280', flex: 1, marginRight: 8 },
    unreadMessage: { color: '#111827', fontWeight: '600' },
    badge: {
        backgroundColor: Colors.light.tint,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.light.tint,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});

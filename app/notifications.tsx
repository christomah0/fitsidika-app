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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { markNotificationsSeen } from '@/hooks/use-notification-count';
import {
    getPatientVitalSigns,
    getPatientSymptoms,
    getPatientMedications,
    getConversationsForUser,
    getCarePlans,
    getGoals,
    getDoctorPatientIds,
    markConversationAsRead,
} from '@/services/firebase/firestoreServices';

interface NotificationEvent {
    id: string;
    type: 'message' | 'symptom' | 'vital' | 'medication' | 'care_plan' | 'goal';
    icon: IconSymbolName;
    title: string;
    description: string;
    date: Date;
    color: string;
    bgColor: string;
}

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            let cancelled = false;

            const load = async () => {
                setLoading(true);
                const allEvents: NotificationEvent[] = [];
                const role = user.role as 'patient' | 'doctor';

                try {
                    // Mark all notifications as seen (resets event counter)
                    await markNotificationsSeen();

                    // Messages: show messages from the OTHER side
                    const conversations = await getConversationsForUser(user.id, role);

                    // Mark all conversations as read
                    for (const conv of conversations) {
                        const unread = role === 'patient' ? conv.unreadByPatient : conv.unreadByDoctor;
                        if (unread > 0) {
                            markConversationAsRead(conv.id, role);
                        }
                    }
                    for (const conv of conversations) {
                        if (!conv.lastMessage) continue;
                        const isFromOther = conv.lastMessageBy !== user.id;
                        if (!isFromOther) continue;

                        const otherName = role === 'patient' ? conv.doctorName : conv.patientName;
                        allEvents.push({
                            id: `msg-${conv.id}`,
                            type: 'message',
                            icon: 'bubble.left.fill',
                            title: `Message de ${otherName}`,
                            description: conv.lastMessage,
                            date: conv.lastMessageAt instanceof Date ? conv.lastMessageAt : new Date(),
                            color: '#3B82F6',
                            bgColor: '#EFF6FF',
                        });
                    }

                    if (role === 'patient') {
                        // Patient sees: care plans, goals, medications prescribed by doctor
                        const [carePlans, goals, medications] = await Promise.all([
                            getCarePlans(user.id),
                            getGoals(user.id),
                            getPatientMedications(user.id),
                        ]);

                        for (const cp of carePlans) {
                            allEvents.push({
                                id: `plan-${cp.id}`,
                                type: 'care_plan',
                                icon: 'heart.text.square',
                                title: `Plan de soins: ${cp.title}`,
                                description: `Par Dr. ${cp.doctorName} · ${cp.status === 'active' ? 'Actif' : cp.status}`,
                                date: cp.startDate instanceof Date ? cp.startDate : new Date(cp.startDate),
                                color: '#10B981',
                                bgColor: '#ECFDF5',
                            });
                        }

                        for (const g of goals) {
                            allEvents.push({
                                id: `goal-${g.id}`,
                                type: 'goal',
                                icon: 'target',
                                title: `Objectif: ${g.title}`,
                                description: `Par Dr. ${g.doctorName} · ${g.status === 'in_progress' ? 'En cours' : g.status === 'achieved' ? 'Atteint' : g.status}`,
                                date: g.deadline instanceof Date ? g.deadline : new Date(g.deadline),
                                color: '#8B5CF6',
                                bgColor: '#F5F3FF',
                            });
                        }

                        for (const m of medications) {
                            const mDate = m.createdAt && typeof (m.createdAt as any).toDate === 'function'
                                ? (m.createdAt as any).toDate()
                                : m.startDate instanceof Date ? m.startDate : new Date(m.startDate);
                            allEvents.push({
                                id: `med-${m.id}`,
                                type: 'medication',
                                icon: 'pill',
                                title: `Médicament prescrit: ${m.name}`,
                                description: `${m.dosageValue} ${m.dosageUnit} · ${m.frequency}`,
                                date: mDate,
                                color: '#F59E0B',
                                bgColor: '#FFFBEB',
                            });
                        }
                    } else {
                        // Doctor sees: vitals, symptoms, medications from all their patients
                        const patients = await getDoctorPatientIds(user.id);

                        const patientPromises = patients.map(async (p) => {
                            const [vitals, symptoms, meds] = await Promise.all([
                                getPatientVitalSigns(p.id, 5),
                                getPatientSymptoms(p.id, 5),
                                getPatientMedications(p.id),
                            ]);

                            for (const v of vitals) {
                                allEvents.push({
                                    id: `vital-${p.id}-${v.id}`,
                                    type: 'vital',
                                    icon: 'waveform.path.ecg',
                                    title: `Vitaux de ${p.name}`,
                                    description: `TA: ${v.systolic}/${v.diastolic} · FC: ${v.heartRate} · SpO2: ${v.oxygenSaturation}%`,
                                    date: v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt),
                                    color: '#EF4444',
                                    bgColor: '#FEF2F2',
                                });
                            }

                            for (const s of symptoms) {
                                allEvents.push({
                                    id: `symptom-${p.id}-${s.id}`,
                                    type: 'symptom',
                                    icon: 'doc.text',
                                    title: `Symptôme de ${p.name}`,
                                    description: s.title || 'Symptôme enregistré',
                                    date: s.date instanceof Date ? s.date : new Date(s.date),
                                    color: '#F59E0B',
                                    bgColor: '#FFFBEB',
                                });
                            }

                            for (const m of meds) {
                                const mDate = m.createdAt && typeof (m.createdAt as any).toDate === 'function'
                                    ? (m.createdAt as any).toDate()
                                    : m.startDate instanceof Date ? m.startDate : new Date(m.startDate);
                                allEvents.push({
                                    id: `med-${p.id}-${m.id}`,
                                    type: 'medication',
                                    icon: 'pill',
                                    title: `Médicament de ${p.name}`,
                                    description: `${m.name} · ${m.dosageValue} ${m.dosageUnit}`,
                                    date: mDate,
                                    color: '#10B981',
                                    bgColor: '#ECFDF5',
                                });
                            }
                        });

                        await Promise.all(patientPromises);
                    }
                } catch (error) {
                    console.error('Error loading notifications:', error);
                }

                allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

                if (!cancelled) {
                    setEvents(allEvents);
                    setLoading(false);
                }
            };

            load();
            return () => { cancelled = true; };
        }, [user])
    );

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Hier';
        if (days < 7) return `Il y a ${days}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const renderEvent = ({ item }: { item: NotificationEvent }) => (
        <View style={styles.eventItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                <IconSymbol name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.eventTime}>{formatDate(item.date)}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={22} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.backButton} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.tint} />
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEvent}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="bell" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>Aucune notification</Text>
                            <Text style={styles.emptySubtitle}>
                                Vos activités récentes apparaîtront ici.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingVertical: 8 },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    eventContent: { flex: 1 },
    eventTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
    eventDescription: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
    eventTime: { fontSize: 12, color: '#9CA3AF' },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});

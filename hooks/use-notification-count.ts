import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useAuth } from './use-auth';
import {
    subscribeToUnreadCount,
    countNewEventsForPatient,
    countNewEventsForDoctor,
    getDoctorPatientIds,
} from '@/services/firebase/firestoreServices';

const LAST_SEEN_KEY = 'notifications_last_seen';

export async function getLastNotificationSeenAt(): Promise<Date> {
    const val = await AsyncStorage.getItem(LAST_SEEN_KEY);
    // Default to 24h ago if never opened notifications
    return val ? new Date(val) : new Date(Date.now() - 24 * 60 * 60 * 1000);
}

export async function markNotificationsSeen(): Promise<void> {
    await AsyncStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
}

export function useNotificationCount() {
    const { user } = useAuth();
    const [messageCount, setMessageCount] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const patientIdsRef = useRef<string[]>([]);

    // Real-time listener for unread messages
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToUnreadCount(
            user.id,
            user.role as 'patient' | 'doctor',
            setMessageCount
        );

        return () => unsubscribe();
    }, [user]);

    // Cache doctor's patient IDs once
    useEffect(() => {
        if (!user || user.role !== 'doctor') return;

        getDoctorPatientIds(user.id).then(patients => {
            patientIdsRef.current = patients.map(p => p.id);
        });
    }, [user]);

    const loadEventCount = useCallback(async () => {
        if (!user) return;

        const since = await getLastNotificationSeenAt();
        const role = user.role as 'patient' | 'doctor';

        let count = 0;
        if (role === 'patient') {
            count = await countNewEventsForPatient(user.id, since);
        } else {
            count = await countNewEventsForDoctor(patientIdsRef.current, since);
        }
        setEventCount(count);
    }, [user]);

    // Refresh event count on screen focus
    useFocusEffect(
        useCallback(() => {
            loadEventCount();
        }, [loadEventCount])
    );

    // Also refresh when app comes to foreground
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') loadEventCount();
        });
        return () => sub.remove();
    }, [loadEventCount]);

    return messageCount + eventCount;
}

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dateOnly = (date: Date) => {
    return new Date(date.toISOString().split('T')[0]);
};

export const formatTime = (timestamp: any) => {
    if (!timestamp) return "No data";
    
    // Convert Firestore Timestamp to JS Date
    const date = timestamp.toDate(); 
    
    // Returns "15 min" or "2 hours"
    return formatDistanceToNow(date, { addSuffix: false, locale: fr }); 
};

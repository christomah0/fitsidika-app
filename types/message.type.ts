import { FieldValue } from "firebase/firestore";

export interface Conversation {
    id: string;
    patientId: string;
    doctorId: string;
    patientName: string;
    doctorName: string;
    lastMessage: string;
    lastMessageAt: Date | FieldValue;
    lastMessageBy: string;
    unreadByPatient: number;
    unreadByDoctor: number;
    createdAt?: FieldValue;
}

export interface ConversationCreate extends Omit<Conversation, 'id' | 'createdAt'> {}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'patient' | 'doctor';
    text: string;
    createdAt: Date | FieldValue;
}

export interface MessageCreate extends Omit<Message, 'id'> {}

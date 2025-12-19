import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    where,
    Timestamp,
    type DocumentData,
    QueryDocumentSnapshot,
    doc,
    updateDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { RSVP, BirthdayNote, GiftTransaction, MediaItem } from "./types";

// Collection References
const RSVPS_COLLECTION = "rsvps";
const NOTES_COLLECTION = "birthday_notes";
const TRANSACTIONS_COLLECTION = "transactions";
const MEDIA_COLLECTION = "media_gallery";

// --- RSVP Services ---

export const submitRSVP = async (rsvpData: Omit<RSVP, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, RSVPS_COLLECTION), {
            ...rsvpData,
            createdAt: Timestamp.now().toMillis(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error submitting RSVP:", error);
        throw error;
    }
};

export const getRSVPs = async () => {
    try {
        const q = query(collection(db, RSVPS_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        })) as RSVP[];
    } catch (error) {
        console.error("Error fetching RSVPs:", error);
        return [];
    }
};

export const updateRSVPStatus = async (id: string, newStatus: string) => {
    try {
        const docRef = doc(db, RSVPS_COLLECTION, id);
        await updateDoc(docRef, { approval_status: newStatus });
        return { success: true };
    } catch (error) {
        console.error("Error updating RSVP status:", error);
        throw error;
    }
};

// --- Birthday Note Services ---

export const addBirthdayNote = async (noteData: Omit<BirthdayNote, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
            ...noteData,
            createdAt: Timestamp.now().toMillis(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding birthday note:", error);
        throw error;
    }
};

export const getBirthdayNotes = async () => {
    try {
        const q = query(collection(db, NOTES_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        })) as BirthdayNote[];
    } catch (error) {
        console.error("Error fetching birthday notes:", error);
        return [];
    }
};

// --- Transaction/Gifting Services ---

export const recordTransaction = async (transactionData: Omit<GiftTransaction, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
            ...transactionData,
            createdAt: Timestamp.now().toMillis(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error recording transaction:", error);
        throw error;
    }
};

// --- Media Gallery Services ---

export const saveMediaMetadata = async (fileUrl: string, fileType: string, caption?: string, uploadedBy?: string) => {
    try {
        const mediaData: Omit<MediaItem, "id" | "createdAt"> = {
            url: fileUrl,
            type: fileType.startsWith('image') ? 'image' : 'video',
            mimeType: fileType, // We might need to derive this or pass it from the upload response if available, or just generic
            caption: caption || "",
            uploadedBy: uploadedBy || "Anonymous",
            path: fileUrl // Using URL as path since we don't manage storage path directly here anymore
        };

        const docRef = await addDoc(collection(db, MEDIA_COLLECTION), {
            ...mediaData,
            createdAt: Timestamp.now().toMillis(),
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error saving media metadata:", error);
        throw error;
    }
};

export const getGalleryMedia = async () => {
    try {
        const q = query(collection(db, MEDIA_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        })) as MediaItem[];
    } catch (error) {
        console.error("Error fetching gallery media:", error);
        return [];
    }
};

export const deleteMediaItem = async (id: string) => {
    try {
        await deleteDoc(doc(db, MEDIA_COLLECTION, id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting media item:", error);
        throw error;
    }
};

// --- Access Verification ---

export const validateAccessCode = async (code: string) => {
    // In a real application, you would check this against a 'guests' or 'codes' collection in Firestore.
    // For now, we will simulate a check.
    try {
        const validCodes = ['OBELE50', 'GRACE50', 'FAMILY'];
        return validCodes.includes(code.toUpperCase());
    } catch (error) {
        console.error("Error validating code:", error);
        return false;
    }
};

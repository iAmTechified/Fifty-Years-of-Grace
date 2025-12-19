export interface RSVP {
    id?: string;
    fullName: string;
    email: string;
    phone?: string;
    attending: boolean;
    guestsCount: number;
    dietaryRestrictions?: string;
    specialRequests?: string;
    createdAt: number; // Unix timestamp
    approval_status: string;
}

export interface BirthdayNote {
    id?: string;
    authorName: string;
    message: string;
    isPrivate: boolean;
    createdAt: number;
}

export interface GiftTransaction {
    id?: string;
    donorName: string;
    email?: string;
    amount: number;
    currency: string;
    message?: string;
    reference: string; // Payment reference ID
    status: 'pending' | 'success' | 'failed';
    createdAt: number;
}

export interface MediaItem {
    id?: string;
    url: string;
    type: 'image' | 'video';
    mimeType: string;
    caption?: string;
    uploadedBy?: string;
    createdAt: number;
    path: string; // Storage path
}

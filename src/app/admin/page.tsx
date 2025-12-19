"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Image as ImageIcon,
    MessageSquare,
    Download,
    Check,
    X,
    Upload,
    Trash2,
    Search,
    LogOut,
    Loader2,
    RefreshCw
} from "lucide-react";
import { clsx } from "clsx";
import { getRSVPs, updateRSVPStatus, getGalleryMedia, saveMediaMetadata, getBirthdayNotes, deleteMediaItem } from "@/lib/firebase-services";
import { RSVP, MediaItem, BirthdayNote } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing";


import { createContext, useContext } from "react";

// --- Toast System ---

interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

const ToastContext = createContext<{
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}>({ showToast: () => { } });

const useToast = () => useContext(ToastContext);

const ToastContainer = ({ toasts, removeToast }: { toasts: ToastMessage[], removeToast: (id: string) => void }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className={clsx(
                            "pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border border-white/20 min-w-[300px]",
                            toast.type === 'success' ? "bg-green-600 text-white" :
                                toast.type === 'error' ? "bg-red-600 text-white" :
                                    "bg-gray-900 text-white"
                        )}
                    >
                        {toast.type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
                        {toast.type === 'error' && <X className="w-5 h-5 flex-shrink-0" />}
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button onClick={() => removeToast(toast.id)} className="ml-auto opacity-70 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// --- Confirmation Modal ---

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    isDestructive = false
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl z-10"
                    >
                        <h3 className="text-xl font-serif text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-500 mb-8">{message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                className={clsx(
                                    "px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg shadow-gray-200",
                                    isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --- Types ---
type RSVPStatus = "pending" | "approved" | "declined";

interface GalleryImage {
    id: string;
    url: string;
    name: string;
    date: string;
}

// --- Mock Data ---

const MOCK_IMAGES: GalleryImage[] = []; // Removed mock images

// --- Components ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex items-center gap-3 px-4 py-3 w-full text-sm font-medium transition-all duration-300 rounded-xl",
            active
                ? "bg-[#C7A24B] text-white shadow-lg shadow-[#C7A24B]/20"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        )}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

const StatCard = ({ label, value, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
        <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">{label}</span>
        <span className={clsx("text-3xl font-serif", colorClass)}>{value}</span>
    </div>
);

const Badge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    const styles: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        approved: "bg-green-100 text-green-700 border-green-200",
        declined: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium border", styles[s] || "bg-gray-100 text-gray-700 border-gray-200")}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
        </span>
    );
};

// --- Views ---

const RSVPsView = () => {
    const { showToast } = useToast();
    const [activeFilter, setActiveFilter] = useState<"all" | RSVPStatus>("all");
    const [rsvps, setRsvps] = useState<RSVP[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRSVPs = async () => {
        setLoading(true);
        const data = await getRSVPs();
        setRsvps(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRSVPs();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!id) return;
        try {
            await updateRSVPStatus(id, newStatus);
            // Optimistic update
            setRsvps(prev => prev.map(r => r.id === id ? { ...r, approval_status: newStatus } : r));
            showToast(`Guest has been ${newStatus}`, "success");
        } catch (error) {
            console.error("Failed to update status", error);
            showToast("Failed to update status. Please try again.", "error");
        }
    };

    const filtered = activeFilter === "all"
        ? rsvps
        : rsvps.filter(r => (r.approval_status || "pending").toLowerCase() === activeFilter);

    const stats = {
        total: rsvps.length,
        pending: rsvps.filter(r => (r.approval_status || "pending") === "pending").length,
        approved: rsvps.filter(r => r.approval_status === "approved").length,
        declined: rsvps.filter(r => r.approval_status === "declined").length,
    };

    const downloadCSV = () => {
        const approved = rsvps.filter(r => r.approval_status === "approved");

        if (approved.length === 0) {
            showToast("No approved guests to export.", "info");
            return;
        }

        const headers = ["Name", "Email", "Guests", "Dietary Restrictions", "Date"];
        const rows = approved.map(r => [
            `"${r.fullName}"`,
            `"${r.email}"`,
            r.guestsCount,
            `"${r.dietaryRestrictions || ""}"`,
            new Date(r.createdAt).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "approved_guests.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-gray-900">Guest List</h2>
                    <p className="text-gray-500 mt-1">Hello Mrs. Obele, Manage your RSVP requests</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchRSVPs}
                        className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                    </button>
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Approved
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Guests" value={stats.total} colorClass="text-gray-900" />
                <StatCard label="Pending" value={stats.pending} colorClass="text-yellow-600" />
                <StatCard label="Confirmed" value={stats.approved} colorClass="text-green-600" />
                <StatCard label="Declined" value={stats.declined} colorClass="text-red-600" />
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl container mb-12 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex gap-2 overflow-x-auto">
                    {(["all", "pending", "approved", "declined"] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize whitespace-nowrap",
                                activeFilter === filter
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Responsive List View */}

                {/* Mobile/Tablet/Small Laptop Card View */}
                <div className="xl:hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading guests...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No Guests.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filtered.map((rsvp) => (
                                <div key={rsvp.id} className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{rsvp.fullName}</p>
                                            <p className="text-gray-500 text-xs">{rsvp.email}</p>
                                        </div>
                                        <Badge status={rsvp.approval_status || "pending"} />
                                    </div>

                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span>{rsvp.guestsCount} Guest{rsvp.guestsCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        {rsvp.dietaryRestrictions && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="truncate max-w-[150px]">{rsvp.dietaryRestrictions}</span>
                                            </div>
                                        )}
                                    </div>

                                    {(rsvp.approval_status || "pending") === "pending" && (
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => handleStatusUpdate(rsvp.id!, "approved")}
                                                className="flex-1 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(rsvp.id!, "declined")}
                                                className="flex-1 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden xl:block max-w-[80vw] overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Guests</th>
                                <th className="px-6 py-4">Dietary</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading guests...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No requests found in this category.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((rsvp) => (
                                    <tr key={rsvp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{rsvp.fullName}</p>
                                            <p className="text-gray-500 text-xs">{rsvp.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{rsvp.guestsCount}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {rsvp.dietaryRestrictions || <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={rsvp.approval_status || "pending"} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {(rsvp.approval_status || "pending") === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(rsvp.id!, "approved")}
                                                            className="p-2 pr-4 text-green-600 hover:bg-green-20 text-xs bg-green-50 rounded-full flex items-center gap-2 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(rsvp.id!, "declined")}
                                                            className="p-2 pr-4 text-red-600 hover:bg-red-20 text-xs bg-red-50 rounded-full flex items-center gap-2 transition-colors"
                                                            title="Decline"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span>Decline</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const GalleryUploadCard = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
    const { showToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: async (res) => {
            if (res && res[0]) {
                const uploadedFile = res[0];
                await saveMediaMetadata(uploadedFile.url, uploadedFile.type || 'image/jpeg', "Admin Upload", "Admin");
                onUploadComplete();
                setFile(null);
                setPreview(null);
                setPreview(null);
                showToast("Upload Completed Successfully", "success");
            }
        },
        onUploadError: (error: Error) => {
            showToast(`Upload failed: ${error.message}`, "error");
        },
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleClear = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#C7A24B]/50 transition-colors group">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {!file ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#C7A24B] transition-colors"
                >
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Upload Image</span>
                </button>
            ) : (
                <div className="absolute inset-0 w-full h-full p-3">
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/5 shadow-inner group-hover:shadow-md transition-shadow">
                        <img src={preview!} alt="Preview" className="w-full h-full object-cover" />

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            {isUploading ? (
                                <div className="flex flex-col items-center text-white">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span className="text-xs font-medium tracking-wide">UPLOADING...</span>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => startUpload([file])}
                                        className="bg-[#C7A24B] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#b08d3e] transition-colors shadow-lg"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="text-white/70 hover:text-white text-xs underline decoration-white/30 hover:decoration-white"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const GalleryView = () => {
    const { showToast } = useToast();
    const [images, setImages] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const refreshGallery = () => setRefreshTrigger(prev => prev + 1);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMediaItem(deleteId);
            // Optimistic update
            setImages(prev => prev.filter(img => img.id !== deleteId));
            showToast("Image removed from gallery", "success");
        } catch (error) {
            console.error("Failed to delete media:", error);
            showToast("Failed to delete item.", "error");
        } finally {
            setDeleteId(null);
        }
    };

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            try {
                const data = await getGalleryMedia();
                setImages(data);
            } catch (error) {
                console.error("Failed to load gallery:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, [refreshTrigger]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-gray-900">Gallery</h2>
                    <p className="text-gray-500 mt-1">Curate the memories</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={refreshGallery}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                        title="Refresh Gallery"
                    >
                        <RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-[#C7A24B] animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Upload Card is always first */}
                    <GalleryUploadCard onUploadComplete={refreshGallery} />

                    {images.map((img) => (
                        <div key={img.id} className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                            {img.type === 'video' ? (
                                <video src={img.url} className="w-full h-full object-cover" />
                            ) : (
                                <img
                                    src={img.url}
                                    alt={img.caption || "Gallery Image"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setDeleteId(img.id!)}
                                    className="p-3 bg-red-500/80 backdrop-blur-md text-white rounded-full hover:bg-red-600/80 transition-colors"
                                    title="Delete Image"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && images.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-400 text-sm">You can start by uploading your first photo above.</p>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Image"
                message="Are you sure you want to delete this image? This action cannot be undone."
                isDestructive={true}
                confirmText="Delete"
            />
        </div>
    );
};

const NotesView = () => {
    const [notes, setNotes] = useState<BirthdayNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<BirthdayNote | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            const data = await getBirthdayNotes();
            setNotes(data);
            setLoading(false);
        };
        fetchNotes();
    }, []);

    return (
        <div className="space-y-8 relative">
            <div>
                <h2 className="text-3xl font-serif text-gray-900">Birthday Notes</h2>
                <p className="text-gray-500 mt-1">Wishes from your loved ones</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-[#C7A24B] animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-yellow-50 text-[#C7A24B] px-3 py-1 rounded-full text-xs font-medium">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                </div>
                                {note.isPrivate && (
                                    <span className="text-xs font-bold text-red-400 border border-red-100 px-2 py-0.5 rounded bg-red-50">PRIVATE</span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6 font-serif italic line-clamp-3">
                                "{note.message}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {note.authorName.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{note.authorName}</span>
                            </div>
                        </div>
                    ))}
                    {notes.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            No birthday notes received yet.
                        </div>
                    )}
                </div>
            )}

            {/* Note Detail Modal */}
            <AnimatePresence>
                {selectedNote && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 border m-0" style={{ margin: 0 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNote(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`note-${selectedNote.id}`}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg max-h-[80vh] flex flex-col overflow-y-hidden bg-white p-8 pb-2 md:p-12 md:pb-3 rounded-2xl shadow-2xl z-10"
                        >
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#C7A24B]/10 flex items-center justify-center text-xl font-serif text-[#C7A24B]">
                                    {selectedNote.authorName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl text-gray-900">{selectedNote.authorName}</h3>
                                    <p className="text-sm text-gray-500">{new Date(selectedNote.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6 max-h-[100%] overflow-y-auto">
                                <p className="font-sans italic text-base text-gray-700 leading-relaxed text-center">
                                    "{selectedNote.message}"
                                </p>
                            </div>

                            {selectedNote.isPrivate && (
                                <p className="text-center text-xs text-red-500 font-medium bg-red-50 py-2 rounded">
                                    This note is marked as private.
                                </p>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Page ---

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API delay
        setTimeout(() => {
            // NOTE: Simple hardcoded check as requested. 
            // In production, verify against env var or backend.
            if (code === "@50&Grace") {
                onLogin();
            } else {
                setError(true);
                setCode("");
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-gray-100 border border-white/50">
                    <div className="text-center mb-10">
                        <h1 className="font-serif text-4xl text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Please enter your access code</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    setError(false);
                                }}
                                maxLength={9}
                                placeholder="* * * * * *"
                                className={clsx(
                                    "w-full text-center text-3xl tracking-[1em] font-serif py-4 border-b-2 bg-transparent focus:outline-none transition-all placeholder:text-gray-200 placeholder:tracking-widest",
                                    error ? "border-red-400 text-red-500" : "border-gray-200 focus:border-[#C7A24B] text-gray-900"
                                )}
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-500 text-center text-sm mt-3 animate-pulse">
                                    Invalid access code
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.length < 1}
                            className="w-full py-4 bg-[#140309] text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<"rsvps" | "gallery" | "notes">("rsvps");

    // Toast State
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Check for existing session
    useEffect(() => {
        if (typeof window !== "undefined") {
            const session = localStorage.getItem("admin_session");
            if (session === "true") setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        localStorage.setItem("admin_session", "true");
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_session");
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return (
        <div className="flex min-h-screen bg-[#FAFAFA]">
            {/* Sidebar - Desktop */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 bg-white border-r border-gray-100 z-50"
            >
                <div className="p-8">
                    <h1 className="text-2xl font-serif text-gray-900">Admin.</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <TabButton
                        active={activeTab === "rsvps"}
                        onClick={() => setActiveTab("rsvps")}
                        icon={Users}
                        label="Guest Management"
                    />
                    <TabButton
                        active={activeTab === "gallery"}
                        onClick={() => setActiveTab("gallery")}
                        icon={ImageIcon}
                        label="Gallery & Moments"
                    />
                    <TabButton
                        active={activeTab === "notes"}
                        onClick={() => setActiveTab("notes")}
                        icon={MessageSquare}
                        label="Birthday Notes"
                    />
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-6 md:p-12 relative">
                {/* Mobile Header */}
                <div className="lg:hidden flex justify-between items-center mb-8">
                    <h1 className="text-xl font-serif text-gray-900">Admin</h1>
                    <button onClick={handleLogout} className="p-2 text-gray-500"><LogOut className="w-5 h-5" /></button>
                </div>

                {/* Dynamic Mobile Nav (Simple for now, could be better) */}
                <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
                    {/* Mobile tabs if needed, or rely on sidebar toggle */}
                    <button onClick={() => setActiveTab("rsvps")} className={clsx("px-4 py-2 rounded-lg text-sm", activeTab === "rsvps" ? "bg-gray-900 text-white" : "bg-white")}>Guests</button>
                    <button onClick={() => setActiveTab("gallery")} className={clsx("px-4 py-2 rounded-lg text-sm", activeTab === "gallery" ? "bg-gray-900 text-white" : "bg-white")}>Gallery</button>
                    <button onClick={() => setActiveTab("notes")} className={clsx("px-4 py-2 rounded-lg text-sm", activeTab === "notes" ? "bg-gray-900 text-white" : "bg-white")}>Notes</button>
                </div>

                <ToastContext.Provider value={{ showToast }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === "rsvps" && <RSVPsView />}
                            {activeTab === "gallery" && <GalleryView />}
                            {activeTab === "notes" && <NotesView />}
                        </motion.div>
                    </AnimatePresence>
                </ToastContext.Provider>

                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </main>
        </div>
    );
}

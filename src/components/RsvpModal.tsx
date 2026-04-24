'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { clsx } from 'clsx';
import { submitRSVP } from '@/lib/firebase-services';
import { sendAdminNotification } from '@/lib/email-service';
import { RSVP_DAY_OPTIONS, type RSVPDayDate, normalizeAttendanceDays } from '@/lib/rsvp-days';

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RsvpModal({ isOpen, onClose }: RsvpModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        attendanceDays: [] as RSVPDayDate[],
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const toggleAttendanceDay = (dayDate: RSVPDayDate) => {
        setErrorMessage('');
        setStatus('idle');
        setFormData((prev) => ({
            ...prev,
            attendanceDays: prev.attendanceDays.includes(dayDate)
                ? prev.attendanceDays.filter((day) => day !== dayDate)
                : [...prev.attendanceDays, dayDate],
        }));
    };

    const isFormReady =
        formData.fullName.trim().length > 0 &&
        formData.email.trim().length > 0 &&
        formData.attendanceDays.length > 0;

    const handleSubmit = async () => {
        if (!isFormReady) {
            setStatus('error');
            setErrorMessage('Please enter your name, email, and select at least one day.');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            const attendanceDays = normalizeAttendanceDays(formData.attendanceDays);
            const fullName = formData.fullName.trim();
            const email = formData.email.trim();

            // 1. Submit RSVP to Firestore
            await submitRSVP({
                fullName,
                email,
                attending: true,
                attendanceDays,
                guestsCount: 1,
                dietaryRestrictions: '',
                specialRequests: '',
                approval_status: "pending"
            });

            // 2. Send Notification Email to Admin (First Stage) - Non-blocking
            sendAdminNotification(email, fullName, 1, attendanceDays);

            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ fullName: '', email: '', attendanceDays: [] });
            }, 2000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            if (error instanceof Error && error.message) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-auto"
                    >
                        <motion.div
                            layoutId="modal-container"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
                            className="w-[92vw] max-w-[620px] bg-[#140309] border border-[#C7A24B]/30 p-8 md:p-10 shadow-2xl overflow-visible max-h-[88vh] rounded-xl relative"
                        >
                            <div className="flex flex-col gap-8 font-sans text-[#F6F3EE] relative z-20">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-serif text-3xl text-[#C7A24B] italic">RSVP</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                                        className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-[#C7A24B] transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="rsvp-modal-scroll max-h-[66vh] overflow-y-auto pr-2 md:pr-3 mr-[-12px]">
                                    {status === 'success' ? (
                                        <div className="py-10 text-center">
                                            <p className="text-xl font-serif text-[#C7A24B] mb-2">Thank You</p>
                                            <p className="text-sm opacity-60">Your request has been received.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex flex-col gap-3 group/input">
                                                <label className="text-[10px] uppercase tracking-wider opacity-60 group-focus-within/input:text-[#C7A24B] transition-colors">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) => {
                                                        setErrorMessage('');
                                                        setStatus('idle');
                                                        setFormData({ ...formData, fullName: e.target.value });
                                                    }}
                                                    className="bg-transparent border-b border-[#F6F3EE]/10 py-2 text-sm focus:outline-none focus:border-[#C7A24B] transition-colors placeholder:text-[#F6F3EE]/10"
                                                    placeholder="Enter your name"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-3 group/input">
                                                <label className="text-[10px] uppercase tracking-wider opacity-60 group-focus-within/input:text-[#C7A24B] transition-colors">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        setErrorMessage('');
                                                        setStatus('idle');
                                                        setFormData({ ...formData, email: e.target.value });
                                                    }}
                                                    className="bg-transparent border-b border-[#F6F3EE]/10 py-2 text-sm focus:outline-none focus:border-[#C7A24B] transition-colors placeholder:text-[#F6F3EE]/10"
                                                    placeholder="name@example.com"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] uppercase tracking-wider opacity-60">
                                                        Select Days You Will Attend
                                                    </label>
                                                    <span className="text-[10px] uppercase tracking-wide text-[#C7A24B]">
                                                        {formData.attendanceDays.length} Selected
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {RSVP_DAY_OPTIONS.map((dayOption) => {
                                                        const isSelected = formData.attendanceDays.includes(dayOption.dateIso);

                                                        return (
                                                            <button
                                                                key={dayOption.id}
                                                                type="button"
                                                                onClick={() => toggleAttendanceDay(dayOption.dateIso)}
                                                                className={clsx(
                                                                    "group/day rounded-xl border p-4 text-left transition-all duration-300",
                                                                    isSelected
                                                                        ? "border-[#C7A24B] bg-[#C7A24B]/10 shadow-[0_0_0_1px_rgba(199,162,75,0.25)]"
                                                                        : "border-[#F6F3EE]/15 bg-[#F6F3EE]/[0.02] hover:border-[#C7A24B]/50"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#C7A24B]">
                                                                            {dayOption.label}
                                                                        </p>
                                                                        <p className="font-serif text-lg leading-tight text-[#F6F3EE]">
                                                                            {dayOption.date}
                                                                        </p>
                                                                        <p className="text-xs text-[#F6F3EE]/65">
                                                                            {dayOption.title}
                                                                        </p>
                                                                    </div>

                                                                    <span
                                                                        className={clsx(
                                                                            "mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
                                                                            isSelected
                                                                                ? "border-[#C7A24B] bg-[#C7A24B]"
                                                                                : "border-[#F6F3EE]/40 bg-transparent"
                                                                        )}
                                                                    >
                                                                        <span
                                                                            className={clsx(
                                                                                "h-2 w-2 rounded-full bg-[#140309] transition-opacity",
                                                                                isSelected ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <p className="text-[11px] text-[#F6F3EE]/50">
                                                    Choose one day, two days, or all three days.
                                                </p>
                                            </div>

                                            {status === 'error' && (
                                                <p className="text-red-400 text-xs">{errorMessage}</p>
                                            )}

                                            <button
                                                onClick={handleSubmit}
                                                disabled={status === 'loading' || !isFormReady}
                                                className="mt-4 py-4 w-full bg-[#C7A24B] text-[#140309] uppercase text-[11px] tracking-[0.2em] font-medium hover:bg-[#F6F3EE] transition-colors duration-300 disabled:opacity-50"
                                            >
                                                {status === 'loading' ? 'Processing...' : 'Submit Request'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grain-overlay pointer-events-none absolute inset-0 z-0 opacity-[0.05]" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] pointer-events-auto"
                    />
                </>
            )}
        </AnimatePresence>
    );
}

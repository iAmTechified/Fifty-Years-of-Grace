export const RSVP_DAY_OPTIONS = [
    {
        id: "day1",
        dateIso: "2026-06-26",
        label: "Day 1",
        date: "June 26th, 2026",
        title: "Exclusive Dublin Tour",
    },
    {
        id: "day2",
        dateIso: "2026-06-27",
        label: "Day 2",
        date: "June 27th, 2026",
        title: "Birthday Dinner with Obele",
    },
    {
        id: "day3",
        dateIso: "2026-06-28",
        label: "Day 3",
        date: "June 28th, 2026",
        title: "Birthday Thanksgiving Day",
    },
] as const;

export type RSVPDayId = (typeof RSVP_DAY_OPTIONS)[number]["id"];
export type RSVPDayDate = (typeof RSVP_DAY_OPTIONS)[number]["dateIso"];
type RSVPDayValue = RSVPDayId | RSVPDayDate;

const RSVP_DAY_ID_SET = new Set<string>(RSVP_DAY_OPTIONS.map((option) => option.id));
const RSVP_DAY_DATE_SET = new Set<string>(RSVP_DAY_OPTIONS.map((option) => option.dateIso));
const RSVP_DAY_VALUE_TO_DATE = new Map<string, RSVPDayDate>(
    RSVP_DAY_OPTIONS.flatMap((option) => [
        [option.id, option.dateIso] as const,
        [option.dateIso, option.dateIso] as const,
    ])
);

export const isRSVPDayId = (value: string): value is RSVPDayId => {
    return RSVP_DAY_ID_SET.has(value);
};

export const isRSVPDayDate = (value: string): value is RSVPDayDate => {
    return RSVP_DAY_DATE_SET.has(value);
};

export const normalizeAttendanceDays = (days: unknown): RSVPDayDate[] => {
    if (!Array.isArray(days)) return [];

    const uniqueDays = new Set<RSVPDayDate>();

    for (const day of days) {
        if (typeof day === "string") {
            const normalizedDate = RSVP_DAY_VALUE_TO_DATE.get(day);
            if (normalizedDate) {
                uniqueDays.add(normalizedDate);
            }
        }
    }

    return Array.from(uniqueDays);
};

export const formatAttendanceDayLabel = (day: RSVPDayValue) => {
    const normalizedDay = RSVP_DAY_VALUE_TO_DATE.get(day);
    if (!normalizedDay) return day;

    const match = RSVP_DAY_OPTIONS.find((option) => option.dateIso === normalizedDay);
    if (!match) return day;
    return `${match.label} - ${match.date}`;
};

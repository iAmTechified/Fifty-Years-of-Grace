import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin | Fifty Years of Grace",
    description: "Admin Dashboard",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#111111] antialiased">
            {children}
        </div>
    );
}

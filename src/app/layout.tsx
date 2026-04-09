import type { Metadata } from "next";
import { Inter, Syncopate, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });
const syncopate = Syncopate({ 
    subsets: ["latin"], 
    weight: ["400", "700"],
    variable: "--font-syncopate"
});
const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-outfit"
});

export const metadata: Metadata = {
    title: "Synchro",
    description: "Privacy-preserving calendar synchronization and matching",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${syncopate.variable} ${outfit.variable}`} suppressHydrationWarning>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

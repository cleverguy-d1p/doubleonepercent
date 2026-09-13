import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title: "Double One Percent | Your next 90 days", description:"Personal fitness coaching built around your goals, training, nutrition and lifestyle."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SmartGov-Wase | Digital Gateway to Wase Local Government",
    template: "%s | SmartGov-Wase",
  },
  description:
    "SmartGov-Wase connects government, communities and citizens of Wase Local Government Area, Plateau State — digital services, civic information and Discover Wase in one platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-bg text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
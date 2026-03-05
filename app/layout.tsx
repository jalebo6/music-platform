import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "MusicShare - Your Music Journey",
  description: "Like Letterboxd for music. Share songs, albums, and connect with music lovers worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#14181c]">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </main>
        <footer className="border-t border-[#456] mt-16 py-8 bg-[#14181c]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-[#678] text-sm">
                <span className="font-bold text-white">
                  MusicShare
                </span>
                {" • "}
                Your music journey
              </div>
              <div className="flex items-center space-x-6 text-sm text-[#9ab]">
                <a href="#" className="hover:text-white transition-colors">
                  About
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "MusicShare - Share Your Music Journey",
  description: "Like Letterboxd for music. Share songs, albums, and connect with music lovers worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  MusicShare
                </span>
                {" • "}
                Share your music journey
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  About
                </a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
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

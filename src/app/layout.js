import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { UserProvider } from "./context/UserContext";
import ToastProvider from "./components/ToastProvider";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import BootstrapClient from "./BootstrapClient";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Luloy",
  description: "Luloy App",
  icons: {
    icon: '/luloy.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <UserProvider>
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <footer className="mt-5 pt-4 pb-5 border-top text-center">
              <div className="d-flex justify-content-center gap-4 mb-4">
                <a href="mailto:luloyapp@gmail.com" className="text-muted"><i className="bi bi-envelope-fill fs-4"></i></a>
                <a href="https://www.facebook.com/groovyrey" target="_blank" rel="noopener noreferrer" className="text-muted"><i className="bi bi-facebook fs-4"></i></a>
              </div>
              <p className="text-muted">&copy; 2025 Luloy. All rights reserved.</p>
            </footer>
          </UserProvider>
        <ToastProvider />
        </ThemeProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
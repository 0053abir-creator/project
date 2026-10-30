import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Campus Lost & Found | Islamic University, Kushtia, Bangladesh",
  description:
    "Official Lost & Found web portal for Islamic University, Kushtia, Bangladesh (iu.ac.bd). Managed by the Department of Computer Science & Engineering.",
  icons: {
    icon: "/iu-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import { Toaster } from "sonner";
// import "./globals.css";
// import { AuthProvider } from "@/providers/auth-provider";

// import { Footer } from "@/components/layout/footer";
// import { Navbar } from "@/components/layout/navbar";
// import { QueryProvider } from "@/providers/query-provider";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

// export const metadata: Metadata = {
//   title: {
//     default: "GearUp | Rent Sports & Outdoor Gear",
//     template: "%s | GearUp",
//   },
//   description:
//     "Rent premium sports and outdoor equipment for your next adventure.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
      
//       <body className={`${inter.variable} min-h-screen bg-slate-50 font-sans text-slate-950`}>
//   <QueryProvider>
//     <AuthProvider>
//       <Navbar />
//       <main>{children}</main>
//       <Footer />
//       <Toaster richColors position="top-right" />
//     </AuthProvider>
//   </QueryProvider>
// </body>

//     </html>
//   );
// }

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/providers/app-providers";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GearUp | Rent Professional Gear",
  description: "Rent cameras, lenses, drones and professional equipment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </AppProviders>
      </body>
    </html>
  );
}

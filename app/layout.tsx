import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import Aurora from "@/components/Aurora";
import ThreeBackground from "@/components/ThreeBackground";
import ScrollProgress from "@/components/ScrollProgress";
import Preloader from "@/components/Preloader";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sarathofficial.vercel.app"),
  title: "Sarath Adukkadukkam — AI & Full-Stack Developer",
  description:
    "Portfolio of Sarath Adukkadukkam, M.Sc. Artificial Intelligence student at OTH Amberg-Weiden and full-stack developer. Projects in machine learning, computer vision, robotics and web development.",
  keywords: [
    "Sarath Adukkadukkam",
    "Artificial Intelligence",
    "Machine Learning",
    "Full-Stack Developer",
    "React",
    "Python",
    "Portfolio",
  ],
  authors: [{ name: "Sarath Adukkadukkam" }],
  openGraph: {
    title: "Sarath Adukkadukkam — AI & Full-Stack Developer",
    description:
      "M.Sc. Artificial Intelligence student & full-stack developer. Projects in ML, computer vision, robotics and web.",
    type: "website",
    url: "https://sarathofficial.vercel.app",
    siteName: "Sarath Adukkadukkam",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarath Adukkadukkam — AI & Full-Stack Developer",
    description:
      "M.Sc. Artificial Intelligence student & full-stack developer.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={rajdhani.variable}>
      <body>
        <Preloader />
        <Aurora />
        <ThreeBackground />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}

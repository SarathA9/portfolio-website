import type { Metadata } from "next";
import { Rajdhani, Space_Grotesk } from "next/font/google";
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

// Display face used only for the hero name
const heroFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-hero",
  weight: ["600", "700"],
  display: "swap",
});

const siteUrl = "https://sarathadukkadukkam.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sarath Adukkadukkam — AI & Full-Stack Developer",
    template: "%s | Sarath Adukkadukkam",
  },
  description:
    "Portfolio of Sarath Adukkadukkam, M.Sc. Artificial Intelligence student at OTH Amberg-Weiden and full-stack developer. Projects in machine learning, computer vision, robotics and web development.",
  keywords: [
    "Sarath Adukkadukkam",
    "Artificial Intelligence",
    "Machine Learning",
    "Computer Vision",
    "Full-Stack Developer",
    "React",
    "Next.js",
    "Python",
    "OTH Amberg-Weiden",
    "Nuremberg",
    "Portfolio",
  ],
  authors: [{ name: "Sarath Adukkadukkam", url: siteUrl }],
  creator: "Sarath Adukkadukkam",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Sarath Adukkadukkam — AI & Full-Stack Developer",
    description:
      "M.Sc. Artificial Intelligence student & full-stack developer. Projects in ML, computer vision, robotics and web.",
    type: "website",
    url: siteUrl,
    siteName: "Sarath Adukkadukkam",
    locale: "en_US",
    images: [
      {
        url: "/profile.jpg",
        alt: "Sarath Adukkadukkam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarath Adukkadukkam — AI & Full-Stack Developer",
    description:
      "M.Sc. Artificial Intelligence student & full-stack developer.",
    images: ["/profile.jpg"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sarath Adukkadukkam",
  url: siteUrl,
  image: `${siteUrl}/profile.jpg`,
  jobTitle: "AI / ML Engineer & Full-Stack Developer",
  email: "mailto:adukkadukkamsarath@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nuremberg",
    addressCountry: "DE",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "OTH Amberg-Weiden (Ostbayerische Technische Hochschule)",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "SDM College, Ujire",
    },
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Computer Vision",
    "Full-Stack Web Development",
    "Robotics",
    "Signal Processing",
  ],
  sameAs: [
    "https://www.linkedin.com/in/sarath-adukkadukkam",
    "https://github.com/SarathA9",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rajdhani.variable} ${heroFont.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Preloader />
        <Aurora />
        <ThreeBackground />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}

// Central content for the portfolio. Edit text here to update the site.

export const profile = {
  name: "Sarath Adukkadukkam",
  role: "M.Sc. Artificial Intelligence · Full-Stack Developer",
  // Rotating titles used by the hero typewriter (article a/an chosen automatically)
  roles: [
    "AI / ML Engineer",
    "Full-Stack Developer",
    "Computer Vision Engineer",
  ],
  kicker: "M.Sc. Artificial Intelligence · OTH Amberg-Weiden",
  headline: "I build intelligent software.",
  tagline:
    "From real-time web platforms to applied machine learning and robotics. I take problems end-to-end, from data and models to interfaces people actually enjoy using.",
  location: "Nuremberg, Germany",
  available: "Open to working-student & internship roles in AI / software",
  email: "adukkadukkamsarath@gmail.com",
  academicEmail: "s.adukkadukkam@oth-aw.de",
  address: "Nuremberg, Germany",
  linkedin: "https://www.linkedin.com/in/sarath-adukkadukkam",
  github: "https://github.com/SarathA9",
  gitlab: "https://gitlab.com/marshal.sebastine/alia-delivery/-/tree/main",
  resume: "/Sarath_Adukkadukkam_Resume.pdf",
};

export const about = {
  intro: [
    "I'm a Master of Science student in Artificial Intelligence at OTH Amberg-Weiden (Ostbayerische Technische Hochschule), in the Industrie 4.0 Informatik programme. My background is in computer applications, and I work across the full stack while focusing on applied AI, robotics, and signal processing.",
    "Alongside my studies I work as a freelance software developer, building scalable web applications with React, Node.js and MySQL. I enjoy taking a problem end-to-end — from data and models to a clean, responsive interface that people actually want to use.",
  ],
  focus: [
    "Applied machine learning & computer vision",
    "Full-stack web (React · Node.js · Flask)",
    "Robotics & real-time systems",
    "Biomedical signal processing",
  ],
};

export const stats = [
  { value: "3", label: "Research papers" },
  { value: "7+", label: "Shipped projects" },
  { value: "3", label: "Industry roles" },
  { value: "5+", label: "Years coding" },
];

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    role: "Freelance Software Developer",
    company: "Self-employed",
    location: "Nuremberg, Germany",
    period: "Aug 2024 – Present",
    points: [
      "Deliver full-stack web applications for clients using React, Node.js and MySQL.",
      "Build scalable, secure architectures with a focus on performance and clean UX.",
      "Provide client-focused, agile development support from requirements to deployment.",
    ],
  },
  {
    role: "Software Engineering Intern",
    company: "Talisma Corporation Pvt. Ltd",
    location: "Bangalore, India",
    period: "8 months",
    points: [
      "Developed web applications with modern technologies alongside the engineering team.",
      "Implemented secure authentication and authorization mechanisms.",
      "Supported database management, integration, and real-time data & analytics features.",
      "Built responsive, user-friendly interfaces.",
    ],
  },
  {
    role: "Software Development Intern",
    company: "Codelab Systems",
    location: "Mangalore, India",
    period: "May 2024",
    points: [
      "Built dynamic React.js applications and strengthened API-integration skills.",
      "Contributed to responsive eCommerce-focused web designs.",
      "Practised troubleshooting and technical issue resolution.",
    ],
  },
];

export type Research = {
  title: string;
  venue: string;
  date: string;
  summary: string;
  highlights: string[];
  tags: string[];
  links: { label: string; href: string }[];
};

export const research: Research[] = [
  {
    title:
      "Rank-Faithfulness Consistency: A Query-Time Defense Against Dual-Surface Backdoors in RAG",
    venue: "OTH Amberg-Weiden · Research Report",
    date: "Jun 2026",
    summary:
      "A dual-surface backdoor threat against Retrieval-Augmented Generation — an LLM backdoored during QLoRA fine-tuning combined with a poisoned retrieval corpus. I build the full LLaMA-3-8B + FAISS pipeline and propose Rank-Faithfulness Consistency (RFC): a query-time defense that flags a retrieved document when its query relevance exceeds its similarity to the centroid of the co-retrieved context.",
    highlights: [
      "Near-perfect detection of realistic sparse corpus poisoning — AUC 0.99–1.00 at one poison document in the top-5",
      "The matching defense restores end-to-end accuracy (conflict attack 0.756→0.858; ASR 0.21→0.014)",
      "RFC and ingestion-time filtering are structurally complementary — proven against an adaptive, RFC-aware attacker",
    ],
    tags: ["Python", "PyTorch", "LLaMA-3", "QLoRA", "FAISS"],
    links: [{ label: "GitHub", href: "https://github.com/SarathA9" }],
  },
  {
    title:
      "ECG Signal Processing for Anaesthesia Monitoring: A Rule-Based Classification Approach",
    venue: "OTH Amberg-Weiden · Technical Report",
    date: "Jan 2026",
    summary:
      "A simulation-based ECG processing chain for anaesthesia monitoring: synthetic awake/sleep signals are filtered to IEC 60601-2-27, R-peaks detected, and HRV features used to classify patient state — robust to operating-room interference.",
    highlights: [
      "100% classification accuracy (awake vs. sleep) on synthetic data",
      "31.4 dB attenuation of 100 Hz electrocautery interference",
      "Zero-phase Butterworth band-pass filter (0.5–40 Hz), R-peak detection & SDNN/HRV features",
    ],
    tags: ["Python", "SciPy", "NumPy", "Signal Processing", "Biomedical"],
    links: [{ label: "Read the report (PDF)", href: "/ECG_Anaesthesia_Monitoring_Report.pdf" }],
  },
  {
    title:
      "MQTT Communication & UI for Autonomous Robot Delivery (ALIA-DELIVERY)",
    venue: "OTH Amberg-Weiden · Contribution Report",
    date: "Jul 2025",
    summary:
      "A digital-twin simulation (Webots) for autonomous robots delivering medication and supplies in a care facility. I built the real-time MQTT messaging layer, a re-usable glassmorphic room-selection UI, and a thread-safe dynamic command-override system on top of A* pathfinding.",
    highlights: [
      "Sub-second response from UI command to robot movement",
      "Thread-safe dynamic task switching with immediate path re-planning (A*)",
      "Publish/subscribe MQTT (Paho) integration with automatic reconnection",
    ],
    tags: ["Python", "MQTT / Paho", "Webots", "A* Pathfinding", "Digital Twin"],
    links: [
      { label: "Read the report (PDF)", href: "/ALIA_Delivery_MQTT_Report.pdf" },
      { label: "GitLab repository", href: "https://gitlab.com/marshal.sebastine/alia-delivery/-/tree/main" },
    ],
  },
];

export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  href: string;
  linkLabel: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "RAG Backdoor Defense — RFC",
    blurb:
      "A dual-surface backdoor study for Retrieval-Augmented Generation: a QLoRA-backdoored LLaMA-3-8B paired with a poisoned retrieval corpus. I designed Rank-Faithfulness Consistency (RFC), a query-time defense that detects poisoned documents (AUC 0.99–1.00), benchmarked against ingestion-time filtering and an adaptive attacker.",
    tags: ["LLaMA-3", "QLoRA", "RAG", "FAISS", "PyTorch", "LLM Security"],
    href: "https://github.com/SarathA9",
    linkLabel: "GitHub",
    featured: true,
  },
  {
    title: "NeuroTrack — AI Neurofeedback Platform",
    blurb:
      "Real-time EEG-based neurofeedback training with ML-driven personalized cognitive-state analysis, live visualizations and WebSocket data streaming.",
    tags: ["React", "Node.js", "Flask", "TensorFlow", "WebSocket"],
    href: "https://github.com/SarathA9/NeuroTrack---AI-Driven-Neurofeedback",
    linkLabel: "GitHub",
    featured: true,
  },
  {
    title: "Smart Traffic Density Estimation",
    blurb:
      "Real-time vehicle counting and traffic-density estimation with a transfer-learned YOLOv8 model, evaluated with confusion matrices and exported to ONNX.",
    tags: ["YOLOv8", "Python", "OpenCV", "ONNX"],
    href: "https://github.com/SarathA9/SmartTrafficDensityEstimation",
    linkLabel: "GitHub",
    featured: true,
  },
  {
    title: "Nirikshaka — Object Detector",
    blurb:
      "In-browser object detection powered by TensorFlow.js and MobileNet, enriched with contextual information from the Wikipedia API.",
    tags: ["TensorFlow.js", "React", "Tailwind", "MobileNet"],
    href: "https://nirikshaka.vercel.app",
    linkLabel: "Live demo",
    featured: true,
  },
  {
    title: "E-Learning Hub",
    blurb:
      "A full e-learning marketplace: course catalog, cart & wishlist, Stripe payments, a seller dashboard with sales analytics, and JWT authentication.",
    tags: ["React", "MUI", "MySQL", "Stripe", "JWT"],
    href: "https://github.com/SarathA9",
    linkLabel: "GitHub",
  },
  {
    title: "Mobile Clinic Software",
    blurb:
      "Final-degree project: patient management (EHR, scheduling, reminders), telemedicine consultations, role-based access, and reporting & analytics.",
    tags: ["Telemedicine", "Cloud", "EHR", "Full-Stack"],
    href: "https://github.com/SarathA9/MobileClinic",
    linkLabel: "GitHub",
  },
  {
    title: "TalkEase",
    blurb:
      "Real-time chat and collaboration app with Socket.io messaging and secure JWT + HTTP-cookie authentication.",
    tags: ["React", "Node.js", "Firebase", "Socket.io"],
    href: "https://github.com/SarathA9/TalkEase",
    linkLabel: "GitHub",
  },
  {
    title: "Digitalization of the Book",
    blurb:
      "Student research project: an interactive digital edition of “Jawaharlal Nehru: The Man and His Ideas” using destructive and non-destructive scanning techniques.",
    tags: ["Research", "Digitization", "Interactive"],
    href: "https://www.sdmcujire.in",
    linkLabel: "Institution",
  },
];

export type SkillGroup = { name: string; items: string[] };

export const skills: SkillGroup[] = [
  { name: "Languages", items: ["Python", "JavaScript", "Java", "C#", "C", "SQL", "R"] },
  { name: "Frontend", items: ["React", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "MUI", "Three.js"] },
  { name: "Backend", items: ["Node.js", "Express", "Flask", "ASP.NET", "Java Servlets", "MVC"] },
  { name: "Databases", items: ["MySQL", "MongoDB", "Firebase"] },
  { name: "AI / ML", items: ["TensorFlow", "TensorFlow.js", "Scikit-learn", "YOLOv8", "OpenCV"] },
  { name: "Tools & Cloud", items: ["Git", "GitHub", "Postman", "Oracle Cloud", "Webots", "MQTT"] },
];

export type Education = {
  degree: string;
  school: string;
  location: string;
  period: string;
  note?: string;
};

export const education: Education[] = [
  {
    degree: "M.Sc. Artificial Intelligence",
    school: "OTH Amberg-Weiden (Ostbayerische Technische Hochschule)",
    location: "Germany",
    period: "Current",
    note: "Programme: Industrie 4.0 Informatik",
  },
  {
    degree: "Bachelor of Computer Applications (BCA)",
    school: "SDM College, Ujire",
    location: "Mangalore, India",
    period: "2021 – 2024",
  },
  {
    degree: "Higher Secondary",
    school: "CHSS Chattanchal",
    location: "Kasaragod, India",
    period: "2018 – 2020",
  },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

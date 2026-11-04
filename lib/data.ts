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
    "I'm a master's student in Artificial Intelligence at OTH Amberg-Weiden, in the Industrie 4.0 Informatik programme. My focus is machine learning, LLM security, robotics and signal processing, and I like taking a problem all the way from data and models to a finished web interface.",
    "My study projects range from defending RAG systems against backdoors to autonomous robot navigation and indoor localisation. Alongside my studies I work as a freelance full-stack developer, building web applications for clients with React, Node.js and MySQL.",
  ],
  focus: [
    "LLM security and RAG",
    "Machine learning and computer vision",
    "Robotics and sensor fusion",
    "Full-stack web development",
  ],
};

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
    location: "Remote",
    period: "Present",
    points: [
      "Build full-stack web applications for clients with React, Node.js and MySQL.",
      "Design scalable, secure architectures with a focus on performance and user experience.",
      "Run projects in an agile way, from requirements analysis to deployment.",
    ],
  },
  {
    role: "Software Engineering Intern",
    company: "Talisma Corporation Pvt. Ltd",
    location: "Bangalore, India",
    period: "07/2024 – 02/2025",
    points: [
      "Developed web applications as part of the engineering team.",
      "Implemented secure authentication and authorization.",
      "Supported database management, system integration, and real-time data and analytics features.",
      "Built responsive, user-friendly interfaces.",
    ],
  },
  {
    role: "Software Development Intern",
    company: "Codelab Systems",
    location: "Mangalore, India",
    period: "01/2024 – 05/2024",
    points: [
      "Built dynamic React.js applications and extended API integrations.",
      "Contributed to responsive e-commerce web designs.",
      "Analysed bugs and solved technical issues.",
    ],
  },
];

export type Research = {
  title: string;
  venue: string;
  date: string;
  /** The single headline result, shown large on the card */
  result: string;
  summary: string;
  highlights: string[];
  tags: string[];
  links: { label: string; href: string }[];
};

export const research: Research[] = [
  {
    title: "Rank-Faithfulness Consistency: A Query-Time Defense Against Dual-Surface Backdoors in RAG",
    venue: "AI Security and Privacy, research report",
    date: "06/2026",
    result: "AUC 0.99–1.00",
    summary:
      "A dual backdoor threat against Retrieval-Augmented Generation: a LLaMA-3-8B model backdoored with QLoRA, plus a poisoned retrieval corpus (FAISS, 2,067 passages). I designed Rank-Faithfulness Consistency (RFC), a query-time defense that flags a retrieved document when its query relevance exceeds its similarity to the rest of the retrieved context.",
    highlights: [
      "Detects single poisoned documents with an AUC of 0.99 to 1.00",
      "Cuts the conflict attack's success rate from 21% to 1.4% (500 questions)",
      "Tested against an adaptive attacker: shows the method's limits and that it complements filtering at indexing time",
    ],
    tags: ["Python", "PyTorch", "LLaMA-3", "QLoRA", "FAISS", "Sentence-Transformers", "scikit-learn"],
    links: [{ label: "GitHub", href: "https://github.com/SarathA9" }],
  },
  {
    title: "Autonomous Maze Navigation with the Husarion RosBot",
    venue: "Robotics project",
    date: "10/2026",
    result: "5 of 5 mazes solved",
    summary:
      "Fully autonomous navigation through five unknown mazes to a blue and then a yellow pillar, using only on-board sensors. A layered occupancy grid from lidar, depth camera and floor colour, scan matching for localisation, A* path planning, pure-pursuit control and detection of floating walls.",
    highlights: [
      "Three parameter profiles solve all five mazes without entering forbidden areas",
      "Fastest run: 277 seconds total",
    ],
    tags: ["Python", "NumPy", "Webots", "Lidar", "RGB-D", "A*"],
    links: [],
  },
  {
    title: "EMI Indoor Navigation with a Particle Filter",
    venue: "Team project, three people",
    date: "07/2026",
    result: "4.3 m mean error",
    summary:
      "Reconstructing walking routes in the two-storey EMI building from smartphone sensor data. Step detection (IMU), heading (AHRS), BLE beacons and the floor plan are fused in a map-based particle filter. My part included data collection, route planning and path sketches.",
    highlights: [
      "100% floor detection across four recorded runs, including stair changes",
      "Mean position error at reference doors down from 7.4 m to about 4.3 m",
    ],
    tags: ["Python", "NumPy", "SciPy", "pandas", "Sensor fusion"],
    links: [],
  },
  {
    title: "Machine Learning Challenge: Classification and Rule Reconstruction",
    venue: "Machine Learning, exam project",
    date: "06/2026",
    result: "0.38 → 0.525 accuracy",
    summary:
      "A three-class problem (7,500 rows, 70 features) where standard models stall at about 0.38 accuracy. The key insight: the target rule is permutation-invariant. Sorted values, ECDF features and ExtraTrees lift five-fold cross-validated accuracy to 0.525 (chance is 0.333).",
    highlights: [
      "Exact reconstruction of the rule-based regression target in a domain-specific language (R² = 1.0)",
      "All results cross-validated, with no data leakage",
    ],
    tags: ["Python", "scikit-learn", "XGBoost", "NumPy", "pandas"],
    links: [],
  },
  {
    title: "ECG Signal Processing for Anaesthesia Monitoring",
    venue: "Technical report",
    date: "01/2026",
    result: "−31.4 dB interference",
    summary:
      "Rule-based classification of awake versus anaesthetised patients from ECG. A zero-phase Butterworth band-pass (0.5–40 Hz), R-peak detection and HRV features (SDNN).",
    highlights: [
      "100% accuracy on synthetic data",
      "100 Hz electrocautery interference attenuated by 31.4 dB",
    ],
    tags: ["Python", "SciPy", "NumPy"],
    links: [{ label: "Read the report", href: "/ECG_Anaesthesia_Monitoring_Report.pdf" }],
  },
  {
    title: "ALIA Delivery: MQTT Communication and UI for Autonomous Delivery Robots",
    venue: "Industrie 4.0 team project, contribution report",
    date: "07/2025",
    result: "< 1 s command to motion",
    summary:
      "A digital-twin simulation of delivery robots in a care facility. Real-time messaging over MQTT (Paho) with automatic reconnection, and thread-safe task switching with immediate A* re-planning.",
    highlights: [
      "Under one second from UI command to robot movement",
      "Thread-safe dynamic task switching with instant path re-planning",
    ],
    tags: ["Python", "Webots", "MQTT", "A*", "JavaScript"],
    links: [
      { label: "Read the report", href: "/ALIA_Delivery_MQTT_Report.pdf" },
      { label: "GitLab", href: "https://gitlab.com/marshal.sebastine/alia-delivery/-/tree/main" },
    ],
  },
];

export type Project = {
  title: string;
  kind: string;
  blurb: string;
  tags: string[];
  href: string;
  linkLabel: string;
};

export const projects: Project[] = [
  {
    title: "NeuroTrack",
    kind: "AI neurofeedback platform",
    blurb:
      "Real-time EEG-based neurofeedback with ML-driven analysis of cognitive states, live visualisation and WebSocket data streaming.",
    tags: ["React", "Node.js", "Flask", "TensorFlow", "WebSocket"],
    href: "https://github.com/SarathA9/NeuroTrack---AI-Driven-Neurofeedback",
    linkLabel: "View on GitHub",
  },
  {
    title: "Smart Traffic Density",
    kind: "Computer vision",
    blurb:
      "Real-time vehicle counting and traffic-density estimation with a transfer-learned YOLOv8 model, evaluated with confusion matrices and exported to ONNX.",
    tags: ["Python", "YOLOv8", "OpenCV", "ONNX"],
    href: "https://github.com/SarathA9/SmartTrafficDensityEstimation",
    linkLabel: "View on GitHub",
  },
  {
    title: "Nirikshaka",
    kind: "Object detection in the browser",
    blurb:
      "Object detection that runs entirely in the browser with TensorFlow.js and MobileNet, enriched with context from the Wikipedia API.",
    tags: ["TensorFlow.js", "React", "Tailwind CSS", "MobileNet"],
    href: "https://nirikshaka.vercel.app",
    linkLabel: "Open live demo",
  },
  {
    title: "E-Learning Hub",
    kind: "Course marketplace",
    blurb:
      "An online course marketplace with catalogue, cart and wishlist, Stripe payments, a seller dashboard with sales analytics, and JWT authentication.",
    tags: ["React", "MUI", "MySQL", "Stripe", "JWT"],
    href: "https://github.com/SarathA9",
    linkLabel: "View on GitHub",
  },
  {
    title: "Mobile Clinic Software",
    kind: "Bachelor's final project",
    blurb:
      "Patient management with electronic health records, scheduling and reminders, telemedicine consultations, role-based access, and reporting.",
    tags: ["Full-stack", "Cloud", "EHR", "Telemedicine"],
    href: "https://github.com/SarathA9/MobileClinic",
    linkLabel: "View on GitHub",
  },
];

export type SkillGroup = { name: string; items: string[] };

export const skills: SkillGroup[] = [
  { name: "Languages", items: ["Python", "JavaScript", "Java", "C#", "C", "SQL", "R"] },
  { name: "AI and ML", items: ["PyTorch", "TensorFlow", "TensorFlow.js", "scikit-learn", "XGBoost", "YOLOv8", "OpenCV"] },
  { name: "LLMs and security", items: ["LLaMA-3", "QLoRA", "Fine-tuning", "RAG", "FAISS", "Sentence-Transformers", "Backdoor and data-poisoning defense"] },
  { name: "Robotics and signals", items: ["Webots", "Particle filters", "Occupancy grids", "A*", "Sensor fusion (IMU, lidar, BLE)", "SciPy"] },
  { name: "Frontend", items: ["React", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "MUI", "Three.js"] },
  { name: "Backend", items: ["Node.js", "Express", "Flask", "ASP.NET", "Java Servlets", "MVC", "JWT", "Stripe"] },
  { name: "Databases", items: ["MySQL", "PostgreSQL", "MongoDB", "Firebase"] },
  { name: "Tools and cloud", items: ["Git", "GitHub", "Jupyter", "Postman", "Oracle Cloud", "MQTT"] },
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
    location: "Amberg, Germany",
    period: "Since 2024",
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

// Static reference data for TECHMED AIS Brainstorming.

export const BRAND = {
  name: "TECHMED AIS Brainstorming",
  short: "TECHMED AIS",
  tagline: "Think Smart. Perform Elite.",
  colors: {
    navy: "#0A1628",
    blue: "#0066CC",
    cyan: "#00D4FF",
  },
};

// Major Nigerian universities (federal, state and notable private).
export const NIGERIAN_UNIVERSITIES: string[] = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "University of Nigeria, Nsukka (UNN)",
  "Obafemi Awolowo University (OAU)",
  "Ahmadu Bello University (ABU), Zaria",
  "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)",
  "University of Port Harcourt (UNIPORT)",
  "Bayero University Kano (BUK)",
  "University of Calabar (UNICAL)",
  "University of Jos (UNIJOS)",
  "University of Maiduguri (UNIMAID)",
  "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Minna (FUTMINNA)",
  "Federal University of Technology, Owerri (FUTO)",
  "Nnamdi Azikiwe University (UNIZIK)",
  "University of Uyo (UNIUYO)",
  "Usmanu Danfodiyo University, Sokoto (UDUS)",
  "University of Agriculture, Abeokuta (FUNAAB)",
  "Michael Okpara University of Agriculture, Umudike",
  "Lagos State University (LASU)",
  "Ekiti State University (EKSU)",
  "Rivers State University (RSU)",
  "Delta State University (DELSU)",
  "Ambrose Alli University (AAU), Ekpoma",
  "Enugu State University of Science and Technology (ESUT)",
  "Kaduna State University (KASU)",
  "Olabisi Onabanjo University (OOU)",
  "Ladoke Akintola University of Technology (LAUTECH)",
  "Abia State University (ABSU)",
  "Imo State University (IMSU)",
  "Benue State University (BSU)",
  "Nasarawa State University, Keffi",
  "Kogi State University (Prince Abubakar Audu University)",
  "Covenant University",
  "Babcock University",
  "Bowen University",
  "Afe Babalola University (ABUAD)",
  "Landmark University",
  "Bells University of Technology",
  "Pan-Atlantic University",
  "Redeemer's University",
  "American University of Nigeria (AUN)",
  "Bingham University",
  "Lead City University",
  "Igbinedion University, Okada",
  "Nile University of Nigeria",
  "Baze University",
  "Federal University, Oye-Ekiti (FUOYE)",
  "Federal University, Dutse (FUD)",
  "Federal University, Lafia",
  "Federal University, Lokoja",
  "Federal University, Otuoke",
  "Federal University, Ndufu-Alike (AE-FUNAI)",
  "Federal University, Wukari",
  "Federal University, Kashere",
  "Federal University, Dutsin-Ma",
  "Federal University, Gashua",
  "Other",
];

export const FACULTIES: string[] = [
  "Medicine & Surgery",
  "Pharmacy",
  "Nursing Sciences",
  "Basic Medical Sciences",
  "Dentistry",
  "Engineering & Technology",
  "Sciences",
  "Physical Sciences",
  "Biological Sciences",
  "Computing & Information Technology",
  "Social Sciences",
  "Management Sciences",
  "Administration",
  "Arts & Humanities",
  "Law",
  "Education",
  "Agriculture",
  "Environmental Sciences",
  "Veterinary Medicine",
  "Communication & Media Studies",
];

// A representative set of courses keyed by faculty for the dependent dropdown.
export const COURSES_BY_FACULTY: Record<string, string[]> = {
  "Medicine & Surgery": ["Medicine and Surgery (MBBS)", "Physiotherapy", "Medical Laboratory Science", "Radiography"],
  Pharmacy: ["Pharmacy (PharmD)", "Pharmacology"],
  "Nursing Sciences": ["Nursing Science", "Public Health Nursing"],
  "Basic Medical Sciences": ["Anatomy", "Physiology", "Biochemistry"],
  Dentistry: ["Dentistry (BDS)", "Dental Technology"],
  "Engineering & Technology": [
    "Mechanical Engineering",
    "Electrical/Electronics Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Computer Engineering",
    "Mechatronics Engineering",
    "Petroleum Engineering",
    "Agricultural Engineering",
  ],
  Sciences: ["Mathematics", "Statistics", "Industrial Chemistry", "Geology"],
  "Physical Sciences": ["Physics", "Chemistry", "Mathematics", "Geology"],
  "Biological Sciences": ["Biology", "Microbiology", "Biochemistry", "Botany", "Zoology"],
  "Computing & Information Technology": [
    "Computer Science",
    "Software Engineering",
    "Cyber Security",
    "Information Technology",
    "Data Science",
  ],
  "Social Sciences": ["Economics", "Political Science", "Psychology", "Sociology", "Geography", "Mass Communication"],
  "Management Sciences": ["Accounting", "Business Administration", "Banking and Finance", "Marketing", "Actuarial Science"],
  Administration: ["Public Administration", "Local Government Studies"],
  "Arts & Humanities": ["English Language", "History", "Philosophy", "Theatre Arts", "Linguistics", "Religious Studies"],
  Law: ["Law (LLB)"],
  Education: ["Educational Management", "Guidance and Counselling", "Science Education", "Arts Education"],
  Agriculture: ["Agriculture", "Animal Science", "Crop Science", "Agricultural Economics", "Soil Science"],
  "Environmental Sciences": ["Architecture", "Estate Management", "Quantity Surveying", "Urban and Regional Planning", "Surveying and Geoinformatics"],
  "Veterinary Medicine": ["Veterinary Medicine (DVM)"],
  "Communication & Media Studies": ["Mass Communication", "Journalism", "Film and Multimedia"],
};

export interface SubjectSeed {
  name: string;
  code: string;
  icon: string; // emoji
  color: string; // hex
}

// Canonical subject list shown during registration & seeded into the DB.
export const SUBJECTS: SubjectSeed[] = [
  { name: "English", code: "ENG", icon: "📖", color: "#0066CC" },
  { name: "Mathematics", code: "MTH", icon: "➗", color: "#00D4FF" },
  { name: "Physics", code: "PHY", icon: "🧲", color: "#7C3AED" },
  { name: "Chemistry", code: "CHM", icon: "⚗️", color: "#16A34A" },
  { name: "Biology", code: "BIO", icon: "🧬", color: "#DB2777" },
  { name: "Economics", code: "ECO", icon: "📈", color: "#F59E0B" },
  { name: "Government", code: "GOV", icon: "🏛️", color: "#0EA5E9" },
  { name: "Literature", code: "LIT", icon: "📚", color: "#9333EA" },
  { name: "Geography", code: "GEO", icon: "🗺️", color: "#0D9488" },
  { name: "Agricultural Science", code: "AGR", icon: "🌾", color: "#65A30D" },
  { name: "Commerce", code: "COM", icon: "🛒", color: "#EA580C" },
  { name: "Accounting", code: "ACC", icon: "🧮", color: "#0891B2" },
  { name: "Further Mathematics", code: "FMT", icon: "📐", color: "#4F46E5" },
  { name: "CRS/IRS", code: "CRS", icon: "🕊️", color: "#D97706" },
];

export const SUBJECT_MIN = 3;
export const SUBJECT_MAX = 6;

export const QUESTION_COUNT_OPTIONS = [10, 20, 30, 40, 50] as const;

// Difficulty → seconds per question (used to auto-calculate timed mode).
export const SECONDS_PER_QUESTION: Record<string, number> = {
  EASY: 45,
  MEDIUM: 60,
  HARD: 90,
  MIXED: 60,
};

export const DIFFICULTY_FILTERS = ["MIXED", "EASY", "MEDIUM", "HARD"] as const;
export const SOURCE_FILTERS = ["ALL_YEARS", "SPECIFIC_YEAR", "MY_UNIVERSITY", "ALL_UNIVERSITIES"] as const;
export const TIME_MODES = ["TIMED", "UNTIMED", "CUSTOM"] as const;
export const EXAM_MODES = ["PRACTICE", "EXAM", "ONE_SUBJECT", "CUSTOM"] as const;

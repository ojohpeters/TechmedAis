import { PrismaClient, Difficulty, AnswerOption } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SUBJECTS } from "../lib/constants";

const prisma = new PrismaClient();

interface QSeed {
  subject: string;
  university: string;
  year: number;
  q: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correct: AnswerOption;
  explanation: string;
  difficulty: Difficulty;
}

const QUESTIONS: QSeed[] = [
  // ── English ──
  { subject: "English", university: "University of Lagos (UNILAG)", year: 2022, q: "Choose the option nearest in meaning to: 'The new policy was a panacea for the company's problems.'", a: "A partial solution", b: "A cure-all remedy", c: "A temporary fix", d: "A major setback", correct: "B", explanation: "A 'panacea' is a solution or remedy for all difficulties or diseases — a cure-all.", difficulty: "MEDIUM" },
  { subject: "English", university: "University of Ibadan (UI)", year: 2021, q: "Identify the figure of speech: 'The classroom was a zoo.'", a: "Simile", b: "Metaphor", c: "Personification", d: "Hyperbole", correct: "B", explanation: "A direct comparison without 'like' or 'as' is a metaphor.", difficulty: "EASY" },
  { subject: "English", university: "Obafemi Awolowo University (OAU)", year: 2020, q: "Choose the correctly spelt word.", a: "Occassion", b: "Occasion", c: "Ocassion", d: "Occasionn", correct: "B", explanation: "'Occasion' has double 'c' and single 's'.", difficulty: "EASY" },
  { subject: "English", university: "University of Nigeria, Nsukka (UNN)", year: 2023, q: "The antonym of 'benevolent' is:", a: "Generous", b: "Kind", c: "Malevolent", d: "Charitable", correct: "C", explanation: "'Benevolent' means kind; its opposite is 'malevolent' (wishing harm).", difficulty: "MEDIUM" },

  // ── Mathematics ──
  { subject: "Mathematics", university: "University of Lagos (UNILAG)", year: 2022, q: "If 2x + 3 = 11, what is the value of x?", a: "3", b: "4", c: "5", d: "7", correct: "B", explanation: "2x = 11 - 3 = 8, so x = 4.", difficulty: "EASY" },
  { subject: "Mathematics", university: "Ahmadu Bello University (ABU), Zaria", year: 2021, q: "Simplify: (2³ × 2²) ÷ 2⁴", a: "2", b: "4", c: "8", d: "16", correct: "A", explanation: "2^(3+2-4) = 2^1 = 2.", difficulty: "MEDIUM" },
  { subject: "Mathematics", university: "University of Ibadan (UI)", year: 2020, q: "What is the value of log₁₀ 1000?", a: "1", b: "2", c: "3", d: "10", correct: "C", explanation: "log10(1000) = log10(10^3) = 3.", difficulty: "EASY" },
  { subject: "Mathematics", university: "University of Benin (UNIBEN)", year: 2023, q: "The roots of x² - 5x + 6 = 0 are:", a: "1 and 6", b: "2 and 3", c: "-2 and -3", d: "-1 and -6", correct: "B", explanation: "(x-2)(x-3)=0, so x = 2 or 3.", difficulty: "MEDIUM" },
  { subject: "Mathematics", university: "University of Ilorin (UNILORIN)", year: 2022, q: "Find the derivative of f(x) = 3x² + 2x.", a: "6x + 2", b: "3x + 2", c: "6x", d: "x² + 2", correct: "A", explanation: "d/dx(3x²)=6x and d/dx(2x)=2, so f'(x)=6x+2.", difficulty: "HARD" },

  // ── Physics ──
  { subject: "Physics", university: "Federal University of Technology, Akure (FUTA)", year: 2021, q: "The SI unit of force is the:", a: "Joule", b: "Watt", c: "Newton", d: "Pascal", correct: "C", explanation: "Force is measured in newtons (N).", difficulty: "EASY" },
  { subject: "Physics", university: "University of Lagos (UNILAG)", year: 2022, q: "A body moves with uniform velocity. Its acceleration is:", a: "Maximum", b: "Zero", c: "Increasing", d: "Negative", correct: "B", explanation: "Uniform velocity means no change in velocity, so acceleration = 0.", difficulty: "EASY" },
  { subject: "Physics", university: "Obafemi Awolowo University (OAU)", year: 2020, q: "Which of the following is a vector quantity?", a: "Mass", b: "Speed", c: "Distance", d: "Velocity", correct: "D", explanation: "Velocity has both magnitude and direction, making it a vector.", difficulty: "MEDIUM" },
  { subject: "Physics", university: "Ahmadu Bello University (ABU), Zaria", year: 2023, q: "The work done in lifting a 5 kg mass 2 m vertically (g = 10 m/s²) is:", a: "10 J", b: "50 J", c: "100 J", d: "1000 J", correct: "C", explanation: "W = mgh = 5 × 10 × 2 = 100 J.", difficulty: "HARD" },

  // ── Chemistry ──
  { subject: "Chemistry", university: "University of Ibadan (UI)", year: 2021, q: "The atomic number of an element is the number of:", a: "Neutrons", b: "Protons", c: "Electrons + neutrons", d: "Nucleons", correct: "B", explanation: "Atomic number equals the number of protons in the nucleus.", difficulty: "EASY" },
  { subject: "Chemistry", university: "University of Nigeria, Nsukka (UNN)", year: 2022, q: "Which gas turns lime water milky?", a: "Oxygen", b: "Hydrogen", c: "Carbon dioxide", d: "Nitrogen", correct: "C", explanation: "CO₂ reacts with calcium hydroxide to form insoluble CaCO₃ (milky).", difficulty: "MEDIUM" },
  { subject: "Chemistry", university: "University of Benin (UNIBEN)", year: 2020, q: "The pH of a neutral solution at 25°C is:", a: "0", b: "7", c: "10", d: "14", correct: "B", explanation: "A neutral solution has pH 7 at 25°C.", difficulty: "EASY" },
  { subject: "Chemistry", university: "Bayero University Kano (BUK)", year: 2023, q: "How many moles are in 36 g of water (H₂O, molar mass 18 g/mol)?", a: "0.5", b: "1", c: "2", d: "18", correct: "C", explanation: "moles = mass/molar mass = 36/18 = 2.", difficulty: "HARD" },

  // ── Biology ──
  { subject: "Biology", university: "University of Lagos (UNILAG)", year: 2021, q: "The powerhouse of the cell is the:", a: "Nucleus", b: "Ribosome", c: "Mitochondrion", d: "Golgi body", correct: "C", explanation: "Mitochondria produce ATP, the cell's energy currency.", difficulty: "EASY" },
  { subject: "Biology", university: "University of Ibadan (UI)", year: 2022, q: "Which blood cells are responsible for clotting?", a: "Red blood cells", b: "White blood cells", c: "Platelets", d: "Plasma", correct: "C", explanation: "Platelets (thrombocytes) initiate blood clotting.", difficulty: "MEDIUM" },
  { subject: "Biology", university: "University of Calabar (UNICAL)", year: 2020, q: "Photosynthesis occurs mainly in the:", a: "Roots", b: "Stem", c: "Leaves", d: "Flowers", correct: "C", explanation: "Leaves contain chloroplasts where photosynthesis occurs.", difficulty: "EASY" },
  { subject: "Biology", university: "Obafemi Awolowo University (OAU)", year: 2023, q: "The genetic material in most organisms is:", a: "RNA", b: "DNA", c: "Protein", d: "Lipid", correct: "B", explanation: "DNA carries hereditary information in most organisms.", difficulty: "MEDIUM" },

  // ── Economics ──
  { subject: "Economics", university: "University of Lagos (UNILAG)", year: 2022, q: "The basic economic problem is:", a: "Inflation", b: "Scarcity", c: "Unemployment", d: "Taxation", correct: "B", explanation: "Scarcity (limited resources vs unlimited wants) is the fundamental economic problem.", difficulty: "EASY" },
  { subject: "Economics", university: "University of Nigeria, Nsukka (UNN)", year: 2021, q: "A movement along the demand curve is caused by a change in:", a: "Income", b: "Price of the good", c: "Taste", d: "Population", correct: "B", explanation: "Only a change in the good's own price causes movement along the demand curve.", difficulty: "MEDIUM" },
  { subject: "Economics", university: "University of Ibadan (UI)", year: 2020, q: "Which of these is a factor of production?", a: "Money", b: "Land", c: "Shares", d: "Bonds", correct: "B", explanation: "Land, labour, capital and entrepreneurship are the factors of production.", difficulty: "EASY" },

  // ── Government ──
  { subject: "Government", university: "Ahmadu Bello University (ABU), Zaria", year: 2021, q: "The principle of separation of powers was propounded by:", a: "Karl Marx", b: "Montesquieu", c: "John Locke", d: "Thomas Hobbes", correct: "B", explanation: "Baron de Montesquieu propounded the separation of powers.", difficulty: "MEDIUM" },
  { subject: "Government", university: "University of Jos (UNIJOS)", year: 2022, q: "Nigeria gained independence in:", a: "1957", b: "1960", c: "1963", d: "1979", correct: "B", explanation: "Nigeria gained independence on 1 October 1960.", difficulty: "EASY" },
  { subject: "Government", university: "University of Maiduguri (UNIMAID)", year: 2020, q: "A constitution that is contained in a single document is said to be:", a: "Unwritten", b: "Rigid", c: "Written", d: "Flexible", correct: "C", explanation: "A written constitution is codified in a single formal document.", difficulty: "MEDIUM" },

  // ── Literature ──
  { subject: "Literature", university: "University of Ibadan (UI)", year: 2021, q: "A play that ends in disaster for the protagonist is a:", a: "Comedy", b: "Tragedy", c: "Farce", d: "Satire", correct: "B", explanation: "A tragedy ends with the downfall or death of the protagonist.", difficulty: "EASY" },
  { subject: "Literature", university: "Obafemi Awolowo University (OAU)", year: 2022, q: "The author of 'Things Fall Apart' is:", a: "Wole Soyinka", b: "Chinua Achebe", c: "Cyprian Ekwensi", d: "Elechi Amadi", correct: "B", explanation: "Chinua Achebe wrote 'Things Fall Apart' (1958).", difficulty: "EASY" },
  { subject: "Literature", university: "University of Lagos (UNILAG)", year: 2020, q: "'Soft is the night' is an example of:", a: "Metaphor", b: "Assonance", c: "Synecdoche", d: "Litotes", correct: "B", explanation: "The repetition of the 'o' vowel sound is assonance.", difficulty: "HARD" },

  // ── Geography ──
  { subject: "Geography", university: "University of Ilorin (UNILORIN)", year: 2021, q: "The imaginary line at 0° latitude is the:", a: "Prime Meridian", b: "Equator", c: "Tropic of Cancer", d: "Greenwich line", correct: "B", explanation: "The equator is at 0° latitude.", difficulty: "EASY" },
  { subject: "Geography", university: "Bayero University Kano (BUK)", year: 2022, q: "Which type of rock is formed from cooled magma?", a: "Sedimentary", b: "Metamorphic", c: "Igneous", d: "Limestone", correct: "C", explanation: "Igneous rocks form from the solidification of magma or lava.", difficulty: "MEDIUM" },
  { subject: "Geography", university: "University of Jos (UNIJOS)", year: 2020, q: "The largest river in Nigeria is the:", a: "Benue", b: "Niger", c: "Cross River", d: "Kaduna", correct: "B", explanation: "The River Niger is the longest/largest river in Nigeria.", difficulty: "EASY" },

  // ── Agricultural Science ──
  { subject: "Agricultural Science", university: "University of Agriculture, Abeokuta (FUNAAB)", year: 2021, q: "The process of loosening the soil before planting is called:", a: "Mulching", b: "Tillage", c: "Weeding", d: "Harvesting", correct: "B", explanation: "Tillage is the preparation/loosening of soil for cultivation.", difficulty: "EASY" },
  { subject: "Agricultural Science", university: "Michael Okpara University of Agriculture, Umudike", year: 2022, q: "Which nutrient promotes leaf and stem growth in plants?", a: "Phosphorus", b: "Potassium", c: "Nitrogen", d: "Calcium", correct: "C", explanation: "Nitrogen promotes vegetative (leaf and stem) growth.", difficulty: "MEDIUM" },

  // ── Commerce ──
  { subject: "Commerce", university: "University of Benin (UNIBEN)", year: 2021, q: "The document that lists goods sent to a buyer and amount due is a(n):", a: "Receipt", b: "Invoice", c: "Quotation", d: "Order", correct: "B", explanation: "An invoice states the goods supplied and the amount payable.", difficulty: "EASY" },
  { subject: "Commerce", university: "Lagos State University (LASU)", year: 2022, q: "A market with a single seller is called a:", a: "Monopoly", b: "Oligopoly", c: "Duopoly", d: "Perfect competition", correct: "A", explanation: "A monopoly has only one seller of a product with no close substitute.", difficulty: "MEDIUM" },

  // ── Accounting ──
  { subject: "Accounting", university: "University of Lagos (UNILAG)", year: 2021, q: "The accounting equation is:", a: "Assets = Liabilities − Capital", b: "Assets = Capital + Liabilities", c: "Capital = Assets + Liabilities", d: "Liabilities = Assets + Capital", correct: "B", explanation: "Assets = Capital + Liabilities (the fundamental accounting equation).", difficulty: "MEDIUM" },
  { subject: "Accounting", university: "Nnamdi Azikiwe University (UNIZIK)", year: 2022, q: "A document showing the financial position at a point in time is the:", a: "Trial balance", b: "Income statement", c: "Balance sheet", d: "Cash book", correct: "C", explanation: "The balance sheet (statement of financial position) shows assets, liabilities and equity at a point in time.", difficulty: "EASY" },

  // ── Further Mathematics ──
  { subject: "Further Mathematics", university: "Federal University of Technology, Owerri (FUTO)", year: 2021, q: "If the matrix A = [[1,2],[3,4]], its determinant is:", a: "-2", b: "2", c: "10", d: "-10", correct: "A", explanation: "det = (1)(4) − (2)(3) = 4 − 6 = −2.", difficulty: "HARD" },
  { subject: "Further Mathematics", university: "Federal University of Technology, Minna (FUTMINNA)", year: 2022, q: "The sum of the first n terms of an AP with a=2, d=3 and n=5 is:", a: "35", b: "40", c: "45", d: "50", correct: "B", explanation: "Sₙ = n/2[2a+(n-1)d] = 5/2[4+12] = 5/2(16) = 40.", difficulty: "HARD" },

  // ── CRS/IRS ──
  { subject: "CRS/IRS", university: "University of Ibadan (UI)", year: 2021, q: "Who led the Israelites out of Egypt?", a: "Abraham", b: "Moses", c: "Joshua", d: "David", correct: "B", explanation: "Moses led the Israelites out of Egyptian bondage (the Exodus).", difficulty: "EASY" },
  { subject: "CRS/IRS", university: "Bayero University Kano (BUK)", year: 2022, q: "The first pillar of Islam is:", a: "Salat", b: "Zakat", c: "Shahadah", d: "Hajj", correct: "C", explanation: "The Shahadah (declaration of faith) is the first pillar of Islam.", difficulty: "EASY" },
];

async function main() {
  console.log("🌱 Seeding TECHMED AIS Brainstorming…");

  // Subjects
  const subjectMap = new Map<string, string>();
  for (const s of SUBJECTS) {
    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name, icon: s.icon, color: s.color },
      create: { name: s.name, code: s.code, icon: s.icon, color: s.color },
    });
    subjectMap.set(s.name, subject.id);
  }
  console.log(`✓ ${SUBJECTS.length} subjects`);

  // Questions
  let inserted = 0;
  for (const q of QUESTIONS) {
    const subjectId = subjectMap.get(q.subject);
    if (!subjectId) continue;
    // Avoid duplicates on re-seed by matching text+subject.
    const exists = await prisma.question.findFirst({
      where: { subjectId, questionText: q.q },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.question.create({
      data: {
        subjectId,
        university: q.university,
        year: q.year,
        questionText: q.q,
        optionA: q.a,
        optionB: q.b,
        optionC: q.c,
        optionD: q.d,
        correctAnswer: q.correct,
        explanation: q.explanation,
        difficulty: q.difficulty,
      },
    });
    inserted++;
  }
  console.log(`✓ ${inserted} questions`);

  // Admin user
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@techmed.ng").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const hashed = await bcrypt.hash(adminPassword, 12);
  const coreSubjects = ["English", "Mathematics", "Biology", "Chemistry"]
    .map((n) => subjectMap.get(n))
    .filter(Boolean) as string[];

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      name: "TECHMED Admin",
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
      university: "University of Lagos (UNILAG)",
      faculty: "Medicine & Surgery",
      course: "Medicine and Surgery (MBBS)",
      selectedSubjects: { connect: coreSubjects.map((id) => ({ id })) },
      streak: { create: { currentStreak: 0, longestStreak: 0, freezeTokens: 0 } },
    },
  });
  console.log(`✓ admin user: ${admin.email}`);

  // Demo student
  const demoHashed = await bcrypt.hash("Student@123", 12);
  await prisma.user.upsert({
    where: { email: "student@techmed.ng" },
    update: {},
    create: {
      name: "Demo Student",
      displayName: "Demo",
      email: "student@techmed.ng",
      password: demoHashed,
      role: "STUDENT",
      university: "University of Ibadan (UI)",
      faculty: "Sciences",
      course: "Microbiology",
      totalPoints: 320,
      selectedSubjects: { connect: coreSubjects.map((id) => ({ id })) },
      streak: { create: { currentStreak: 2, longestStreak: 5, freezeTokens: 0 } },
    },
  });
  console.log("✓ demo student: student@techmed.ng / Student@123");

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export const SITE = {
  name: "Noor Al-Quran Academy",
  shortName: "Noor Academy",
  teacher: "Ustadh Hasib Hasan",
  teacherTitle: "Hafiz ul Quran",
  hafizYear: 2022,
  location: "Chapai Nawabganj, Bangladesh",
  timezone: "Asia/Dhaka",
  tagline: "Learn Quran with a Hafiz — online, one-to-one, from anywhere",
  description:
    "Personalized online Quran classes in Tajweed, Hifz, Nazra and Duas, taught by Hafiz ul Quran Ustadh Hasib Hasan from Chapai Nawabganj, Bangladesh.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@nooralquran.com",
  phone: "+8801XXXXXXXXX",
  bKashNumber: "01XXXXXXXXX",
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    "https://facebook.com/nooralquranacademy",
  messenger: process.env.NEXT_PUBLIC_MESSENGER_URL || "https://m.me/nooralquranacademy",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "https://wa.me/8801XXXXXXXXX",
  targetCountries: ["Italy", "USA", "UK", "Saudi Arabia", "Bangladesh"],
  subjects: ["tajweed", "hifz", "nazra", "dua"],
  classTimes: {
    satThu: ["08:00", "09:00", "10:00", "16:00", "17:00", "20:00"],
    friday: ["20:00", "21:00"],
    durations: [30, 45, 60],
  },
};

export const NAV_LINKS = [
  { key: "nav.home", label: "Home", href: "/" },
  { key: "nav.courses", label: "Courses", href: "/#courses" },
  { key: "nav.about", label: "About", href: "/#about" },
  { key: "nav.pricing", label: "Pricing", href: "/#pricing" },
  { key: "nav.testimonials", label: "Testimonials", href: "/#testimonials" },
  { key: "nav.faq", label: "FAQ", href: "/#faq" },
];

export const COURSES = [
  {
    id: "tajweed",
    name: "Tajweed",
    arabic: "التجويد",
    bangla: "তাজবীদ",
    level: "All Levels",
    description:
      "Master the rules of Quranic recitation — proper pronunciation (Makharij) and articulation (Sifaat) with a qualified Hafiz.",
    duration: "30 / 45 / 60 min",
  },
  {
    id: "hifz",
    name: "Hifz",
    arabic: "الحفظ",
    bangla: "হিফজ",
    level: "Beginner → Advanced",
    description:
      "Systematic memorization of the Quran with strong revision (Murāja'ah) schedule to make memorization solid and permanent.",
    duration: "45 / 60 min",
  },
  {
    id: "nazra",
    name: "Nazra",
    arabic: "النظرة",
    bangla: "নাজরা",
    level: "Beginners",
    description:
      "Fluent and correct reading of the Quran word by word, building confidence for learners of every age.",
    duration: "30 / 45 / 60 min",
  },
  {
    id: "dua",
    name: "Masnoon Duas",
    arabic: "الأدعية",
    bangla: "মাসনূন দোয়া",
    level: "All Levels",
    description:
      "Learn essential daily duas and adhkar from the Sunnah with correct Arabic pronunciation and meaning.",
    duration: "30 min",
  },
];

export const PRICING = {
  bd: {
    currency: "BDT",
    symbol: "৳",
    plans: [
      {
        name: "Starter",
        classes: 4,
        price: 1200,
        features: [
          "4 classes per month",
          "Any subject",
          "Online via video call",
          "WhatsApp support",
        ],
        popular: false,
      },
      {
        name: "Popular",
        classes: 8,
        price: 2200,
        features: [
          "8 classes per month",
          "Any subject",
          "Online via video call",
          "WhatsApp support",
          "Progress tracking",
        ],
        popular: true,
      },
      {
        name: "Intensive",
        classes: 12,
        price: 3000,
        features: [
          "12 classes per month",
          "Any subject",
          "Online via video call",
          "WhatsApp support",
          "Progress tracking",
          "Priority scheduling",
        ],
        popular: false,
      },
    ],
  },
  intl: {
    currency: "USD",
    symbol: "$",
    plans: [
      {
        name: "Starter",
        classes: 4,
        price: 20,
        features: [
          "4 classes per month",
          "Any subject",
          "Online via video call",
          "WhatsApp support",
        ],
        popular: false,
      },
      {
        name: "Popular",
        classes: 8,
        price: 36,
        features: [
          "8 classes per month",
          "Any subject",
          "Online via video call",
          "WhatsApp support",
          "Progress tracking",
        ],
        popular: true,
      },
      {
        name: "Intensive",
        classes: 12,
        price: 48,
        features: [
          "12 classes per month",
          "Any subject",
          "Online via video call",
          "WhatsApp support",
          "Progress tracking",
          "Priority scheduling",
        ],
        popular: false,
      },
    ],
  },
};

export const STATS = [
  { value: "5+", label: "Countries served" },
  { value: "100+", label: "Students taught" },
  { value: "4", label: "Courses offered" },
  { value: "1", label: "Hafiz instructor" },
];

export const TESTIMONIALS = [
  {
    name: "Aisha Rahman",
    country: "Italy",
    text: "My children love their Tajweed classes. Ustadh Hasib is patient, punctual and very skilled at explaining Makharij.",
    rating: 5,
  },
  {
    name: "Mohammed Karim",
    country: "USA",
    text: "I started Hifz from zero and the structured revision plan made all the difference. Alhamdulillah, my memorization is finally sticking.",
    rating: 5,
  },
  {
    name: "Fatima Islam",
    country: "UK",
    text: "The one-to-one Nazra lessons helped me read fluently in a few months. Highly recommended for beginners of any age.",
    rating: 5,
  },
  {
    name: "Yusuf Ahmed",
    country: "Saudi Arabia",
    text: "Best online Quran teacher I have found. The class times work perfectly with my schedule in Riyadh.",
    rating: 5,
  },
];

export const FAQS = [
  {
    question: "How are classes delivered?",
    answer:
      "Classes are one-to-one via video call (Google Meet / Zoom). You get a private meet link for every confirmed booking.",
  },
  {
    question: "Can I choose my class time?",
    answer:
      "Yes. Slots are available Saturday to Thursday at 08:00, 09:00, 10:00, 16:00, 17:00 and 20:00 (Asia/Dhaka time). Friday slots are 20:00 and 21:00.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Students in Bangladesh can pay with bKash. International students pay securely online with Stripe (card / Apple Pay / Google Pay).",
  },
  {
    question: "Can I take a free trial class first?",
    answer:
      "Absolutely. We offer a free trial class so you can meet the teacher and experience the lesson format before booking.",
  },
  {
    question: "Who is the teacher?",
    answer:
      "Ustadh Hasib Hasan, Hafiz ul Quran (2022) from Chapai Nawabganj, Bangladesh. He teaches Tajweed, Hifz, Nazra and Masnoon Duas.",
  },
  {
    question: "Can I change or reschedule a class?",
    answer:
      "Yes, you can request rescheduling or cancellation from your student dashboard, subject to our booking policy.",
  },
];

export const FOOTER_LINKS = {
  quickLinks: [
    { key: "nav.home", label: "Home", href: "/" },
    { key: "nav.courses", label: "Courses", href: "/#courses" },
    { key: "nav.about", label: "About", href: "/#about" },
    { key: "nav.pricing", label: "Pricing", href: "/#pricing" },
    { key: "nav.faq", label: "FAQ", href: "/#faq" },
  ],
  account: [
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Free Trial", href: "/free-trial" },
    { label: "Student Dashboard", href: "/dashboard" },
  ],
  contact: [
    { label: "Chapai Nawabganj, Bangladesh", href: null },
    { label: "contact@nooralquran.com", href: "mailto:contact@nooralquran.com" },
    { label: "WhatsApp", href: "https://wa.me/8801XXXXXXXXX" },
  ],
};

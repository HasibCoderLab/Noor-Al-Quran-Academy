export const metadata = {
  title: "Free Trial Class",
  description:
    "Book a free one-to-one Quran trial class with a Hafiz ul Quran. Choose your course, date and time — no payment required.",
  alternates: {
    canonical: "/free-trial",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Free Trial Class",
    description:
      "Book a free one-to-one Quran trial class — choose your course, date and time. No payment required.",
    url: "/free-trial",
    type: "website",
  },
};

export default function Layout({ children }) {
  return children;
}

export default function sitemap() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const lastModified = new Date();

  const routes = [
    { path: "/", priority: 1 },
    { path: "/free-trial", priority: 0.9 },
    { path: "/register", priority: 0.6 },
    { path: "/login", priority: 0.5 },
    { path: "/terms", priority: 0.4 },
    { path: "/privacy-policy", priority: 0.4 },
    { path: "/refund-policy", priority: 0.4 },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.path === "/" ? "daily" : "monthly",
    priority: route.priority,
  }));
}

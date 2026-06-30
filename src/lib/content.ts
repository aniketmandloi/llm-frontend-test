export const siteConfig = {
  name: "Nexus",
  tagline: "Ship faster with clarity",
  description:
    "The all-in-one workspace for modern teams. Plan, build, and deliver — without the chaos.",
  cta: {
    primary: "Start free trial",
    secondary: "Book a demo",
  },
  nav: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  logos: ["Acme", "Orbital", "Pulse", "Vertex", "Horizon", "Nova", "Atlas"],
  features: [
    {
      title: "Unified workspace",
      description:
        "Projects, docs, and tasks in one place. No more tab-switching between tools.",
      icon: "layers",
    },
    {
      title: "Real-time collaboration",
      description:
        "See changes as they happen. Comment, assign, and ship together.",
      icon: "users",
    },
    {
      title: "Smart automations",
      description:
        "Trigger workflows from any event. Let routine work run itself.",
      icon: "zap",
    },
    {
      title: "Insightful analytics",
      description:
        "Track velocity, bottlenecks, and team health with built-in dashboards.",
      icon: "chart",
    },
    {
      title: "Enterprise security",
      description:
        "SOC 2 compliant with SSO, audit logs, and role-based access control.",
      icon: "shield",
    },
    {
      title: "Integrations",
      description:
        "Connect Slack, GitHub, Figma, and 50+ tools in minutes.",
      icon: "plug",
    },
  ],
  pricing: [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "For individuals and small teams getting started.",
      features: [
        "Up to 3 projects",
        "5 team members",
        "Basic automations",
        "Community support",
      ],
      cta: "Get started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per user / month",
      description: "For growing teams that need more power.",
      features: [
        "Unlimited projects",
        "Advanced automations",
        "Analytics dashboard",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Start free trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For organizations with advanced security needs.",
      features: [
        "SSO & SAML",
        "Dedicated support",
        "Custom SLA",
        "Audit logs",
        "On-premise option",
      ],
      cta: "Contact sales",
      highlighted: false,
    },
  ],
  faq: [
    {
      id: "trial",
      question: "Is there a free trial?",
      answer:
        "Yes. Pro plans include a 14-day free trial with full access — no credit card required.",
    },
    {
      id: "cancel",
      question: "Can I cancel anytime?",
      answer:
        "Absolutely. Cancel your subscription at any time from your account settings. No lock-in contracts.",
    },
    {
      id: "security",
      question: "How secure is my data?",
      answer:
        "We are SOC 2 Type II certified. All data is encrypted at rest and in transit. Enterprise plans include SSO and audit logs.",
    },
    {
      id: "migrate",
      question: "Can I migrate from another tool?",
      answer:
        "Yes. We offer import tools for Jira, Asana, Notion, and Linear. Our team can assist with Enterprise migrations.",
    },
    {
      id: "support",
      question: "What support do you offer?",
      answer:
        "Starter plans include community support. Pro plans get priority email support. Enterprise customers receive a dedicated account manager.",
    },
    {
      id: "billing",
      question: "Do you offer annual billing?",
      answer:
        "Yes. Switch to annual billing and save 20% on Pro plans. Contact sales for Enterprise pricing.",
    },
  ],
  footer: {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
} as const;

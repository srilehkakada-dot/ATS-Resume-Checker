export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration: string;
    location: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    duration: string;
    gpa?: string;
  }[];
  projects: {
    name: string;
    technologies: string;
    description: string;
  }[];
  certifications: string[];
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  keywords: string[];
}

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  status: 'Bookmarked' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  dateApplied: string;
  nextStep: string;
  nextStepDate: string;
  notes: string;
  resumeVersion: string;
  rating: number; // 1-5 stars indicating interest
}

export const SAMPLE_RESUMES: Record<string, ResumeData> = {
  software_engineer: {
    name: "Alex Rivera",
    title: "Senior Full Stack Engineer",
    email: "alex.rivera@devmail.io",
    phone: "+1 (555) 321-7890",
    location: "San Francisco, CA (Hybrid)",
    website: "github.com/alexriveradev",
    summary: "Dynamic Software Engineer with over 6 years of experience building scalable web applications. Specialist in React, Node.js, and cloud architectures. Proven track record of improving site speed by 40% and leading agile development teams to deliver enterprise-grade software products.",
    skills: ["React", "TypeScript", "Node.js", "Express", "Next.js", "MongoDB", "PostgreSQL", "AWS (S3, EC2, Lambda)", "Docker", "GraphQL", "REST APIs", "CI/CD", "Jest", "Tailwind CSS"],
    experience: [
      {
        role: "Senior Full Stack Developer",
        company: "CloudVantage Technologies",
        duration: "2022 - Present",
        location: "San Francisco, CA",
        bullets: [
          "Architected and deployed a microservices-based customer portal, serving 250,000+ monthly active users.",
          "Optimized slow MongoDB queries and added Redis caching layer, decreasing page load speeds by 42%.",
          "Mentored 5 junior developers on TypeScript best practices and clean React design patterns.",
          "Implemented comprehensive CI/CD pipelines using GitHub Actions, cutting production deploy failures by 30%."
        ]
      },
      {
        role: "Software Engineer II",
        company: "FinTech Pulse Solutions",
        duration: "2020 - 2022",
        location: "Oakland, CA",
        bullets: [
          "Developed core banking dashboard widgets using React, Redux Toolkit, and Tailwind CSS.",
          "Integrated Stripe and Plaid payment gateways, processing over $2M in transactions daily with 99.99% uptime.",
          "Collaborated with UX designers to refactor the design system, ensuring full compliance with WCAG 2.1 AA accessibility standards.",
          "Wrote 150+ unit and integration tests using Jest and React Testing Library, boosting coverage from 60% to 88%."
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        school: "University of California, Berkeley",
        duration: "2016 - 2020",
        gpa: "3.7"
      }
    ],
    projects: [
      {
        name: "DevSphere - Developer Social Network",
        technologies: "Next.js, Tailwind CSS, Prisma, PostgreSQL",
        description: "Built a fully-featured social hub for developers with real-time chat, code snippets sharing, and repository integrations."
      },
      {
        name: "EcoMetric - Cloud Resource Cost Auditor",
        technologies: "Node.js, AWS SDK, React, Chart.js",
        description: "Created a SaaS dashboard that scans AWS accounts and flags idle resources, saving early-stage startups average of $450/month."
      }
    ],
    certifications: [
      "AWS Certified Solutions Architect – Associate",
      "Certified ScrumMaster (CSM)"
    ]
  },
  marketing_manager: {
    name: "Sarah Chen",
    title: "Senior Growth Marketing Manager",
    email: "sarah.chen@growthops.co",
    phone: "+1 (555) 789-0123",
    location: "New York, NY",
    website: "sarahchenmarketing.com",
    summary: "Data-driven Growth Marketer with 5+ years of experience managing multi-channel digital marketing campaigns. Expert in user acquisition, SEO, SEM, content strategy, and marketing automation. Managed budgets of $50k+/month generating over 3.5x ROI.",
    skills: ["Google Analytics 4", "SEO & SEM", "A/B Testing", "HubSpot", "Meta Ads Manager", "Google Ads", "Content Marketing", "SQL Basics", "Email Marketing", "Copywriting", "Asana", "Tableau", "Customer Journey Mapping"],
    experience: [
      {
        role: "Growth Marketing Lead",
        company: "SaaSify Inc.",
        duration: "2023 - Present",
        location: "New York, NY",
        bullets: [
          "Scaled self-serve signups by 140% in 10 months through high-intent SEO keyword optimization and tailored landing pages.",
          "Managed a $60,000 monthly digital advertising budget across Meta and Google, reducing Customer Acquisition Cost (CAC) by 22%.",
          " Spearheaded a marketing automation nurture sequence in HubSpot that increased trial-to-paid conversion rates from 4.2% to 6.8%."
        ]
      },
      {
        role: "Digital Marketing Specialist",
        company: "Spark Brand Agency",
        duration: "2021 - 2023",
        location: "New York, NY",
        bullets: [
          "Executed comprehensive paid search campaigns that drove a 35% increase in lead generation for B2B clients.",
          "Conducted detailed keyword research and on-page optimization, lifting organic traffic by 65,000 monthly visitors.",
          "Presented weekly ROI reports and analytical dashboards to enterprise clients using Google Data Studio and Tableau."
        ]
      }
    ],
    education: [
      {
        degree: "B.B.A. in Marketing (Minor in Data Analytics)",
        school: "New York University",
        duration: "2017 - 2021",
        gpa: "3.8"
      }
    ],
    projects: [
      {
        name: "The Growth Hub Newsletter",
        technologies: "Substack, Canva, Google Analytics",
        description: "Founded and scaled a weekly growth marketing newsletter to 12,000+ active subscribers with an average open rate of 42%."
      }
    ],
    certifications: [
      "Google Analytics Individual Qualification (GAIQ)",
      "HubSpot Inbound Marketing Certification"
    ]
  },
  product_manager: {
    name: "Marcus Sterling",
    title: "Senior Product Manager",
    email: "marcus@sterlingpm.xyz",
    phone: "+1 (555) 456-7890",
    location: "Austin, TX (Remote)",
    website: "linkedin.com/in/marcussterling",
    summary: "Product Leader with 7+ years of experience leading cross-functional teams of engineers, designers, and marketers. Passionate about building fintech and SaaS products from 0 to 1. Proven success in driving product vision, defining roadmap priorities, and scaling user base to 1.2M users.",
    skills: ["Product Roadmap", "Agile/Scrum", "User Research", "Jira & Confluence", "Amplitude", "Mixpanel", "SQL", "Figma (Wireframing)", "Market Analysis", "Feature Prioritization", "Stakeholder Management", "OKR Planning"],
    experience: [
      {
        role: "Senior Product Manager",
        company: "PayStream Networks",
        duration: "2022 - Present",
        location: "Austin, TX",
        bullets: [
          "Defined the product roadmap and led a 14-person cross-functional squad to launch PayStream Split, boosting transaction volume by $12M.",
          "Utilized Amplitude and user interviews to analyze drop-off rates, leading to a checkout redesign that increased conversion by 18%.",
          "Collaborated with compliance and legal to expand payment services into 3 new European countries.",
          "Established OKR-based reporting frameworks, aligning product outcomes directly with company financial targets."
        ]
      },
      {
        role: "Product Manager - Mobile App",
        company: "WealthBud Finance",
        duration: "2019 - 2022",
        location: "Austin, TX",
        bullets: [
          "Owned the lifecycle of the WealthBud iOS/Android app, scaling active users from 200k to 1.2M in 2.5 years.",
          "Championed the integration of AI-driven budget tips, resulting in a 25% increase in 30-day retention.",
          "Facilitated daily standups, sprint planning, and backlog grooming sessions in an Agile environment."
        ]
      }
    ],
    education: [
      {
        degree: "B.S. in Management Information Systems",
        school: "University of Texas at Austin",
        duration: "2015 - 2019"
      }
    ],
    projects: [
      {
        name: "BudgetBot - Discord Personal Finance Helper",
        technologies: "Python, Discord API, PostgreSQL",
        description: "Built a side-project bot helping 5,000 users log and categorize expenses directly inside chat channels."
      }
    ],
    certifications: [
      "Pragmatic Institute Certified (Level IV)",
      "Certified Product Owner (CSPO)"
    ]
  }
};

export const SAMPLE_JOBS: JobDescription[] = [
  {
    id: "jd_swe",
    title: "Senior React / Full Stack Engineer",
    company: "NextGen Software Corporation",
    description: "We are seeking a Senior Full Stack Engineer experienced in React, TypeScript, and AWS cloud solutions. You will own the architecture of critical user portals and optimize databases using Redis and PostgreSQL. Experience with CI/CD pipelines, Docker containers, and unit testing is highly desired.",
    keywords: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "CI/CD", "Docker", "Redis", "Jest", "Microservices", "Scalability", "REST APIs"]
  },
  {
    id: "jd_growth_mkt",
    title: "Senior Growth Marketing Lead",
    company: "SaaSify Inc.",
    description: "Looking for a data-driven Growth Marketing Specialist. Responsibilities include scaling organic and paid channels, managing $50k+ monthly budgets, mastering SEO keyword strategies, Google Analytics 4, A/B Testing, HubSpot workflow automation, and reducing CAC. Must be comfortable presenting metrics to leadership.",
    keywords: ["Google Analytics 4", "SEO", "SEM", "A/B Testing", "HubSpot", "CAC", "ROI", "Paid Search", "Meta Ads Manager", "Google Ads", "User Acquisition", "Tableau"]
  },
  {
    id: "jd_pm",
    title: "Product Manager (Fintech / SaaS)",
    company: "StripeWave Payment Gateway",
    description: "Join us to scale our API-driven billing products. You will lead cross-functional engineering and design squads, author product roadmaps in Jira, define OKRs, perform deep user research, and analyze behavior using Amplitude or Mixpanel. Excellent stakeholder management is key.",
    keywords: ["Product Roadmap", "Agile", "User Research", "Jira", "Amplitude", "Mixpanel", "Stakeholder Management", "OKRs", "Fintech", "SaaS", "Feature Prioritization", "SQL"]
  }
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: "app_1",
    title: "Senior React Engineer",
    company: "NextGen Software Corp",
    salary: "$145,000 - $165,000",
    location: "San Francisco, CA (Hybrid)",
    status: "Interviewing",
    dateApplied: "2026-02-10",
    nextStep: "Technical Live Coding Session",
    nextStepDate: "2026-03-02",
    notes: "Rounds 1 & 2 went great. They asked detailed questions about state management, react hooks performance, and AWS deployment. Next is a 60-minute system design & code challenge.",
    resumeVersion: "Modern Tech (Alex Rivera)",
    rating: 5
  },
  {
    id: "app_2",
    title: "Growth Lead",
    company: "SaaSify Inc",
    salary: "$120,000 - $135,000",
    location: "New York, NY",
    status: "Offer",
    dateApplied: "2026-01-28",
    nextStep: "Review Offer Letter Details",
    nextStepDate: "2026-02-28",
    notes: "Offer received! Base $130k + 10% bonus + options. Need to negotiate signing bonus by Friday.",
    resumeVersion: "Creative Neon (Sarah Chen)",
    rating: 4
  },
  {
    id: "app_3",
    title: "Product Director",
    company: "StripeWave Payments",
    salary: "$175,000 - $200,000",
    location: "Austin, TX (Remote)",
    status: "Applied",
    dateApplied: "2026-02-20",
    nextStep: "Follow up with HR Hiring Manager",
    nextStepDate: "2026-03-05",
    notes: "Applied online and sent a LinkedIn connection message to the lead recruiter. They viewed my profile yesterday.",
    resumeVersion: "Executive Gold (Marcus Sterling)",
    rating: 5
  },
  {
    id: "app_4",
    title: "Staff Developer",
    company: "CyberGate Security",
    salary: "$180,000",
    location: "Remote",
    status: "Bookmarked",
    dateApplied: "",
    nextStep: "Tailor resume using ATS checker",
    nextStepDate: "2026-03-01",
    notes: "Need to highlight Docker, AWS Lambda and compliance framework certifications before submitting.",
    resumeVersion: "Unsubmitted",
    rating: 3
  },
  {
    id: "app_5",
    title: "Full Stack Engineer",
    company: "Initech Corp",
    salary: "$110,000",
    location: "Dallas, TX",
    status: "Rejected",
    dateApplied: "2026-01-15",
    nextStep: "Archived",
    nextStepDate: "",
    notes: "Recruiter screen did not advance. Said they wanted 10+ years of experiences for this specific team.",
    resumeVersion: "Clean Professional (Alex Rivera)",
    rating: 2
  }
];

import type { Profile } from '../../src/modules/content/schema';
export function legacyProfile(resume: string): Profile {
  return {
    id: 'profile',
    name: 'Sudhanshu Ranjan',
    role: 'Senior frontend engineer',
    introduction: [
      "Hi, I'm Sudhanshu Ranjan. I'm a senior frontend engineer with 6+ years of experience building fast, responsive, accessible products. I focus on frontend architecture, cross-browser behavior, and shipping features end-to-end with product, design, and backend teams. Outside of work, I enjoy video games, anime, and reading.",
      "I'm currently working as a senior software engineer (frontend lead) at Fletch.",
      'I like learning new things and sharing my knowledge with others.',
    ],
    aside: "Ask me about iframes or forms — I've solved my fair share of tricky problems there.",
    experience: [
      {
        company: 'Fletch',
        href: 'https://fletch.co/',
        role: 'Senior Software Engineer (Frontend Lead)',
        period: 'Dec 2022 – present',
        highlights: [
          'Led frontend architecture for a multi-tenant pet insurance platform.',
          'Built an internal form builder and shipped analytics, A/B testing, and partner widgets with Web Components.',
        ],
      },
      {
        company: 'Interview Kickstart',
        href: 'https://interviewkickstart.com/',
        role: 'Software Engineer',
        period: 'Nov 2021 – Nov 2022',
        highlights: [
          'Led i18n and built analytics and payment integrations.',
          'Improved DX with Storybook and a monorepo, and contributed backend APIs.',
        ],
      },
      {
        company: 'Aptus Data Labs',
        href: 'https://paytm.com/',
        role: 'Software Development Engineer (Frontend Lead)',
        period: 'Jan 2019 – Aug 2021',
        highlights: [
          'Led analytics dashboards, implemented RBAC, and migrated to TypeScript.',
          'Automated deployments with Docker and improved platform reliability.',
        ],
      },
    ],
    projects: [
      {
        name: 'Expense Buddy',
        description: 'Cross-platform expense tracker built with React Native and Expo.',
        href: 'https://github.com/sudokoi/expense-buddy',
      },
      {
        name: 'Portfolio & Blog',
        description:
          'A personal frontend journal built with Next.js, Sanity, and automatically generated OG images.',
        href: 'https://github.com/sudokoi/portfolio',
      },
    ],
    skills: [
      'TypeScript / JavaScript',
      'React / Next.js / Remix',
      'React Native',
      'Tailwind / MUI / Chakra',
      'Node.js / Django',
      'REST APIs / SQL',
      'Docker / CI/CD',
      'GTM / GA / Adobe',
      'Accessibility / Performance',
      'A/B Testing',
    ],
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/perfectsudh/' },
      { label: 'GitHub', href: 'https://github.com/sudokoi' },
      { label: 'Twitter', href: 'https://twitter.com/sudokaii' },
      { label: 'Instagram', href: 'https://instagram.com/sudokaii' },
      { label: 'Email', href: 'mailto:perfectsudh@gmail.com' },
    ],
    resume: { _type: 'reference', _ref: resume },
  };
}

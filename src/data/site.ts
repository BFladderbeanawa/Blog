export type ExternalLink = { name: string; href: string };
export type Project = { name: string; description: string; href: string };
export type Friend = { name: string; description: string; href: string };

export const site = {
  name: 'BFladderbean',
  shortName: 'BF',
  url: 'https://bfladderbean.me',
  description: 'Notes on web development, mathematics, philosophy, and the process of learning.',
  introduction:
    'I can be called as BFladderbean, with a lot of alias, I guess. \"BF\" is one of the most common ones. A hobbyist of graphic design and web development, and a researcher of machine learning.',
  about:
    'I build web interfaces, study technical systems, and document the patterns I want future-me to find again.',
  interests:
    'Games, tools, diagrams, proofs, interaction details, and the strange emotional weather of learning hard things.',
} as const;

export const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Projects', href: '/projects' },
  { name: 'Friend Links', href: '/friends' },
  { name: 'All Posts', href: '/all' },
] as const;

export const socials: ExternalLink[] = [
  { name: 'GitHub', href: 'https://github.com/BFladderbeanawa' },
  { name: 'Bilibili', href: 'https://space.bilibili.com/499560971' },
];
// Add only confirmed public information. Missing accounts are not links.
export const kaggleUrl: string | null = 'https://www.kaggle.com/bfladderbean';
export const contactEmail: string | null = 'fannbryan@gmail.com';
export const projects: Project[] = [];
export const friends: Friend[] = [];

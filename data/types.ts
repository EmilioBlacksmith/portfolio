export type Project = {
  title: string;
  year: number;
  isFeatured?: boolean;
  description: string;
  projectImgs?: string[];
  sliderImg?: string;
  techStack: string[];
  role: string;
  overview?: string;
  highlights?: string[];
  features?: { title: string; description: string }[];
  challenges?: string;
  id: string;
};

export type Profile = {
  name: string;
  alias: string;
  role: string;
  location: string;
  image: string;
  tagline: string;
  bio: string[];
  experience: {
    role: string;
    company: string;
    period: string;
    location: string;
    points: string[];
  }[];
  education: { degree: string; school: string; period: string; gpa: string };
  languages: Record<string, string>;
  skills: Record<string, string[]>;
  links: { github: string; linkedin: string; npm: string };
};

export interface InstructorSocials {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface InstructorCourseSummary {
  slug: string;
  title: string;
  badge?: string;
  price?: string;
}

export interface InstructorItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  experience: string;
  projects: string;
  students: string;
  bio: string;
  socials: InstructorSocials;
  courseSlugs?: string[];
  courses?: InstructorCourseSummary[];
  createdAt?: string;
  updatedAt?: string;
}

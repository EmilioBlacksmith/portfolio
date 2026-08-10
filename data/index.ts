import projectsEn from "./en/projects.json";
import projectsEs from "./es/projects.json";
import profileEn from "./en/profile.json";
import profileEs from "./es/profile.json";
import type { Profile, Project } from "./types";

export function getProjects(locale: string): Project[] {
  return locale === "es" ? projectsEs : projectsEn;
}

export function getProfile(locale: string): Profile {
  return locale === "es" ? profileEs : profileEn;
}

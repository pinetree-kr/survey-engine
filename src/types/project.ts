export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  owner_id: string;
  project_members?: { id: string }[];
  membersCount?: number;
  formsCount?: number;
}
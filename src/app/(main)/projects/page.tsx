import { createClient } from "@/lib/supabase/server";
import { ProjectsList } from "@/components/dashboard/ProjectsList";

interface ProjectPageProps {
  searchParams: Promise<{
    type: "starred" | "owned" | "all";
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectPageProps) {
  const { type = "owned" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return <ProjectsList userId={user.id} type={type} />;
}


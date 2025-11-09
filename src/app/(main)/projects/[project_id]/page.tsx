import { createClient } from "@/lib/supabase/server";
import { ProjectDetail } from "@/components/dashboard/ProjectDetail";

interface ProjectPageProps {
  params: {
    project_id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return <ProjectDetail projectId={params.project_id} userId={user.id} />;
}


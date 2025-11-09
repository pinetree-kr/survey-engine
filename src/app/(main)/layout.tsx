import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MainLayout } from "@/components/layout/MainLayout";
import { Project } from "@/types/project";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 로그인되지 않은 사용자는 홈으로 리다이렉트
    if (!user) {
        redirect("/");
    }
    //   소유한 프로젝트와 참여한 프로젝트를 분리하여 호출(각 3개씩)

    const { data: ownerProjects, error: ownerProjectsError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .limit(3)
        .order("created_at", { ascending: false })
        .overrideTypes<Project[]>();


    // const { data: attendedProjectIds, error: attendedProjectIdsError } = await supabase
    //     .from("project_members")
    //     .select("project_id")
    //     .eq("user_id", user.id)
    //     .is("deleted_at", null)
    //     .not("project_id", "in", ownerProjects?.map((p) => p.id) || [])
    //     .order("created_at", { ascending: false });

    // const { data: starredProjects, error: starredProjectsError } = await supabase
    //     .from("projects")
    //     .select("id, name")
    //     .in("id", attendedProjectIds?.map((p) => p.project_id) || [])
    //     .is("deleted_at", null)
    //     .order("created_at", { ascending: false });

    // if (starredProjectsError) {
    //     console.error("프로젝트 목록을 불러오는 중 오류가 발생했습니다.", starredProjectsError);
    // }
    const starredProjects: Project[] = [];

    return (
        <MainLayout userId={user.id} ownedProjects={ownerProjects || []} starredProjects={starredProjects || []}>
            {children}
        </MainLayout>
    );
}


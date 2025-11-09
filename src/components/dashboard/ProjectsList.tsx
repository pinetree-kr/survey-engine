"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ProjectCard } from "./ProjectCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Project } from "@/types/project";

interface ProjectsListProps {
  userId: string;
  type: "starred" | "owned" | "all";
}

export function ProjectsList({ userId, type }: ProjectsListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    loadProjects(type);
  }, [userId, type]);

  const loadProjects = async (type: "starred" | "owned" | "all") => {
    try {
      setLoading(true);

      if (type === "starred") {

        const { data: starredProjects, error: starredError } = await supabase
          .from("project_members")
          .select("project_id")
          .eq("user_id", userId);

        if (starredError) throw starredError;

        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, project_members(id), forms(id)")
          .in("id", starredProjects.map((p: any) => p.project_id))
          .not("owner_id", "eq", userId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .overrideTypes<Project[]>();

        if (projectsError) throw projectsError;

        setProjects((projects || [])
          .map(({ project_members, forms, ...project }) => {
            return {
              ...project,
              membersCount: project_members?.length || 0,
              formsCount: forms?.length || 0,
            };
          })
          .filter(Boolean));
      }
      else if (type === "owned") {
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, project_members(id), forms(id)")
          .eq("owner_id", userId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .overrideTypes<Project[]>();

        setProjects((projects || [])
          .map(({ project_members, forms, ...project }) => {
            return {
              ...project,
              membersCount: project_members?.length || 0,
              formsCount: forms?.length || 0,
            };
          })
          .filter(Boolean));
      }
      else if (type === "all") {
        const { data: attendedProjects, error: attendedProjectsError } = await supabase
          .from("project_members")
          .select("project_id")
          .eq("user_id", userId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (attendedProjectsError) throw attendedProjectsError;

        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, project_members(id), forms(id)")
          .is("deleted_at", null)
          .in("id", attendedProjects.map((p: any) => p.project_id))
          .order("created_at", { ascending: false })
          .overrideTypes<Project[]>();

        setProjects((projects || [])
          .map(({ project_members, forms, ...project }) => {
            return {
              ...project,
              membersCount: project_members?.length || 0,
              formsCount: forms?.length || 0,
            };
          })
          .filter(Boolean));
      }
    } catch (error: any) {
      toast.error("프로젝트를 불러오는 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    loadProjects(type);
    setIsCreateProjectOpen(false);
  };

  const handleProjectRename = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      toast.error("프로젝트를 찾을 수 없습니다.");
      return;
    }
    setProjectToRename(projectId);
    setNewProjectName(project.name);
    setIsRenameDialogOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!projectToRename || !newProjectName.trim()) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({ name: newProjectName.trim() })
        .eq("id", projectToRename);

      if (error) throw error;

      toast.success("프로젝트 이름이 변경되었습니다.");
      setIsRenameDialogOpen(false);
      setProjectToRename(null);
      setNewProjectName("");
      loadProjects(type);
    } catch (error: any) {
      toast.error(error.message || "프로젝트 이름 변경 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleProjectDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsDeleteDialogOpen(true);
  };

  const handleProjectDelete = async () => {
    if (!projectToDelete) return;

    try {
      const { data, error } = await supabase.rpc("delete_project", {
        project_id: projectToDelete,
      });

      if (error) throw error;

      if (data) {
        toast.success("프로젝트가 휴지통으로 이동되었습니다.");
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
        loadProjects(type);
      } else {
        toast.error("프로젝트 삭제에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "프로젝트 삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleProjectShare = (projectId: string) => {
    const link = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(link);
    toast.success("프로젝트 링크가 클립보드에 복사되었습니다.");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? "s" : ""} ago`;
  };

  return (
    <>
      {/* Projects Content */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        {/* Content */}
        <div className="px-6 py-6 space-y-10">
          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-normal text-[#101828] leading-6">
                {type === "starred" ? "Starred Projects" : type === "owned" ? "Your Projects" : "All Projects"}
              </h2>
              {/* <Button
                variant="default"
                size="sm"
                className="hover:bg-[#155DFC]/90"
                onClick={() => setIsCreateProjectOpen(true)}
              >
                + 프로젝트
              </Button> */}
            </div>

            {loading ? (
              <div className="text-center py-8 text-[#4A5565]">로딩 중...</div>
            ) : projects.length === 0 ? (
              <Card className="bg-white border-[#E5E7EB] rounded-[10px]">
                <CardContent className="py-12 text-center text-[#4A5565]">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[#6A7282]" />
                  <p>프로젝트가 없습니다.</p>
                  <p className="text-sm mt-2">새 프로젝트를 만들어보세요.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* New Project Card */}
                <Card
                  className="bg-white border-[#D1D5DC] border-dashed rounded-[10px] p-6 cursor-pointer hover:border-[#155DFC] hover:bg-[#F0F7FF] transition-colors flex items-center justify-center"
                  onClick={() => setIsCreateProjectOpen(true)}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-[#4A5565]" />
                    </div>
                    <p className="text-sm font-normal text-[#4A5565]">New project</p>
                  </div>
                </Card>
                {projects.map((project) => {
                  return (
                    <ProjectCard
                      key={project.id}
                      title={project.name}
                      formsCount={project.formsCount || 0}
                      membersCount={project.membersCount || 0}
                      updatedAt={formatDate(project.created_at)}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onRename={() => handleProjectRename(project.id)}
                      onDelete={() => handleProjectDeleteClick(project.id)}
                      onShare={() => handleProjectShare(project.id)}
                      projectId={project.id}
                    />
                  );
                })}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        onSuccess={handleProjectCreated}
        userId={userId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white text-[#101828] border-[#E5E7EB] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#101828] text-lg font-semibold">
              1개의 파일을 휴지통으로 이동
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-[#4A5565] text-sm leading-6">
            <div className="space-y-1">
              <p>1개의 파일을 휴지통으로 이동합니다.</p>
              <p>언제든지 나중에 휴지통 섹션에서 복원할 수 있습니다.</p>
            </div>
          </DialogDescription>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              className="bg-white text-[#101828] border-[#D1D5DC] hover:bg-[#F9FAFB] hover:text-[#101828]"
            >
              취소
            </Button>
            <Button
              onClick={handleProjectDelete}
              className="bg-[#DC2626] text-white hover:bg-[#DC2626]/90"
            >
              파일을 휴지통으로 이동
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-white text-[#101828] border-[#E5E7EB] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#101828] text-lg font-semibold">
              프로젝트 이름 변경
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-[#4A5565] text-sm leading-6">
            <div className="space-y-4">
              <p>새 프로젝트 이름을 입력하세요.</p>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="프로젝트 이름"
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameConfirm();
                  }
                }}
              />
            </div>
          </DialogDescription>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setProjectToRename(null);
                setNewProjectName("");
              }}
              className="bg-white text-[#101828] border-[#D1D5DC] hover:bg-[#F9FAFB] hover:text-[#101828]"
            >
              취소
            </Button>
            <Button
              onClick={handleRenameConfirm}
              disabled={!newProjectName.trim()}
              className="bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


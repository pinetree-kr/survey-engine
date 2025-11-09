"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, FileText, Users, LogOut, Settings, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { CreateFormDialog } from "./CreateFormDialog";
import { InviteUserDialog } from "./InviteUserDialog";
import { ProjectCard } from "./ProjectCard";
import { FormCard } from "./FormCard";
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

interface Form {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
}

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isFormDeleteDialogOpen, setIsFormDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    loadProjects();
  }, [userId]);

  useEffect(() => {
    if (selectedProject) {
      loadForms(selectedProject.id);
    } else {
      setForms([]);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // project_members에서 본인이 참여한 프로젝트 목록을 가져오고
      // 프로젝트 정보(소유권 포함)와 멤버 수를 조인하여 가져오기

      // A 방식
      const { data: attendProjects, error: attendError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", userId);

      if (attendError) throw attendError;

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          project_members(id),
          forms(id)
        `)
        .in("id", attendProjects.map((p: any) => p.project_id))
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // 프로젝트에 멤버 수 추가
      const projectsWithCount: Project[] = (projects || [])
        .map(({ project_members, forms, ...project }) => {
          return {
            ...project,
            membersCount: project_members?.length || 0,
            formsCount: forms?.length || 0,
          };
        })
        .filter(Boolean);

      setProjects(projectsWithCount);
      if (projectsWithCount.length > 0 && !selectedProject) {
        setSelectedProject(projectsWithCount[0]);
      }
    } catch (error: any) {
      toast.error("프로젝트를 불러오는 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadForms = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error: any) {
      toast.error("설문 폼을 불러오는 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    } else {
      toast.success("로그아웃되었습니다.");
      router.push("/");
      router.refresh();
    }
  };

  const handleProjectCreated = () => {
    loadProjects();
    setIsCreateProjectOpen(false);
  };

  const handleFormCreated = () => {
    if (selectedProject) {
      loadForms(selectedProject.id);
    }
    setIsCreateFormOpen(false);
  };

  const handleFormRename = async (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    if (!form) {
      toast.error("폼을 찾을 수 없습니다.");
      return;
    }

    const newName = prompt("새 폼 이름을 입력하세요:", form.name);
    if (!newName || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from("forms")
        .update({ name: newName.trim() })
        .eq("id", formId);

      if (error) throw error;

      toast.success("폼 이름이 변경되었습니다.");
      if (selectedProject) {
        loadForms(selectedProject.id);
      }
    } catch (error: any) {
      toast.error(error.message || "폼 이름 변경 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleFormDuplicate = async (formId: string) => {
    try {
      const form = forms.find((f) => f.id === formId);
      if (!form) {
        toast.error("폼을 찾을 수 없습니다.");
        return;
      }

      if (!selectedProject) {
        toast.error("프로젝트를 선택해주세요.");
        return;
      }

      // 폼 복제
      const { data: newForm, error: formError } = await supabase
        .from("forms")
        .insert([
          {
            name: `${form.name} (복사본)`,
            project_id: selectedProject.id,
            data: null, // TODO: 폼 데이터도 복제할 수 있도록 수정
          },
        ])
        .select()
        .single();

      if (formError) throw formError;

      toast.success("폼이 복제되었습니다.");
      loadForms(selectedProject.id);
    } catch (error: any) {
      toast.error(error.message || "폼 복제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleFormDeleteClick = (formId: string) => {
    setFormToDelete(formId);
    setIsFormDeleteDialogOpen(true);
  };

  const handleFormDelete = async () => {
    if (!formToDelete || !selectedProject) return;

    try {
      // RPC 함수를 사용하여 폼 삭제
      const { data, error } = await supabase.rpc("delete_form", {
        form_id: formToDelete,
      });

      if (error) throw error;

      if (data) {
        toast.success("폼이 휴지통으로 이동되었습니다.");
        setIsFormDeleteDialogOpen(false);
        setFormToDelete(null);
        loadForms(selectedProject.id);
      } else {
        toast.error("폼 삭제에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "폼 삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleFormShare = (formId: string) => {
    if (!selectedProject) return;
    const link = `${window.location.origin}/builder?formId=${formId}&projectId=${selectedProject.id}`;
    navigator.clipboard.writeText(link);
    toast.success("폼 링크가 클립보드에 복사되었습니다.");
  };

  const handleProjectRename = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

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
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "프로젝트 이름 변경 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleProjectDuplicate = async (projectId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        toast.error("프로젝트를 찾을 수 없습니다.");
        return;
      }

      // 프로젝트 복제
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            name: `${project.name} (복사본)`,
            description: project.description,
            owner_id: userId,
          },
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // 프로젝트 소유자를 멤버로 추가
      const { error: memberError } = await supabase
        .from("project_members")
        .insert([
          {
            project_id: newProject.id,
            user_id: userId,
            role: "owner",
          },
        ]);

      if (memberError) throw memberError;

      toast.success("프로젝트가 복제되었습니다.");
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "프로젝트 복제 중 오류가 발생했습니다.");
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
      // RPC 함수를 사용하여 프로젝트 삭제
      const { data, error } = await supabase.rpc("delete_project", {
        project_id: projectToDelete,
      });

      if (error) throw error;

      if (data) {
        toast.success("프로젝트가 휴지통으로 이동되었습니다.");
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
        loadProjects();
        if (selectedProject?.id === projectToDelete) {
          setSelectedProject(null);
        }
      } else {
        toast.error("프로젝트 삭제에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "프로젝트 삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleProjectShare = (projectId: string) => {
    const link = `${window.location.origin}/dashboard?project=${projectId}`;
    navigator.clipboard.writeText(link);
    toast.success("프로젝트 링크가 클립보드에 복사되었습니다.");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"recent" | "all" | "owners">("recent");

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

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        {/* Filter Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("recent")}
                className={`
                    h-8 px-3 rounded-lg flex items-center gap-2 text-sm font-normal transition-colors
                    ${filter === "recent"
                    ? "bg-[#F3F4F6] text-[#364153]"
                    : "text-[#364153] hover:bg-[#F3F4F6]"
                  }
                  `}
              >
                Recently viewed
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`
                    h-8 px-3 rounded-lg flex items-center gap-2 text-sm font-normal transition-colors
                    ${filter === "all"
                    ? "bg-[#F3F4F6] text-[#364153]"
                    : "text-[#364153] hover:bg-[#F3F4F6]"
                  }
                  `}
              >
                All projects
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilter("owners")}
                className={`
                    h-8 px-3 rounded-lg flex items-center gap-2 text-sm font-normal transition-colors
                    ${filter === "owners"
                    ? "bg-[#F3F4F6] text-[#364153]"
                    : "text-[#364153] hover:bg-[#F3F4F6]"
                  }
                  `}
              >
                All owners
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-10">
          {/* Your Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-normal text-[#101828] leading-6">
                Your Projects
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#155DFC] text-sm font-normal hover:text-[#155DFC]/90 hover:bg-[#F0F7FF]"
                onClick={() => router.push("/projects?type=owned")}
              >
                See all projects
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-[#4A5565]">로딩 중...</div>
            ) : filteredProjects.length === 0 ? (
              <Card className="bg-white border-[#E5E7EB] rounded-[10px]">
                <CardContent className="py-12 text-center text-[#4A5565]">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[#6A7282]" />
                  <p>프로젝트가 없습니다.</p>
                  <p className="text-sm mt-2">새 프로젝트를 만들어보세요.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredProjects.slice(0, 3).map((project) => {
                  return (
                    <ProjectCard
                      key={project.id}
                      title={project.name}
                      formsCount={project.formsCount || 0}
                      membersCount={project.membersCount || 0}
                      updatedAt={formatDate(project.created_at)}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onRename={() => handleProjectRename(project.id)}
                      onDuplicate={() => handleProjectDuplicate(project.id)}
                      onDelete={() => handleProjectDeleteClick(project.id)}
                      onShare={() => handleProjectShare(project.id)}
                      projectId={project.id}
                      className={
                        selectedProject?.id === project.id
                          ? "border-[#155DFC] bg-[#F0F7FF]"
                          : ""
                      }
                    />
                  );
                })}
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
              </div>
            )}
          </div>

          {/* Recent Forms Section */}
          {selectedProject && (
            <div className="space-y-4">
              <h2 className="text-xl font-normal text-[#101828] leading-[30px]">
                Recent Forms
              </h2>
              {filteredForms.length === 0 ? (
                <Card className="bg-white border-[#E5E7EB] rounded-[10px]">
                  <CardContent className="py-12 text-center text-[#4A5565]">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-[#6A7282]" />
                    <p>설문 폼이 없습니다.</p>
                    <p className="text-sm mt-2">새 설문 폼을 만들어보세요.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filteredForms.slice(0, 6).map((form) => {
                    const editedDate = new Date(form.created_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - editedDate.getTime());
                    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                    const editedAtText = diffHours < 24
                      ? `Edited ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
                      : formatDate(form.created_at);

                    return (
                      <FormCard
                        key={form.id}
                        title={form.name}
                        editedAt={editedAtText}
                        responsesCount={0} // TODO: Get actual response count
                        owner="You"
                        ownerInitial="Y"
                        formId={form.id}
                        onClick={() =>
                          router.push(
                            `/builder?formId=${form.id}&projectId=${selectedProject.id}`
                          )
                        }
                        onRename={() => handleFormRename(form.id)}
                        onDuplicate={() => handleFormDuplicate(form.id)}
                        onDelete={() => handleFormDeleteClick(form.id)}
                        onShare={() => handleFormShare(form.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        onSuccess={handleProjectCreated}
        userId={userId}
      />
      <CreateFormDialog
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSuccess={handleFormCreated}
        projectId={selectedProject?.id || null}
      />
      <InviteUserDialog
        open={isInviteUserOpen}
        onOpenChange={setIsInviteUserOpen}
        projectId={selectedProject?.id || null}
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

      {/* Form Delete Confirmation Dialog */}
      <Dialog open={isFormDeleteDialogOpen} onOpenChange={setIsFormDeleteDialogOpen}>
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
                setIsFormDeleteDialogOpen(false);
                setFormToDelete(null);
              }}
              className="bg-white text-[#101828] border-[#D1D5DC] hover:bg-[#F9FAFB] hover:text-[#101828]"
            >
              취소
            </Button>
            <Button
              onClick={handleFormDelete}
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


"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormCard } from "./FormCard";
import { CreateFormDialog } from "./CreateFormDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project } from "@/types/project";

interface Form {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
}

interface ProjectDetailProps {
  projectId: string;
  userId: string;
}

export function ProjectDetail({ projectId, userId }: ProjectDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProjects();
    loadProject();
    loadForms();
  }, [projectId]);

  const loadProjects = async () => {
    try {
      const { data: attendProjects, error: attendError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", userId);

      if (attendError) throw attendError;

      const { data: projectsData, error: projectsError } = await supabase
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

      const projectsWithCount: Project[] = (projectsData || [])
        .map(({ project_members, forms, ...project }) => {
          return {
            ...project,
            membersCount: project_members?.length || 0,
            formsCount: forms?.length || 0,
          };
        })
        .filter(Boolean);

      setProjects(projectsWithCount);
    } catch (error: any) {
      console.error("프로젝트 목록을 불러오는 중 오류가 발생했습니다.", error);
    }
  };

  const loadProject = async () => {
    try {
      setLoading(true);
      const { data: attendProjects, error: attendError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", userId);

      if (attendError) throw attendError;

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select(`
          *,
          project_members(id),
          forms(id)
        `)
        .eq("id", projectId)
        .is("deleted_at", null)
        .in("id", attendProjects.map((p: any) => p.project_id))
        .single();

      if (projectError) throw projectError;

      if (projectData) {
        const projectWithCount: Project = {
          ...projectData,
          membersCount: projectData.project_members?.length || 0,
          formsCount: projectData.forms?.length || 0,
        };
        setProject(projectWithCount);
      }
    } catch (error: any) {
      toast.error("프로젝트를 불러오는 중 오류가 발생했습니다.");
      console.error(error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadForms = async () => {
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

  const handleFormCreated = () => {
    loadForms();
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
      loadForms();
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

      // 폼 복제
      const { data: newForm, error: formError } = await supabase
        .from("forms")
        .insert([
          {
            name: `${form.name} (복사본)`,
            project_id: projectId,
            data: null, // TODO: 폼 데이터도 복제할 수 있도록 수정
          },
        ])
        .select()
        .single();

      if (formError) throw formError;

      toast.success("폼이 복제되었습니다.");
      loadForms();
    } catch (error: any) {
      toast.error(error.message || "폼 복제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleFormDeleteClick = (formId: string) => {
    setFormToDelete(formId);
    setIsDeleteDialogOpen(true);
  };

  const handleFormDelete = async () => {
    if (!formToDelete) return;

    try {
      // RPC 함수를 사용하여 폼 삭제
      const { data, error } = await supabase.rpc("delete_form", {
        form_id: formToDelete,
      });

      if (error) throw error;

      if (data) {
        toast.success("폼이 휴지통으로 이동되었습니다.");
        setIsDeleteDialogOpen(false);
        setFormToDelete(null);
        loadForms();
      } else {
        toast.error("폼 삭제에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "폼 삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleFormShare = (formId: string) => {
    const link = `${window.location.origin}/builder?formId=${formId}&projectId=${projectId}`;
    navigator.clipboard.writeText(link);
    toast.success("폼 링크가 클립보드에 복사되었습니다.");
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

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-[#4A5565]">로딩 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-[#4A5565]">
          <p>프로젝트를 찾을 수 없습니다.</p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-4"
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        {/* Content */}
        <div className="px-6 py-6">
          {/* Forms Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* New Form Card */}
            <Card
              className="bg-white border-[#E5E7EB] rounded-[10px] cursor-pointer hover:border-[#155DFC] hover:bg-[#F0F7FF] transition-colors"
              onClick={() => setIsCreateFormOpen(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[271.73px]">
                <FilePlus className="w-6 h-6 text-[#4A5565] mb-2" />
                <p className="text-sm font-normal text-[#4A5565] text-center">
                  New form
                </p>
              </CardContent>
            </Card>

            {/* Form Cards */}
            {filteredForms.map((form) => {
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
                      `/builder?formId=${form.id}&projectId=${projectId}`
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

          {/* Empty State */}
          {filteredForms.length === 0 && (
            <div className="mt-4">
              <Card className="bg-white border-[#E5E7EB] rounded-[10px]">
                <CardContent className="py-12 text-center text-[#4A5565]">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-[#6A7282]" />
                  <p>설문 폼이 없습니다.</p>
                  <p className="text-sm mt-2">새 설문 폼을 만들어보세요.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateFormDialog
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSuccess={handleFormCreated}
        projectId={projectId}
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
    </>
  );
}


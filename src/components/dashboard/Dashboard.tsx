"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, FileText, Users, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { CreateFormDialog } from "./CreateFormDialog";
import { InviteUserDialog } from "./InviteUserDialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  owner_id: string;
}

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
      // 사용자가 소유한 프로젝트와 멤버로 참여한 프로젝트 모두 가져오기
      const { data: ownedProjects, error: ownedError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (ownedError) throw ownedError;

      const { data: memberProjects, error: memberError } = await supabase
        .from("project_members")
        .select("projects(*)")
        .eq("user_id", userId);

      if (memberError) throw memberError;

      const allProjects: Project[] = [
        ...(ownedProjects || []),
        ...(memberProjects?.map((pm: any) => pm.projects).filter(Boolean) || []),
      ];

      // 중복 제거
      const uniqueProjects = Array.from(
        new Map(allProjects.map((p) => [p.id, p])).values()
      );

      setProjects(uniqueProjects);
      if (uniqueProjects.length > 0 && !selectedProject) {
        setSelectedProject(uniqueProjects[0]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">그리다 폼</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteUserOpen(true)}
                disabled={!selectedProject}
              >
                <Users className="w-4 h-4 mr-2" />
                사용자 초대
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 프로젝트 목록 */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">프로젝트</h2>
              <Button
                size="sm"
                onClick={() => setIsCreateProjectOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 프로젝트
              </Button>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
              ) : projects.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>프로젝트가 없습니다.</p>
                    <p className="text-sm mt-2">새 프로젝트를 만들어보세요.</p>
                  </CardContent>
                </Card>
              ) : (
                projects.map((project) => (
                  <Card
                    key={project.id}
                    className={`cursor-pointer transition-all ${
                      selectedProject?.id === project.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* 설문 폼 목록 */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedProject.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">설문 폼 목록</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateFormOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 설문 폼
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {forms.length === 0 ? (
                    <Card className="md:col-span-2">
                      <CardContent className="py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>설문 폼이 없습니다.</p>
                        <p className="text-sm mt-2">새 설문 폼을 만들어보세요.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    forms.map((form) => (
                      <Card
                        key={form.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/builder?formId=${form.id}&projectId=${selectedProject.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">{form.name}</h3>
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(form.created_at).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>프로젝트를 선택하거나 새 프로젝트를 만들어보세요.</p>
                </CardContent>
              </Card>
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
    </div>
  );
}


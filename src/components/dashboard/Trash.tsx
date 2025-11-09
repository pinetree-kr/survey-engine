"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FolderOpen, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormCard } from "./FormCard";
import { ProjectCard } from "./ProjectCard";
import { Project } from "@/types/project";

interface TrashItem {
  id: string;
  item_type: "project" | "form";
  item_id: string;
  item_data: any;
  deleted_by: string;
  deleted_at: string;
  restored_at: string | null;
  created_at: string;
}

interface TrashProps {
  userId: string;
}

export function Trash({ userId }: TrashProps) {
  const router = useRouter();
  const supabase = createClient();
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTrash();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: attendProjects, error: attendError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", userId);

      if (attendError) throw attendError;

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name")
        .in("id", attendProjects.map((p: any) => p.project_id))
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .overrideTypes<Project[]>();

      if (projectsError) throw projectsError;

      setProjects(projectsData || []);
    } catch (error: any) {
      console.error("프로젝트 목록을 불러오는 중 오류가 발생했습니다.", error);
    }
  };

  const loadTrash = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trash")
        .select("*")
        .eq("deleted_by", userId)
        .is("restored_at", null)
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setTrashItems(data || []);
    } catch (error: any) {
      toast.error("휴지통을 불러오는 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (trashId: string, itemType: "project" | "form", itemId: string) => {
    try {
      // RPC 함수를 사용하여 원복
      const { data, error } = await supabase.rpc("restore_from_trash", {
        trash_id: trashId,
      });

      if (error) throw error;

      if (data) {
        toast.success(`${itemType === "project" ? "프로젝트" : "폼"}이 원복되었습니다.`);
        loadTrash();
      } else {
        toast.error("원복에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "원복 중 오류가 발생했습니다.");
      console.error(error);
    }
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

  const filteredTrashItems = trashItems.filter((item) => {
    const name = item.item_data?.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const projectItems = filteredTrashItems.filter((item) => item.item_type === "project");
  const formItems = filteredTrashItems.filter((item) => item.item_type === "form");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-[#4A5565]">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        {/* Content */}
        <div className="px-6 py-6 space-y-10">
          {/* Trash Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-normal text-[#101828] leading-[30px]">
              Trash
            </h2>

            {filteredTrashItems.length === 0 ? (
              <Card className="bg-white border-[#E5E7EB] rounded-[10px]">
                <CardContent className="py-12 text-center text-[#4A5565]">
                  <Trash2 className="w-12 h-12 mx-auto mb-4 text-[#6A7282]" />
                  <p>휴지통이 비어있습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Projects Section */}
                {projectItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-normal text-[#101828] leading-6">
                      Projects
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {projectItems.map((item) => {
                        const projectData = item.item_data;
                        return (
                          <Card
                            key={item.id}
                            className="bg-white border-[#E5E7EB] rounded-[10px] p-[21px] relative group"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between">
                                <h3 className="text-base font-normal text-[#101828] leading-6">
                                  {projectData?.name || "Unknown Project"}
                                </h3>
                              </div>
                              <p className="text-xs font-normal text-[#6A7282]">
                                Deleted {formatDate(item.deleted_at)}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(item.id, "project", item.item_id)}
                                className="w-full"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                원복
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Forms Section */}
                {formItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-normal text-[#101828] leading-6">
                      Forms
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {formItems.map((item) => {
                        const formData = item.item_data;
                        const editedDate = new Date(formData?.created_at || item.deleted_at);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - editedDate.getTime());
                        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                        const editedAtText = diffHours < 24
                          ? `Edited ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
                          : formatDate(formData?.created_at || item.deleted_at);

                        return (
                          <Card
                            key={item.id}
                            className="bg-white border-[#E5E7EB] rounded-[10px] overflow-hidden relative group"
                          >
                            <div className="h-[181.73px] bg-[#F3F4F6] relative" />
                            <div className="p-4 flex flex-col gap-2">
                              <h3 className="text-sm font-normal text-[#101828] leading-[20px]">
                                {formData?.name || "Unknown Form"}
                              </h3>
                              <p className="text-xs font-normal text-[#6A7282]">
                                Deleted {formatDate(item.deleted_at)}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(item.id, "form", item.item_id)}
                                className="w-full mt-2"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                원복
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


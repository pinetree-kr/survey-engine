"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalActions,
} from "@/components/ui/modal";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("프로젝트 이름을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 프로젝트 생성
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            owner_id: userId,
          },
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // 프로젝트 생성자를 project_members에 추가
      const { error: memberError } = await supabase
        .from("project_members")
        .insert([
          {
            project_id: project.id,
            user_id: userId,
            role: "owner",
          },
        ]);

      if (memberError) throw memberError;

      toast.success("프로젝트가 생성되었습니다.");
      setName("");
      setDescription("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "프로젝트 생성 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent width="md">
        <ModalHeader paddingBottom={true}>
          <ModalTitle>새 프로젝트 만들기</ModalTitle>
          <ModalDescription>
            프로젝트를 생성하여 설문 폼을 관리하세요.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-2">
              <Label htmlFor="project-name">프로젝트 이름 *</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 고객 만족도 조사"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">설명 (선택사항)</Label>
              <Input
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="프로젝트에 대한 간단한 설명"
              />
            </div>
          </ModalBody>
          <ModalActions
            cancelLabel="취소"
            confirmLabel={loading ? "생성 중..." : "생성"}
            onCancel={() => onOpenChange(false)}
            confirmType="submit"
            isLoading={loading}
            disabled={loading}
          />
        </form>
      </ModalContent>
    </Modal>
  );
}


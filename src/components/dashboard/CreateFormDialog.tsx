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
import { useRouter } from "next/navigation";

interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId: string | null;
}

export function CreateFormDialog({
  open,
  onOpenChange,
  onSuccess,
  projectId,
}: CreateFormDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("설문 폼 이름을 입력해주세요.");
      return;
    }

    if (!projectId) {
      toast.error("프로젝트를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forms")
        .insert([
          {
            name: name.trim(),
            project_id: projectId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("설문 폼이 생성되었습니다.");
      setName("");
      onSuccess();
      onOpenChange(false);
      
      // 설문 폼 빌더로 이동
      router.push(`/builder?formId=${data.id}&projectId=${projectId}`);
    } catch (error: any) {
      toast.error(error.message || "설문 폼 생성 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent width="md">
        <ModalHeader>
          <ModalTitle>새 설문 폼 만들기</ModalTitle>
          <ModalDescription>
            프로젝트에 새로운 설문 폼을 추가하세요.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-2">
              <Label htmlFor="form-name">설문 폼 이름 *</Label>
              <Input
                id="form-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 고객 만족도 조사"
                required
              />
            </div>
          </ModalBody>
          <ModalActions
            cancelLabel="취소"
            confirmLabel={loading ? "생성 중..." : "생성"}
            onCancel={() => onOpenChange(false)}
            confirmType="submit"
            isLoading={loading}
            disabled={loading || !projectId}
          />
        </form>
      </ModalContent>
    </Modal>
  );
}


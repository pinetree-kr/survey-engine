"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 설문 폼 만들기</DialogTitle>
          <DialogDescription>
            프로젝트에 새로운 설문 폼을 추가하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading || !projectId}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


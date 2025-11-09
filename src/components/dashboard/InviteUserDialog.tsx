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

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  projectId,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    if (!projectId) {
      toast.error("프로젝트를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 먼저 사용자 ID를 찾기 위해 이메일로 사용자 검색
      // Supabase Auth는 직접 이메일로 사용자를 조회할 수 없으므로,
      // 프로젝트 멤버 테이블에 이메일을 저장하거나, 별도의 사용자 프로필 테이블이 필요합니다.
      // 여기서는 간단하게 이메일을 저장하고, 나중에 사용자가 가입하면 연결하는 방식으로 구현합니다.

      // TODO: 실제 구현에서는 사용자 프로필 테이블을 만들어서 이메일로 사용자를 찾아야 합니다.
      // 현재는 프로젝트 멤버에 이메일을 임시로 저장하는 방식입니다.
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      // 프로젝트 소유자 확인
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("owner_id")
        .eq("id", projectId)
        .single();

      if (projectError || !project) {
        throw new Error("프로젝트를 찾을 수 없습니다.");
      }

      if (project.owner_id !== user.id) {
        throw new Error("프로젝트 소유자만 사용자를 초대할 수 있습니다.");
      }

      // 사용자 초대 (이메일 기반)
      // 실제 구현에서는 사용자 프로필 테이블에서 이메일로 사용자를 찾아야 합니다.
      // 여기서는 간단하게 project_invitations 테이블에 초대 정보를 저장합니다.
      
      const { error: inviteError } = await supabase
        .from("project_invitations")
        .insert([
          {
            project_id: projectId,
            email: email.trim(),
            invited_by: user.id,
          },
        ]);

      if (inviteError) {
        // 테이블이 없을 수 있으므로, project_members에 이메일을 저장하는 방식으로 대체
        // 실제 프로덕션에서는 별도의 초대 시스템을 구축해야 합니다.
        toast.error("초대 기능을 사용하려면 데이터베이스 스키마가 필요합니다.");
        console.error(inviteError);
      } else {
        toast.success(`${email}에게 초대가 전송되었습니다.`);
        setEmail("");
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || "사용자 초대 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사용자 초대</DialogTitle>
          <DialogDescription>
            프로젝트에 사용자를 초대하려면 이메일을 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">이메일 *</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
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
              {loading ? "초대 중..." : "초대"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


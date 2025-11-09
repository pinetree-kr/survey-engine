"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  FolderOpen,
  ExternalLink,
  Copy,
  Share2,
  Files,
  History,
  Pencil,
  Folder,
  Trash2,
  X
} from "lucide-react";

interface ProjectCardProps {
  title: string;
  formsCount: number;
  membersCount: number;
  updatedAt: string;
  onClick?: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
  projectId?: string;
}

export function ProjectCard({
  title,
  formsCount,
  membersCount,
  updatedAt,
  onClick,
  onRename,
  onDuplicate,
  onDelete,
  onShare,
  className,
  projectId,
}: ProjectCardProps) {
  const handleCopyLink = () => {
    if (projectId) {
      const link = `${window.location.origin}/dashboard?project=${projectId}`;
      navigator.clipboard.writeText(link);
    }
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.location.href = window.location.href;
      }
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          className={cn(
            "bg-white border-[#E5E7EB] rounded-[10px] p-[21px] cursor-pointer hover:shadow-md transition-shadow",
            className
          )}
          onClick={onClick}
        >
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="text-base font-normal text-[#101828] leading-6">
                {title}
              </h3>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-normal text-[#4A5565]">
                {formsCount} forms
              </span>
              <span className="text-sm font-normal text-[#4A5565]">•</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal text-[#4A5565]">
                  {membersCount} members
                </span>
                <div className="w-5 h-5 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                  <span className="text-xs font-normal text-[#4A5565]">
                    {membersCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Updated At */}
            <p className="text-xs font-normal text-[#6A7282]">
              Updated {updatedAt}
            </p>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-white text-[#101828] border-[#E5E7EB] shadow-lg">
        {/* <ContextMenuItem onClick={onClick} className="text-[#101828] hover:bg-[#F3F4F6]">
          <FolderOpen className="mr-2 h-4 w-4" />
          프로젝트에 표시
        </ContextMenuItem> */}
        <ContextMenuItem onClick={onClick} className="text-[#101828] hover:bg-[#F3F4F6]">
          열기
        </ContextMenuItem>
        <ContextMenuItem onClick={handleOpenInNewTab} className="text-[#101828] hover:bg-[#F3F4F6]">
          <ExternalLink className="mr-2 h-4 w-4" />
          새 탭에서 열기
        </ContextMenuItem>
        {/* <ContextMenuSeparator className="bg-[#E5E7EB]" />
        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-[#101828] hover:bg-[#F3F4F6]">
            사이드바에 추가
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-white text-[#101828] border-[#E5E7EB] shadow-lg">
            <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
              즐겨찾기
            </ContextMenuItem>
            <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
              최근 항목
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub> */}
        <ContextMenuSeparator className="bg-[#E5E7EB]" />
        <ContextMenuItem onClick={handleCopyLink} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Copy className="mr-2 h-4 w-4" />
          링크 복사
        </ContextMenuItem>
        {/* <ContextMenuItem onClick={onShare} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Share2 className="mr-2 h-4 w-4" />
          공유하기
        </ContextMenuItem> */}
        {/* <ContextMenuItem onClick={onDuplicate} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Files className="mr-2 h-4 w-4" />
          복제
        </ContextMenuItem> */}
        <ContextMenuSeparator className="bg-[#E5E7EB]" />
        {/* <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
          <History className="mr-2 h-4 w-4" />
          버전 내역 보기
        </ContextMenuItem> */}
        <ContextMenuItem onClick={onRename} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Pencil className="mr-2 h-4 w-4" />
          이름 변경
        </ContextMenuItem>
        {/* <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
          <Folder className="mr-2 h-4 w-4" />
          파일 이동...
        </ContextMenuItem> */}
        <ContextMenuItem
          onClick={onDelete}
          variant="destructive"
          className="text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          휴지통으로 이동
        </ContextMenuItem>
        {/* <ContextMenuSeparator className="bg-[#E5E7EB]" />
        <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
          <X className="mr-2 h-4 w-4" />
          최근 항목 1개 제거
        </ContextMenuItem> */}
      </ContextMenuContent>
    </ContextMenu>
  );
}


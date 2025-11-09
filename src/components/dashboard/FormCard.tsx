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
  FileText,
  ExternalLink,
  Copy,
  Share2,
  Files,
  History,
  Pencil,
  Folder,
  Trash2,
  X,
} from "lucide-react";

interface FormCardProps {
  title: string;
  editedAt: string;
  responsesCount: number;
  owner: string;
  ownerInitial: string;
  imageUrl?: string;
  onClick?: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
  formId?: string;
}

export function FormCard({
  title,
  editedAt,
  responsesCount,
  owner,
  ownerInitial,
  imageUrl,
  onClick,
  onRename,
  onDuplicate,
  onDelete,
  onShare,
  className,
  formId,
}: FormCardProps) {
  const handleCopyLink = () => {
    if (formId) {
      const link = `${window.location.origin}/builder?formId=${formId}`;
      navigator.clipboard.writeText(link);
    }
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      const newWindow = window.open();
      if (newWindow && formId) {
        newWindow.location.href = `${window.location.origin}/builder?formId=${formId}`;
      }
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          className={cn(
            "bg-white border-[#E5E7EB] rounded-[10px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
            className
          )}
          onClick={onClick}
        >
      {/* Image Section */}
      <div className="h-[181.73px] bg-[#F3F4F6] relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#F3F4F6]" />
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-2">
        {/* Title */}
        <h3 className="text-sm font-normal text-[#101828] leading-[20px]">
          {title}
        </h3>
        
        {/* Edited At and Responses */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal text-[#4A5565] leading-[16px]">
            {editedAt}
          </span>
          <span className="text-xs font-normal text-[#4A5565] leading-[16px]">
            {responsesCount} responses
          </span>
        </div>
        
        {/* Owner */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-normal text-[#6A7282] leading-[16px]">
            {owner}
          </span>
          <div className="w-4 h-4 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <span className="text-[10px] font-normal text-[#0A0A0A] leading-[15px]">
              {ownerInitial}
            </span>
          </div>
        </div>
      </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-white text-[#101828] border-[#E5E7EB] shadow-lg">
        <ContextMenuItem onClick={onClick} className="text-[#101828] hover:bg-[#F3F4F6]">
          <FileText className="mr-2 h-4 w-4" />
          열기
        </ContextMenuItem>
        <ContextMenuItem onClick={handleOpenInNewTab} className="text-[#101828] hover:bg-[#F3F4F6]">
          <ExternalLink className="mr-2 h-4 w-4" />
          새 탭에서 열기
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#E5E7EB]" />
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
        </ContextMenuSub>
        <ContextMenuSeparator className="bg-[#E5E7EB]" />
        <ContextMenuItem onClick={handleCopyLink} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Copy className="mr-2 h-4 w-4" />
          링크 복사
        </ContextMenuItem>
        <ContextMenuItem onClick={onShare} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Share2 className="mr-2 h-4 w-4" />
          공유하기
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Files className="mr-2 h-4 w-4" />
          복제
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#E5E7EB]" />
        <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
          <History className="mr-2 h-4 w-4" />
          버전 내역 보기
        </ContextMenuItem>
        <ContextMenuItem onClick={onRename} className="text-[#101828] hover:bg-[#F3F4F6]">
          <Pencil className="mr-2 h-4 w-4" />
          이름 변경
        </ContextMenuItem>
        <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
          <Folder className="mr-2 h-4 w-4" />
          파일 이동...
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onDelete}
          variant="destructive"
          className="text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          휴지통으로 이동
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#E5E7EB]" />
        <ContextMenuItem className="text-[#101828] hover:bg-[#F3F4F6]">
          <X className="mr-2 h-4 w-4" />
          최근 항목 1개 제거
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}


"use client";

import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ onSearch }: DashboardHeaderProps) {
  return (
    <div className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-[448px]">
        {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99A1AF]" />
        <Input
          type="text"
          placeholder="Search forms and projects..."
          className="pl-10 h-9 bg-[#F9FAFB] border-[#E5E7EB] text-sm text-[#717182] placeholder:text-[#717182] rounded-lg"
          onChange={(e) => onSearch?.(e.target.value)}
        /> */}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6]"
        >
          <Bell className="w-4 h-4 text-[#4A5565]" />
        </Button>
        <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}


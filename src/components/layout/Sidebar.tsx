"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  FolderOpen,
  Trash2,
  Settings,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Project } from "@/types/project";

interface SidebarProps {
  onNavigate?: (path: string) => void;
  ownedProjects?: Project[];
  starredProjects?: Project[];
}

export function Sidebar({ onNavigate, ownedProjects = [], starredProjects = [] }: SidebarProps) {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("all-projects");
  const [showProjects, setShowProjects] = useState(true);
  const [showStarred, setShowStarred] = useState(true);

  // const navigationItems = [
  //   { id: "recents", label: "Recents", icon: Clock, active: true },
  // ];

  // 프로젝트 목록 (최대 3개)
  const projectItems = ownedProjects.slice(0, 3).map((project) => ({
    id: project.id,
    label: project.name,
    icon: FolderOpen,
  }));

  const teamItems = [
    ...projectItems,
    { id: "all-projects", label: "All projects", icon: LayoutGrid },
  ];

  const starredItems = [
    // { id: "contact-form", label: "Contact Form", icon: FileText },
    ...starredProjects.slice(0, 3).map((project) => ({
      id: project.id,
      label: project.name,
      icon: FolderOpen,
    })),
    { id: "all-starred-projects", label: "All starred projects", icon: LayoutGrid },
  ];

  const bottomItems = [
    { id: "trash", label: "Trash", icon: Trash2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-[240px] h-screen bg-white border-r border-[#E5E7EB] flex flex-col">
      {/* Logo Section */}
      <div className="h-14 px-4 border-b border-[#E5E7EB] flex items-center">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/icons/logo-192.png"
            alt="Grida Form 로고"
            width={28}
            height={28}
            className="rounded"
            priority
          />
          <span className="text-sm font-semibold text-[#101828] tracking-tight">
            그리다, 폼
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 space-y-6">
          {/* Main Navigation */}
          {/* <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    onNavigate?.(item.id);
                  }}
                  className={cn(
                    "w-full h-9 rounded-lg flex items-center gap-3 px-3 transition-colors",
                    activeItem === item.id
                      ? "bg-[#F3F4F6] text-[#101828]"
                      : "text-[#4A5565] hover:bg-[#F3F4F6]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-normal">{item.label}</span>
                </button>
              );
            })}
          </div> */}

          {/* Your projects Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-normal text-[#6A7282]">Your projects</span>
              <button
                onClick={() => setShowProjects(!showProjects)}
                className="p-1 rounded hover:bg-[#F3F4F6]"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-[#6A7282] transition-transform",
                    !showProjects && "-rotate-90"
                  )}
                />
              </button>
            </div>
            {showProjects && (
              <div className="space-y-1">
                {teamItems.map((item) => {
                  const Icon = item.icon;
                  const isProject = item.id !== "all-projects" && ownedProjects.some(p => p.id === item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveItem(item.id);
                        if (isProject) {
                          router.push(`/projects/${item.id}`);
                        } else if (item.id === "all-projects") {
                          router.push("/projects?type=owned");
                        } else {
                          onNavigate?.(item.id);
                        }
                      }}
                      className={cn(
                        "w-full h-9 rounded-lg flex items-center gap-3 px-3 transition-colors",
                        activeItem === item.id
                          ? "bg-[#F3F4F6] text-[#101828]"
                          : "text-[#4A5565] hover:bg-[#F3F4F6]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-normal">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Starred Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-normal text-[#6A7282]">Starred</span>
              <button
                onClick={() => setShowStarred(!showStarred)}
                className="p-1 rounded hover:bg-[#F3F4F6]"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-[#6A7282] transition-transform",
                    !showStarred && "-rotate-90"
                  )}
                />
              </button>
            </div>
            {showStarred && (
              <div className="space-y-1">
                {starredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveItem(item.id);
                        if (item.id === "all-starred-projects") {
                          router.push("/projects?type=starred");
                        } else {
                          onNavigate?.(item.id);
                        }
                      }}
                      className={cn(
                        "w-full h-9 rounded-lg flex items-center gap-3 px-3 transition-colors",
                        activeItem === item.id
                          ? "bg-[#F3F4F6] text-[#101828]"
                          : "text-[#4A5565] hover:bg-[#F3F4F6]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-normal">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-[#E5E7EB] pt-2 pb-2 px-2 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id);
                if (item.id === "trash") {
                  router.push("/trash");
                } else if (item.id === "settings") {
                  // TODO: Settings 페이지로 이동
                  onNavigate?.(item.id);
                } else {
                  onNavigate?.(item.id);
                }
              }}
              className={cn(
                "w-full h-9 rounded-lg flex items-center gap-3 px-3 transition-colors",
                activeItem === item.id
                  ? "bg-[#F3F4F6] text-[#101828]"
                  : "text-[#4A5565] hover:bg-[#F3F4F6]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-normal">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


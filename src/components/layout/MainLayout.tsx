"use client";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./MainHeader";
import { Project } from "@/types/project";

interface MainLayoutProps {
  userId: string;
  ownedProjects: Project[];
  starredProjects: Project[];
  children: React.ReactNode;
}

export function MainLayout({ userId, ownedProjects, starredProjects, children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Sidebar ownedProjects={ownedProjects} starredProjects={starredProjects} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}


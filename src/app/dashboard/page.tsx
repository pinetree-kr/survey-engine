import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인되지 않은 사용자는 홈으로 리다이렉트
  if (!user) {
    redirect("/");
  }

  return <Dashboard userId={user.id} />;
}


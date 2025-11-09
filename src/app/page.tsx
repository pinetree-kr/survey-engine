import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginPage } from "@/components/auth/LoginPage";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}


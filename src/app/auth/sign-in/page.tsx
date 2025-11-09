import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  if (user) {
    redirect("/dashboard");
  }

  return (
    <SignInForm />
  );
}


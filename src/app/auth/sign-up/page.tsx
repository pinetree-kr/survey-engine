import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  if (user) {
    redirect("/dashboard");
  }

  return (
    <SignUpForm />
  );
}


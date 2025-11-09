import { FormBuilder } from "@/components/FormBuilder";
import { loadSurveyDraftFromServerCookie } from "@/utils/cookie";
import { cookies } from "next/headers";
import "./index.css";

export default async function FormBuilderPage() {
  // 서버에서 쿠키 읽기
  const cookieStore = await cookies();
  const initialSurvey = loadSurveyDraftFromServerCookie(cookieStore);

  return (
    <div>
      <FormBuilder initialSurvey={initialSurvey} />
    </div>
  );
}

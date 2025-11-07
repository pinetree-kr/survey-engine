"use client";

import { QuestionRenderer } from "@/ui/QuestionRenderer";
import type { Question } from "@/schema/question.types";
import type { AnswersMap } from "@/engine/visibility";
import demoSurveyData from "@/fixtures/demo-survey.json";

// JSON을 Question 배열로 타입 캐스팅
const questions = demoSurveyData as Question[];

export default function Home() {
  const handleComplete = (answers: AnswersMap) => {
    console.log("설문 완료!");
    console.log("답변:", Object.fromEntries(answers));
    alert("설문이 완료되었습니다! 콘솔을 확인하세요.");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <QuestionRenderer questions={questions} onComplete={handleComplete} />
    </div>
  );
}


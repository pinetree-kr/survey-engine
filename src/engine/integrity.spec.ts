import { describe, it, expect } from "vitest";
import { validateSurvey } from "./integrity";
import type { Question } from "@/schema/question.types";

describe("integrity", () => {
  describe("validateSurvey", () => {
    it("중복된 질문 ID를 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
        },
        {
          id: "q1",
          title: "질문 2",
          type: "short_text",
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.code === "DUPLICATE_QUESTION_ID")).toBe(
        true
      );
    });

    it("중복된 옵션 키를 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "single_choice",
          options: [
            { label: "옵션 1", key: "opt1" },
            { label: "옵션 2", key: "opt1" },
          ],
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(
        result.errors.some((e) => e.code === "DUPLICATE_OPTION_KEY")
      ).toBe(true);
    });

    it("중복된 컴포지트 키를 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "composite_single",
          compositeItems: [
            { label: "항목 1", key: "item1", input_type: "text" },
            { label: "항목 2", key: "item1", input_type: "text" },
          ],
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(
        result.errors.some((e) => e.code === "DUPLICATE_COMPOSITE_KEY")
      ).toBe(true);
    });

    it("존재하지 않는 nextQuestionId를 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
          nextQuestionId: "q999",
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === "INVALID_NEXT_QUESTION_ID"
        )
      ).toBe(true);
    });

    it("존재하지 않는 branch_logic 참조를 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
        },
        {
          id: "q2",
          title: "질문 2",
          type: "short_text",
          branch_logic: [
            {
              conditions: [
                {
                  question_id: "q999",
                  operator: "eq",
                  value: "test",
                },
              ],
              nextQuestionId: "q1",
            },
          ],
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === "INVALID_BRANCH_CONDITION_QUESTION_ID"
        )
      ).toBe(true);
    });

    it("사이클을 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
          nextQuestionId: "q2",
        },
        {
          id: "q2",
          title: "질문 2",
          type: "short_text",
          nextQuestionId: "q1",
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.code === "CYCLE_DETECTED")).toBe(
        true
      );
    });

    it("도달 불가능한 질문을 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
          nextQuestionId: "q2",
        },
        {
          id: "q2",
          title: "질문 2",
          type: "short_text",
        },
        {
          id: "q3",
          title: "질문 3",
          type: "short_text",
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(
        result.errors.some((e) => e.code === "UNREACHABLE_QUESTIONS")
      ).toBe(true);
    });

    it("multiple_choice의 minSelect/maxSelect 제약을 검증해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "multiple_choice",
          minSelect: 5,
          maxSelect: 3,
          options: [
            { label: "옵션 1", key: "opt1" },
            { label: "옵션 2", key: "opt2" },
          ],
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(
        result.errors.some((e) => e.code === "INVALID_SELECT_RANGE")
      ).toBe(true);
    });

    it("유효하지 않은 정규식을 검출해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
          validations: {
            regex: "[invalid",
          },
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_REGEX")).toBe(true);
    });

    it("유효한 설문은 통과해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
          nextQuestionId: "q2",
        },
        {
          id: "q2",
          title: "질문 2",
          type: "single_choice",
          options: [
            { label: "옵션 1", key: "opt1" },
            { label: "옵션 2", key: "opt2" },
          ],
        },
      ];

      const result = validateSurvey(questions);
      expect(result.ok).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });
});


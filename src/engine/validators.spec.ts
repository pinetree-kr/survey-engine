import { describe, it, expect } from "vitest";
import { validateAnswer } from "./validators";
import type { Question } from "@/schema/question.types";

describe("validators", () => {
  describe("validateAnswer", () => {
    it("required 필드가 비어있으면 오류를 반환해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "short_text",
        required: true,
      };

      const result = validateAnswer(question, "");
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("required가 false이면 빈 값도 통과해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "short_text",
        required: false,
      };

      const result = validateAnswer(question, "");
      expect(result.ok).toBe(true);
    });

    it("텍스트 길이 검증이 동작해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "short_text",
        validations: {
          minLength: 5,
          maxLength: 10,
        },
      };

      const result1 = validateAnswer(question, "abc");
      expect(result1.ok).toBe(false);
      expect(result1.errors.some((e) => e.includes("최소"))).toBe(true);

      const result2 = validateAnswer(question, "abcdefghijklmn");
      expect(result2.ok).toBe(false);
      expect(result2.errors.some((e) => e.includes("최대"))).toBe(true);

      const result3 = validateAnswer(question, "abcdef");
      expect(result3.ok).toBe(true);
    });

    it("정규식 검증이 동작해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "short_text",
        validations: {
          regex: "^[A-Z]+$",
        },
      };

      const result1 = validateAnswer(question, "ABC");
      expect(result1.ok).toBe(true);

      const result2 = validateAnswer(question, "abc123");
      expect(result2.ok).toBe(false);
    });

    it("choice에서 유효하지 않은 옵션 키를 검출해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "choice",
        options: [
          { label: "옵션 1", key: "opt1" },
          { label: "옵션 2", key: "opt2" },
        ],
      };

      const result = validateAnswer(question, "invalid_key");
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes("유효하지 않은"))).toBe(
        true
      );
    });

    it("choice (isMultiple)에서 selectLimit 검증이 동작해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "choice",
        isMultiple: true,
        selectLimit: {
          type: "range",
          min: 2,
          max: 3,
        },
        options: [
          { label: "옵션 1", key: "opt1" },
          { label: "옵션 2", key: "opt2" },
          { label: "옵션 3", key: "opt3" },
          { label: "옵션 4", key: "opt4" },
        ],
      };

      const result1 = validateAnswer(question, ["opt1"]);
      expect(result1.ok).toBe(false);
      expect(result1.errors.some((e) => e.includes("최소"))).toBe(true);

      const result2 = validateAnswer(question, ["opt1", "opt2", "opt3", "opt4"]);
      expect(result2.ok).toBe(false);
      expect(result2.errors.some((e) => e.includes("최대"))).toBe(true);

      const result3 = validateAnswer(question, ["opt1", "opt2"]);
      expect(result3.ok).toBe(true);
    });

    it("composite에서 required 항목 검증이 동작해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "composite_single",
        compositeItems: [
          {
            label: "이름",
            key: "name",
            input_type: "text",
            required: true,
          },
          {
            label: "이메일",
            key: "email",
            input_type: "email",
            required: false,
          },
        ],
      };

      const result1 = validateAnswer(question, { email: "test@example.com" });
      expect(result1.ok).toBe(false);
      expect(result1.errors.some((e) => e.includes("이름"))).toBe(true);

      const result2 = validateAnswer(question, {
        name: "홍길동",
        email: "test@example.com",
      });
      expect(result2.ok).toBe(true);
    });

    it("composite에서 이메일 형식 검증이 동작해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "composite_single",
        compositeItems: [
          {
            label: "이메일",
            key: "email",
            input_type: "email",
            required: true,
          },
        ],
      };

      const result1 = validateAnswer(question, { email: "invalid-email" });
      expect(result1.ok).toBe(false);
      expect(result1.errors.some((e) => e.includes("이메일"))).toBe(true);

      const result2 = validateAnswer(question, {
        email: "test@example.com",
      });
      expect(result2.ok).toBe(true);
    });

    it("composite에서 숫자 범위 검증이 동작해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "composite_single",
        compositeItems: [
          {
            label: "나이",
            key: "age",
            input_type: "number",
            required: true,
            validations: {
              min: 0,
              max: 120,
            },
          },
        ],
      };

      const result1 = validateAnswer(question, { age: -1 });
      expect(result1.ok).toBe(false);
      expect(result1.errors.some((e) => e.includes("이상"))).toBe(true);

      const result2 = validateAnswer(question, { age: 150 });
      expect(result2.ok).toBe(false);
      expect(result2.errors.some((e) => e.includes("이하"))).toBe(true);

      const result3 = validateAnswer(question, { age: 30 });
      expect(result3.ok).toBe(true);
    });

    it("description 타입은 항상 통과해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "description",
      };

      const result = validateAnswer(question, null);
      expect(result.ok).toBe(true);
    });
  });
});


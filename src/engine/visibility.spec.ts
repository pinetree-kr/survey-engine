import { describe, it, expect } from "vitest";
import { evaluateShowConditions } from "./visibility";
import type { Question } from "@/schema/question.types";
import type { AnswersMap } from "./visibility";

describe("visibility", () => {
  describe("evaluateShowConditions", () => {
    it("조건이 없으면 항상 표시해야 함", () => {
      const question: Question = {
        id: "q1",
        title: "질문 1",
        type: "short_text",
      };

      const answers: AnswersMap = new Map();
      expect(evaluateShowConditions(question, answers)).toBe(true);
    });

    it("OR 결합: 하나의 조건만 충족해도 표시해야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "OR",
              children: [
                {
                  kind: "predicate",
                  op: "eq",
                  value: "value1",
                },
                {
                  kind: "predicate",
                  op: "eq",
                  value: "value2",
                },
              ],
            },
          },
        ],
      };

      const answers: AnswersMap = new Map([["q1", "value1"]]);
      expect(evaluateShowConditions(question, answers)).toBe(true);
    });

    it("모든 조건이 충족되지 않으면 숨겨야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "OR",
              children: [
                {
                  kind: "predicate",
                  op: "eq",
                  value: "value1",
                },
                {
                  kind: "predicate",
                  op: "eq",
                  value: "value2",
                },
              ],
            },
          },
        ],
      };

      const answers: AnswersMap = new Map([["q1", "value3"]]);
      expect(evaluateShowConditions(question, answers)).toBe(false);
    });

    it("eq 연산자가 동작해야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "AND",
              children: [
                {
                  kind: "predicate",
                  op: "eq",
                  value: "test",
                },
              ],
            },
          },
        ],
      };

      const answers1: AnswersMap = new Map([["q1", "test"]]);
      expect(evaluateShowConditions(question, answers1)).toBe(true);

      const answers2: AnswersMap = new Map([["q1", "other"]]);
      expect(evaluateShowConditions(question, answers2)).toBe(false);
    });

    it("neq 연산자가 동작해야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "AND",
              children: [
                {
                  kind: "predicate",
                  op: "neq",
                  value: "test",
                },
              ],
            },
          },
        ],
      };

      const answers1: AnswersMap = new Map([["q1", "other"]]);
      expect(evaluateShowConditions(question, answers1)).toBe(true);

      const answers2: AnswersMap = new Map([["q1", "test"]]);
      expect(evaluateShowConditions(question, answers2)).toBe(false);
    });

    it("contains 연산자가 동작해야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "AND",
              children: [
                {
                  kind: "predicate",
                  op: "contains",
                  value: "test",
                },
              ],
            },
          },
        ],
      };

      const answers1: AnswersMap = new Map([["q1", "this is a test"]]);
      expect(evaluateShowConditions(question, answers1)).toBe(true);

      const answers2: AnswersMap = new Map([["q1", "other"]]);
      expect(evaluateShowConditions(question, answers2)).toBe(false);
    });

    it("숫자 비교 연산자(gt, lt, gte, lte)가 동작해야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "AND",
              children: [
                {
                  kind: "predicate",
                  op: "gt",
                  value: 10,
                },
              ],
            },
          },
        ],
      };

      const answers1: AnswersMap = new Map([["q1", 15]]);
      expect(evaluateShowConditions(question, answers1)).toBe(true);

      const answers2: AnswersMap = new Map([["q1", 5]]);
      expect(evaluateShowConditions(question, answers2)).toBe(false);
    });

    it("subKey를 사용하여 컴포지트 값에 접근해야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "AND",
              children: [
                {
                  kind: "predicate",
                  subKey: "email",
                  op: "neq",
                  value: "",
                },
              ],
            },
          },
        ],
      };

      const answers: AnswersMap = new Map([
        [
          "q1",
          {
            name: "홍길동",
            email: "test@example.com",
          },
        ],
      ]);

      expect(evaluateShowConditions(question, answers)).toBe(true);
    });

    it("답변이 없으면 숨겨야 함", () => {
      const question: Question = {
        id: "q2",
        title: "질문 2",
        type: "short_text",
        showRules: [
          {
            refQuestionId: "q1",
            when: {
              kind: "group",
              op: "AND",
              children: [
                {
                  kind: "predicate",
                  op: "eq",
                  value: "test",
                },
              ],
            },
          },
        ],
      };

      const answers: AnswersMap = new Map();
      expect(evaluateShowConditions(question, answers)).toBe(false);
    });
  });
});


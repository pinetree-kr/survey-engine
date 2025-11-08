import { describe, it, expect } from "vitest";
import { getNextQuestionId } from "./next-router";
import type { Operator, Question } from "@/schema/question.types";
import type { AnswersMap } from "./visibility";

describe("next-router", () => {
  describe("getNextQuestionId", () => {
    it("현재 질문의 branchRules가 최우선이어야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "choice",
          options: [
            { label: "옵션 1", key: "opt1" },
          ],
          branchRules: [
            {
              next_question_id: "q3",
            },
          ],
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

      const answers: AnswersMap = new Map();
      const nextId = getNextQuestionId(questions[0], questions, answers);
      expect(nextId).toBe("q3");
    });

    it("choice에서 선택된 옵션의 nextQuestionId를 반환해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "choice",
          options: [
            { label: "옵션 1", key: "opt1" },
            { label: "옵션 2", key: "opt2" },
          ],
          branchRules: [
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "eq" as Operator,
                  value: "opt1",
                }],
              },
              next_question_id: "q2",
            },
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "eq" as Operator,
                  value: "opt2",
                }],
              },
              next_question_id: "q3",
            }
          ],
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

      const answers: AnswersMap = new Map([["q1", "opt2"]]);
      const nextId = getNextQuestionId(questions[0], questions, answers);
      expect(nextId).toBe("q3");
    });

    it("choice (isMultiple)에서 첫 매칭 옵션의 nextQuestionId를 반환해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "choice",
          isMultiple: true,
          options: [
            { label: "옵션 1", key: "opt1" },
            { label: "옵션 2", key: "opt2" },
            { label: "옵션 3", key: "opt3" },
          ],
          branchRules: [
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "contains" as Operator,
                  value: "opt1",
                }],
              },
              next_question_id: "q2",
            },
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "contains" as Operator,
                  value: "opt2",
                }],
              },
              next_question_id: "q3",
            },
          ],
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

      const answers: AnswersMap = new Map([["q1", ["opt3", "opt1"]]]);
      const nextId = getNextQuestionId(questions[0], questions, answers);
      // opt3가 먼저지만 branchRules에서 opt1의 nextQuestionId 반환
      expect(nextId).toBe("q2");
    });

    it("complex_choice에서 subKey를 사용한 branchRules가 동작해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "complex_choice",
          complexItems: [
            {
              label: "이름",
              key: "name",
              input_type: "text",
            },
            {
              label: "이메일",
              key: "email",
              input_type: "email",
            },
          ],
          branchRules: [
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "eq" as Operator,
                  subKey: "name",
                  value: "홍길동",
                }],
              },
              next_question_id: "q2",
            },
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "eq" as Operator,
                  subKey: "email",
                  value: "test@example.com",
                }],
              },
              next_question_id: "q3",
            },
          ],
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

      const answers: AnswersMap = new Map([["q1", { name: "홍길동", email: "test@example.com" }]]);
      const nextId = getNextQuestionId(questions[0], questions, answers);
      // 첫 번째 매칭 규칙이 적용됨
      expect(nextId).toBe("q2");
    });

    it("branchRules에서 AND 평가 후 첫 매칭 rule의 nextQuestionId를 반환해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "short_text",
        },
        {
          id: "q2",
          title: "질문 2",
          type: "choice",
          options: [
            { label: "옵션 1", key: "opt1" },
            { label: "옵션 2", key: "opt2" },
          ],
          branchRules: [
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "eq" as Operator,
                  value: "opt1",
                }],
              },
              next_question_id: "q3",
            },
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "eq" as Operator,
                  value: "opt2",
                }],
              },
              next_question_id: "q4",
            },
          ],
        },
        {
          id: "q3",
          title: "질문 3",
          type: "short_text",
        },
        {
          id: "q4",
          title: "질문 4",
          type: "short_text",
        },
      ];

      // 첫 번째 rule의 모든 조건 충족
      const answers1: AnswersMap = new Map([
        ["q2", "opt1"],
      ]);
      const nextId1 = getNextQuestionId(questions[1], questions, answers1);
      expect(nextId1).toBe("q3");

      // 첫 번째 rule 실패, 두 번째 rule 성공
      const answers2: AnswersMap = new Map([
        ["q2", "opt2"],
      ]);
      const nextId2 = getNextQuestionId(questions[1], questions, answers2);
      expect(nextId2).toBe("q4");
    });

    it("모든 분기 조건이 없으면 선형 다음 질문을 반환해야 함", () => {
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
        },
        {
          id: "q3",
          title: "질문 3",
          type: "short_text",
        },
      ];

      const answers: AnswersMap = new Map();
      const nextId = getNextQuestionId(questions[0], questions, answers);
      expect(nextId).toBe("q2");
    });

    it("마지막 질문이면 null을 반환해야 함", () => {
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
        },
      ];

      const answers: AnswersMap = new Map();
      const nextId = getNextQuestionId(questions[1], questions, answers);
      expect(nextId).toBe(null);
    });

    it("답변이 없어도 선형 다음 질문을 반환해야 함", () => {
      const questions: Question[] = [
        {
          id: "q1",
          title: "질문 1",
          type: "choice",
          options: [
            { label: "옵션 1", key: "opt1" },
            { label: "옵션 2", key: "opt2" },
          ],
          branchRules: [
            {
              when: {
                kind: "group",
                op: "AND",
                children: [{
                  kind: "predicate",
                  op: "eq" as Operator,
                  value: "opt1",
                }],
              },
              next_question_id: "q2",
            },
          ],
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

      const answers: AnswersMap = new Map();
      const nextId = getNextQuestionId(questions[0], questions, answers);
      // 답변이 없으므로 선형 다음 질문 반환
      expect(nextId).toBe("q2");
    });
  });
});

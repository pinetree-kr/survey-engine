'use client';

import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QuestionTypePalette } from '@/components/QuestionTypePalette';
import { QuestionBlock } from '@/components/QuestionBlock';
import { InspectorPanel } from '@/components/InspectorPanel';
import { Header } from '@/components/Header';
import { AddQuestionBar } from '@/components/AddQuestionBar';
import { Question, QuestionType, Survey, Option } from '@/types/survey';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export function FormBuilder() {
    const [survey, setSurvey] = useState<Survey>({
        title: '제목 없는 설문조사',
        questions: [],
    });

    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

    const handleAddQuestion = useCallback((type: QuestionType) => {
        // dropdown 타입을 choice로 통합하고 isDropdown 필드 설정
        const isDropdown = type === 'dropdown';
        const questionType = isDropdown ? 'choice' : type;
        
        const newQuestion: Question = {
            id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: questionType,
            title: '',
            description: type !== 'description' ? '' : undefined,
            required: false,
            options: ['choice', 'dropdown'].includes(type)
                ? [{ label: '', key: `option-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }] as Option[]
                : undefined,
            isDropdown: isDropdown ? true : undefined,
            design: {
                themeColor: '#6366f1',
            },
        };

        setSurvey((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));

        setSelectedQuestionId(newQuestion.id);
        toast.success('질문이 추가되었습니다');
    }, []);

    const handleUpdateQuestion = useCallback((id: string, updates: Partial<Question>) => {
        setSurvey((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === id ? { ...q, ...updates } : q
            ),
        }));
    }, []);

    const handleDeleteQuestion = useCallback((id: string) => {
        setSurvey((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== id),
        }));

        if (selectedQuestionId === id) {
            setSelectedQuestionId(null);
        }

        toast.success('질문이 삭제되었습니다');
    }, [selectedQuestionId]);

    const handleDuplicateQuestion = useCallback((id: string) => {
        setSurvey((prev) => {
            const questionIndex = prev.questions.findIndex((q) => q.id === id);
            if (questionIndex === -1) return prev;

            const originalQuestion = prev.questions[questionIndex];
            const duplicatedQuestion: Question = {
                ...originalQuestion,
                id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                title: `${originalQuestion.title} (사본)`,
            };

            const newQuestions = [...prev.questions];
            newQuestions.splice(questionIndex + 1, 0, duplicatedQuestion);

            return {
                ...prev,
                questions: newQuestions,
            };
        });

        toast.success('질문이 복제되었습니다');
    }, []);

    const handleMoveQuestion = useCallback((dragIndex: number, hoverIndex: number) => {
        setSurvey((prev) => {
            const newQuestions = [...prev.questions];
            const [removed] = newQuestions.splice(dragIndex, 1);
            newQuestions.splice(hoverIndex, 0, removed);

            return {
                ...prev,
                questions: newQuestions,
            };
        });
    }, []);

    const handlePreview = () => {
        toast.info('미리보기 기능 - 곧 제공됩니다!');
    };

    const handleSaveDraft = () => {
        toast.success('임시저장이 완료되었습니다');
        console.log('설문 데이터:', survey);
    };

    const handlePublish = () => {
        if (survey.questions.length === 0) {
            toast.error('배포하기 전에 최소 하나 이상의 질문을 추가해주세요');
            return;
        }

        toast.success('설문조사가 성공적으로 배포되었습니다!');
        console.log('배포된 설문:', survey);
    };

    const selectedQuestion = survey.questions.find((q) => q.id === selectedQuestionId) || null;

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen bg-gray-50">
                <Header
                    surveyTitle={survey.title}
                    onTitleChange={(title) => setSurvey((prev) => ({ ...prev, title }))}
                    onPreview={handlePreview}
                    onSaveDraft={handleSaveDraft}
                    onPublish={handlePublish}
                />

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Question Type Palette */}
                    <QuestionTypePalette onAddQuestion={handleAddQuestion} />

                    {/* Center Canvas */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto p-8">
                            {survey.questions.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-gray-900 mb-2">설문조사 만들기 시작</h3>
                                    <p className="text-gray-500 mb-8">
                                        왼쪽 사이드바에서 질문 유형을 선택하여 시작하세요
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6 pb-24">
                                    {survey.questions.map((question, index) => (
                                        <QuestionBlock
                                            key={question.id}
                                            question={question}
                                            index={index}
                                            isSelected={selectedQuestionId === question.id}
                                            onSelect={() => setSelectedQuestionId(question.id)}
                                            onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
                                            onDelete={() => handleDeleteQuestion(question.id)}
                                            onDuplicate={() => handleDuplicateQuestion(question.id)}
                                            onMove={handleMoveQuestion}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Inspector Panel */}
                    <InspectorPanel
                        question={selectedQuestion}
                        allQuestions={survey.questions}
                        onUpdate={(updates) => {
                            if (selectedQuestionId) {
                                handleUpdateQuestion(selectedQuestionId, updates);
                            }
                        }}
                    />
                </div>

                {/* Bottom Bar */}
                <AddQuestionBar onClick={() => handleAddQuestion('short_text')} />

                <Toaster position="bottom-right" />
            </div>
        </DndProvider>
    );
}
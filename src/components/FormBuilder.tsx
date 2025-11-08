'use client';

import { useState, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QuestionTypePalette } from '@/components/QuestionTypePalette';
import { QuestionBlock } from '@/components/QuestionBlock';
import { InspectorPanel } from '@/components/InspectorPanel';
import { Header } from '@/components/Header';
import { AddQuestionBar } from '@/components/AddQuestionBar';
import { SectionHeader } from '@/components/SectionHeader';
import { SectionDropZone } from '@/components/SectionDropZone';
import { Question, QuestionType, Survey, Option, Section } from '@/types/survey';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export function FormBuilder() {
    // 기본 섹션 생성 함수
    const createDefaultSection = (): Section => ({
        id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: '새 섹션',
        order: 0,
    });

    const [survey, setSurvey] = useState<Survey>({
        title: '제목 없는 설문조사',
        questions: [],
        sections: [createDefaultSection()],
    });

    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

    // 섹션별로 정렬된 섹션 목록
    const sortedSections = useMemo(() => {
        if (!survey.sections || survey.sections.length === 0) {
            return [];
        }
        return [...survey.sections].sort((a, b) => a.order - b.order);
    }, [survey.sections]);

    // 섹션별로 그룹화된 문항
    const questionsBySection = useMemo(() => {
        const grouped: Record<string, Question[]> = {};
        const unassigned: Question[] = [];

        survey.questions.forEach((q) => {
            if (q.sectionId) {
                if (!grouped[q.sectionId]) {
                    grouped[q.sectionId] = [];
                }
                grouped[q.sectionId].push(q);
            } else {
                unassigned.push(q);
            }
        });

        // 기본 섹션에 할당되지 않은 문항들을 첫 번째 섹션에 할당
        if (unassigned.length > 0 && sortedSections.length > 0) {
            const firstSectionId = sortedSections[0].id;
            if (!grouped[firstSectionId]) {
                grouped[firstSectionId] = [];
            }
            grouped[firstSectionId].push(...unassigned);
        }

        return grouped;
    }, [survey.questions, sortedSections]);

    const handleAddQuestion = useCallback((type: QuestionType, sectionId?: string) => {
        // dropdown 타입을 choice로 통합하고 isDropdown 필드 설정
        const isDropdown = type === 'dropdown';
        const questionType = isDropdown ? 'choice' : type;
        
        // sectionId가 제공되지 않으면 첫 번째 섹션에 할당
        const targetSectionId = sectionId || (sortedSections.length > 0 ? sortedSections[0].id : undefined);
        
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
            sectionId: targetSectionId,
        };

        setSurvey((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));

        setSelectedQuestionId(newQuestion.id);
        toast.success('질문이 추가되었습니다');
    }, [sortedSections]);

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

    const handleMoveQuestion = useCallback((dragIndex: number, hoverIndex: number, sectionId?: string) => {
        setSurvey((prev) => {
            const allQuestions = [...prev.questions];
            const dragQuestion = allQuestions[dragIndex];
            
            if (!dragQuestion) return prev;

            // 같은 섹션 내에서 이동하는 경우
            if (sectionId && dragQuestion.sectionId === sectionId) {
                // 해당 섹션의 문항들만 필터링
                const sectionQuestions = allQuestions
                    .filter(q => q.sectionId === sectionId)
                    .map((q, idx) => ({ question: q, originalIndex: allQuestions.findIndex(sq => sq.id === q.id) }))
                    .sort((a, b) => a.originalIndex - b.originalIndex);
                
                const dragQuestionInSection = sectionQuestions.find(item => item.question.id === dragQuestion.id);
                if (!dragQuestionInSection) return prev;
                
                const sectionDragIndex = sectionQuestions.findIndex(item => item.question.id === dragQuestion.id);
                
                // 섹션 내에서의 순서 변경 (스왑이 아닌 삽입 방식)
                const newSectionQuestions = [...sectionQuestions];
                const [removed] = newSectionQuestions.splice(sectionDragIndex, 1);
                
                // 드래그한 문항을 제거한 후 타겟 인덱스 조정
                let targetSectionIndex = hoverIndex;
                if (sectionDragIndex < hoverIndex) {
                    targetSectionIndex = hoverIndex - 1;
                }
                
                // 타겟 위치에 삽입 (스왑이 아닌 삽입)
                newSectionQuestions.splice(targetSectionIndex, 0, removed);
                
                // 다른 섹션의 문항들
                const otherQuestions = allQuestions
                    .map((q, idx) => ({ question: q, index: idx }))
                    .filter(item => item.question.sectionId !== sectionId);
                
                // 섹션별로 그룹화하여 순서 유지
                const sectionOrder = (prev.sections || []).sort((a, b) => a.order - b.order).map(s => s.id);
                const questionsBySection: Record<string, typeof newSectionQuestions> = {};
                
                otherQuestions.forEach(item => {
                    const sid = item.question.sectionId || 'unassigned';
                    if (!questionsBySection[sid]) {
                        questionsBySection[sid] = [];
                    }
                    questionsBySection[sid].push({ question: item.question, originalIndex: item.index });
                });
                
                // 섹션 순서대로 문항 재배열
                const reorderedQuestions: Question[] = [];
                sectionOrder.forEach(sid => {
                    if (sid === sectionId) {
                        // 현재 섹션의 문항들 추가
                        newSectionQuestions.forEach(item => reorderedQuestions.push(item.question));
                    } else if (questionsBySection[sid]) {
                        questionsBySection[sid]
                            .sort((a, b) => a.originalIndex - b.originalIndex)
                            .forEach(item => reorderedQuestions.push(item.question));
                    }
                });
                
                // 할당되지 않은 문항들 추가
                if (questionsBySection['unassigned']) {
                    questionsBySection['unassigned']
                        .sort((a, b) => a.originalIndex - b.originalIndex)
                        .forEach(item => reorderedQuestions.push(item.question));
                }
                
                return {
                    ...prev,
                    questions: reorderedQuestions,
                };
            }
            
            // 섹션 간 이동 또는 일반 이동
            // 스왑이 아닌 삽입 방식으로 변경
            const newQuestions = [...allQuestions];
            const [removed] = newQuestions.splice(dragIndex, 1);
            
            // 드래그한 문항을 제거한 후 타겟 인덱스 조정
            // 드래그 인덱스가 타겟 인덱스보다 작으면, 제거 후 타겟 인덱스가 1 감소
            let targetIndex = hoverIndex;
            if (dragIndex < hoverIndex) {
                targetIndex = hoverIndex - 1;
            }
            
            // 타겟 위치에 삽입 (스왑이 아닌 삽입)
            newQuestions.splice(targetIndex, 0, removed);

            return {
                ...prev,
                questions: newQuestions,
            };
        });
    }, []);

    // 섹션 관리 함수들
    const handleAddSection = useCallback(() => {
        setSurvey((prev) => {
            const maxOrder = prev.sections 
                ? Math.max(...prev.sections.map(s => s.order), -1)
                : -1;
            
            const newSection: Section = {
                id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                title: '새 섹션',
                order: maxOrder + 1,
            };

            return {
                ...prev,
                sections: [...(prev.sections || []), newSection],
            };
        });
        toast.success('섹션이 추가되었습니다');
    }, []);

    const handleUpdateSection = useCallback((id: string, updates: Partial<Section>) => {
        setSurvey((prev) => ({
            ...prev,
            sections: (prev.sections || []).map((s) =>
                s.id === id ? { ...s, ...updates } : s
            ),
        }));
    }, []);

    const handleDeleteSection = useCallback((id: string) => {
        setSurvey((prev) => {
            const sections = prev.sections || [];
            const sectionToDelete = sections.find(s => s.id === id);
            
            if (!sectionToDelete) return prev;

            // 섹션에 속한 문항들을 첫 번째 섹션으로 이동
            const firstSection = sections.find(s => s.id !== id);
            const questionsToMove = prev.questions.filter(q => q.sectionId === id);
            
            const updatedQuestions = prev.questions.map(q => {
                if (q.sectionId === id) {
                    return { ...q, sectionId: firstSection?.id };
                }
                return q;
            });

            // 섹션 삭제
            const updatedSections = sections.filter(s => s.id !== id);

            // 섹션이 모두 삭제되면 기본 섹션 생성
            if (updatedSections.length === 0) {
                const defaultSection = createDefaultSection();
                return {
                    ...prev,
                    sections: [defaultSection],
                    questions: updatedQuestions.map(q => 
                        q.sectionId === id ? { ...q, sectionId: defaultSection.id } : q
                    ),
                };
            }

            return {
                ...prev,
                sections: updatedSections,
                questions: updatedQuestions,
            };
        });
        toast.success('섹션이 삭제되었습니다');
    }, []);

    const handleMoveSection = useCallback((dragIndex: number, hoverIndex: number) => {
        setSurvey((prev) => {
            const sections = [...(prev.sections || [])];
            const [removed] = sections.splice(dragIndex, 1);
            sections.splice(hoverIndex, 0, removed);
            
            // order 업데이트
            const updatedSections = sections.map((s, index) => ({
                ...s,
                order: index,
            }));

            return {
                ...prev,
                sections: updatedSections,
            };
        });
    }, []);

    const handleMoveQuestionToSection = useCallback((questionId: string, targetSectionId: string, targetIndex?: number) => {
        setSurvey((prev) => {
            const question = prev.questions.find(q => q.id === questionId);
            if (!question) return prev;

            const allQuestions = [...prev.questions];
            const dragIndex = allQuestions.findIndex(q => q.id === questionId);
            
            if (dragIndex === -1) return prev;

            // 문항을 해당 섹션으로 이동하고 위치 조정
            const updatedQuestions = allQuestions.map((q) =>
                q.id === questionId ? { ...q, sectionId: targetSectionId } : q
            );

            // 타겟 인덱스가 지정된 경우 위치 조정
            if (targetIndex !== undefined) {
                const [removed] = updatedQuestions.splice(dragIndex, 1);
                
                // 드래그 인덱스가 타겟 인덱스보다 작으면, 제거 후 타겟 인덱스가 1 감소
                let finalTargetIndex = targetIndex;
                if (dragIndex < targetIndex) {
                    finalTargetIndex = targetIndex - 1;
                }
                
                updatedQuestions.splice(finalTargetIndex, 0, removed);
                
                return {
                    ...prev,
                    questions: updatedQuestions,
                };
            }

            return {
                ...prev,
                questions: updatedQuestions,
            };
        });
        toast.success('문항이 섹션으로 이동되었습니다');
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
                            {sortedSections.length === 0 && survey.questions.length === 0 ? (
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
                                <div className="space-y-8 pb-24">
                                    {sortedSections.map((section, sectionIndex) => {
                                        const sectionQuestions = questionsBySection[section.id] || [];
                                        const globalQuestionIndices = sectionQuestions.map(q => 
                                            survey.questions.findIndex(sq => sq.id === q.id)
                                        ).filter(idx => idx !== -1);

                                        return (
                                            <div 
                                                key={section.id} 
                                                className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm overflow-hidden"
                                            >
                                                {/* 섹션 헤더 */}
                                                <div className="border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                                                    <SectionHeader
                                                        section={section}
                                                        index={sectionIndex}
                                                        questionCount={sectionQuestions.length}
                                                        onUpdate={handleUpdateSection}
                                                        onDelete={handleDeleteSection}
                                                        onMove={handleMoveSection}
                                                        onAddQuestion={(sectionId) => handleAddQuestion('short_text', sectionId)}
                                                    />
                                                </div>
                                                
                                                {/* 섹션 내 문항들 */}
                                                <div className="px-6">
                                                    {sectionQuestions.length === 0 ? (
                                                        <SectionDropZone
                                                            sectionId={section.id}
                                                            onDrop={handleMoveQuestionToSection}
                                                            isEmpty={true}
                                                        />
                                                    ) : (
                                                        <>
                                                            {/* 첫 번째 드롭 존 */}
                                                            <SectionDropZone
                                                                sectionId={section.id}
                                                                onDrop={handleMoveQuestionToSection}
                                                                isEmpty={false}
                                                                targetIndex={globalQuestionIndices[0] || 0}
                                                            />
                                                            {sectionQuestions.map((question, localIndex) => {
                                                                const globalIndex = globalQuestionIndices[localIndex];
                                                                const nextGlobalIndex = globalQuestionIndices[localIndex + 1];
                                                                return (
                                                                    <div key={question.id} className="mb-0">
                                                                        <QuestionBlock
                                                                            question={question}
                                                                            index={globalIndex}
                                                                            isSelected={selectedQuestionId === question.id}
                                                                            onSelect={() => setSelectedQuestionId(question.id)}
                                                                            onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
                                                                            onDelete={() => handleDeleteQuestion(question.id)}
                                                                            onDuplicate={() => handleDuplicateQuestion(question.id)}
                                                                            onMove={(dragIdx, hoverIdx) => handleMoveQuestion(dragIdx, hoverIdx, section.id)}
                                                                        />
                                                                        {/* 문항 아래 드롭 존 */}
                                                                        <SectionDropZone
                                                                            sectionId={section.id}
                                                                            onDrop={handleMoveQuestionToSection}
                                                                            isEmpty={false}
                                                                            targetIndex={nextGlobalIndex !== undefined ? nextGlobalIndex : globalIndex + 1}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* 섹션 추가 버튼 */}
                                    <div className="flex justify-center pt-4">
                                        <Button
                                            onClick={handleAddSection}
                                            variant="outline"
                                            className="border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            새 섹션 추가
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Inspector Panel */}
                    <InspectorPanel
                        question={selectedQuestion}
                        allQuestions={survey.questions}
                        sections={sortedSections}
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
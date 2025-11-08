'use client';

import { useState, useMemo } from 'react';
import { Type, AlignLeft, CheckSquare, LayoutGrid, FileText, Search, User, Mail, Phone, MapPin, Users, Star, Globe } from 'lucide-react';
import { QuestionType, Question, Option } from '../types/survey';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';

interface QuestionTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: QuestionType, sectionId?: string, targetIndex?: number) => void;
  onSelectTemplate?: (template: Partial<Question>, sectionId?: string, targetIndex?: number) => void;
  sectionId?: string;
  targetIndex?: number;
}

interface QuestionTemplate {
  id: string;
  label: string;
  description: string;
  icon: typeof Type;
  template: Partial<Question>;
  category: string;
  isPremium?: boolean;
}

interface QuestionTypeItem {
  type: QuestionType;
  icon: typeof Type;
  label: string;
  description: string;
  category: string;
  recommended?: boolean;
  isPremium?: boolean;
}

// 통합된 아이템 타입
type UnifiedItem = 
  | { kind: 'type'; data: QuestionTypeItem }
  | { kind: 'template'; data: QuestionTemplate };

const allQuestionTypes: QuestionTypeItem[] = [
  { type: 'short_text', icon: Type, label: '단답형', description: '한 줄 텍스트', category: 'Text', recommended: true },
  { type: 'long_text', icon: AlignLeft, label: '장문형', description: '여러 줄 텍스트', category: 'Text' },
  { type: 'choice', icon: CheckSquare, label: '선택형', description: '라디오/체크박스/드롭다운', category: 'Choice', recommended: true },
  { type: 'complex_choice', icon: LayoutGrid, label: '복합 선택', description: '선택지와 여러 필드', category: 'Choice' },
  { type: 'complex_input', icon: LayoutGrid, label: '복합 입력', description: '여러 입력 필드', category: 'Text' },
  { type: 'description', icon: FileText, label: '설명', description: '텍스트 블록만', category: 'Text' },
];

// 통합된 카테고리 목록
const unifiedCategories = ['Contact info', 'Choice', 'Text'];

// 템플릿 정의
const questionTemplates: QuestionTemplate[] = [
  {
    id: 'name',
    label: '이름',
    description: '이름을 입력받습니다',
    icon: User,
    category: 'Contact info',
    template: {
      type: 'short_text',
      title: '이름',
      input_type: 'text',
      required: true,
      placeholder: '이름을 입력하세요',
    },
  },
  {
    id: 'email',
    label: '이메일',
    description: '이메일 주소를 입력받습니다',
    icon: Mail,
    category: 'Contact info',
    template: {
      type: 'short_text',
      title: '이메일',
      input_type: 'email',
      required: true,
      placeholder: 'example@email.com',
    },
  },
  {
    id: 'phone',
    label: '전화번호',
    description: '전화번호를 입력받습니다',
    icon: Phone,
    category: 'Contact info',
    template: {
      type: 'short_text',
      title: '전화번호',
      input_type: 'tel',
      required: true,
      placeholder: '010-1234-5678',
    },
  },
  {
    id: 'address',
    label: '주소',
    description: '주소를 입력받습니다',
    icon: MapPin,
    category: 'Contact info',
    template: {
      type: 'long_text',
      title: '주소',
      required: false,
      placeholder: '주소를 입력하세요',
    },
  },
  {
    id: 'website',
    label: '웹사이트',
    description: '웹사이트 주소를 입력받습니다',
    icon: Globe,
    category: 'Contact info',
    template: {
      type: 'short_text',
      title: '웹사이트',
      input_type: 'text',
      required: false,
      placeholder: 'https://example.com',
    },
  },
  {
    id: 'contact_info',
    label: 'Contact Info',
    description: '여러 개인정보를 한 번에 입력받습니다',
    icon: User,
    category: 'Contact info',
    template: {
      type: 'complex_input',
      title: '연락처 정보',
      required: true,
      complexItems: [
        {
          label: '이름',
          input_type: 'text',
          key: 'name',
          required: true,
          placeholder: '이름을 입력하세요',
        },
        {
          label: '이메일',
          input_type: 'email',
          key: 'email',
          required: true,
          placeholder: 'example@email.com',
        },
        {
          label: '전화번호',
          input_type: 'tel',
          key: 'phone',
          required: true,
          placeholder: '010-1234-5678',
        },
        {
          label: '주소',
          input_type: 'text',
          key: 'address',
          required: false,
          placeholder: '주소를 입력하세요',
        },
      ],
    },
  },
  {
    id: 'gender',
    label: '성별',
    description: '성별을 선택합니다',
    icon: Users,
    category: 'Choice',
    template: {
      type: 'choice',
      title: '성별',
      required: true,
      options: [
        { label: '남성', key: 'male' },
        { label: '여성', key: 'female' },
        { label: '기타', key: 'other' },
      ] as Option[],
    },
  },
  {
    id: 'satisfaction',
    label: '만족도',
    description: '만족도를 평가합니다',
    icon: Star,
    category: 'Choice',
    template: {
      type: 'choice',
      title: '만족도',
      required: true,
      options: [
        { label: '매우 만족', key: 'very_satisfied' },
        { label: '만족', key: 'satisfied' },
        { label: '보통', key: 'neutral' },
        { label: '불만족', key: 'dissatisfied' },
        { label: '매우 불만족', key: 'very_dissatisfied' },
      ] as Option[],
    },
  },
];

export function QuestionTypeModal({ 
  open, 
  onOpenChange, 
  onSelectType,
  onSelectTemplate,
  sectionId,
  targetIndex 
}: QuestionTypeModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectType = (type: QuestionType) => {
    onSelectType(type, sectionId, targetIndex);
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleSelectTemplate = (template: Partial<Question>) => {
    if (onSelectTemplate) {
      onSelectTemplate(template, sectionId, targetIndex);
    } else {
      // 템플릿 핸들러가 없으면 기본 타입만 전달
      if (template.type) {
        handleSelectType(template.type);
      }
    }
    onOpenChange(false);
    setSearchQuery('');
  };

  // 통합된 필터링된 아이템들
  const filteredItems = useMemo(() => {
    const types: UnifiedItem[] = allQuestionTypes.map(item => ({ kind: 'type', data: item }));
    const templates: UnifiedItem[] = questionTemplates.map(item => ({ kind: 'template', data: item }));
    const allItems = [...types, ...templates];

    if (!searchQuery.trim()) {
      return allItems;
    }

    const query = searchQuery.toLowerCase();
    return allItems.filter(item => {
      const data = item.data;
      return (
        data.label.toLowerCase().includes(query) ||
        data.description.toLowerCase().includes(query) ||
        data.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // 추천 아이템들 (기본형과 템플릿 혼합)
  const recommendedItems = useMemo(() => {
    const recommendedTypes = allQuestionTypes.filter(item => item.recommended);
    const recommendedTemplates = questionTemplates.slice(0, 2); // 처음 2개 템플릿
    
    const items: UnifiedItem[] = [
      ...recommendedTypes.map(item => ({ kind: 'type' as const, data: item })),
      ...recommendedTemplates.map(item => ({ kind: 'template' as const, data: item })),
    ];
    
    return items.slice(0, 3); // 최대 3개
  }, []);

  // 카테고리별로 그룹화된 아이템들
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, UnifiedItem[]> = {};
    
    filteredItems.forEach(item => {
      const category = item.data.category;
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }, [filteredItems]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>문항 추가</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="문항 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {/* Recommended Section */}
            {!searchQuery && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">추천</h3>
                <div className="space-y-2">
                  {recommendedItems.map((item) => {
                    const Icon = item.data.icon;
                    const label = item.data.label;
                    
                    return (
                      <button
                        key={item.kind === 'type' ? item.data.type : item.data.id}
                        onClick={() => {
                          if (item.kind === 'type') {
                            handleSelectType(item.data.type);
                          } else {
                            handleSelectTemplate(item.data.template);
                          }
                        }}
                        className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-gray-900">{label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {searchQuery ? (
              // Search Results
              <div className="space-y-6">
                {Object.keys(itemsByCategory).length > 0 ? (
                  Object.entries(itemsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((item) => {
                          const Icon = item.data.icon;
                          const label = item.data.label;
                          const description = item.data.description;
                          const key = item.kind === 'type' ? item.data.type : item.data.id;
                          
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                if (item.kind === 'type') {
                                  handleSelectType(item.data.type);
                                } else {
                                  handleSelectTemplate(item.data.template);
                                }
                              }}
                              className="text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all duration-200 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900">{label}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            ) : (
              // Categorized View (기본형과 템플릿 통합)
              <div className="space-y-6">
                {unifiedCategories.map(category => {
                  const items = itemsByCategory[category] || [];
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((item) => {
                          const Icon = item.data.icon;
                          const label = item.data.label;
                          const description = item.data.description;
                          const key = item.kind === 'type' ? item.data.type : item.data.id;
                          
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                if (item.kind === 'type') {
                                  handleSelectType(item.data.type);
                                } else {
                                  handleSelectTemplate(item.data.template);
                                }
                              }}
                              className="text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all duration-200 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900">{label}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


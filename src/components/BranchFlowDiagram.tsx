'use client';

import { useMemo } from 'react';
import { Question, BranchRule, ShowRule } from '@/types/survey';
import { isChoiceQuestion, isComplexChoiceQuestion } from '@/schema/question.types';
import { 
  Type, 
  AlignLeft, 
  CheckSquare, 
  LayoutGrid, 
  FileText, 
  Sliders,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Star,
  CircleCheck,
  ChevronDown,
  XCircle,
  GitBranch
} from 'lucide-react';
import { evaluateShowConditions } from '@/engine/visibility';
import type { AnswersMap } from '@/engine/visibility';

interface BranchFlowDiagramProps {
  questions: Question[];
  currentQuestionId?: string;
  answers?: AnswersMap;
}

interface FlowNode {
  id: string;
  question: Question;
  x: number;
  y: number;
  width: number;
  height: number;
  isHidden?: boolean;
  isCurrent?: boolean;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  isBranch?: boolean;
  isDefault?: boolean;
}

// 질문 타입별 아이콘 가져오기
function getQuestionIcon(question: Question) {
  // 템플릿 기반 문항인지 확인
  if (question.title === '이름' && question.type === 'short_text') {
    return User;
  }
  if (question.title === '이메일' && question.type === 'short_text') {
    return Mail;
  }
  if (question.title === '전화번호' && question.type === 'short_text') {
    return Phone;
  }
  if (question.title === '주소' && question.type === 'long_text') {
    return MapPin;
  }
  if (question.title === '웹사이트' && question.type === 'short_text') {
    return Globe;
  }
  if (question.title === '연락처 정보' && question.type === 'complex_input') {
    return User;
  }
  if (question.title === '성별' && question.type === 'choice') {
    return Users;
  }
  if (question.title === '만족도' && question.type === 'choice') {
    return Star;
  }

  // 타입별 기본 아이콘
  switch (question.type) {
    case 'short_text':
      return Type;
    case 'long_text':
      return AlignLeft;
    case 'choice':
      if (isChoiceQuestion(question)) {
        return question.isBoolean ? CircleCheck : (question.isDropdown ? ChevronDown : CheckSquare);
      }
      return CheckSquare;
    case 'complex_choice':
    case 'complex_input':
      return LayoutGrid;
    case 'range':
      return Sliders;
    case 'description':
      return FileText;
    default:
      return Type;
  }
}

// 질문 타입별 배지 색상
function getQuestionBadgeColor(question: Question): string {
  if (question.showRules && question.showRules.length > 0) {
    return 'bg-purple-100 text-purple-700';
  }
  if (isChoiceQuestion(question) || isComplexChoiceQuestion(question)) {
    if (question.branchRules && question.branchRules.length > 0) {
      return 'bg-green-100 text-green-700';
    }
  }
  return 'bg-gray-100 text-gray-700';
}

// 조건 노드를 텍스트로 변환
function formatBranchNode(node: any, question: Question): string {
  if (!node) return '';
  
  if (node.kind === 'predicate') {
    const subKey = node.subKey ? `[${node.subKey}]` : '';
    const op = node.op;
    const value = node.value;
    
    let opText = '';
    switch (op) {
      case 'eq': opText = '='; break;
      case 'neq': opText = '≠'; break;
      case 'gt': opText = '>'; break;
      case 'lt': opText = '<'; break;
      case 'gte': opText = '≥'; break;
      case 'lte': opText = '≤'; break;
      case 'contains': opText = '포함'; break;
      default: opText = op;
    }
    
    return `${subKey} ${opText} ${value}`;
  }
  
  if (node.kind === 'group') {
    const children = node.children.map((child: any) => formatBranchNode(child, question)).filter(Boolean);
    return `(${children.join(` ${node.op} `)})`;
  }
  
  return '';
}

export function BranchFlowDiagram({ questions, currentQuestionId, answers = new Map() }: BranchFlowDiagramProps) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: FlowNode[] = [];
    const flowEdges: FlowEdge[] = [];
    
    // 노드 생성
    questions.forEach((question, index) => {
      const isHidden = !evaluateShowConditions(question, answers);
      const isCurrent = question.id === currentQuestionId;
      
      flowNodes.push({
        id: question.id,
        question,
        x: 0, // 레이아웃은 나중에 계산
        y: 0,
        width: 200,
        height: 120,
        isHidden,
        isCurrent,
      });
    });
    
    // 레이아웃 계산: 분기 구조를 고려한 배치
    const nodeSpacing = 180;
    const horizontalSpacing = 280;
    
    // 질문 순서대로 기본 위치 설정
    flowNodes.forEach((node, index) => {
      node.x = 100;
      node.y = index * nodeSpacing + 50;
    });
    
    // branchRules를 기반으로 분기 노드들을 옆으로 배치
    // 분기가 여러 개인 경우, 타겟 노드들을 수평으로 배치
    questions.forEach((question) => {
      if (isChoiceQuestion(question) || isComplexChoiceQuestion(question)) {
        const branchRules = question.branchRules || [];
        if (branchRules.length > 1) {
          // 여러 분기가 있는 경우, 타겟 노드들을 옆으로 배치
          const sourceNode = flowNodes.find(n => n.id === question.id);
          if (!sourceNode) return;
          
          const baseX = sourceNode.x;
          const baseY = sourceNode.y + sourceNode.height;
          
          // 분기 노드들을 수평으로 배치
          branchRules.forEach((rule, ruleIndex) => {
            const targetNode = flowNodes.find(n => n.id === rule.next_question_id);
            if (targetNode) {
              // 중앙을 기준으로 좌우로 분산 배치
              const totalBranches = branchRules.length;
              const centerOffset = (ruleIndex - (totalBranches - 1) / 2) * horizontalSpacing;
              targetNode.x = baseX + centerOffset;
              
              // Y 위치는 소스 노드보다 아래에 배치
              const targetQuestionIndex = questions.findIndex(q => q.id === targetNode.id);
              if (targetQuestionIndex > questions.findIndex(q => q.id === question.id)) {
                // 타겟이 소스보다 뒤에 있으면, 소스 아래에 배치
                targetNode.y = baseY + 80;
              }
            }
          });
        } else if (branchRules.length === 1) {
          // 분기가 1개인 경우도 분기 라인으로 표시
          const targetNode = flowNodes.find(n => n.id === branchRules[0].next_question_id);
          if (targetNode) {
            const sourceNode = flowNodes.find(n => n.id === question.id);
            if (sourceNode) {
              // 단일 분기는 기본 위치 유지하되, 분기 라인으로 표시
              // Y 위치는 소스 노드보다 아래에 배치
              const targetQuestionIndex = questions.findIndex(q => q.id === targetNode.id);
              if (targetQuestionIndex > questions.findIndex(q => q.id === question.id)) {
                targetNode.y = sourceNode.y + sourceNode.height + 80;
              }
            }
          }
        }
      }
    });
    
    // 엣지 생성 (branchRules 기반)
    questions.forEach((question) => {
      if (isChoiceQuestion(question) || isComplexChoiceQuestion(question)) {
        const branchRules = question.branchRules || [];
        
        if (branchRules.length > 0) {
          branchRules.forEach((rule, ruleIndex) => {
            const targetQuestion = questions.find(q => q.id === rule.next_question_id);
            if (targetQuestion) {
              const conditionText = rule.when ? formatBranchNode(rule.when, question) : '기본';
              const isDefault = !rule.when;
              
              flowEdges.push({
                from: question.id,
                to: rule.next_question_id,
                label: conditionText,
                isBranch: true,
                isDefault,
              });
            }
          });
        } else {
          // branchRules가 없으면 선형 다음 질문으로 연결
          const currentIndex = questions.findIndex(q => q.id === question.id);
          if (currentIndex < questions.length - 1) {
            flowEdges.push({
              from: question.id,
              to: questions[currentIndex + 1].id,
              isBranch: false,
            });
          }
        }
      } else {
        // branchRules가 없는 타입은 선형으로 연결
        const currentIndex = questions.findIndex(q => q.id === question.id);
        if (currentIndex < questions.length - 1) {
          flowEdges.push({
            from: question.id,
            to: questions[currentIndex + 1].id,
            isBranch: false,
          });
        }
      }
    });
    
    return { nodes: flowNodes, edges: flowEdges };
  }, [questions, currentQuestionId, answers]);
  
  // 컨테이너 크기 계산
  const containerWidth = useMemo(() => {
    const maxX = Math.max(...nodes.map(n => n.x + n.width), 400);
    return Math.max(maxX + 100, 600);
  }, [nodes]);
  
  const containerHeight = useMemo(() => {
    const maxY = Math.max(...nodes.map(n => n.y + n.height), 400);
    return Math.max(maxY + 100, 600);
  }, [nodes]);
  
  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-6">
      <div className="relative" style={{ minHeight: containerHeight, minWidth: containerWidth }}>
        {/* 엣지 렌더링 */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;
            
            const fromX = fromNode.x + fromNode.width / 2;
            const fromY = fromNode.y + fromNode.height;
            const toX = toNode.x + toNode.width / 2;
            const toY = toNode.y;
            
            // 분기인 경우 곡선, 그렇지 않으면 직선
            let path: string;
            if (edge.isBranch && fromNode.id !== toNode.id) {
              // 분기 라인: 곡선 경로
              const horizontalDiff = Math.abs(toX - fromX);
              const verticalDiff = Math.abs(toY - fromY);
              
              // 수평 분기가 있는 경우 (옆으로 갈라지는 경우)
              if (horizontalDiff > 50) {
                // 곡선 경로: 시작점 -> 중간 제어점 -> 끝점
                const midY = (fromY + toY) / 2;
                const controlY1 = fromY + 30;
                const controlX = fromX + (toX - fromX) * 0.5;
                path = `M ${fromX} ${fromY} Q ${controlX} ${controlY1}, ${controlX} ${midY} T ${toX} ${toY}`;
              } else {
                // 수직 분기: 약간의 곡선으로 표시
                const midY = (fromY + toY) / 2;
                const controlX = fromX + (toX - fromX) * 0.3;
                const controlY = fromY + (toY - fromY) * 0.3;
                path = `M ${fromX} ${fromY} Q ${controlX} ${controlY}, ${toX} ${toY}`;
              }
            } else {
              // 직선 경로
              path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
            }
            
            const midY = (fromY + toY) / 2;
            
            return (
              <g key={`edge-${index}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={edge.isDefault ? '#9ca3af' : edge.isBranch ? '#10b981' : '#6b7280'}
                  strokeWidth={edge.isBranch ? 2 : 1.5}
                  strokeDasharray={edge.isDefault ? '4,4' : '0'}
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && edge.isBranch && (
                  <g>
                    <rect
                      x={(fromX + toX) / 2 - 40}
                      y={midY - 12}
                      width={80}
                      height={16}
                      fill="white"
                      stroke={edge.isDefault ? '#9ca3af' : '#10b981'}
                      strokeWidth={1.5}
                      rx={4}
                    />
                    <text
                      x={(fromX + toX) / 2}
                      y={midY - 2}
                      textAnchor="middle"
                      className="text-xs"
                      fill={edge.isDefault ? '#6b7280' : '#059669'}
                      style={{ fontSize: '10px', fontWeight: '600' }}
                    >
                      {edge.label.length > 20 ? edge.label.substring(0, 20) + '...' : edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* 화살표 마커 */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
            </marker>
          </defs>
        </svg>
        
        {/* 노드 렌더링 */}
        {nodes.map((node) => {
          const Icon = getQuestionIcon(node.question);
          const badgeColor = getQuestionBadgeColor(node.question);
          const hasBranchRules = (isChoiceQuestion(node.question) || isComplexChoiceQuestion(node.question)) 
            && node.question.branchRules && node.question.branchRules.length > 0;
          
          return (
            <div
              key={node.id}
              className={`absolute bg-white rounded-xl border-2 p-4 shadow-sm transition-all ${
                node.isCurrent 
                  ? 'border-indigo-500 shadow-lg' 
                  : node.isHidden 
                    ? 'border-purple-300 opacity-60' 
                    : 'border-gray-200'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                minHeight: `${node.height}px`,
              }}
            >
              {/* 배지 */}
              <div className={`absolute -left-3 -top-3 w-8 h-8 ${badgeColor} rounded-full flex items-center justify-center text-xs font-semibold`}>
                {questions.findIndex(q => q.id === node.id) + 1}
              </div>
              
              {/* 내용 */}
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1 truncate">
                  {node.question.title || '제목 없음'}
                </div>
                
                {/* 질문 타입 아이콘 */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-gray-100">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500">{node.question.type}</span>
                </div>
                
                {/* 숨김 표시 */}
                {node.isHidden && (
                  <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                    <XCircle className="w-3 h-3" />
                    <span>조건부 숨김</span>
                  </div>
                )}
                
                {/* 분기 표시 */}
                {hasBranchRules && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                    <GitBranch className="w-3 h-3" />
                    <span>분기 규칙 {node.question.branchRules?.length}개</span>
                  </div>
                )}
              </div>
              
              {/* 우측 아이콘들 */}
              <div className="absolute right-3 top-3 flex items-center gap-1">
                {hasBranchRules && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <GitBranch className="w-3 h-3 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
  Position,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Question } from '@/types/survey';
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

interface NodePosition {
  x: number;
  y: number;
}

interface BranchFlowDiagramProps {
  questions: Question[];
  currentQuestionId?: string;
  answers?: AnswersMap;
  onQuestionMove?: (dragIndex: number, hoverIndex: number) => void;
  onQuestionSelect?: (questionId: string) => void;
  onNodePositionChange?: (questionId: string, position: NodePosition) => void;
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
      return LayoutGrid;
    case 'complex_input':
      return Sliders;
    case 'description':
      return FileText;
    default:
      return Type;
  }
}

// 질문 타입별 배지 색상 가져오기
function getQuestionBadgeColor(question: Question): string {
  const isHidden = !evaluateShowConditions(question, new Map());

  if (isHidden) {
    return 'bg-purple-100 text-purple-700';
  }

  switch (question.type) {
    case 'choice':
    case 'complex_choice':
      return 'bg-green-100 text-green-700';
    case 'description':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// 분기 노드 포맷팅
function formatBranchNode(node: any, question: Question): string {
  if (!node) return '';

  if (node.kind === 'predicate') {
    const operator = node.op || 'eq';
    const value = node.value;

    // choice 타입인 경우 선택지 라벨 찾기
    if (isChoiceQuestion(question) && !isComplexChoiceQuestion(question) && question.options) {
      const option = question.options.find(opt => opt.key === value);
      if (option) {
        // choice 타입이고 eq 연산자일 때 "(Y 선택)" 형태로 렌더링
        if (operator === 'eq') {
          // return option.label;
          return option.key;
        }
        // 다른 연산자는 기존 형태 유지
        const operatorSymbol: Record<string, string> = {
          eq: '=',
          ne: '≠',
          gt: '>',
          gte: '≥',
          lt: '<',
          lte: '≤',
        };
        return `(${operatorSymbol[operator] || operator} ${option.label})`;
      }
    }


    const operatorSymbol: Record<string, string> = {
      eq: '=',
      ne: '≠',
      gt: '>',
      gte: '≥',
      lt: '<',
      lte: '≤',
    };
    return `(${operatorSymbol[operator] || operator} ${value})`;
  }

  if (node.kind === 'group') {
    const children = node.children || [];
    if (children.length === 0) return '';

    const operator = node.op || 'and';
    const formattedNodes = children
      .map((n: any) => formatBranchNode(n, question))
      .filter((s: string) => s.length > 0);

    if (formattedNodes.length === 0) return '';
    if (formattedNodes.length === 1) return formattedNodes[0];

    return `(${formattedNodes.join(` ${operator.toUpperCase()} `)})`;
  }

  return '';
}

// 커스텀 노드 컴포넌트
function CustomNode({ data }: { data: any }) {
  const { question, index, isCurrent, isHidden, hasBranchRules } = data;
  const Icon = getQuestionIcon(question);
  const badgeColor = getQuestionBadgeColor(question);

  return (
    <div
      className={`relative bg-white rounded-md border px-[6px] py-[3px] shadow-sm select-none ${isCurrent
        ? 'border-indigo-500 shadow-lg'
        : isHidden
          ? 'border-purple-300 opacity-60'
          : 'border-gray-200'
        }`}
      style={{ width: '140px', minHeight: '32px' }}
    >
      {/* Handle - 좌측 (들어오는 연결) */}
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{ background: '#6b7280', width: '8px', height: '8px' }}
      />

      {/* Handle - 우측 (나가는 연결) */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ background: '#6b7280', width: '8px', height: '8px' }}
      />

      {/* 브랜치 아이콘 - 오른쪽 Handle 근처 */}
      {hasBranchRules && (
        <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center z-10">
          <GitBranch className="w-2.5 h-2.5 text-green-600" />
        </div>
      )}

      {/* 배지 */}
      <div className={`absolute -left-3 -top-3 w-6 h-6 ${badgeColor} rounded-full flex items-center justify-center text-[0.525rem] font-semibold`}>
        {index + 1}
      </div>

      {/* 내용 */}
      <div className="mt-2">
        {/* 타이틀과 타입 아이콘 */}
        <div className="flex items-center gap-2 mb-1 min-w-0">
          <div className="p-1 rounded-md bg-gray-100 flex-shrink-0">
            <Icon className="w-3 h-3 text-gray-600" />
          </div>
          <div className="text-[0.525rem] text-gray-500 truncate min-w-0 flex-1">
            {question.title || '제목 없음'}
          </div>
        </div>

        {/* 숨김 표시 */}
        {isHidden && (
          <div className="flex items-center gap-1 text-[0.525rem] text-purple-600 mb-1">
            <XCircle className="w-2.5 h-2.5" />
            <span>조건부 숨김</span>
          </div>
        )}

        {/* 분기 표시 */}
        {hasBranchRules && (
          <div className="text-[0.525rem] text-green-600 mt-2">
            <span>분기 규칙 {question.branchRules?.length}개</span>
          </div>
        )}
      </div>

    </div>
  );
}

// 커스텀 엣지 컴포넌트 (곡선, 라벨)
function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: any) {
  const { label, isBranch, isDefault } = data || {};

  // 앞문항 우측에서 뒷문항 좌측으로 연결
  const fromX = sourceX;
  const fromY = sourceY;
  const toX = targetX;
  const toY = targetY;

  const horizontalDiff = Math.abs(toX - fromX);
  const verticalDiff = Math.abs(toY - fromY);

  // 곡선의 시작과 끝을 부드럽게 처리하기 위한 오프셋
  const startOffset = 50; // 시작 부분 우측으로 튀어나오는 정도
  const endOffset = 50; // 끝 부분 좌측으로 튀어나오는 정도

  // 모든 라인을 넓은 곡선으로 처리
  let path: string;
  if (horizontalDiff > verticalDiff) {
    // 수평 이동이 더 큰 경우: 좌->우 넓은 곡선
    const curveStrength = Math.max(horizontalDiff * 0.5, 100); // 곡선의 넓이

    const controlX1 = fromX + startOffset + curveStrength * 0.3; // 첫 번째 제어점 (우측으로 넓게)
    const controlY1 = fromY;
    const controlX2 = toX - endOffset - curveStrength * 0.3; // 두 번째 제어점 (좌측으로 넓게)
    const controlY2 = toY;

    // 전체 경로를 하나의 넓은 곡선으로 연결
    path = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
  } else {
    // 수직 이동이 더 큰 경우: 위->아래 넓은 곡선 (분기)
    const curveStrength = Math.max(verticalDiff * 0.5, 100); // 곡선의 넓이

    const controlX1 = fromX + startOffset + curveStrength * 0.4; // 첫 번째 제어점 (우측으로 넓게)
    const controlY1 = fromY + (toY - fromY) * 0.2;
    const controlX2 = toX - endOffset - curveStrength * 0.4; // 두 번째 제어점 (좌측으로 넓게)
    const controlY2 = fromY + (toY - fromY) * 0.8;

    // 전체 경로를 하나의 넓은 곡선으로 연결
    path = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
  }

  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  return (
    <>
      <path
        id={id}
        d={path}
        fill="none"
        // stroke={isDefault ? '#9ca3af' : isBranch ? '#10b981' : '#6b7280'}
        stroke={'#6b7280'}
        // strokeWidth={isBranch ? 2 : 1.5}
        // strokeDasharray={isDefault ? '4,4' : '0'}
        strokeWidth={1.5}
        strokeDasharray={'0'}
        markerEnd={markerEnd}
        style={style}
      />
      {label && isBranch && (
        <g>
          <rect
            x={midX - 20}
            y={midY - 12}
            width={40}
            height={16}
            // fill="white"
            fill={'#10b981'}
            stroke={'#10b981'}
            // fill={isDefault ? '#9ca3af' : '#10b981'}
            // stroke={isDefault ? '#9ca3af' : '#10b981'}
            strokeWidth={1}
            rx={4}
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            className="text-xs"
            // fill={isDefault ? '#6b7280' : '#059669'}
            fill={'#ffffff'}
            style={{ fontSize: '10px', fontWeight: '600' }}
          >
            {label.length > 10 ? label.substring(0, 10) + '...' : label}
          </text>
        </g>
      )}
    </>
  );
}

// 노드 타입 정의
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// 엣지 타입 정의
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

export function BranchFlowDiagram({
  questions,
  currentQuestionId,
  answers = new Map(),
  onQuestionMove,
  onQuestionSelect,
  onNodePositionChange
}: BranchFlowDiagramProps) {
  // 엣지 생성
  const edgesForRendering = useMemo(() => {
    const flowEdges: Edge[] = [];

    questions.forEach((question) => {
      if (isChoiceQuestion(question) || isComplexChoiceQuestion(question)) {
        const branchRules = question.branchRules || [];

        if (branchRules.length > 0) {
          branchRules.forEach((rule) => {
            const targetQuestion = questions.find(q => q.id === rule.next_question_id);
            if (targetQuestion) {
              const conditionText = rule.when ? formatBranchNode(rule.when, question) : '기본';
              const isDefault = !rule.when;

              flowEdges.push({
                id: `e-${question.id}-${rule.next_question_id}`,
                source: question.id,
                target: rule.next_question_id,
                type: 'custom',
                sourceHandle: 'right',
                targetHandle: 'left',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 16,
                  height: 16,
                  color: '#6b7280',
                  // color: isDefault ? '#9ca3af' : '#10b981',
                },
                data: {
                  label: conditionText,
                  isBranch: true,
                  isDefault,
                },
              });
            }
          });
        } else {
          // branchRules가 없으면 선형 다음 질문으로 연결
          const currentIndex = questions.findIndex(q => q.id === question.id);
          if (currentIndex < questions.length - 1) {
            flowEdges.push({
              id: `e-${question.id}-${questions[currentIndex + 1].id}`,
              source: question.id,
              target: questions[currentIndex + 1].id,
              type: 'custom',
              sourceHandle: 'right',
              targetHandle: 'left',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 16,
                color: '#6b7280',
              },
              data: {
                isBranch: false,
              },
            });
          }
        }
      } else {
        // branchRules가 없는 타입은 선형으로 연결
        const currentIndex = questions.findIndex(q => q.id === question.id);
        if (currentIndex < questions.length - 1) {
          flowEdges.push({
            id: `e-${question.id}-${questions[currentIndex + 1].id}`,
            source: question.id,
            target: questions[currentIndex + 1].id,
            type: 'custom',
            sourceHandle: 'right',
            targetHandle: 'left',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#6b7280',
            },
            data: {
              isBranch: false,
            },
          });
        }
      }
    });

    return flowEdges;
  }, [questions]);

  // 노드 생성 및 레이아웃 계산
  const initialNodes = useMemo(() => {
    const flowNodes: Node[] = [];
    const nodePositions: Record<string, NodePosition> = {};

    // 노드 생성
    questions.forEach((question, index) => {
      const isHidden = !evaluateShowConditions(question, answers);
      const isCurrent = question.id === currentQuestionId;
      const hasBranchRules = (isChoiceQuestion(question) || isComplexChoiceQuestion(question))
        && (question.branchRules?.length || 0) > 0;

      flowNodes.push({
        id: question.id,
        type: 'custom',
        position: { x: 0, y: 0 }, // 레이아웃은 나중에 계산
        data: {
          question,
          index,
          isCurrent,
          isHidden,
          hasBranchRules,
        },
      });
    });

    // 노드 크기 상수
    const NODE_WIDTH = 140;
    // const NODE_HEIGHT = 84;
    const NODE_HEIGHT = 64;
    const MIN_SPACING = 50; // 노드 간 최소 간격

    // 노드 간 충돌 감지 함수
    const checkCollision = (node1: Node, node2: Node): boolean => {
      const x1 = node1.position.x;
      const y1 = node1.position.y;
      const x2 = node2.position.x;
      const y2 = node2.position.y;

      // 노드 간 최소 간격을 고려한 충돌 감지
      return !(
        x1 + NODE_WIDTH + MIN_SPACING <= x2 ||
        x2 + NODE_WIDTH + MIN_SPACING <= x1 ||
        y1 + NODE_HEIGHT + MIN_SPACING <= y2 ||
        y2 + NODE_HEIGHT + MIN_SPACING <= y1
      );
    };

    // 충돌 해결: 노드를 밀어내기
    const resolveCollision = (node1: Node, node2: Node) => {
      const dx = node2.position.x - node1.position.x;
      const dy = node2.position.y - node1.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) {
        // 같은 위치에 있으면 아래로 밀기
        node2.position.y += NODE_HEIGHT + MIN_SPACING;
        return;
      }

      // 주로 수직 충돌인 경우 (y 차이가 작을 때)
      if (Math.abs(dy) < NODE_HEIGHT + MIN_SPACING) {
        // 아래쪽 노드를 더 아래로 밀기
        if (node2.position.y >= node1.position.y) {
          node2.position.y = node1.position.y + NODE_HEIGHT + MIN_SPACING;
        } else {
          node1.position.y = node2.position.y + NODE_HEIGHT + MIN_SPACING;
        }
      } else {
        // 주로 수평 충돌인 경우 (x 차이가 작을 때)
        if (Math.abs(dx) < NODE_WIDTH + MIN_SPACING) {
          // 오른쪽 노드를 더 오른쪽으로 밀기
          if (node2.position.x >= node1.position.x) {
            node2.position.x = node1.position.x + NODE_WIDTH + MIN_SPACING;
          } else {
            node1.position.x = node2.position.x + NODE_WIDTH + MIN_SPACING;
          }
        }
      }
    };

    // 레이아웃 계산: 분기 구조를 고려한 배치
    const nodeSpacing = 190; // 좌->우 정렬을 위한 간격 (노드 너비 140px + 간격 50px)
    const verticalSpacing = 134; // 분기 시 위->아래 정렬을 위한 간격 (노드 높이 84px + 간격 50px)

    // 질문 순서대로 기본 위치 설정 (저장된 위치가 없는 경우만)
    // 기본 정렬: 좌->우
    flowNodes.forEach((node, index) => {
      const savedPos = nodePositions[node.id];
      if (savedPos) {
        // 저장된 위치가 있으면 사용
        node.position = { x: savedPos.x, y: savedPos.y };
      } else {
        // 저장된 위치가 없으면 기본 위치 설정 (좌->우)
        node.position = {
          x: index === 0 ? 50 : 50 + index * nodeSpacing,
          y: 100,
        };
      }
    });

    // branchRules를 기반으로 분기 노드들을 위->아래로 배치
    const branchTargetNodes = new Set<string>();
    const branchSourceNodes = new Map<string, string[]>();

    questions.forEach((question) => {
      if (isChoiceQuestion(question) || isComplexChoiceQuestion(question)) {
        const branchRules = question.branchRules || [];
        if (branchRules.length > 1) {
          // 여러 분기가 있는 경우, 타겟 노드들을 위->아래로 배치
          const sourceNode = flowNodes.find(n => n.id === question.id);
          if (!sourceNode) return;

          if (nodePositions[sourceNode.id]) return;

          const baseX = sourceNode.position.x + 140 + 100; // 소스 노드 우측에 배치

          const targetNodeIds: string[] = [];
          const targetNodes: Node[] = [];

          branchRules.forEach((rule) => {
            const targetNode = flowNodes.find(n => n.id === rule.next_question_id);
            if (targetNode && !nodePositions[targetNode.id]) {
              targetNodes.push(targetNode);
              targetNodeIds.push(targetNode.id);
            }
          });

          if (targetNodes.length > 0) {
            const startY = sourceNode.position.y;
            targetNodes.forEach((targetNode, index) => {
              const horizontalOffset = index * 50;
              targetNode.position = {
                x: baseX + horizontalOffset,
                y: startY + index * verticalSpacing,
              };
              branchTargetNodes.add(targetNode.id);
            });
          }

          if (targetNodeIds.length > 0) {
            branchSourceNodes.set(sourceNode.id, targetNodeIds);
          }
        } else if (branchRules.length === 1) {
          const targetNode = flowNodes.find(n => n.id === branchRules[0].next_question_id);
          if (targetNode && !nodePositions[targetNode.id]) {
            const sourceNode = flowNodes.find(n => n.id === question.id);
            if (sourceNode && !nodePositions[sourceNode.id]) {
              targetNode.position = {
                x: sourceNode.position.x + 140 + 100,
                y: sourceNode.position.y,
              };
              branchTargetNodes.add(targetNode.id);
              branchSourceNodes.set(sourceNode.id, [targetNode.id]);
            }
          }
        }
      }
    });

    // 분기 소스 노드의 위치 조정: 타겟 노드들의 중간 선상에 배치
    branchSourceNodes.forEach((targetNodeIds, sourceNodeId) => {
      const sourceNode = flowNodes.find(n => n.id === sourceNodeId);
      if (!sourceNode || nodePositions[sourceNode.id]) return;

      if (targetNodeIds.length > 1) {
        const targetNodes = targetNodeIds
          .map(id => flowNodes.find(n => n.id === id))
          .filter((n): n is Node => n !== undefined);

        if (targetNodes.length > 0) {
          const avgY = targetNodes.reduce((sum, n) => sum + n.position.y + 42, 0) / targetNodes.length;
          sourceNode.position.y = avgY - 42;
        }
      }
    });

    // 분기된 노드들 다음에 오는 노드들의 위치 조정
    const tempEdges: Edge[] = [];
    questions.forEach((q) => {
      if (isChoiceQuestion(q) || isComplexChoiceQuestion(q)) {
        const branchRules = q.branchRules || [];
        if (branchRules.length > 0) {
          branchRules.forEach((rule) => {
            const targetQuestion = questions.find(question => question.id === rule.next_question_id);
            if (targetQuestion) {
              tempEdges.push({
                id: `temp-${q.id}-${rule.next_question_id}`,
                source: q.id,
                target: rule.next_question_id,
              });
            }
          });
        } else {
          const currentIndex = questions.findIndex(question => question.id === q.id);
          if (currentIndex < questions.length - 1) {
            tempEdges.push({
              id: `temp-${q.id}-${questions[currentIndex + 1].id}`,
              source: q.id,
              target: questions[currentIndex + 1].id,
            });
          }
        }
      } else {
        const currentIndex = questions.findIndex(question => question.id === q.id);
        if (currentIndex < questions.length - 1) {
          tempEdges.push({
            id: `temp-${q.id}-${questions[currentIndex + 1].id}`,
            source: q.id,
            target: questions[currentIndex + 1].id,
          });
        }
      }
    });

    questions.forEach((question) => {
      const node = flowNodes.find(n => n.id === question.id);
      if (!node || nodePositions[node.id]) return;

      const incomingEdges = tempEdges.filter(edge => edge.target === question.id);

      if (incomingEdges.length > 0) {
        const sourceNodes = incomingEdges
          .map(edge => flowNodes.find(n => n.id === edge.source))
          .filter((n): n is Node => n !== undefined);

        if (sourceNodes.length > 0) {
          const allSourcesAreBranched = sourceNodes.every(n => branchTargetNodes.has(n.id));

          if (allSourcesAreBranched && sourceNodes.length > 1) {
            const avgY = sourceNodes.reduce((sum, n) => sum + n.position.y + 42, 0) / sourceNodes.length;
            node.position.y = avgY - 42;
          } else if (sourceNodes.length === 1) {
            const sourceNode = sourceNodes[0];
            node.position.y = sourceNode.position.y;
          }
        }
      }
    });

    // 충돌 해결: 모든 노드 쌍에 대해 충돌 감지 및 해결
    // 저장된 위치가 없는 노드들만 충돌 해결 대상
    const nodesToResolve = flowNodes.filter(n => !nodePositions[n.id]);

    let hasCollision = true;
    let iterations = 0;
    const maxIterations = 10; // 무한 루프 방지

    while (hasCollision && iterations < maxIterations) {
      hasCollision = false;
      iterations++;

      for (let i = 0; i < nodesToResolve.length; i++) {
        for (let j = i + 1; j < nodesToResolve.length; j++) {
          const node1 = nodesToResolve[i];
          const node2 = nodesToResolve[j];

          if (checkCollision(node1, node2)) {
            hasCollision = true;
            resolveCollision(node1, node2);
          }
        }
      }
    }

    return flowNodes;
  }, [questions, currentQuestionId, answers]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesForRendering);

  // 노드 변경 핸들러
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);

    // 위치 변경 감지 (드래그 종료 시)
    changes.forEach((change) => {
      if (change.type === 'position' && change.position && change.dragging === false) {
        if (onNodePositionChange) {
          onNodePositionChange(change.id, {
            x: change.position.x,
            y: change.position.y,
          });
        }
      }
    });
  }, [onNodesChange, onNodePositionChange]);

  // 노드 클릭 핸들러
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    onQuestionSelect?.(node.id);
  }, [onQuestionSelect]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-full bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}


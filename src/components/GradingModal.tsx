import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Volume2, 
  Loader2, 
  Save, 
  Check, 
  TrendingUp, 
  Award, 
  BookCheck, 
  PenTool, 
  RotateCcw, 
  Image as ImageIcon, 
  ZoomIn,
  Maximize2,
  Minimize2,
  Highlighter,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  Eye,
  SplitSquareVertical,
  Columns,
  MessageSquare,
  HelpCircle,
  Undo2,
  Copy,
  ChevronDown,
  Layers,
  Wand2,
  AlertTriangle,
  Sliders,
  Percent,
  GraduationCap,
  Globe,
  Target
} from 'lucide-react';
import { Assignment, CustomCriterionScore, InlineCorrection, ScoringSystemType, Submission, SubmissionCriteriaScores } from '../types';
import { formatSecondsToTime, getBandColorClass, roundIELTSBand } from '../utils/formatters';

export interface ErrorCategoryMeta {
  key: string;
  nameVi: string;
  nameEn: string;
  badge: string;
  bgClass: string;
  badgeBg: string;
  borderClass: string;
  highlightClass: string;
  colorHex: string;
}

export const ERROR_CATEGORIES: Record<string, ErrorCategoryMeta> = {
  grammar: {
    key: 'grammar',
    nameVi: 'Ngữ Pháp (GRA)',
    nameEn: 'Grammar Range & Accuracy',
    badge: 'GRA',
    bgClass: 'bg-rose-500',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    borderClass: 'border-rose-300',
    highlightClass: 'bg-rose-100 text-rose-950 border-b-2 border-rose-500 hover:bg-rose-200',
    colorHex: '#f43f5e'
  },
  vocabulary: {
    key: 'vocabulary',
    nameVi: 'Từ Vựng (LR)',
    nameEn: 'Lexical Resource',
    badge: 'LR',
    bgClass: 'bg-amber-500',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    borderClass: 'border-amber-300',
    highlightClass: 'bg-amber-100 text-amber-950 border-b-2 border-amber-500 hover:bg-amber-200',
    colorHex: '#f59e0b'
  },
  cohesion: {
    key: 'cohesion',
    nameVi: 'Liên Kết (CC)',
    nameEn: 'Coherence & Cohesion',
    badge: 'CC',
    bgClass: 'bg-sky-500',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    borderClass: 'border-sky-300',
    highlightClass: 'bg-sky-100 text-sky-950 border-b-2 border-sky-500 hover:bg-sky-200',
    colorHex: '#0284c7'
  },
  task_response: {
    key: 'task_response',
    nameVi: 'Luận Điểm (TR/TA)',
    nameEn: 'Task Response',
    badge: 'TR',
    bgClass: 'bg-purple-500',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    borderClass: 'border-purple-300',
    highlightClass: 'bg-purple-100 text-purple-950 border-b-2 border-purple-500 hover:bg-purple-200',
    colorHex: '#a855f7'
  },
  spelling: {
    key: 'spelling',
    nameVi: 'Chính Tả & Dấu Câu',
    nameEn: 'Spelling & Mechanics',
    badge: 'SP',
    bgClass: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderClass: 'border-emerald-300',
    highlightClass: 'bg-emerald-100 text-emerald-950 border-b-2 border-emerald-500 hover:bg-emerald-200',
    colorHex: '#10b981'
  }
};

export const SCORING_SYSTEMS: {
  id: ScoringSystemType;
  nameVi: string;
  nameEn: string;
  badge: string;
  icon: string;
  description: string;
}[] = [
  {
    id: 'ielts_band',
    nameVi: 'Thang IELTS Band (0.0 - 9.0)',
    nameEn: 'IELTS 9-Band Scale',
    badge: 'IELTS 9.0',
    icon: 'Award',
    description: 'Chuẩn 4 tiêu chí TR/TA, CC, LR, GRA (bước nhảy 0.5)'
  },
  {
    id: 'scale_10',
    nameVi: 'Thang Điểm 10 (0.0 - 10.0)',
    nameEn: '10-Point Scale (VN Standard)',
    badge: 'Điểm 10',
    icon: 'Sliders',
    description: 'Chuẩn trường học/trung tâm Việt Nam (bước nhảy 0.1 / 0.25)'
  },
  {
    id: 'scale_100',
    nameVi: 'Thang Điểm 100 / % (0 - 100)',
    nameEn: 'Percentage / 100-Point Scale',
    badge: '100 Điểm / %',
    icon: 'Percent',
    description: 'Thang điểm 100 hoặc phần trăm theo chuẩn quốc tế'
  },
  {
    id: 'letter_grade',
    nameVi: 'Thang Điểm Chữ (A+, A, B, C, D, F)',
    nameEn: 'US Letter Grade (GPA 4.0)',
    badge: 'Grade A-F',
    icon: 'GraduationCap',
    description: 'Hệ điểm chữ chuẩn GPA (A+, A, B+, B, C, D, F)'
  },
  {
    id: 'cefr',
    nameVi: 'Khung Tham Chiếu CEFR (A1 - C2)',
    nameEn: 'CEFR Proficiency Levels',
    badge: 'CEFR A1-C2',
    icon: 'Globe',
    description: 'Khung năng lực ngoại ngữ Châu Âu (A1, A2, B1, B2, C1, C2)'
  },
  {
    id: 'toeic_scale',
    nameVi: 'Thang Điểm TOEIC (0 - 200)',
    nameEn: 'TOEIC Speaking/Writing',
    badge: 'TOEIC 200',
    icon: 'Target',
    description: 'Thang điểm kỹ năng TOEIC Speaking / Writing (0 - 200)'
  }
];

interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  assignment?: Assignment;
  onSaveGrade: (updatedSubmission: Submission) => void;
}

export const GradingModal: React.FC<GradingModalProps> = ({
  isOpen,
  onClose,
  submission,
  assignment,
  onSaveGrade,
}) => {
  const isWriting = submission.assignmentSkill === 'writing';
  const isSpeaking = submission.assignmentSkill === 'speaking';
  const isObjective = submission.assignmentSkill === 'reading' || submission.assignmentSkill === 'listening';

  // Full-screen mode state
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [activeTab, setActiveTab] = useState<'highlight' | 'direct_edit' | 'diff'>('highlight');

  // Selected Scoring System
  const [scoringSystem, setScoringSystem] = useState<ScoringSystemType>(
    submission.scoringSystem || 'ielts_band'
  );

  // Scoring states for all systems
  const [overallBand, setOverallBand] = useState<number>(submission.overallBand || 6.5);
  const [score10, setScore10] = useState<number>(submission.score10 || 7.5);
  const [score100, setScore100] = useState<number>(submission.score100 || 75);
  const [letterGrade, setLetterGrade] = useState<string>(submission.letterGrade || 'B+');
  const [cefrLevel, setCefrLevel] = useState<string>(submission.cefrLevel || 'B2');
  const [toeicScore, setToeicScore] = useState<number>(submission.toeicScore || 140);

  // Criteria for IELTS
  const [criteriaScores, setCriteriaScores] = useState<SubmissionCriteriaScores>(
    submission.criteriaScores || {
      taskAchievement: 6.5,
      coherenceCohesion: 6.5,
      lexicalResource: 6.5,
      grammarAccuracy: 6.5,
      pronunciation: isSpeaking ? 6.5 : undefined
    }
  );

  // Criteria for 10-Point Scale
  const [scale10Criteria, setScale10Criteria] = useState<{
    content: number; // 0 - 10
    grammar: number; // 0 - 10
    vocabulary: number; // 0 - 10
    organization: number; // 0 - 10
  }>({
    content: 7.5,
    grammar: 7.5,
    vocabulary: 7.5,
    organization: 7.5
  });

  // Criteria for 100-Point Scale
  const [scale100Criteria, setScale100Criteria] = useState<{
    content: number; // 0 - 25
    grammar: number; // 0 - 25
    vocabulary: number; // 0 - 25
    organization: number; // 0 - 25
  }>({
    content: 18,
    grammar: 18,
    vocabulary: 19,
    organization: 20
  });

  const [teacherFeedback, setTeacherFeedback] = useState<string>(
    submission.teacherFeedback || ''
  );
  const [strengths, setStrengths] = useState<string[]>(submission.strengths || []);
  const [weaknesses, setWeaknesses] = useState<string[]>(submission.weaknesses || []);
  const [inlineCorrections, setInlineCorrections] = useState<InlineCorrection[]>(
    submission.inlineCorrections || []
  );
  const [sampleUpgrade, setSampleUpgrade] = useState<string>(submission.sampleUpgrade || '');

  // Direct edit content state
  const [teacherEditedContent, setTeacherEditedContent] = useState<string>(
    submission.teacherEditedContent || submission.essayContent || submission.speakingTranscript || ''
  );

  // Active selected correction for editing in popover / sidebar
  const [activeCorrectionIdx, setActiveCorrectionIdx] = useState<number | null>(null);
  const [hoveredCorrectionIdx, setHoveredCorrectionIdx] = useState<number | null>(null);

  // Text selection floating toolbar state
  const [selectedText, setSelectedText] = useState<string>('');
  const [showAddCorrectionModal, setShowAddCorrectionModal] = useState(false);
  const [newCorrectionData, setNewCorrectionData] = useState<{
    original: string;
    corrected: string;
    explanation: string;
    category: string;
  }>({
    original: '',
    corrected: '',
    explanation: '',
    category: 'grammar'
  });

  // AI Evaluator state
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const contentContainerRef = useRef<HTMLDivElement | null>(null);

  const attachedImages = assignment?.assignmentImages && assignment.assignmentImages.length > 0
    ? assignment.assignmentImages
    : (assignment?.assignmentImageUrl ? [assignment.assignmentImageUrl] : []);

  if (!isOpen) return null;

  // Conversion helpers between scoring systems
  const syncScoresFromBand = (band: number) => {
    // 9.0 = 10 / 100 / A+ / C2 / 200
    // 8.0 = 9.0 / 90 / A / C1 / 180
    // 7.0 = 8.0 / 80 / B+ / C1 / 160
    // 6.5 = 7.5 / 75 / B / B2 / 140
    // 6.0 = 7.0 / 70 / B- / B2 / 130
    // 5.5 = 6.5 / 65 / C+ / B1 / 110
    // 5.0 = 6.0 / 60 / C / B1 / 100
    const s10 = Math.min(10, Math.max(1, parseFloat((band * 1.1).toFixed(1))));
    const s100 = Math.min(100, Math.max(10, Math.round(band * 11)));
    setScore10(s10);
    setScore100(s100);

    if (band >= 8.5) { setLetterGrade('A+'); setCefrLevel('C2'); setToeicScore(190); }
    else if (band >= 7.5) { setLetterGrade('A'); setCefrLevel('C1'); setToeicScore(170); }
    else if (band >= 6.5) { setLetterGrade('B+'); setCefrLevel('B2'); setToeicScore(150); }
    else if (band >= 5.5) { setLetterGrade('B'); setCefrLevel('B2'); setToeicScore(130); }
    else if (band >= 4.5) { setLetterGrade('C'); setCefrLevel('B1'); setToeicScore(100); }
    else { setLetterGrade('D'); setCefrLevel('A2'); setToeicScore(70); }
  };

  const syncScoresFromScale10 = (val: number) => {
    const band = roundIELTSBand(Math.min(9.0, Math.max(1.0, val / 1.1)));
    setOverallBand(band);
    const s100 = Math.min(100, Math.max(10, Math.round(val * 10)));
    setScore100(s100);
    if (val >= 9.0) { setLetterGrade('A+'); setCefrLevel('C2'); setToeicScore(190); }
    else if (val >= 8.0) { setLetterGrade('A'); setCefrLevel('C1'); setToeicScore(170); }
    else if (val >= 7.0) { setLetterGrade('B+'); setCefrLevel('B2'); setToeicScore(150); }
    else if (val >= 6.0) { setLetterGrade('B'); setCefrLevel('B1'); setToeicScore(120); }
    else if (val >= 5.0) { setLetterGrade('C'); setCefrLevel('A2'); setToeicScore(90); }
    else { setLetterGrade('D'); setCefrLevel('A1'); setToeicScore(60); }
  };

  const syncScoresFromScale100 = (val: number) => {
    const s10 = parseFloat((val / 10).toFixed(1));
    setScore10(s10);
    const band = roundIELTSBand(Math.min(9.0, Math.max(1.0, val / 11)));
    setOverallBand(band);
    if (val >= 90) { setLetterGrade('A+'); setCefrLevel('C2'); setToeicScore(190); }
    else if (val >= 80) { setLetterGrade('A'); setCefrLevel('C1'); setToeicScore(170); }
    else if (val >= 70) { setLetterGrade('B+'); setCefrLevel('B2'); setToeicScore(150); }
    else if (val >= 60) { setLetterGrade('B'); setCefrLevel('B1'); setToeicScore(120); }
    else if (val >= 50) { setLetterGrade('C'); setCefrLevel('A2'); setToeicScore(90); }
    else { setLetterGrade('D'); setCefrLevel('A1'); setToeicScore(60); }
  };

  // Handle user selecting text in student's submission
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    const text = selection.toString().trim();
    if (text.length >= 2) {
      setSelectedText(text);
      setNewCorrectionData(prev => ({
        ...prev,
        original: text,
        corrected: text,
        explanation: ''
      }));
    }
  };

  const handleOpenAddCorrection = (categoryKey?: string) => {
    if (categoryKey) {
      setNewCorrectionData(prev => ({ ...prev, category: categoryKey }));
    }
    setShowAddCorrectionModal(true);
  };

  const handleSaveNewCorrection = () => {
    if (!newCorrectionData.original.trim()) return;

    const newId = `corr-${Date.now()}`;
    const newCorr: InlineCorrection = {
      id: newId,
      original: newCorrectionData.original.trim(),
      corrected: newCorrectionData.corrected.trim() || newCorrectionData.original.trim(),
      explanation: newCorrectionData.explanation.trim() || ERROR_CATEGORIES[newCorrectionData.category]?.nameVi || 'Lỗi cần sửa',
      category: newCorrectionData.category
    };

    setInlineCorrections(prev => [...prev, newCorr]);
    setShowAddCorrectionModal(false);
    setSelectedText('');
    setNewCorrectionData({ original: '', corrected: '', explanation: '', category: 'grammar' });
  };

  const handleUpdateCorrection = (index: number, updates: Partial<InlineCorrection>) => {
    setInlineCorrections(prev => 
      prev.map((item, idx) => idx === index ? { ...item, ...updates } : item)
    );
  };

  const handleDeleteCorrection = (index: number) => {
    setInlineCorrections(prev => prev.filter((_, idx) => idx !== index));
    if (activeCorrectionIdx === index) {
      setActiveCorrectionIdx(null);
    }
  };

  // Apply all corrections directly into teacherEditedContent
  const handleAutoApplyAllCorrections = () => {
    let base = submission.essayContent || submission.speakingTranscript || '';
    inlineCorrections.forEach(corr => {
      if (corr.original && corr.corrected && corr.original !== corr.corrected) {
        base = base.split(corr.original).join(corr.corrected);
      }
    });
    setTeacherEditedContent(base);
    setActiveTab('direct_edit');
  };

  const handleRunAiEvaluation = async () => {
    setIsAiGrading(true);
    setAiError(null);

    const studentContent = isWriting 
      ? submission.essayContent 
      : isSpeaking 
      ? (submission.speakingTranscript || 'Bài nói học sinh') 
      : JSON.stringify(submission.answers);

    try {
      const response = await fetch('/api/gemini/evaluate-ielts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: submission.assignmentSkill,
          taskType: assignment?.taskType || 'IELTS Task',
          prompt: assignment?.writingPrompt || assignment?.readingPassage || assignment?.speakingCueCard?.topic || assignment?.title,
          studentContent,
          targetBand: assignment?.targetBand || '6.5'
        })
      });

      const resData = await response.json();
      if (!resData.success || !resData.data) {
        throw new Error(resData.error || 'Không thể chấm điểm qua AI');
      }

      const aiResult = resData.data;
      if (aiResult.overallBand) {
        const b = aiResult.overallBand;
        setOverallBand(b);
        syncScoresFromBand(b);
      }
      if (aiResult.criteriaScores) {
        setCriteriaScores({
          taskAchievement: aiResult.criteriaScores.taskAchievement || 6.5,
          coherenceCohesion: aiResult.criteriaScores.coherenceCohesion || 6.5,
          lexicalResource: aiResult.criteriaScores.lexicalResource || 6.5,
          grammarAccuracy: aiResult.criteriaScores.grammarAccuracy || 6.5,
          pronunciation: aiResult.criteriaScores.pronunciation || (isSpeaking ? 6.5 : undefined)
        });
      }
      if (aiResult.summaryFeedback) {
        setTeacherFeedback(aiResult.summaryFeedback);
      }
      if (Array.isArray(aiResult.strengths)) {
        setStrengths(aiResult.strengths);
      }
      if (Array.isArray(aiResult.weaknesses)) {
        setWeaknesses(aiResult.weaknesses);
      }
      if (Array.isArray(aiResult.corrections)) {
        setInlineCorrections(aiResult.corrections.map((c: any, i: number) => ({
          ...c,
          id: `ai-${Date.now()}-${i}`
        })));
      }
      if (aiResult.sampleUpgrade) {
        setSampleUpgrade(aiResult.sampleUpgrade);
      }

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi khi gọi AI Gemini. Vui lòng thử lại.');
    } finally {
      setIsAiGrading(false);
    }
  };

  // Generate Score Display String based on current scoring system
  const getFormattedScoreDisplay = (): string => {
    switch (scoringSystem) {
      case 'ielts_band':
        return `Band ${overallBand.toFixed(1)}`;
      case 'scale_10':
        return `${score10.toFixed(1)} / 10`;
      case 'scale_100':
        return `${score100} / 100`;
      case 'letter_grade':
        return `Grade ${letterGrade} (${score100}%)`;
      case 'cefr':
        return `CEFR ${cefrLevel}`;
      case 'toeic_scale':
        return `${toeicScore} / 200 (TOEIC)`;
      default:
        return `Band ${overallBand.toFixed(1)}`;
    }
  };

  const handleSave = () => {
    const formattedScore = getFormattedScoreDisplay();

    // Prepare custom criteria scores for saving
    let customCriteria: CustomCriterionScore[] | undefined = undefined;
    if (scoringSystem === 'scale_10') {
      customCriteria = [
        { key: 'content', nameVi: 'Nội Dung & Bám Sát Đề', nameEn: 'Content & Task Fulfillment', score: scale10Criteria.content, maxScore: 10 },
        { key: 'grammar', nameVi: 'Ngữ Pháp & Cấu Trúc', nameEn: 'Grammar & Accuracy', score: scale10Criteria.grammar, maxScore: 10 },
        { key: 'vocabulary', nameVi: 'Từ Vựng & Diễn Đạt', nameEn: 'Vocabulary & Style', score: scale10Criteria.vocabulary, maxScore: 10 },
        { key: 'organization', nameVi: 'Mạch Lạc & Trình Bày', nameEn: 'Organization & Coherence', score: scale10Criteria.organization, maxScore: 10 }
      ];
    } else if (scoringSystem === 'scale_100') {
      customCriteria = [
        { key: 'content', nameVi: 'Nội Dung & Luận Điểm', nameEn: 'Content (25%)', score: scale100Criteria.content, maxScore: 25 },
        { key: 'grammar', nameVi: 'Ngữ Pháp & Cú Pháp', nameEn: 'Grammar (25%)', score: scale100Criteria.grammar, maxScore: 25 },
        { key: 'vocabulary', nameVi: 'Từ Vựng Học Thuật', nameEn: 'Lexical (25%)', score: scale100Criteria.vocabulary, maxScore: 25 },
        { key: 'organization', nameVi: 'Trình Bày & Liên Kết', nameEn: 'Cohesion (25%)', score: scale100Criteria.organization, maxScore: 25 }
      ];
    }

    const updated: Submission = {
      ...submission,
      status: 'graded',
      scoringSystem,
      scoreDisplay: formattedScore,
      overallBand,
      score10,
      score100,
      letterGrade,
      cefrLevel,
      toeicScore,
      criteriaScores,
      customCriteriaScores: customCriteria,
      teacherFeedback,
      strengths,
      weaknesses,
      inlineCorrections,
      teacherEditedContent,
      sampleUpgrade,
      gradedByTeacher: true,
      gradedAt: new Date().toISOString(),
      gradedBy: 'Teacher Celina Phạm'
    };
    onSaveGrade(updated);
    onClose();
  };

  const handleUpdateIELTSCriterion = (key: keyof SubmissionCriteriaScores, value: number) => {
    const updated = { ...criteriaScores, [key]: value };
    setCriteriaScores(updated);

    const values = [
      updated.taskAchievement || 0,
      updated.coherenceCohesion || 0,
      updated.lexicalResource || 0,
      updated.grammarAccuracy || 0,
      ...(isSpeaking && updated.pronunciation ? [updated.pronunciation] : [])
    ];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const rounded = roundIELTSBand(avg);
    setOverallBand(rounded);
    syncScoresFromBand(rounded);
  };

  const handleUpdateScale10Criterion = (key: keyof typeof scale10Criteria, val: number) => {
    const updated = { ...scale10Criteria, [key]: val };
    setScale10Criteria(updated);
    const avg = (updated.content + updated.grammar + updated.vocabulary + updated.organization) / 4;
    const roundedAvg = parseFloat(avg.toFixed(1));
    setScore10(roundedAvg);
    syncScoresFromScale10(roundedAvg);
  };

  const handleUpdateScale100Criterion = (key: keyof typeof scale100Criteria, val: number) => {
    const updated = { ...scale100Criteria, [key]: val };
    setScale100Criteria(updated);
    const total = updated.content + updated.grammar + updated.vocabulary + updated.organization;
    setScore100(total);
    syncScoresFromScale100(total);
  };

  // Helper: Render interactive highlighted essay with error badges and clickable tooltips
  const renderHighlightedContent = (rawText: string) => {
    if (!rawText) return <p className="text-slate-400 italic">(Học sinh chưa nhập bài làm)</p>;
    if (!inlineCorrections || inlineCorrections.length === 0) {
      return (
        <div 
          onMouseUp={handleTextSelection}
          className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-800 font-serif selection:bg-blue-200"
        >
          {rawText}
        </div>
      );
    }

    interface MatchSegment {
      start: number;
      end: number;
      corr: InlineCorrection;
      index: number;
    }

    const segments: MatchSegment[] = [];

    inlineCorrections.forEach((corr, idx) => {
      if (!corr.original || !corr.original.trim()) return;
      const target = corr.original.trim();
      let pos = 0;
      while ((pos = rawText.indexOf(target, pos)) !== -1) {
        segments.push({
          start: pos,
          end: pos + target.length,
          corr,
          index: idx
        });
        pos += target.length;
      }
    });

    segments.sort((a, b) => a.start - b.start);

    const validSegments: MatchSegment[] = [];
    let lastEnd = 0;
    for (const seg of segments) {
      if (seg.start >= lastEnd) {
        validSegments.push(seg);
        lastEnd = seg.end;
      }
    }

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    validSegments.forEach((seg, i) => {
      if (seg.start > currentIndex) {
        elements.push(
          <span key={`text-${currentIndex}`}>
            {rawText.substring(currentIndex, seg.start)}
          </span>
        );
      }

      const catMeta = ERROR_CATEGORIES[seg.corr.category] || ERROR_CATEGORIES.grammar;
      const isActive = activeCorrectionIdx === seg.index;
      const isHovered = hoveredCorrectionIdx === seg.index;

      elements.push(
        <span
          key={`mark-${seg.index}-${i}`}
          onClick={() => setActiveCorrectionIdx(seg.index)}
          onMouseEnter={() => setHoveredCorrectionIdx(seg.index)}
          onMouseLeave={() => setHoveredCorrectionIdx(null)}
          className={`relative inline cursor-pointer px-1 py-0.5 rounded transition-all font-medium select-text ${catMeta.highlightClass} ${
            isActive || isHovered ? 'ring-2 ring-blue-600 shadow-xs' : ''
          }`}
          title={`Click để chỉnh sửa câu này • Lỗi: ${catMeta.nameVi}`}
        >
          {rawText.substring(seg.start, seg.end)}
          
          <span className={`inline-flex items-center justify-center ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ${catMeta.bgClass}`}>
            {seg.index + 1}
          </span>
        </span>
      );

      currentIndex = seg.end;
    });

    if (currentIndex < rawText.length) {
      elements.push(
        <span key={`text-end`}>
          {rawText.substring(currentIndex)}
        </span>
      );
    }

    return (
      <div 
        ref={contentContainerRef}
        onMouseUp={handleTextSelection}
        className="whitespace-pre-line text-sm sm:text-base leading-loose text-slate-900 font-serif selection:bg-blue-200 tracking-wide"
      >
        {elements}
      </div>
    );
  };

  const categoryCounts = inlineCorrections.reduce((acc, curr) => {
    const cat = curr.category || 'grammar';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const studentEssay = submission.essayContent || submission.speakingTranscript || '';
  const currentWordCount = studentEssay.split(/\s+/).filter(Boolean).length;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex flex-col ${isFullscreen ? 'w-screen h-screen' : 'p-2 sm:p-4'}`}>
      <div 
        className={`bg-slate-50 text-slate-800 flex flex-col overflow-hidden shadow-2xl transition-all ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-7xl max-h-[96vh] rounded-2xl mx-auto border border-slate-200'
        }`}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Bright Header Toolbar */}
        <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap shadow-xs">
          
          {/* Left: Student info & Skill badge */}
          <div className="flex items-center gap-3">
            <img
              src={submission.studentAvatar}
              alt={submission.studentName}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shrink-0 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Chấm Bài: {submission.studentName}
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                  {submission.assignmentSkill}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  Target Band {assignment?.targetBand || '6.5+'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {submission.assignmentTitle} • {currentWordCount} từ • Nộp lúc {new Date(submission.submittedAt).toLocaleTimeString('vi-VN')} ({formatSecondsToTime(submission.timeSpentSeconds)})
              </p>
            </div>
          </div>

          {/* Center: Live Error Category Stats Counters */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {Object.entries(ERROR_CATEGORIES).map(([catKey, catMeta]) => {
              const count = categoryCounts[catKey] || 0;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => handleOpenAddCorrection(catKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    count > 0 
                      ? 'bg-white text-slate-800 border border-slate-300 shadow-xs hover:border-slate-400' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
                  title={`Click để thêm lỗi ${catMeta.nameVi}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${catMeta.bgClass}`}></span>
                  <span>{catMeta.badge}</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-slate-200 text-slate-700">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            
            {/* AI Auto-Evaluation Button */}
            <button
              type="button"
              onClick={handleRunAiEvaluation}
              disabled={isAiGrading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              title="AI tự động phân tích bài viết, tìm lỗi ngữ pháp & từ vựng, tính điểm theo thang đo"
            >
              {isAiGrading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Đang Phân Tích...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>AI Chấm Điểm & Lỗi</span>
                </>
              )}
            </button>

            {/* Save & Publish Grade */}
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu & Công Bố</span>
            </button>

            {/* Toggle Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title={isFullscreen ? "Thu nhỏ cửa sổ" : "Phóng to toàn màn hình"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng bảng chấm bài"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Selected Text Floating Action Bar (When teacher highlights text) */}
        {selectedText && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 max-w-xl truncate">
              <span className="p-1 bg-amber-200 text-amber-900 rounded">
                <Highlighter className="w-3.5 h-3.5" />
              </span>
              <span className="text-slate-600 font-medium">Đã chọn:</span>
              <span className="font-serif italic font-bold text-blue-950 truncate">
                "{selectedText}"
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-600 font-bold mr-1">Đánh dấu lỗi & Sửa:</span>
              {Object.entries(ERROR_CATEGORIES).map(([catKey, catMeta]) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => handleOpenAddCorrection(catKey)}
                  className={`px-2.5 py-1 text-[11px] font-bold text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${catMeta.bgClass} hover:opacity-90 shadow-2xs`}
                >
                  <span>{catMeta.nameVi}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedText('')}
                className="p-1 text-slate-500 hover:text-slate-800 rounded ml-1"
                title="Bỏ chọn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Workspace Dual-Pane (Split Screen) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-100">
          
          {/* ================= LEFT PANE (7 COLS): Essay Highlighter & Direct Editor ================= */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden bg-white">
            
            {/* Left Pane Sub-Header */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Bài Làm Học Sinh & Highlight Trực Quan
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                  {inlineCorrections.length} ghi chú sửa
                </span>
              </div>

              {/* View / Edit Mode Switcher */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('highlight')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'highlight' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Chế độ đánh dấu lỗi bằng màu sắc và sửa từng câu"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Highlight Màu Lỗi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('direct_edit')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'direct_edit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Chế độ sửa trực tiếp toàn bộ văn bản bài viết"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa Trực Tiếp Bài</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('diff')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'diff' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="So sánh bài gốc và bài đã qua chỉnh sửa"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                  <span>So Sánh (Diff)</span>
                </button>
              </div>
            </div>

            {/* Left Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              
              {/* Prompt Accordion / Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Đề Bài / Prompt</span>
                  {assignment?.taskType && (
                    <span className="text-blue-700 font-mono text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {assignment.taskType}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {assignment?.writingPrompt || assignment?.readingPassage?.slice(0, 300) || assignment?.speakingCueCard?.topic || assignment?.title}
                </p>

                {/* Attached Diagram / Images */}
                {attachedImages.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-blue-600" />
                      Biểu đồ & sơ đồ đề bài ({attachedImages.length} ảnh):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {attachedImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setZoomImage(imgUrl)}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <img src={imgUrl} alt={`Đề ${idx + 1}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1 font-bold">
                            <ZoomIn className="w-4 h-4" />
                            <span>Phóng to</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mode 1: Interactive Highlight Mode */}
              {activeTab === 'highlight' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Highlighter className="w-4 h-4 text-amber-500" />
                      <span>Bôi đen bất kỳ từ/câu nào để đánh dấu lỗi & sửa trực tiếp:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAddCorrection()}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Sửa Câu</span>
                    </button>
                  </div>

                  {/* Main Essay White Box with Highlighting */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[380px]">
                    {renderHighlightedContent(studentEssay)}
                  </div>

                  {/* Audio Player for Speaking Response */}
                  {isSpeaking && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                          File Thu Âm Của Học Sinh ({submission.audioDurationSeconds || 120}s)
                        </span>
                        <span className="text-xs text-emerald-700 font-mono font-bold">01:58</span>
                      </div>
                      <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full w-2/3"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Direct Edit Mode */}
              {activeTab === 'direct_edit' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-800 font-medium flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-emerald-600" />
                      Chỉnh sửa trực tiếp bài viết của học sinh (Giáo viên biên tập lại)
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoApplyAllCorrections}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Tự động thay thế tất cả các câu đã sửa vào văn bản"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Áp Dụng Toàn Bộ Sửa Đổi</span>
                    </button>
                  </div>

                  <textarea
                    rows={16}
                    value={teacherEditedContent}
                    onChange={(e) => setTeacherEditedContent(e.target.value)}
                    placeholder="Chỉnh sửa hoặc viết lại các câu trực tiếp tại đây..."
                    className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-2xl font-serif text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-inner"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Số từ bài đã sửa: {teacherEditedContent.split(/\s+/).filter(Boolean).length} từ</span>
                    <button
                      type="button"
                      onClick={() => setTeacherEditedContent(studentEssay)}
                      className="text-xs text-slate-600 hover:text-rose-600 flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Khôi phục bài gốc</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 3: Diff / Side-by-Side Compare */}
              {activeTab === 'diff' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Bản Gốc Học Sinh Nộp</span>
                      <span className="font-mono text-[11px]">({currentWordCount} từ)</span>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs sm:text-sm text-slate-800 font-serif leading-relaxed whitespace-pre-line h-[420px] overflow-y-auto shadow-xs">
                      {studentEssay}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Bản Giáo Viên Đã Sửa / Nâng Cấp</span>
                      <span className="font-mono text-[11px]">({teacherEditedContent.split(/\s+/).filter(Boolean).length} từ)</span>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-emerald-300 text-xs sm:text-sm text-slate-900 font-serif leading-relaxed whitespace-pre-line h-[420px] overflow-y-auto shadow-xs">
                      {teacherEditedContent}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ================= RIGHT PANE (5 COLS): Scoring Systems, Rubrics & Feedback ================= */}
          <div className="lg:col-span-5 flex flex-col overflow-hidden bg-slate-50">
            
            {/* Right Pane Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {aiError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* 1. SCORING SYSTEM SELECTOR (LỰA CHỌN CÁCH TÍNH ĐIỂM ĐA DẠNG) */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Hệ Thống Thang Điểm:</span>
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {SCORING_SYSTEMS.find(s => s.id === scoringSystem)?.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SCORING_SYSTEMS.map((sys) => {
                    const isSelected = scoringSystem === sys.id;
                    return (
                      <button
                        key={sys.id}
                        type="button"
                        onClick={() => setScoringSystem(sys.id)}
                        className={`p-2 rounded-xl text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-xs font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span className="text-xs block font-bold truncate">{sys.nameVi.split(' (')[0]}</span>
                        <span className="text-[10px] text-slate-500 block truncate font-mono">{sys.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. DYNAMIC SCORE BANNER CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white text-center space-y-2 shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  {SCORING_SYSTEMS.find(s => s.id === scoringSystem)?.nameVi}
                </span>
                
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-amber-300 font-mono">
                    {scoringSystem === 'ielts_band' && overallBand.toFixed(1)}
                    {scoringSystem === 'scale_10' && score10.toFixed(1)}
                    {scoringSystem === 'scale_100' && score100}
                    {scoringSystem === 'letter_grade' && letterGrade}
                    {scoringSystem === 'cefr' && cefrLevel}
                    {scoringSystem === 'toeic_scale' && toeicScore}
                  </span>

                  <div className="text-left space-y-0.5">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white border border-white/30 block">
                      {scoringSystem === 'ielts_band' && (overallBand >= 7.5 ? 'Very Good User' : overallBand >= 6.5 ? 'Competent User' : 'Modest User')}
                      {scoringSystem === 'scale_10' && (score10 >= 9.0 ? 'Xuất Sắc (9-10)' : score10 >= 8.0 ? 'Giỏi (8.0-8.9)' : score10 >= 6.5 ? 'Khá (6.5-7.9)' : 'Trung Bình')}
                      {scoringSystem === 'scale_100' && (score100 >= 85 ? 'Distinction' : score100 >= 70 ? 'Merit' : score100 >= 50 ? 'Pass' : 'Needs Work')}
                      {scoringSystem === 'letter_grade' && (letterGrade.startsWith('A') ? 'Excellent' : letterGrade.startsWith('B') ? 'Good' : 'Satisfactory')}
                      {scoringSystem === 'cefr' && (cefrLevel === 'C2' ? 'Mastery' : cefrLevel === 'C1' ? 'Effective Operational' : cefrLevel === 'B2' ? 'Vantage (Upper-Int)' : 'Threshold')}
                      {scoringSystem === 'toeic_scale' && (toeicScore >= 160 ? 'High Proficiency' : toeicScore >= 130 ? 'Medium-High' : 'Basic')}
                    </span>
                    <p className="text-[11px] text-blue-100">Hiển thị trên bảng điểm học sinh</p>
                  </div>
                </div>
              </div>

              {/* 3. DYNAMIC CRITERIA SCORING SLIDERS BASED ON SYSTEM */}

              {/* Case A: IELTS 4-Criteria Rubric */}
              {scoringSystem === 'ielts_band' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      4 Tiêu Chí IELTS Band Descriptors (0 - 9.0)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Bước nhảy 0.5</span>
                  </div>

                  {/* TR */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        {isWriting ? 'Task Response / Achievement (TR/TA)' : 'Fluency & Coherence (FC)'}
                      </span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {criteriaScores.taskAchievement?.toFixed(1) || '6.5'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={criteriaScores.taskAchievement || 6.5}
                      onChange={(e) => handleUpdateIELTSCriterion('taskAchievement', parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  {/* CC */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        Coherence & Cohesion (CC)
                      </span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {criteriaScores.coherenceCohesion?.toFixed(1) || '6.5'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={criteriaScores.coherenceCohesion || 6.5}
                      onChange={(e) => handleUpdateIELTSCriterion('coherenceCohesion', parseFloat(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  {/* LR */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        Lexical Resource (LR) - Từ Vựng
                      </span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {criteriaScores.lexicalResource?.toFixed(1) || '6.5'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={criteriaScores.lexicalResource || 6.5}
                      onChange={(e) => handleUpdateIELTSCriterion('lexicalResource', parseFloat(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* GRA */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Grammar Range & Accuracy (GRA)
                      </span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {criteriaScores.grammarAccuracy?.toFixed(1) || '6.5'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={criteriaScores.grammarAccuracy || 6.5}
                      onChange={(e) => handleUpdateIELTSCriterion('grammarAccuracy', parseFloat(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>

                  {isSpeaking && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          Pronunciation (PR) - Phát Âm
                        </span>
                        <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                          {criteriaScores.pronunciation?.toFixed(1) || '6.5'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="9.0"
                        step="0.5"
                        value={criteriaScores.pronunciation || 6.5}
                        onChange={(e) => handleUpdateIELTSCriterion('pronunciation', parseFloat(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Case B: Thang Điểm 10 (0.0 - 10.0) */}
              {scoringSystem === 'scale_10' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      4 Tiêu Chí Thang Điểm 10 (0.0 - 10.0)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Bước nhảy 0.25</span>
                  </div>

                  {/* Tiêu chí 1: Nội dung */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>1. Nội Dung & Bám Sát Đề Bài (Task)</span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {scale10Criteria.content.toFixed(1)} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="10.0"
                      step="0.25"
                      value={scale10Criteria.content}
                      onChange={(e) => handleUpdateScale10Criterion('content', parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Tiêu chí 2: Ngữ pháp */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>2. Ngữ Pháp & Độ Chính Xác (Grammar)</span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {scale10Criteria.grammar.toFixed(1)} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="10.0"
                      step="0.25"
                      value={scale10Criteria.grammar}
                      onChange={(e) => handleUpdateScale10Criterion('grammar', parseFloat(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>

                  {/* Tiêu chí 3: Từ vựng */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>3. Từ Vựng & Cụm Diễn Đạt (Vocabulary)</span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {scale10Criteria.vocabulary.toFixed(1)} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="10.0"
                      step="0.25"
                      value={scale10Criteria.vocabulary}
                      onChange={(e) => handleUpdateScale10Criterion('vocabulary', parseFloat(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* Tiêu chí 4: Mạch lạc */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>4. Mạch Lạc, Bố Cục & Trình Bày</span>
                      <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                        {scale10Criteria.organization.toFixed(1)} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="10.0"
                      step="0.25"
                      value={scale10Criteria.organization}
                      onChange={(e) => handleUpdateScale10Criterion('organization', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Case C: Thang Điểm 100 / % (0 - 100) */}
              {scoringSystem === 'scale_100' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-indigo-600" />
                      4 Tiêu Chí Thang Điểm 100 (4 x 25 điểm)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Tổng: 100 điểm</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-700 block">Nội dung (Max 25):</span>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={scale100Criteria.content}
                        onChange={(e) => handleUpdateScale100Criterion('content', parseInt(e.target.value) || 0)}
                        className="w-full p-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-700 block">Ngữ pháp (Max 25):</span>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={scale100Criteria.grammar}
                        onChange={(e) => handleUpdateScale100Criterion('grammar', parseInt(e.target.value) || 0)}
                        className="w-full p-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-700 block">Từ vựng (Max 25):</span>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={scale100Criteria.vocabulary}
                        onChange={(e) => handleUpdateScale100Criterion('vocabulary', parseInt(e.target.value) || 0)}
                        className="w-full p-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-700 block">Liên kết (Max 25):</span>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={scale100Criteria.organization}
                        onChange={(e) => handleUpdateScale100Criterion('organization', parseInt(e.target.value) || 0)}
                        className="w-full p-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Case D: Letter Grade / CEFR / TOEIC Selectors */}
              {(scoringSystem === 'letter_grade' || scoringSystem === 'cefr' || scoringSystem === 'toeic_scale') && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Chọn Mức Đánh Giá Trực Tiếp
                    </h4>
                  </div>

                  {scoringSystem === 'letter_grade' && (
                    <div className="grid grid-cols-4 gap-2">
                      {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setLetterGrade(g)}
                          className={`py-2 text-sm font-black rounded-xl border transition-all cursor-pointer ${
                            letterGrade === g
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}

                  {scoringSystem === 'cefr' && (
                    <div className="grid grid-cols-3 gap-2">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setCefrLevel(lvl)}
                          className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                            cefrLevel === lvl
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  )}

                  {scoringSystem === 'toeic_scale' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Điểm TOEIC (0 - 200):</span>
                        <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {toeicScore} / 200
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        step="10"
                        value={toeicScore}
                        onChange={(e) => setToeicScore(parseInt(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 4. INLINE CORRECTIONS LIST (DANH SÁCH LỖI VÀ SỬA CÂU) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <BookCheck className="w-4 h-4 text-blue-600" />
                    Danh Sách Lỗi & Sửa Câu ({inlineCorrections.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleOpenAddCorrection()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>

                {inlineCorrections.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 space-y-1.5 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Highlighter className="w-6 h-6 mx-auto text-slate-400" />
                    <p>Chưa có câu nào được đánh dấu sửa lỗi.</p>
                    <p className="text-[11px] text-slate-400">
                      Bôi đen câu trong bài hoặc bấm "AI Chấm Điểm & Lỗi" ở trên.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {inlineCorrections.map((corr, idx) => {
                      const catMeta = ERROR_CATEGORIES[corr.category] || ERROR_CATEGORIES.grammar;
                      const isExpanded = activeCorrectionIdx === idx;

                      return (
                        <div 
                          key={corr.id || idx}
                          onMouseEnter={() => setHoveredCorrectionIdx(idx)}
                          onMouseLeave={() => setHoveredCorrectionIdx(null)}
                          className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                            isExpanded 
                              ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-400 shadow-xs' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Header of Item */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white ${catMeta.bgClass}`}>
                                {idx + 1}
                              </span>
                              <select
                                value={corr.category}
                                onChange={(e) => handleUpdateCorrection(idx, { category: e.target.value })}
                                className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-white border border-slate-300 text-slate-800 focus:outline-hidden"
                              >
                                {Object.entries(ERROR_CATEGORIES).map(([k, v]) => (
                                  <option key={k} value={k}>{v.nameVi}</option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteCorrection(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Xóa ghi chú này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Original Text */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-rose-700 uppercase">Câu gốc của học sinh:</span>
                            <input
                              type="text"
                              value={corr.original}
                              onChange={(e) => handleUpdateCorrection(idx, { original: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-serif"
                            />
                          </div>

                          {/* Corrected Text */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">👉 Câu sửa lại / Nâng cấp trực tiếp:</span>
                            <input
                              type="text"
                              value={corr.corrected}
                              onChange={(e) => handleUpdateCorrection(idx, { corrected: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-emerald-950 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-serif"
                            />
                          </div>

                          {/* Explanation */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-600 uppercase">💡 Giải thích sư phạm:</span>
                            <input
                              type="text"
                              value={corr.explanation}
                              onChange={(e) => handleUpdateCorrection(idx, { explanation: e.target.value })}
                              placeholder="Giải thích vì sao lỗi và quy tắc dùng từ chuẩn..."
                              className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded-lg text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. TEACHER'S GENERAL FEEDBACK (NHẬN XÉT TỔNG THỂ) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Nhận Xét Sư Phạm Tổng Quát Của Giáo Viên
                </h4>
                <textarea
                  rows={4}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Nhận xét tổng thể về ưu điểm, lỗi cần khắc phục và định hướng cho học sinh..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed shadow-inner"
                />
              </div>

              {/* 6. SAMPLE UPGRADE PARAGRAPH (ĐOẠN VĂN MẪU NÂNG CẤP) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Đoạn Văn Mẫu Nâng Cấp (Model Upgrade Band 8.0+)
                </span>
                <textarea
                  rows={3}
                  value={sampleUpgrade}
                  onChange={(e) => setSampleUpgrade(e.target.value)}
                  placeholder="Gợi ý một đoạn văn viết lại mẫu đạt chuẩn Band 8.0+..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-serif focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed shadow-inner"
                />
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* MODAL: ADD / EDIT CORRECTION DIALOG */}
      {showAddCorrectionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-blue-600" />
                <span>Thêm Đánh Dấu Sửa Lỗi Trong Bài</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCorrectionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Loại Lỗi Phân Loại:</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ERROR_CATEGORIES).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setNewCorrectionData(prev => ({ ...prev, category: k }))}
                      className={`p-2 rounded-xl text-left border flex items-center gap-2 cursor-pointer transition-all ${
                        newCorrectionData.category === k
                          ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold ring-1 ring-blue-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${v.bgClass} shrink-0`}></span>
                      <span className="truncate">{v.nameVi}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-rose-700 block mb-1">Từ / Câu Gốc Của Học Sinh:</label>
                <textarea
                  rows={2}
                  value={newCorrectionData.original}
                  onChange={(e) => setNewCorrectionData(prev => ({ ...prev, original: e.target.value }))}
                  placeholder="Nhập cụm từ hoặc câu sai..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-serif text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-700 block mb-1">👉 Câu Sửa Lại / Nâng Cấp Trực Tiếp:</label>
                <textarea
                  rows={2}
                  value={newCorrectionData.corrected}
                  onChange={(e) => setNewCorrectionData(prev => ({ ...prev, corrected: e.target.value }))}
                  placeholder="Nhập câu chuẩn xác hoặc từ vựng nâng cấp..."
                  className="w-full p-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl font-serif text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">💡 Giải Thích Cho Học Sinh:</label>
                <input
                  type="text"
                  value={newCorrectionData.explanation}
                  onChange={(e) => setNewCorrectionData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Vd: Cần dùng thì Quá Khứ Hoàn Thành thay vì Hiện Tại..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddCorrectionModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveNewCorrection}
                disabled={!newCorrectionData.original.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Lưu Đánh Dấu Sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE MODAL */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-white p-2 rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomImage} alt="Phóng to" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

    </div>
  );
};

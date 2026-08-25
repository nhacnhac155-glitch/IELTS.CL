import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Award, 
  BookCheck, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Volume2, 
  PenTool, 
  Clock,
  Image as ImageIcon,
  ZoomIn,
  Maximize2,
  Minimize2,
  Highlighter,
  SplitSquareVertical,
  Edit3,
  Copy,
  Check,
  Layers,
  Eye,
  Sliders,
  Percent,
  GraduationCap,
  Globe,
  Target,
  ArrowRight,
  ChevronRight,
  Filter,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { Assignment, InlineCorrection, Submission } from '../types';
import { formatDateTime, formatSecondsToTime, getBandColorClass } from '../utils/formatters';
import { SkillBadge } from './SkillBadge';
import { evaluateIeltsAnswer, getIeltsQuestionTypeMeta } from '../utils/ieltsQuestionConstants';
import { ERROR_CATEGORIES, SCORING_SYSTEMS } from './GradingModal';

interface StudentFeedbackViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  assignment?: Assignment;
}

export const StudentFeedbackViewModal: React.FC<StudentFeedbackViewModalProps> = ({
  isOpen,
  onClose,
  submission,
  assignment,
}) => {
  const isWriting = submission.assignmentSkill === 'writing';
  const isSpeaking = submission.assignmentSkill === 'speaking';
  const isObjective = submission.assignmentSkill === 'reading' || submission.assignmentSkill === 'listening';

  // Full-screen state
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [activeTab, setActiveTab] = useState<'highlight' | 'direct_edit' | 'diff'>('highlight');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Interactive error selection states
  const [activeCorrectionIdx, setActiveCorrectionIdx] = useState<number | null>(null);
  const [hoveredCorrectionIdx, setHoveredCorrectionIdx] = useState<number | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const rightPaneRef = useRef<HTMLDivElement | null>(null);
  const essayContainerRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const attachedImages = assignment?.assignmentImages && assignment.assignmentImages.length > 0
    ? assignment.assignmentImages
    : (assignment?.assignmentImageUrl ? [assignment.assignmentImageUrl] : []);

  const rawEssay = submission.essayContent || submission.speakingTranscript || '';
  const wordCount = rawEssay.split(/\s+/).filter(Boolean).length;
  const inlineCorrections = submission.inlineCorrections || [];

  // Count errors by category
  const categoryCounts = inlineCorrections.reduce((acc, curr) => {
    const cat = curr.category || 'grammar';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredCorrections = filterCategory === 'all' 
    ? inlineCorrections 
    : inlineCorrections.filter(c => (c.category || 'grammar') === filterCategory);

  const handleCopySample = () => {
    if (!submission.sampleUpgrade) return;
    navigator.clipboard.writeText(submission.sampleUpgrade);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2500);
  };

  const handleSelectCorrection = (index: number) => {
    setActiveCorrectionIdx(index);
    // Scroll right card into view
    const cardEl = document.getElementById(`corr-card-${index}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Render Highlighted Student Essay
  const renderHighlightedContent = (text: string) => {
    if (!text) return <p className="text-slate-400 italic">(Học sinh chưa nhập bài làm)</p>;
    if (inlineCorrections.length === 0) {
      return (
        <div className="whitespace-pre-line text-sm sm:text-base leading-loose text-slate-800 font-serif selection:bg-blue-200">
          {text}
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
      while ((pos = text.indexOf(target, pos)) !== -1) {
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
            {text.substring(currentIndex, seg.start)}
          </span>
        );
      }

      const catMeta = ERROR_CATEGORIES[seg.corr.category] || ERROR_CATEGORIES.grammar;
      const isActive = activeCorrectionIdx === seg.index;
      const isHovered = hoveredCorrectionIdx === seg.index;

      elements.push(
        <span
          key={`mark-${seg.index}-${i}`}
          id={`essay-highlight-${seg.index}`}
          onClick={() => handleSelectCorrection(seg.index)}
          onMouseEnter={() => setHoveredCorrectionIdx(seg.index)}
          onMouseLeave={() => setHoveredCorrectionIdx(null)}
          className={`relative inline cursor-pointer px-1 py-0.5 rounded transition-all font-medium select-text ${catMeta.highlightClass} ${
            isActive || isHovered 
              ? 'ring-2 ring-blue-600 shadow-md font-bold' 
              : ''
          }`}
          title={`Lỗi [${seg.index + 1}]: ${catMeta.nameVi} • Bấm để xem chi tiết sửa câu`}
        >
          {text.substring(seg.start, seg.end)}
          
          <span className={`inline-flex items-center justify-center ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ${catMeta.bgClass} shadow-2xs`}>
            {seg.index + 1}
          </span>
        </span>
      );

      currentIndex = seg.end;
    });

    if (currentIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.substring(currentIndex)}
        </span>
      );
    }

    return (
      <div 
        ref={essayContainerRef}
        className="whitespace-pre-line text-sm sm:text-base leading-loose text-slate-900 font-serif selection:bg-blue-200 tracking-wide"
      >
        {elements}
      </div>
    );
  };

  // Determine current score display
  const scoringSystem = submission.scoringSystem || 'ielts_band';
  const scoreBadgeText = submission.scoreDisplay 
    ? submission.scoreDisplay 
    : scoringSystem === 'scale_10' && submission.score10 
    ? `${submission.score10.toFixed(1)} / 10`
    : scoringSystem === 'scale_100' && submission.score100
    ? `${submission.score100} / 100`
    : scoringSystem === 'letter_grade' && submission.letterGrade
    ? `Grade ${submission.letterGrade}`
    : scoringSystem === 'cefr' && submission.cefrLevel
    ? `CEFR ${submission.cefrLevel}`
    : `Band ${submission.overallBand?.toFixed(1) || '6.5'}`;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex flex-col ${isFullscreen ? 'w-screen h-screen' : 'p-2 sm:p-4'}`}>
      <div 
        className={`bg-slate-50 text-slate-800 flex flex-col overflow-hidden shadow-2xl transition-all ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-7xl max-h-[96vh] rounded-2xl mx-auto border border-slate-200'
        }`}
        role="dialog"
        aria-modal="true"
      >
        
        {/* ================= BRIGHT HEADER TOOLBAR ================= */}
        <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap shadow-xs">
          
          {/* Left: Student info, Skill badge & Scores */}
          <div className="flex items-center gap-3">
            <img
              src={submission.studentAvatar}
              alt={submission.studentName}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shrink-0 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Kết Quả & Bảng Chấm Điểm: {submission.studentName}
                </h2>
                <SkillBadge skill={submission.assignmentSkill} />
                <span className="px-2.5 py-0.5 text-xs font-black rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {scoreBadgeText}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {submission.assignmentTitle} • Chấm bởi {submission.gradedBy || 'Giáo viên'} • {formatSecondsToTime(submission.timeSpentSeconds)} ({wordCount} từ)
              </p>
            </div>
          </div>

          {/* Center: Live Error Counts */}
          {inlineCorrections.length > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 px-2">Lỗi:</span>
              {Object.entries(ERROR_CATEGORIES).map(([catKey, catMeta]) => {
                const count = categoryCounts[catKey] || 0;
                if (count === 0) return null;
                const isFiltered = filterCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setFilterCategory(isFiltered ? 'all' : catKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isFiltered 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-400'
                    }`}
                    title={`Lọc xem lỗi ${catMeta.nameVi}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${catMeta.bgClass}`}></span>
                    <span>{catMeta.badge}</span>
                    <span className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${isFiltered ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
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
              title="Đóng bảng kết quả"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ================= DUAL-PANE SPLIT WORKSPACE ================= */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-100">
          
          {/* ================= LEFT PANE (7 COLS): Essay & Highlight View ================= */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden bg-white">
            
            {/* Sub-Header Toolbar */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Bài Làm Học Sinh & Highlight Lỗi
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                  {wordCount} từ
                </span>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('highlight')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'highlight' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Xem bài gốc có highlight lỗi trực quan"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Highlight Màu Lỗi</span>
                </button>

                {submission.teacherEditedContent && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('direct_edit')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'direct_edit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Xem bản bài viết đã được giáo viên chỉnh sửa hoàn chỉnh"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Bản Sửa Của GV</span>
                  </button>
                )}

                {submission.teacherEditedContent && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('diff')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'diff' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="So sánh bài gốc và bài giáo viên đã sửa"
                  >
                    <SplitSquareVertical className="w-3.5 h-3.5" />
                    <span>So Sánh (Diff)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Left Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              
              {/* Prompt Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Đề Bài / Task Prompt</span>
                  {assignment?.taskType && (
                    <span className="text-blue-700 font-mono text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {assignment.taskType}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {assignment?.writingPrompt || assignment?.readingPassage?.slice(0, 300) || assignment?.speakingCueCard?.topic || assignment?.title || submission.assignmentTitle}
                </p>

                {/* Attached Diagram / Sơ đồ */}
                {attachedImages.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-blue-600" />
                      Biểu đồ đề bài ({attachedImages.length} ảnh):
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

              {/* Mode 1: Highlight Mode */}
              {activeTab === 'highlight' && (
                <div className="space-y-3">
                  
                  {/* Legend guide bar */}
                  <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-xs flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                      <span>Bấm vào vùng màu để xem phân tích sửa lỗi tương ứng:</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold">🔴 GRA</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">🟠 LR</span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-bold">🔵 CC</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold">🟣 TR</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">🟢 SP</span>
                    </div>
                  </div>

                  {/* Main Highlighted Essay Box */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[380px]">
                    {renderHighlightedContent(rawEssay)}
                  </div>

                  {/* Audio Recording for Speaking */}
                  {isSpeaking && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                          File Ghi Âm Của Bạn ({submission.audioDurationSeconds || 120}s)
                        </span>
                        <span className="text-xs text-emerald-700 font-mono font-bold">01:58</span>
                      </div>
                      <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full w-2/3"></div>
                      </div>
                    </div>
                  )}

                  {/* Objective Questions Review (Reading/Listening) */}
                  {isObjective && assignment?.questions && assignment.questions.length > 0 && submission.answers && (
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Chi Tiết Đáp Án ({assignment.questions.length} câu)
                        </span>
                        {submission.rawScore !== undefined && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                            Đúng {submission.rawScore}/{assignment.questions.length} câu
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {assignment.questions.map((q, idx) => {
                          const qNum = String(idx + 1);
                          const studentAns = submission.answers[q.id] || submission.answers[qNum] || submission.answers[q.id.replace('q-', '')] || '(Chưa trả lời)';
                          const { isCorrect } = evaluateIeltsAnswer(q, studentAns);
                          const qConfig = getIeltsQuestionTypeMeta(q.type);

                          return (
                            <div 
                              key={q.id} 
                              className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                                isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`w-5 h-5 rounded-full font-bold text-[11px] flex items-center justify-center ${
                                    isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${qConfig.badgeColor}`}>
                                    {qConfig.badge || qConfig.title}
                                  </span>
                                  <span className="font-semibold text-slate-900">{q.questionText}</span>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {isCorrect ? '✓ CHÍNH XÁC' : '✗ CHƯA ĐÚNG'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Bạn đã chọn:</span>
                                  <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {studentAns}
                                  </span>
                                </div>
                                {q.correctAnswer && (
                                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Đáp án chuẩn:</span>
                                    <span className="font-semibold text-emerald-700">
                                      {q.correctAnswer}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {q.explanation && (
                                <div className="p-2 bg-blue-50/70 rounded-lg text-slate-600 text-[11px] leading-relaxed border border-blue-100">
                                  💡 <strong>Giải thích:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Mode 2: Direct Teacher Edit */}
              {activeTab === 'direct_edit' && submission.teacherEditedContent && (
                <div className="p-5 bg-white rounded-2xl border border-emerald-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Bản Bài Viết Đã Được Giáo Viên Chỉnh Sửa &amp; Nâng Cấp Hoàn Chỉnh:
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {submission.teacherEditedContent.split(/\s+/).filter(Boolean).length} từ
                    </span>
                  </div>
                  <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 text-sm font-serif leading-loose text-slate-900 whitespace-pre-line">
                    {submission.teacherEditedContent}
                  </div>
                </div>
              )}

              {/* Mode 3: Diff Comparison */}
              {activeTab === 'diff' && submission.teacherEditedContent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Bản Gốc Của Bạn</span>
                      <span className="font-mono text-[11px]">({wordCount} từ)</span>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs sm:text-sm text-slate-800 font-serif leading-relaxed whitespace-pre-line h-[460px] overflow-y-auto shadow-xs">
                      {rawEssay}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Bản Giáo Viên Đã Sửa</span>
                      <span className="font-mono text-[11px]">({submission.teacherEditedContent.split(/\s+/).filter(Boolean).length} từ)</span>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-emerald-300 text-xs sm:text-sm text-slate-900 font-serif leading-relaxed whitespace-pre-line h-[460px] overflow-y-auto shadow-xs">
                      {submission.teacherEditedContent}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ================= RIGHT PANE (5 COLS): Scores, Error Breakdown & Teacher Feedback ================= */}
          <div ref={rightPaneRef} className="lg:col-span-5 flex flex-col overflow-hidden bg-slate-50">
            
            {/* Right Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {/* 1. OVERALL SCORE CARD BANNER */}
              <div className="p-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-blue-100 font-bold">
                    {submission.scoringSystem === 'scale_10' && 'Thang Điểm 10 (Chuẩn VN)'}
                    {submission.scoringSystem === 'scale_100' && 'Thang Điểm 100 / %'}
                    {submission.scoringSystem === 'letter_grade' && 'Thang Điểm Chữ (Letter Grade)'}
                    {submission.scoringSystem === 'cefr' && 'Khung Năng Lực CEFR'}
                    {submission.scoringSystem === 'toeic_scale' && 'Thang Điểm TOEIC'}
                    {(!submission.scoringSystem || submission.scoringSystem === 'ielts_band') && 'IELTS Band Score'}
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-white/20 text-white border border-white/30">
                    Target Band {assignment?.targetBand || '6.5+'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                    {scoreBadgeText}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">
                      Chấm bởi: {submission.gradedBy || 'Giáo viên'}
                    </p>
                    <p className="text-[11px] text-blue-200">
                      Thời gian: {formatSecondsToTime(submission.timeSpentSeconds)} (Giới hạn: {submission.timeLimitMinutes || 40}p)
                    </p>
                  </div>
                </div>

                {/* Breakdown criteria badges */}
                {submission.customCriteriaScores && submission.customCriteriaScores.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2 border-t border-white/20">
                    {submission.customCriteriaScores.map((c, i) => (
                      <div key={i} className="bg-white/10 p-2 rounded-xl border border-white/10">
                        <span className="text-[10px] text-blue-100 block truncate" title={c.nameVi}>{c.nameVi.split(' ')[0]}</span>
                        <span className="text-sm font-bold font-mono text-white">
                          {c.score}/{c.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : submission.criteriaScores ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2 border-t border-white/20">
                    <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-blue-100 block">TR / TA</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {submission.criteriaScores.taskAchievement?.toFixed(1) || '—'}
                      </span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-blue-100 block">CC</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {submission.criteriaScores.coherenceCohesion?.toFixed(1) || '—'}
                      </span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-blue-100 block">LR</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {submission.criteriaScores.lexicalResource?.toFixed(1) || '—'}
                      </span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-blue-100 block">GRA / PR</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {submission.criteriaScores.grammarAccuracy?.toFixed(1) || submission.criteriaScores.pronunciation?.toFixed(1) || '—'}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* 2. ERROR BREAKDOWN & INLINE CORRECTIONS (DANH SÁCH LỖI & SỬA CÂU CHI TIẾT) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BookCheck className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Phân Tích Lỗi &amp; Sửa Câu ({inlineCorrections.length} lỗi)
                    </h3>
                  </div>

                  {/* Filter category dropdown / pill selector */}
                  {inlineCorrections.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="all">Tất cả danh mục ({inlineCorrections.length})</option>
                        {Object.entries(ERROR_CATEGORIES).map(([catKey, catMeta]) => {
                          const c = categoryCounts[catKey] || 0;
                          return (
                            <option key={catKey} value={catKey}>
                              {catMeta.nameVi} ({c})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                {/* Corrections List */}
                {filteredCorrections.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    {inlineCorrections.length === 0 
                      ? 'Bài làm xuất sắc không có ghi chú lỗi nào!' 
                      : 'Không có lỗi nào thuộc danh mục này.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCorrections.map((corr, idx) => {
                      const realIndex = inlineCorrections.findIndex(c => c.id === corr.id || (c.original === corr.original && c.corrected === corr.corrected));
                      const displayIdx = realIndex !== -1 ? realIndex : idx;
                      const catMeta = ERROR_CATEGORIES[corr.category] || ERROR_CATEGORIES.grammar;
                      const isSelected = activeCorrectionIdx === displayIdx;
                      const isHovered = hoveredCorrectionIdx === displayIdx;

                      return (
                        <div
                          key={corr.id || idx}
                          id={`corr-card-${displayIdx}`}
                          onClick={() => handleSelectCorrection(displayIdx)}
                          onMouseEnter={() => setHoveredCorrectionIdx(displayIdx)}
                          onMouseLeave={() => setHoveredCorrectionIdx(null)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                            isSelected || isHovered 
                              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/30 shadow-md' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full text-[11px] font-black text-white flex items-center justify-center ${catMeta.bgClass} shadow-2xs`}>
                                {displayIdx + 1}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catMeta.badgeBg}`}>
                                {catMeta.nameVi}
                              </span>
                            </div>
                            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                              <span>Xem vị trí</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>

                          {/* Original Text */}
                          <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs">
                            <span className="text-[10px] font-bold text-rose-600 uppercase block tracking-wider">
                              ❌ Câu gốc học sinh:
                            </span>
                            <p className="font-serif text-rose-950 font-semibold line-through decoration-rose-500 decoration-2 mt-0.5">
                              "{corr.original}"
                            </p>
                          </div>

                          {/* Corrected & Upgraded Text */}
                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">
                              👉 Đề xuất sửa / Nâng cấp Band 8.0+:
                            </span>
                            <p className="font-serif text-emerald-950 font-bold mt-0.5">
                              "{corr.corrected}"
                            </p>
                          </div>

                          {/* Explanation */}
                          {corr.explanation && (
                            <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                              💡 <strong className="text-slate-800 font-bold">Giải thích:</strong> {corr.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. TEACHER DETAILED FEEDBACK */}
              {submission.teacherFeedback && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    💬 Lời Nhận Xét Chi Tiết Của Giáo Viên:
                  </span>
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs sm:text-sm text-slate-800 leading-relaxed italic font-serif">
                    "{submission.teacherFeedback}"
                  </div>
                </div>
              )}

              {/* 4. STRENGTHS & WEAKNESSES */}
              {(submission.strengths || submission.weaknesses) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {submission.strengths && submission.strengths.length > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                        ✓ Điểm Làm Tốt
                      </span>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                        {submission.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {submission.weaknesses && submission.weaknesses.length > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">
                        ⚠ Lưu Ý Cải Thiện
                      </span>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                        {submission.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 5. SAMPLE ESSAY UPGRADE (BAND 8.0+) */}
              {submission.sampleUpgrade && (
                <div className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50/60 rounded-2xl border border-violet-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-violet-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      Đoạn Văn Mẫu Nâng Cấp (Band 8.0+)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySample}
                      className="px-2 py-1 bg-white hover:bg-violet-100 text-violet-800 text-[11px] font-bold rounded-lg border border-violet-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      {copiedSample ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSample ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-violet-950 font-serif leading-relaxed italic bg-white/80 p-3 rounded-xl border border-violet-100">
                    "{submission.sampleUpgrade}"
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Zoom Image Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl max-h-[92vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomImage}
              alt="Phóng to ảnh đề bài"
              className="max-h-[86vh] w-auto max-w-full object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

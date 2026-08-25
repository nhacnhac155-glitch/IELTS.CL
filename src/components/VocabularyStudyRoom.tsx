import React, { useState, useEffect } from 'react';
import { 
  BookA, 
  Volume2, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Search, 
  HelpCircle, 
  Check, 
  X, 
  BookOpen, 
  ListChecks, 
  Shuffle,
  Send,
  Clock,
  ImageIcon,
  ZoomIn,
  Eye,
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Assignment, Question, Student, Submission, VocabularyItem } from '../types';
import { IeltsAnswerSheet } from './IeltsAnswerSheet';
import confetti from 'canvas-confetti';
import { formatSecondsToTime } from '../utils/formatters';

interface VocabularyStudyRoomProps {
  assignment: Assignment;
  student: Student;
  onClose: () => void;
  onSubmit: (submission: Submission) => void;
  timeSpentSeconds: number;
}

export const VocabularyStudyRoom: React.FC<VocabularyStudyRoomProps> = ({
  assignment,
  student,
  onClose,
  onSubmit,
  timeSpentSeconds,
}) => {
  const hasFreeformContent = Boolean(assignment.questionsContent?.trim());
  const hasAnswerKeyList = Boolean(assignment.answerKeyList && assignment.answerKeyList.length > 0);
  const totalFreeformCount = assignment.answerKeyList?.length || 0;

  // Attached diagrams/images
  const attachedImages = assignment.assignmentImages && assignment.assignmentImages.length > 0
    ? assignment.assignmentImages
    : (assignment.assignmentImageUrl ? [assignment.assignmentImageUrl] : []);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Vocabulary List from assignment, with fallback if empty
  const hasExplicitVocabList = Boolean(assignment.vocabularyList && assignment.vocabularyList.length > 0);
  const vocabList: VocabularyItem[] = hasExplicitVocabList
    ? (assignment.vocabularyList || [])
    : [
        {
          id: 'v-fb-1',
          word: 'unprecedented',
          phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
          partOfSpeech: 'adjective',
          vietnameseMeaning: 'chưa từng có tiền lệ, chưa từng thấy trước đây',
          englishDefinition: 'Never having happened or existed in the past.',
          exampleSentence: 'The coastal cities are facing unprecedented levels of sea rise due to global warming.',
          collocations: ['unprecedented scale', 'unprecedented challenge', 'unprecedented rate of growth'],
          synonyms: ['unparalleled', 'exceptional', 'unrivaled'],
          band: '8.0'
        },
        {
          id: 'v-fb-2',
          word: 'biodiversity',
          phonetic: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
          partOfSpeech: 'noun',
          vietnameseMeaning: 'đa dạng sinh học',
          englishDefinition: 'The number and types of plants and animals that exist in a particular area.',
          exampleSentence: 'Deforestation poses an existential threat to the rich biodiversity of tropical rainforests.',
          collocations: ['preserve biodiversity', 'loss of biodiversity', 'marine biodiversity'],
          synonyms: ['ecological diversity', 'biological variety'],
          band: '7.5'
        },
        {
          id: 'v-fb-3',
          word: 'mitigate',
          phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
          partOfSpeech: 'verb',
          vietnameseMeaning: 'giảm nhẹ, xoa dịu, giảm thiểu tác hại',
          englishDefinition: 'To make something less harmful, unpleasant, or bad.',
          exampleSentence: 'Governments must implement stringent policies to mitigate the adverse effects of carbon emissions.',
          collocations: ['mitigate the impact', 'mitigate climate change', 'mitigate environmental risks'],
          synonyms: ['alleviate', 'lessen', 'diminish'],
          band: '8.0'
        }
      ];

  const [activeMode, setActiveMode] = useState<'flashcards' | 'quiz' | 'list'>(
    hasFreeformContent && !hasExplicitVocabList ? 'quiz' : 'flashcards'
  );
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  // Quiz state
  const questions = assignment.questions && assignment.questions.length > 0
    ? assignment.questions
    : [
        {
          id: 'q_voc_default_1',
          type: 'multiple_choice' as const,
          questionText: `Từ nào đồng nghĩa với "${vocabList[0]?.word || 'unprecedented'}"?`,
          options: ['A. Unparalleled', 'B. Conventional', 'C. Ordinary', 'D. Mundane'],
          correctAnswer: 'A. Unparalleled',
          explanation: 'Mang nghĩa chưa từng có tiền lệ, phi thường.'
        }
      ];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Audio Speech Pronunciation using Web Speech API
  const speakWord = (word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-GB'; // British English for IELTS
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard navigation for flashcards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMode !== 'flashcards') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, currentCardIndex, vocabList.length]);

  const currentWord = vocabList[currentCardIndex] || vocabList[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < vocabList.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    } else {
      setCurrentCardIndex(vocabList.length - 1);
    }
  };

  const markMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newMastered = new Set(masteredIds);
    const newReview = new Set(reviewIds);
    newMastered.add(id);
    newReview.delete(id);
    setMasteredIds(newMastered);
    setReviewIds(newReview);
    handleNextCard();
  };

  const markNeedReview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newMastered = new Set(masteredIds);
    const newReview = new Set(reviewIds);
    newReview.add(id);
    newMastered.delete(id);
    setMasteredIds(newMastered);
    setReviewIds(newReview);
    handleNextCard();
  };

  // Quiz / Freeform Score Calculation
  const calculateScore = () => {
    let correctCount = 0;
    if (hasAnswerKeyList && assignment.answerKeyList) {
      assignment.answerKeyList.forEach((item) => {
        const qKey = String(item.questionNumber);
        const userAns = (answers[qKey] || answers[`q-${item.questionNumber}`] || '').trim().toLowerCase();
        const correctStr = (item.correctAnswer || '').trim().toLowerCase();
        const possibleAnswers = correctStr.split(/[\/\;\,]/).map((a) => a.trim().toLowerCase()).filter(Boolean);
        if (userAns && (userAns === correctStr || possibleAnswers.includes(userAns) || possibleAnswers.some((ans) => ans.length > 1 && userAns.startsWith(ans.charAt(0))))) {
          correctCount++;
        }
      });
      return correctCount;
    }

    questions.forEach((q) => {
      const userAns = (answers[q.id] || answers[q.id.replace('q-', '')] || '').trim().toLowerCase();
      const correctAns = Array.isArray(q.correctAnswer) ? q.correctAnswer.join('/') : (q.correctAnswer || '');
      const correctLower = correctAns.trim().toLowerCase();
      const possibleAnswers = correctLower.split(/[\/\;\,]/).map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (userAns && (userAns === correctLower || possibleAnswers.includes(userAns) || (q.type === 'multiple_choice' && correctLower && userAns.startsWith(correctLower.charAt(0))))) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const correctAnswersCount = calculateScore();
  const rawScore = correctAnswersCount;
  const maxRawScore = hasAnswerKeyList ? totalFreeformCount : questions.length;
  const scorePercent = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 100) : 100;

  // Convert quiz performance to estimated IELTS band for vocabulary
  const calculateEstimatedBand = (): number => {
    if (maxRawScore === 0) return 7.5;
    const ratio = rawScore / maxRawScore;
    if (ratio >= 0.9) return 8.5;
    if (ratio >= 0.8) return 8.0;
    if (ratio >= 0.7) return 7.5;
    if (ratio >= 0.5) return 6.5;
    return 6.0;
  };

  const handleFinalSubmit = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const calculatedBand = calculateEstimatedBand();

    const submission: Submission = {
      id: `sub-voc-${Date.now()}`,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      assignmentSkill: 'vocabulary',
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds,
      timeLimitMinutes: assignment.timeLimitMinutes,
      status: 'graded',
      answers,
      rawScore,
      maxRawScore,
      overallBand: calculatedBand,
      criteriaScores: {
        lexicalResource: calculatedBand,
        taskAchievement: Math.min(9.0, calculatedBand + 0.5),
        coherenceCohesion: calculatedBand,
        grammarAccuracy: calculatedBand,
      },
      teacherFeedback: `Học sinh đã hoàn thành bài luyện tập từ vựng "${assignment.title}". Đạt kết quả ${rawScore}/${maxRawScore} câu chính xác (${scorePercent}%). Hãy tiếp tục áp dụng các collocations và word forms này vào Writing và Speaking nhé!`,
      strengths: [
        `Ghi nhớ tốt vốn từ vựng học thuật chủ đề ${assignment.vocabularyTopic || 'IELTS'}`,
        `Đạt độ chính xác ${scorePercent}% trong phần kiểm tra ngữ cảnh và collocations`,
        `Chủ động luyện phát âm và sử dụng chính xác dạng từ`
      ],
      weaknesses: reviewIds.size > 0 ? [
        `Còn ${reviewIds.size} từ cần ôn tập lại để nhớ sâu hơn trước khi bước vào phòng thi.`
      ] : [
        `Cần thực hành thêm việc đặt câu phức với các từ vựng Band 8.0+.`
      ],
      gradedByTeacher: false, // Auto graded
      gradedAt: new Date().toISOString(),
      gradedBy: 'AI Vocabulary Master & Celina Phạm'
    };

    onSubmit(submission);
  };

  // Filtered list for list view
  const filteredVocab = vocabList.filter(
    (v) => 
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vietnameseMeaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.englishDefinition && v.englishDefinition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col w-full h-full overflow-hidden">
      
      {/* Top Header Bar */}
      <header className="bg-slate-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Thoát Phòng Học</span>
          </button>
          
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600/30 border border-teal-500/50 flex items-center justify-center text-teal-400">
              <BookA className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                {assignment.title}
              </h2>
              <span className="text-[11px] text-teal-400 font-medium">
                Chủ đề: {assignment.vocabularyTopic || 'IELTS Academic Vocabulary'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Time Spent Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{formatSecondsToTime(timeSpentSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Bài</span>
          </button>
        </div>
      </header>

      {/* Mode Navigation Tabs */}
      <div className="bg-slate-100 px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          {hasExplicitVocabList && (
            <button
              type="button"
              onClick={() => setActiveMode('flashcards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'flashcards'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Thẻ Flashcard ({vocabList.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveMode('quiz')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'quiz'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>
              {hasFreeformContent 
                ? `Đề Bài & Phiếu Trả Lời (${maxRawScore} câu)` 
                : `Bài Luyện Tập (${questions.length} câu)`}
            </span>
          </button>

          {hasExplicitVocabList && (
            <button
              type="button"
              onClick={() => setActiveMode('list')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'list'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bảng Tra Từ Vựng</span>
            </button>
          )}
        </div>

        {/* Mastered Progress Indicator */}
        <div className="flex items-center gap-3">
          {hasExplicitVocabList && (
            <div className="flex items-center gap-2 text-xs font-semibold hidden sm:flex">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Đã thuộc: {masteredIds.size}/{vocabList.length}
              </span>
              {reviewIds.size > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Ôn lại: {reviewIds.size}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Hoàn Thành & Nộp Bài</span>
          </button>
        </div>
      </div>

      {/* Main Mode Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
        
        {/* ================= 1. FLASHCARD MODE ================= */}
        {activeMode === 'flashcards' && (
          <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl space-y-6 my-auto">
              
              {/* Progress Bar & Counter */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
                <span>
                  Thẻ từ {currentCardIndex + 1} / {vocabList.length}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400">Phím tắt: Space để lật thẻ • Phím mũi tên để chuyển</span>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentCardIndex + 1) / vocabList.length) * 100}%` }}
                />
              </div>

              {/* The Flashcard Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full min-h-[380px] sm:min-h-[420px] bg-white rounded-3xl border-2 border-teal-200 shadow-xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-teal-400 flex flex-col justify-between select-none group"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                      {currentWord.partOfSpeech || 'Word'}
                    </span>
                    {currentWord.band && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Band {currentWord.band}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Phát âm chuẩn IPA"
                      onClick={(e) => speakWord(currentWord.word, e)}
                      className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-transform active:scale-95"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                      {isFlipped ? 'Mặt sau (Nghĩa & Ví dụ)' : 'Bấm để lật thẻ'}
                    </span>
                  </div>
                </div>

                {/* Card Center Content */}
                {!isFlipped ? (
                  /* FRONT OF CARD */
                  <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                    <span className="text-xs font-bold tracking-widest text-teal-600 uppercase">
                      IELTS Academic Keyword
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
                      {currentWord.word}
                    </h2>
                    {currentWord.phonetic && (
                      <span className="text-sm sm:text-base font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                        {currentWord.phonetic}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 italic pt-4">
                      💡 Thử nhớ lại nghĩa tiếng Việt, collocations và câu ví dụ trước khi lật thẻ!
                    </p>
                  </div>
                ) : (
                  /* BACK OF CARD */
                  <div className="space-y-4 py-2 text-left animate-in fade-in zoom-in-95 duration-200">
                    <div>
                      <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
                        Nghĩa Tiếng Việt:
                      </span>
                      <p className="text-base sm:text-lg font-bold text-slate-900">
                        {currentWord.vietnameseMeaning}
                      </p>
                    </div>

                    {currentWord.englishDefinition && (
                      <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-700">
                        <span className="font-bold text-teal-900 block mb-0.5">English Definition:</span>
                        <p className="italic">{currentWord.englishDefinition}</p>
                      </div>
                    )}

                    {currentWord.exampleSentence && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          IELTS Context Example:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                          "{currentWord.exampleSentence}"
                        </p>
                      </div>
                    )}

                    {currentWord.collocations && currentWord.collocations.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                          High-scoring Collocations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentWord.collocations.map((col, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={(e) => markNeedReview(currentWord.id, e)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      reviewIds.has(currentWord.id)
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cần ôn lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => markMastered(currentWord.id, e)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      masteredIds.has(currentWord.id)
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã thuộc từ này</span>
                  </button>
                </div>
              </div>

              {/* Navigation Buttons (Prev / Next) */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Từ trước</span>
                </button>

                <div className="flex items-center gap-1">
                  {vocabList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(idx);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        currentCardIndex === idx
                          ? 'w-6 bg-teal-600'
                          : masteredIds.has(vocabList[idx]?.id)
                          ? 'bg-emerald-400'
                          : reviewIds.has(vocabList[idx]?.id)
                          ? 'bg-amber-400'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextCard}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Từ tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= 2. QUIZ / FREEFORM TEST MODE ================= */}
        {activeMode === 'quiz' && (
          hasFreeformContent ? (
            /* Split Screen IELTS Layout: Left = Freeform Questions & Tables & Images, Right = IELTS Answer Sheet */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
              
              {/* Left Column: Questions Paper */}
              <div className="lg:col-span-7 xl:col-span-8 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white border-r border-slate-200 space-y-6">
                
                {/* Header Banner */}
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      Đề Bài Tập Từ Vựng & Bảng Biểu IELTS
                    </h3>
                    <p className="text-xs text-teal-800/80 mt-0.5">
                      Đọc kỹ yêu cầu câu hỏi, bảng biểu và điền đáp án tương ứng vào Phiếu Trả Lời bên phải
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuizResults(!showQuizResults)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white border border-teal-300 text-teal-800 shadow-2xs hover:bg-teal-100 transition-colors"
                    >
                      {showQuizResults ? 'Ẩn so sánh đáp án' : 'Xem đáp án mẫu'}
                    </button>
                  </div>
                </div>

                {/* Attached Diagrams/Images Gallery */}
                {attachedImages.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-teal-600" />
                        Hình ảnh / Biểu đồ đính kèm ({attachedImages.length} hình ảnh):
                      </span>
                      <span className="text-[11px] text-teal-600 font-medium">Bấm vào hình để xem phóng to</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {attachedImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setZoomImage(imgUrl)}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Hình ảnh đề bài ${idx + 1}`}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1 font-medium">
                            <ZoomIn className="w-4 h-4" />
                            <span>Phóng to</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Markdown Question Paper with Tables */}
                <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-800 prose-p:leading-relaxed prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:bg-teal-50/70 prose-th:p-2.5 prose-th:text-xs prose-th:font-bold prose-th:text-teal-950 prose-td:border prose-td:border-slate-200 prose-td:p-2.5 prose-td:text-xs prose-td:text-slate-800 font-sans text-xs sm:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {assignment.questionsContent || ''}
                  </ReactMarkdown>
                </div>

                {/* Instant Review Section when showQuizResults is true */}
                {showQuizResults && hasAnswerKeyList && (
                  <div className="p-5 bg-teal-50/70 rounded-2xl border border-teal-300 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-teal-600" />
                      Bảng Đáp Án Chuẩn & Giải Thích ({assignment.answerKeyList?.length} câu)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {assignment.answerKeyList?.map((item) => {
                        const userAns = (answers[String(item.questionNumber)] || '').trim();
                        const correctStr = (item.correctAnswer || '').trim();
                        const possibleAnswers = correctStr.split(/[\/\;\,]/).map((a) => a.trim().toLowerCase()).filter(Boolean);
                        const isCorrect = Boolean(
                          userAns && (
                            userAns.toLowerCase() === correctStr.toLowerCase() ||
                            possibleAnswers.includes(userAns.toLowerCase()) ||
                            possibleAnswers.some((ans) => ans.length > 1 && userAns.toLowerCase().startsWith(ans.charAt(0)))
                          )
                        );

                        return (
                          <div 
                            key={item.questionNumber} 
                            className={`p-3 rounded-xl border ${
                              isCorrect ? 'bg-emerald-50/80 border-emerald-300' : 'bg-rose-50/80 border-rose-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 font-bold mb-1">
                              <span className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">
                                  {item.questionNumber}
                                </span>
                                <span>Đáp án: <span className="text-teal-900 font-mono">{item.correctAnswer}</span></span>
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                              }`}>
                                {isCorrect ? '✓ Đúng' : '✕ Chưa đúng'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Bạn đã điền: <strong>{userAns || '(Chưa điền)'}</strong>
                            </div>
                            {item.explanation && (
                              <div className="text-[10px] text-slate-500 mt-1 italic">
                                💡 {item.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: IELTS Answer Sheet */}
              <div className="lg:col-span-5 xl:col-span-4 h-full bg-white flex flex-col">
                <IeltsAnswerSheet
                  totalQuestions={maxRawScore}
                  answers={answers}
                  onAnswerChange={(qKey, val) => {
                    setAnswers((prev) => ({ ...prev, [qKey]: val }));
                  }}
                  answerKeyList={assignment.answerKeyList}
                  skill="vocabulary"
                  themeColor="teal"
                />
              </div>

            </div>
          ) : (
            /* Fallback Legacy Quiz Layout */
            <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-start">
              <div className="w-full max-w-3xl space-y-6">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-teal-600" />
                      Bài Luyện Tập Trắc Nghiệm Từ Vựng
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Làm bài để kiểm tra khả năng vận dụng ngữ cảnh và từ đồng nghĩa
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                      Đã làm: {Object.keys(answers).length} / {questions.length} câu
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQuizResults(!showQuizResults)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {showQuizResults ? 'Ẩn đáp án' : 'Xem kết quả tức thì'}
                    </button>
                  </div>
                </div>

                {/* Questions list */}
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const userAns = answers[q.id];
                    const isAnswered = Boolean(userAns);
                    const correctAnsStr = Array.isArray(q.correctAnswer) ? q.correctAnswer.join('/') : (q.correctAnswer || '');
                    const isCorrect = Boolean(userAns && correctAnsStr && (
                      userAns.trim().toLowerCase() === correctAnsStr.trim().toLowerCase() ||
                      userAns.trim().toLowerCase().startsWith(correctAnsStr.trim().toLowerCase().charAt(0))
                    ));

                    return (
                      <div key={q.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              {q.questionText}
                            </p>
                          </div>

                          {showQuizResults && isAnswered && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isCorrect ? 'Chính xác ✓' : 'Chưa đúng ✕'}
                            </span>
                          )}
                        </div>

                        {/* Options (MCQ) */}
                        {q.type === 'multiple_choice' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = answers[q.id] === opt;
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-1 ring-teal-500'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Fill blank */}
                        {q.type === 'fill_blank' && (
                          <div className="pl-8">
                            <input
                              type="text"
                              placeholder="Nhập từ vựng cần điền..."
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                              className="w-full sm:w-80 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                            />
                          </div>
                        )}

                        {/* True False */}
                        {q.type === 'true_false_ng' && (
                          <div className="flex gap-2 pl-8">
                            {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  answers[q.id] === opt
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Explanation */}
                        {showQuizResults && q.explanation && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 ml-8">
                            <span className="font-bold text-slate-700">💡 Giải thích & Đáp án:</span>
                            <p>{q.explanation}</p>
                            {q.correctAnswer && (
                              <p className="font-semibold text-teal-700">Đáp án đúng: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : q.correctAnswer}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

        {/* ================= 3. WORD LIST CHEATSHEET MODE ================= */}
        {activeMode === 'list' && (
          <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-start">
            <div className="w-full max-w-4xl space-y-4">
              
              {/* Search filter bar */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm từ vựng, nghĩa tiếng Việt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <span className="text-xs text-slate-500 font-semibold">
                  Hiển thị {filteredVocab.length} / {vocabList.length} từ
                </span>
              </div>

              {/* Vocabulary Table / Cards */}
              <div className="space-y-3">
                {filteredVocab.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-colors space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-base font-black text-slate-900 font-serif">
                          {item.word}
                        </h4>
                        {item.phonetic && (
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.phonetic}
                          </span>
                        )}
                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {item.partOfSpeech || 'noun'}
                        </span>
                        {item.band && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Band {item.band}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => speakWord(item.word)}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 flex items-center gap-1 text-xs font-semibold self-start sm:self-auto cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe phát âm</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      <span className="text-slate-500 font-normal">Nghĩa: </span>
                      {item.vietnameseMeaning}
                    </p>

                    {item.englishDefinition && (
                      <p className="text-xs text-slate-600 italic">
                        {item.englishDefinition}
                      </p>
                    )}

                    {item.exampleSentence && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-serif">
                        "{item.exampleSentence}"
                      </div>
                    )}

                    {item.collocations && item.collocations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-500">Collocations:</span>
                        {item.collocations.map((c, cIdx) => (
                          <span key={cIdx} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Confirmation & Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Hoàn Thành Bài Học Vocabulary</h3>
              <p className="text-xs text-slate-500">
                Thời gian làm bài: <strong>{formatSecondsToTime(timeSpentSeconds)}</strong>
              </p>
            </div>

            {/* Quick summary box */}
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2 text-xs text-teal-900">
              {hasExplicitVocabList && (
                <div className="flex items-center justify-between">
                  <span>Số từ vựng đã thuộc:</span>
                  <strong className="font-bold">{masteredIds.size} / {vocabList.length} từ</strong>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Câu hỏi đã trả lời:</span>
                <strong className="font-bold">{Object.keys(answers).filter(k => Boolean((answers[k] || '').trim())).length} / {maxRawScore} câu</strong>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-teal-200">
                <span>Ước lượng Band điểm Vocab:</span>
                <strong className="font-bold text-sm text-teal-800">Band {calculateEstimatedBand().toFixed(1)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Học tiếp
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp Kết Quả Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-70 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 text-white text-sm font-bold bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 hover:bg-slate-700"
            >
              ✕ Đóng (Esc)
            </button>
            <img
              src={zoomImage}
              alt="Hình ảnh phóng to"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}

    </div>
  );
};

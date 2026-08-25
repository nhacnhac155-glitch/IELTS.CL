import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  Send, 
  Save, 
  CheckCircle2, 
  Mic, 
  Square, 
  Play, 
  RotateCcw, 
  BookOpen, 
  PenTool, 
  Headphones, 
  HelpCircle,
  FileText,
  Highlighter,
  Image as ImageIcon,
  ZoomIn,
  Eye,
  CheckSquare,
  BookmarkCheck,
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assignment, Question, Student, Submission } from '../types';
import { formatSecondsToTime } from '../utils/formatters';
import { VoiceRecorder } from '../utils/audioRecorder';
import { SkillBadge } from './SkillBadge';
import { AudioPlayer } from './AudioPlayer';
import { VocabularyStudyRoom } from './VocabularyStudyRoom';
import { evaluateIeltsAnswer, IELTS_QUESTION_TYPES_CONFIG } from '../utils/ieltsQuestionConstants';
import { IeltsQuestionCard } from './IeltsQuestionCard';
import { IeltsAnswerSheet } from './IeltsAnswerSheet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TestTakingRoomProps {
  assignment: Assignment;
  student: Student;
  onClose: () => void;
  onSubmit: (submission: Submission) => void;
}

export const TestTakingRoom: React.FC<TestTakingRoomProps> = ({
  assignment,
  student,
  onClose,
  onSubmit,
}) => {
  // Timer state (seconds remaining)
  const initialSeconds = assignment.timeLimitMinutes > 0 ? assignment.timeLimitMinutes * 60 : 0;
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Student Answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essayContent, setEssayContent] = useState<string>('');
  const [speakingTranscript, setSpeakingTranscript] = useState<string>('');

  // Speaking Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Speaking Prep Countdown (60s)
  const [prepSeconds, setPrepSeconds] = useState(60);
  const [isPrepping, setIsPrepping] = useState(false);

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reading Passage Highlight tool
  const [selectedHighlightText, setSelectedHighlightText] = useState<string>('');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  const attachedImages = assignment.assignmentImages && assignment.assignmentImages.length > 0
    ? assignment.assignmentImages
    : (assignment.assignmentImageUrl ? [assignment.assignmentImageUrl] : []);

  // Start Main Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);

      if (assignment.timeLimitMinutes > 0) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assignment.timeLimitMinutes]);

  // Speaking Prep Timer
  useEffect(() => {
    let interval: any = null;
    if (isPrepping && prepSeconds > 0) {
      interval = setInterval(() => {
        setPrepSeconds((prev) => {
          if (prev <= 1) {
            setIsPrepping(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPrepping, prepSeconds]);

  // Handle Voice Recording
  const handleStartRecording = async () => {
    try {
      const recorder = new VoiceRecorder();
      voiceRecorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Không thể truy cập Microphone. Bạn có thể nhập bài nói vào ô ghi chú transcript.');
      setIsRecording(true); // allow mock recording
    }
  };

  const handleStopRecording = async () => {
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    setIsRecording(false);

    if (voiceRecorderRef.current) {
      try {
        const result = await voiceRecorderRef.current.stop();
        setRecordedAudioUrl(result.url);
        setAudioDuration(result.durationSeconds);
      } catch {
        setRecordedAudioUrl('simulated-audio-recording.webm');
        setAudioDuration(recordingSeconds);
      }
    } else {
      setRecordedAudioUrl('simulated-audio-recording.webm');
      setAudioDuration(recordingSeconds);
    }
  };

  // Word count for Writing
  const wordCount = essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0;
  const minWords = assignment.writingMinWords || 250;

  // Total count of objective questions
  const totalObjectiveCount = (assignment.answerKeyList && assignment.answerKeyList.length > 0)
    ? assignment.answerKeyList.length
    : assignment.questions.length;

  // Auto-grading for objective reading / listening questions using IELTS scoring rules
  const calculateObjectiveScore = () => {
    let correct = 0;
    if (assignment.answerKeyList && assignment.answerKeyList.length > 0) {
      assignment.answerKeyList.forEach((item) => {
        const qKey = String(item.questionNumber);
        const qId = `q-${item.questionNumber}`;
        const studentAns = answers[qKey] || answers[qId] || answers[item.questionNumber] || '';
        const correctOptions = item.correctAnswer.split('/').map((s) => s.trim().toLowerCase());
        if (studentAns.trim() && correctOptions.includes(studentAns.trim().toLowerCase())) {
          correct += 1;
        }
      });
    } else {
      assignment.questions.forEach((q, idx) => {
        const qKey = String(idx + 1);
        const studentAns = answers[q.id] || answers[qKey] || '';
        const result = evaluateIeltsAnswer(q, studentAns);
        if (result.isCorrect) {
          correct += 1;
        }
      });
    }
    return correct;
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);

    const isObjective = assignment.skill === 'reading' || assignment.skill === 'listening';
    const rawScore = isObjective ? calculateObjectiveScore() : undefined;
    const maxCount = isObjective ? totalObjectiveCount : undefined;
    
    // Estimate initial band for reading/listening if all correct
    let estimatedBand: number | undefined = undefined;
    if (isObjective && maxCount && maxCount > 0) {
      const ratio = (rawScore || 0) / maxCount;
      if (ratio >= 0.9) estimatedBand = 8.5;
      else if (ratio >= 0.8) estimatedBand = 7.5;
      else if (ratio >= 0.7) estimatedBand = 6.5;
      else if (ratio >= 0.5) estimatedBand = 5.5;
      else estimatedBand = 4.5;
    }

    const submission: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      assignmentSkill: assignment.skill,
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds,
      timeLimitMinutes: assignment.timeLimitMinutes,
      status: isObjective ? 'graded' : 'submitted', // auto-grade objective tests
      answers,
      essayContent: assignment.skill === 'writing' ? essayContent : undefined,
      wordCount: assignment.skill === 'writing' ? wordCount : undefined,
      audioRecordingUrl: recordedAudioUrl || undefined,
      audioDurationSeconds: audioDuration || undefined,
      speakingTranscript: assignment.skill === 'speaking' ? speakingTranscript : undefined,
      rawScore,
      maxRawScore: maxCount,
      overallBand: estimatedBand,
      teacherFeedback: isObjective 
        ? `Hệ thống tự động chấm: Đúng ${rawScore}/${maxCount} câu trong thời gian ${formatSecondsToTime(timeSpentSeconds)}.` 
        : undefined,
      gradedByTeacher: isObjective ? true : false,
      gradedAt: isObjective ? new Date().toISOString() : undefined,
      gradedBy: isObjective ? 'Hệ thống tự động' : undefined
    };

    // Confetti effect!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      onSubmit(submission);
    }, 400);
  };

  // Timer color classes
  const isUrgent = assignment.timeLimitMinutes > 0 && secondsLeft <= 300; // < 5 mins
  const isCritical = assignment.timeLimitMinutes > 0 && secondsLeft <= 60; // < 1 min

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col">
      
      {/* Top Header Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <SkillBadge skill={assignment.skill} />
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white line-clamp-1">
              {assignment.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Học sinh: {student.name} ({student.className})
            </p>
          </div>
        </div>

        {/* Center Live Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold transition-all ${
              isCritical
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                : isUrgent
                ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                : 'bg-slate-800 text-indigo-300 border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin' : ''}`} />
            <div className="text-right">
              <span className="text-xs text-slate-400 block -mb-1 text-[10px] uppercase font-sans">
                {assignment.timeLimitMinutes > 0 ? 'Thời gian còn lại' : 'Thời gian làm bài'}
              </span>
              <span className="text-base sm:text-lg">
                {assignment.timeLimitMinutes > 0 ? formatSecondsToTime(secondsLeft) : formatSecondsToTime(timeSpentSeconds)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>Nộp Bài Thi</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Test Workspace (Split Screen) */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-100">
        
        {/* ================= READING SKILL VIEW ================= */}
        {assignment.skill === 'reading' && (
          <>
            {/* Left 6 cols: Reading Passage */}
            <div className="lg:col-span-6 h-full overflow-y-auto p-6 bg-white border-r border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    IELTS Reading Passage
                  </h3>
                </div>
                <span className="text-xs text-slate-400 italic">
                  💡 Bạn có thể bôi đen chữ để đánh dấu ý chính
                </span>
              </div>

              <div className="prose prose-sm max-w-none text-slate-800 font-serif leading-relaxed text-sm sm:text-base select-text">
                {assignment.readingPassage?.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} className="mb-4">
                    {para}
                  </p>
                )) || <p>Chưa có nội dung đoạn văn bài đọc.</p>}
              </div>

              {/* Passage Images if any */}
              {attachedImages.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Hình ảnh / Sơ đồ kèm bài đọc:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachedImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedZoomImage(imgUrl)}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center cursor-pointer"
                      >
                        <img src={imgUrl} alt={`Ảnh bài đọc ${idx + 1}`} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1">
                          <ZoomIn className="w-4 h-4" />
                          <span>Phóng to</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 6 cols: Question Sheet */}
            <div className="lg:col-span-6 h-full overflow-hidden flex flex-col bg-slate-50 border-l border-slate-200">
              {assignment.questionsContent ? (
                <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
                  {/* Freeform Questions Text & Tables */}
                  <div className="md:col-span-7 h-full overflow-y-auto p-5 space-y-4 border-r border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Đề Bài & Câu Hỏi IELTS
                      </h4>
                    </div>

                    <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {assignment.questionsContent}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* IELTS Answer Sheet on Right */}
                  <div className="md:col-span-5 h-full overflow-hidden">
                    <IeltsAnswerSheet
                      totalQuestions={totalObjectiveCount}
                      answers={answers}
                      onAnswerChange={(key, val) => setAnswers((prev) => ({ ...prev, [key]: val }))}
                      answerKeyList={assignment.answerKeyList}
                      questions={assignment.questions}
                      skill="reading"
                      themeColor="blue"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Phiếu Trả Lời Câu Hỏi ({assignment.questions.length} câu)
                    </h3>
                    <span className="text-xs font-semibold text-indigo-600">
                      Đã trả lời: {Object.keys(answers).length}/{assignment.questions.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {assignment.questions.map((q, idx) => (
                      <IeltsQuestionCard
                        key={q.id}
                        question={q}
                        index={idx}
                        value={answers[q.id] || answers[String(idx + 1)] || ''}
                        onChange={(val) => setAnswers({ ...answers, [q.id]: val, [String(idx + 1)]: val })}
                        theme="blue"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= WRITING SKILL VIEW ================= */}
        {assignment.skill === 'writing' && (
          <>
            {/* Left 5 cols: Writing Prompt */}
            <div className="lg:col-span-5 h-full overflow-y-auto p-6 bg-white border-r border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    IELTS Writing Task Prompt
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {assignment.taskType || 'Task 2'}
                </span>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {assignment.writingPrompt || 'Hãy viết bài luận trả lời đề bài theo đúng yêu cầu IELTS.'}
              </div>

              {/* Attached Assignment Diagram / Images (Especially Task 1 Graphs/Charts/Maps) */}
              {attachedImages.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      Biểu đồ & Sơ đồ đề bài ({attachedImages.length} hình ảnh):
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">Bấm để phóng to</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {attachedImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedZoomImage(imgUrl)}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer bg-slate-900 aspect-video flex items-center justify-center"
                      >
                        <img
                          src={imgUrl}
                          alt={`Biểu đồ đề bài ${idx + 1}`}
                          className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-medium text-xs">
                          <ZoomIn className="w-4 h-4" />
                          <span>Xem ảnh phóng to</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800">📌 Hướng dẫn làm bài Writing:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Số từ tối thiểu: <strong>{minWords} từ</strong>.</li>
                  <li>Thời gian khuyến nghị: <strong>{assignment.timeLimitMinutes || 40} phút</strong>.</li>
                  <li>Chú ý bố cục đoạn văn rõ ràng: Mở bài, Thân bài 1, Thân bài 2, Kết luận.</li>
                  <li>Sử dụng vốn từ vựng đa dạng (Lexical Resource) và liên từ chuyển ý mượt mà (Coherence & Cohesion).</li>
                </ul>
              </div>
            </div>

            {/* Right 7 cols: Essay Editor */}
            <div className="lg:col-span-7 h-full flex flex-col p-6 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Khu Vực Viết Bài (Essay Editor)
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    wordCount >= minWords
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {wordCount} / {minWords} words
                  </div>
                  <span className="text-[11px] text-slate-400">Tự động lưu nháp</span>
                </div>
              </div>

              <textarea
                rows={22}
                required
                placeholder="Bắt đầu viết bài luận của bạn tại đây (Intro, Body Paragraphs, Conclusion)..."
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                className="flex-1 w-full p-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-serif leading-relaxed resize-none shadow-xs"
              />
            </div>
          </>
        )}

        {/* ================= SPEAKING SKILL VIEW ================= */}
        {assignment.skill === 'speaking' && (
          <div className="lg:col-span-12 h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            
            {/* Speaking Cue Card */}
            <div className="p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900">
                    IELTS Speaking Part 2 - Candidate Cue Card
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Target Band {assignment.targetBand}
                </span>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-sm sm:text-base font-bold text-slate-900">
                {assignment.speakingCueCard?.topic || assignment.title}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase">You should say:</p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 pl-2">
                  {(assignment.speakingCueCard?.bulletPoints || [
                    'What it was',
                    'When it happened',
                    'Why it was significant'
                  ]).map((bp, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 1-Minute Prep Countdown Button */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    Thời gian chuẩn bị ghi chép (1 phút):
                  </span>
                  <span className="text-sm font-mono font-bold text-indigo-700">
                    {prepSeconds}s
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPrepping(true);
                    setPrepSeconds(60);
                  }}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200"
                >
                  Bắt đầu 1 phút chuẩn bị
                </button>
              </div>
            </div>

            {/* Audio Voice Recorder Card */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-md space-y-5 text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ghi Âm Bài Nói (Nói từ 1.5 - 2 phút)
              </h4>

              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                
                {/* Big Recording Button */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-300 animate-pulse hover:scale-105 active:scale-95 transition-all"
                  >
                    <Square className="w-8 h-8 fill-white" />
                  </button>
                )}

                <div>
                  {isRecording ? (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        Đang ghi âm bài nói... ({formatSecondsToTime(recordingSeconds)})
                      </span>
                      <p className="text-[11px] text-slate-400">Bấm nút đỏ để dừng và lưu bản thu</p>
                    </div>
                  ) : recordedAudioUrl ? (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đã ghi âm thành công ({formatSecondsToTime(audioDuration)})
                      </span>
                      <p className="text-[11px] text-slate-400">Bạn có thể thu âm lại nếu muốn cải thiện</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Bấm vào biểu tượng Microphone để bắt đầu ghi âm
                    </p>
                  )}
                </div>

                {/* Audio Player Preview */}
                {recordedAudioUrl && (
                  <div className="w-full max-w-md p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-semibold text-emerald-900">Bản thu đã sẵn sàng</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thu âm lại</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Speaking Transcript / Notes */}
              <div className="text-left space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Ghi chú nội dung bài nói / Lời thoại (Tùy chọn)
                </label>
                <textarea
                  rows={4}
                  placeholder="Ghi chú các từ vựng collocations đã dùng hoặc nhập nội dung bài nói để giáo viên chấm chi tiết hơn..."
                  value={speakingTranscript}
                  onChange={(e) => setSpeakingTranscript(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-sans"
                />
              </div>
            </div>

          </div>
        )}

        {/* ================= LISTENING SKILL VIEW ================= */}
        {assignment.skill === 'listening' && (
          <div className="lg:col-span-12 h-full overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
            
            {/* Audio Track Simulation Box */}
            <div className="p-5 bg-white rounded-2xl border-2 border-purple-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900">
                    IELTS Listening Track Audio
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                  {assignment.taskType || 'Listening Test'}
                </span>
              </div>

              {/* Real Interactive Audio Player */}
              <AudioPlayer
                src={assignment.listeningAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                title={assignment.title}
              />
              
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  Hướng dẫn làm bài nghe:
                </p>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  Bấm nút <strong>Phát Audio</strong> để nghe đoạn băng. Hãy vừa nghe vừa điền đáp án vào Phiếu Trả Lời (Answer Sheet) bên dưới.
                </p>
              </div>
            </div>

            {/* Questions & Answer Sheet */}
            {assignment.questionsContent ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Questions text with table & image markdown */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                    Nội Dung Bài Nghe & Đề Bài
                  </h4>
                  <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {assignment.questionsContent}
                    </ReactMarkdown>
                  </div>

                  {attachedImages.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Sơ đồ / Hình ảnh bài nghe:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachedImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedZoomImage(imgUrl)}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center cursor-pointer"
                          >
                            <img src={imgUrl} alt={`Ảnh bài nghe ${idx + 1}`} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1">
                              <ZoomIn className="w-4 h-4" />
                              <span>Phóng to</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Answer sheet */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs min-h-[500px]">
                  <IeltsAnswerSheet
                    totalQuestions={totalObjectiveCount}
                    answers={answers}
                    onAnswerChange={(key, val) => setAnswers((prev) => ({ ...prev, [key]: val }))}
                    answerKeyList={assignment.answerKeyList}
                    questions={assignment.questions}
                    skill="listening"
                    themeColor="purple"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Danh Sách Câu Hỏi Nghe ({assignment.questions.length} câu)
                </h4>
                <div className="space-y-4">
                  {assignment.questions.map((q, idx) => (
                    <IeltsQuestionCard
                      key={q.id}
                      question={q}
                      index={idx}
                      value={answers[q.id] || answers[String(idx + 1)] || ''}
                      onChange={(val) => setAnswers({ ...answers, [q.id]: val, [String(idx + 1)]: val })}
                      theme="purple"
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= VOCABULARY SKILL VIEW ================= */}
        {assignment.skill === 'vocabulary' && (
          <div className="lg:col-span-12 h-full flex flex-col overflow-hidden">
            <VocabularyStudyRoom
              assignment={assignment}
              student={student}
              onClose={onClose}
              onSubmit={onSubmit}
              timeSpentSeconds={timeSpentSeconds}
            />
          </div>
        )}

      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Xác Nhận Nộp Bài Thi</h3>
              <p className="text-xs text-slate-500">
                Thời gian làm bài: <strong>{formatSecondsToTime(timeSpentSeconds)}</strong>
                {assignment.skill === 'writing' && ` • Số từ: ${wordCount} từ`}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>✓ Bài làm sẽ được gửi trực tiếp đến giáo viên <strong>Celina Phạm</strong>.</p>
              <p>✓ Bạn sẽ nhận được điểm Band và bảng nhận xét chi tiết sau khi giáo viên chấm bài.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp Bài Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Lightbox */}
      {selectedZoomImage && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div className="relative max-w-5xl max-h-[92vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedZoomImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedZoomImage}
              alt="Phóng to ảnh đề bài"
              className="max-h-[86vh] w-auto max-w-full object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}

    </div>
  );
};

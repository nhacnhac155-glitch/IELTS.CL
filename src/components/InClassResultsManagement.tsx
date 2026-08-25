import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Users, 
  FileText, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Sparkles,
  Layers,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  Share2,
  Send,
  SpellCheck,
  CheckSquare
} from 'lucide-react';
import { ClassGroup, InClassResult, InClassResultEntry, InClassScoreType, InClassSkillType, Student } from '../types';
import { StorageService } from '../services/storage';
import { SkillBadge } from './SkillBadge';
import { getBandColorClass } from '../utils/formatters';

interface InClassResultsManagementProps {
  classes: ClassGroup[];
  students: Student[];
  selectedClassId?: string;
  onOpenStudentProfile: (student: Student) => void;
}

const TEMPLATE_SUGGESTIONS = [
  { 
    title: 'Kiểm Tra 20 Từ Vựng & Collocations: Topic Environment', 
    skill: 'vocabulary' as const, 
    maxScore: 20, 
    scoreType: 'words' as const,
    scoreUnit: 'từ',
    topic: '20 từ vựng & Collocations Unit 4 (Spelling + Definition + Example)' 
  },
  { 
    title: 'Vocabulary & Academic Collocations Quick Check (10 câu)', 
    skill: 'vocabulary' as const, 
    maxScore: 10, 
    scoreType: 'points' as const,
    scoreUnit: 'điểm',
    topic: 'Kiểm tra 10 cụm từ học thuật C1 đầu giờ' 
  },
  { 
    title: 'Speaking Part 1: Warm-up phản xạ & Từ vựng chủ đề', 
    skill: 'speaking' as const, 
    maxScore: 9.0, 
    scoreType: 'band' as const,
    scoreUnit: 'band',
    topic: 'Phản xạ Part 1, độ trôi chảy Fluency & Lexical Resource' 
  },
  { 
    title: 'Writing Task 2: Outline & Introduction (15 phút)', 
    skill: 'writing' as const, 
    maxScore: 9.0, 
    scoreType: 'band' as const,
    scoreUnit: 'band',
    topic: 'Agree/Disagree Essay Structure & Thesis Statement' 
  },
  { 
    title: 'Reading: Speed Scanning & Keyword Locating Test', 
    skill: 'reading' as const, 
    maxScore: 10, 
    scoreType: 'points' as const,
    scoreUnit: 'câu',
    topic: 'Kỹ năng Skimming & Scanning trong 10 phút' 
  },
  { 
    title: 'Listening: Section 2 Map & Multiple Choice Quiz', 
    skill: 'listening' as const, 
    maxScore: 10, 
    scoreType: 'points' as const,
    scoreUnit: 'câu',
    topic: 'Map Labelling & nhận diện bẫy Distractors' 
  },
];

// Helper to format score display flexibly
export const formatScoreBadge = (score: number, maxScore: number, scoreType: InClassScoreType, scoreUnit?: string) => {
  if (scoreType === 'words') {
    return {
      text: `${score}/${maxScore} ${scoreUnit || 'từ'}`,
      badgeClass: score >= maxScore * 0.85 
        ? 'bg-purple-100 text-purple-800 border-purple-200' 
        : score >= maxScore * 0.65 
        ? 'bg-blue-100 text-blue-800 border-blue-200' 
        : 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'Từ vựng đúng'
    };
  }
  if (scoreType === 'band') {
    return {
      text: `Band ${score.toFixed(1)}`,
      badgeClass: getBandColorClass(score),
      label: 'IELTS Band'
    };
  }
  if (scoreType === 'percentage') {
    return {
      text: `${score}%`,
      badgeClass: score >= 80 
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
        : score >= 65 
        ? 'bg-blue-100 text-blue-800 border-blue-200' 
        : 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'Tỷ lệ %'
    };
  }
  // Points or custom
  return {
    text: `${score}/${maxScore} ${scoreUnit || 'đ'}`,
    badgeClass: score >= maxScore * 0.8 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : score >= maxScore * 0.6 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Điểm số'
  };
};

export const InClassResultsManagement: React.FC<InClassResultsManagementProps> = ({
  classes,
  students,
  selectedClassId = 'all',
  onOpenStudentProfile,
}) => {
  const [inClassResults, setInClassResults] = useState<InClassResult[]>(() => StorageService.getInClassResults());
  const [filterClassId, setFilterClassId] = useState<string>(selectedClassId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);

  // Auto-report modal state for parents/Zalo
  const [reportModalResult, setReportModalResult] = useState<InClassResult | null>(null);
  const [reportType, setReportType] = useState<'class_zalo' | 'student_parent'>('class_zalo');
  const [reportSelectedStudentId, setReportSelectedStudentId] = useState<string>('');

  // Modal State for New / Edit In-Class Result
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  // Form State
  const [formClassId, setFormClassId] = useState<string>(classes[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSkill, setFormSkill] = useState<InClassSkillType>('vocabulary');
  const [formScoreType, setFormScoreType] = useState<InClassScoreType>('words');
  const [formMaxScore, setFormMaxScore] = useState<number>(20);
  const [formScoreUnit, setFormScoreUnit] = useState<string>('từ');
  const [formTopic, setFormTopic] = useState('');
  const [formSessionNumber, setFormSessionNumber] = useState<number>(1);
  const [formGeneralNotes, setFormGeneralNotes] = useState('');
  
  // Student entries state for the form
  const [formEntries, setFormEntries] = useState<InClassResultEntry[]>([]);

  // Filtered in-class results
  const filteredResults = inClassResults.filter((r) => {
    const matchClass = filterClassId === 'all' || r.classId === filterClassId;
    const matchSkill = selectedSkillFilter === 'all' || r.skill === selectedSkillFilter;
    const matchSearch = searchQuery.trim() === '' || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.topic && r.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.entries.some((e) => e.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchClass && matchSkill && matchSearch;
  });

  // Open Create Modal
  const handleOpenCreateModal = (initialClassId?: string, defaultSkill: InClassSkillType = 'vocabulary') => {
    const targetClassId = initialClassId || (filterClassId !== 'all' ? filterClassId : classes[0]?.id || '');
    setFormClassId(targetClassId);
    setEditingResultId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSkill(defaultSkill);
    setFormSessionNumber(1);
    setFormGeneralNotes('');

    if (defaultSkill === 'vocabulary') {
      setFormTitle('Kiểm Tra Từ Vựng & Collocations: Unit ');
      setFormScoreType('words');
      setFormMaxScore(20);
      setFormScoreUnit('từ');
      setFormTopic('Kiểm tra 20 từ vựng và collocations chủ đề trọng tâm');
    } else {
      setFormTitle('');
      setFormScoreType('band');
      setFormMaxScore(9.0);
      setFormScoreUnit('band');
      setFormTopic('');
    }

    // Populate class students
    const classStudents = students.filter((s) => s.classId === targetClassId);
    const initialEntries: InClassResultEntry[] = classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      studentAvatar: s.avatar,
      score: defaultSkill === 'vocabulary' ? 18 : 6.5,
      maxScore: defaultSkill === 'vocabulary' ? 20 : 9.0,
      scoreType: defaultSkill === 'vocabulary' ? 'words' : 'band',
      scoreUnit: defaultSkill === 'vocabulary' ? 'từ' : 'band',
      bandEquivalent: 6.5,
      status: 'completed',
      notes: '',
    }));
    setFormEntries(initialEntries);
    setIsModalOpen(true);
  };

  // Change form class and update students list
  const handleFormClassChange = (newClassId: string) => {
    setFormClassId(newClassId);
    const classStudents = students.filter((s) => s.classId === newClassId);
    const updatedEntries: InClassResultEntry[] = classStudents.map((s) => {
      const existing = formEntries.find((e) => e.studentId === s.id);
      if (existing) return existing;
      return {
        studentId: s.id,
        studentName: s.name,
        studentAvatar: s.avatar,
        score: formScoreType === 'words' ? Math.round(formMaxScore * 0.85) : formScoreType === 'band' ? 6.5 : 8.0,
        maxScore: formMaxScore,
        scoreType: formScoreType,
        scoreUnit: formScoreUnit,
        bandEquivalent: 6.5,
        status: 'completed',
        notes: '',
      };
    });
    setFormEntries(updatedEntries);
  };

  // Open Edit Modal
  const handleOpenEditModal = (result: InClassResult) => {
    setEditingResultId(result.id);
    setFormClassId(result.classId);
    setFormTitle(result.title);
    setFormDate(result.date);
    setFormSkill(result.skill);
    setFormScoreType(result.scoreType);
    setFormMaxScore(result.maxScore);
    setFormScoreUnit(result.scoreUnit || (result.scoreType === 'words' ? 'từ' : result.scoreType === 'band' ? 'band' : 'điểm'));
    setFormTopic(result.topic || '');
    setFormSessionNumber(result.sessionNumber || 1);
    setFormGeneralNotes(result.generalNotes || '');
    setFormEntries(result.entries || []);
    setIsModalOpen(true);
  };

  // Apply template
  const handleApplyTemplate = (tpl: typeof TEMPLATE_SUGGESTIONS[0]) => {
    setFormTitle(tpl.title);
    setFormSkill(tpl.skill);
    setFormMaxScore(tpl.maxScore);
    setFormScoreType(tpl.scoreType);
    setFormScoreUnit(tpl.scoreUnit);
    setFormTopic(tpl.topic);
    
    // Update entries scores and maxScore
    const calcScore = (st: InClassScoreType, max: number): number => {
      if (st === 'words') return Math.round(max * 0.85);
      if (st === 'band') return 6.5;
      if (st === 'percentage') return 85;
      return Math.round(max * 0.8);
    };

    setFormEntries((prev) =>
      prev.map((e) => ({
        ...e,
        maxScore: tpl.maxScore,
        scoreType: tpl.scoreType,
        scoreUnit: tpl.scoreUnit,
        score: calcScore(tpl.scoreType, tpl.maxScore),
      }))
    );
  };

  // Update a student entry
  const handleUpdateEntry = (studentId: string, updates: Partial<InClassResultEntry>) => {
    setFormEntries((prev) =>
      prev.map((e) => {
        if (e.studentId !== studentId) return e;
        const updated = { ...e, ...updates };
        if (updated.scoreType === 'band') {
          updated.bandEquivalent = updated.score;
        }
        return updated;
      })
    );
  };

  // Save Form
  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tên bài tập / hoạt động trên lớp');
      return;
    }

    const currentClass = classes.find((c) => c.id === formClassId);
    const className = currentClass ? currentClass.name : 'Lớp học';

    const resultData: InClassResult = {
      id: editingResultId || `icr-${Date.now()}`,
      classId: formClassId,
      className,
      title: formTitle.trim(),
      date: formDate,
      skill: formSkill,
      scoreType: formScoreType,
      maxScore: Number(formMaxScore),
      scoreUnit: formScoreUnit.trim() || undefined,
      topic: formTopic.trim() || undefined,
      sessionNumber: Number(formSessionNumber) || 1,
      generalNotes: formGeneralNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
      entries: formEntries.map((e) => ({
        ...e,
        scoreType: formScoreType,
        maxScore: Number(formMaxScore),
        scoreUnit: formScoreUnit.trim() || undefined,
      })),
    };

    if (editingResultId) {
      StorageService.updateInClassResult(resultData);
    } else {
      StorageService.addInClassResult(resultData);
    }

    setInClassResults(StorageService.getInClassResults());
    setIsModalOpen(false);
  };

  // Delete
  const handleDeleteResult = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi kết quả trên lớp: "${title}"?`)) {
      StorageService.deleteInClassResult(id);
      setInClassResults(StorageService.getInClassResults());
    }
  };

  // Open Auto Report Generator Modal
  const handleOpenReportModal = (result: InClassResult) => {
    setReportModalResult(result);
    setReportType('class_zalo');
    const firstStudent = result.entries[0];
    if (firstStudent) {
      setReportSelectedStudentId(firstStudent.studentId);
    }
  };

  // Generate Report Text
  const generateReportText = (result: InClassResult, type: 'class_zalo' | 'student_parent', studentId?: string) => {
    const isVocab = result.skill === 'vocabulary' || result.scoreType === 'words';
    
    if (type === 'student_parent' && studentId) {
      const entry = result.entries.find((e) => e.studentId === studentId);
      if (!entry) return '';
      
      const scoreBadge = formatScoreBadge(entry.score, result.maxScore, result.scoreType, result.scoreUnit);
      
      return [
        `📩 [THÔNG BÁO KẾT QUẢ HỌC TẬP TRÊN LỚP]`,
        `Kính gửi Quý Phụ Huynh em: ${entry.studentName}`,
        `Lớp: ${result.className}`,
        `----------------------------------------`,
        `📌 Hoạt động: ${result.title}`,
        `📅 Ngày thực hiện: ${result.date} ${result.sessionNumber ? `(Buổi ${result.sessionNumber})` : ''}`,
        result.topic ? `📖 Nội dung trọng tâm: ${result.topic}` : '',
        `🎯 Kết quả đạt được: ${entry.status === 'absent' ? 'Vắng mặt (đã gửi bài làm bù)' : `${scoreBadge.text} (${scoreBadge.label})`}`,
        `📝 Nhận xét của Giáo viên: ${entry.notes || 'Em tiếp thu bài tốt và tích cực tham gia các hoạt động phản xạ tại lớp.'}`,
        result.generalNotes ? `💡 Ghi chú chung: ${result.generalNotes}` : '',
        `----------------------------------------`,
        `Thầy/Cô xin cảm ơn sự phối hợp đồng hành của Quý Phụ Huynh cùng con!`
      ].filter(Boolean).join('\n');
    }

    // Default Class Zalo Report
    const completedEntries = result.entries.filter((e) => e.status === 'completed');
    const absentEntries = result.entries.filter((e) => e.status === 'absent');
    
    // Sort completed by score descending
    const sortedCompleted = [...completedEntries].sort((a, b) => b.score - a.score);

    return [
      `📊 [BÁO CÁO KẾT QUẢ HOẠT ĐỘNG TRÊN LỚP] - ${result.className.toUpperCase()}`,
      `📌 Bài kiểm tra/Hoạt động: ${result.title}`,
      `📅 Ngày: ${result.date} ${result.sessionNumber ? `(Buổi ${result.sessionNumber})` : ''} | Kỹ năng: ${result.skill === 'vocabulary' ? 'Từ Vựng (Vocabulary)' : result.skill}`,
      result.topic ? `📖 Nội dung: ${result.topic}` : '',
      `👥 Sĩ số tham gia: ${completedEntries.length}/${result.entries.length} học viên`,
      `----------------------------------------`,
      `🏆 BẢNG ĐIỂM CHI TIẾT TỪNG HỌC VIÊN:`,
      ...sortedCompleted.map((e, idx) => {
        const badge = formatScoreBadge(e.score, result.maxScore, result.scoreType, result.scoreUnit);
        const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '▫️';
        const noteStr = e.notes ? ` ➔ ${e.notes}` : '';
        return `${icon} ${idx + 1}. ${e.studentName}: ${badge.text}${noteStr}`;
      }),
      absentEntries.length > 0 ? `\n⚠️ Học sinh vắng mặt: ${absentEntries.map((e) => `${e.studentName} (${e.notes || 'Vắng'})`).join(', ')}` : '',
      result.generalNotes ? `\n📝 Đánh giá chung của Giáo Viên: ${result.generalNotes}` : '',
      `----------------------------------------`,
      `Chúc mừng các bạn đã hoàn thành tốt bài rèn luyện hôm nay!`
    ].filter(Boolean).join('\n');
  };

  // Copy quick report for clipboard
  const handleCopyReportContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccessToast(id);
    setTimeout(() => setCopySuccessToast(null), 3000);
  };

  // Stats calculation
  const totalActivities = inClassResults.length;
  const vocabQuizzesCount = inClassResults.filter((r) => r.skill === 'vocabulary' || r.scoreType === 'words').length;
  const completedEntriesCount = inClassResults.reduce(
    (acc, curr) => acc + curr.entries.filter((e) => e.status === 'completed').length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copySuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Đã sao chép báo cáo vào bộ nhớ tạm (sẵn sàng gửi Zalo/Phụ huynh)!</span>
        </div>
      )}

      {/* Top Banner Header & Stats */}
      <div className="bg-gradient-to-br from-[#12163a] via-[#1a215a] to-[#252f7a] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-600/30 border border-blue-400/30 rounded-2xl text-blue-300">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Sổ Theo Dõi Kết Quả & Kiểm Tra Từ Vựng Trên Lớp
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1">
                    <SpellCheck className="w-3.5 h-3.5" />
                    <span>Vocab & Skill Check</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/80 mt-0.5">
                  Lưu trữ linh hoạt điểm kiểm tra từ vựng (ví dụ 19/20 từ), mini-test, thực hành Speaking/Writing tại lớp với thang điểm tự do và xuất báo cáo Zalo tự động cho phụ huynh.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto items-stretch sm:items-end shrink-0">
            <button
              type="button"
              onClick={() => handleOpenCreateModal(undefined, 'vocabulary')}
              className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <SpellCheck className="w-4 h-4" />
              <span>+ Kiểm Tra Từ Vựng</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nhập Điểm Hoạt Động Lớp</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-blue-900/40">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-blue-300 font-semibold">Tổng hoạt động trên lớp</div>
            <div className="text-xl font-black text-white mt-1">{totalActivities} bài</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
              <SpellCheck className="w-3 h-3" />
              <span>Bài kiểm tra từ vựng</span>
            </div>
            <div className="text-xl font-black text-purple-300 mt-1">{vocabQuizzesCount} bài</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-emerald-300 font-semibold">Lượt chấm & đánh giá</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{completedEntriesCount} lượt</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-blue-300 font-semibold">Thang điểm chấm</div>
            <div className="text-xl font-black text-amber-300 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Linh hoạt 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
            <Users className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-medium text-slate-500 shrink-0">Lớp:</span>
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả lớp học ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
            <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="text-xs font-medium text-slate-500 shrink-0">Kỹ năng:</span>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả hoạt động</option>
              <option value="vocabulary">📖 Kiểm tra Từ Vựng (Vocabulary)</option>
              <option value="speaking">🎤 Speaking (Nói phản xạ)</option>
              <option value="writing">✍️ Writing (Viết tại lớp)</option>
              <option value="reading">📖 Reading (Đọc & Scanning)</option>
              <option value="listening">🎧 Listening (Nghe & Quiz)</option>
              <option value="Grammar & Vocab">⚡ Grammar & Vocab</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên bài, từ vựng, chủ đề, học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleOpenCreateModal(filterClassId !== 'all' ? filterClassId : undefined, 'vocabulary')}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <SpellCheck className="w-4 h-4" />
            <span>+ Tạo Bài Từ Vựng</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleOpenCreateModal(filterClassId !== 'all' ? filterClassId : undefined)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Hoạt Động</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Chưa có kết quả làm bài trên lớp</h3>
            <p className="text-xs text-slate-500">
              Nhấn vào <span className="font-semibold text-purple-600">"+ Kiểm Tra Từ Vựng"</span> hoặc <span className="font-semibold text-blue-600">"+ Nhập Điểm Hoạt Động Lớp"</span> để lưu lại kết quả kiểm tra từ vựng, thực hành phản xạ hoặc mini-test của học sinh tại lớp học.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenCreateModal(undefined, 'vocabulary')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <SpellCheck className="w-4 h-4" />
              <span>Tạo bài kiểm tra từ vựng</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo hoạt động chấm điểm</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => {
            const isExpanded = expandedCardId === result.id;
            const isVocab = result.skill === 'vocabulary' || result.scoreType === 'words';
            const completedCount = result.entries.filter((e) => e.status === 'completed').length;
            const absentCount = result.entries.filter((e) => e.status === 'absent').length;
            
            // Calculate average score
            const validScores = result.entries.filter((e) => e.status === 'completed').map((e) => e.score);
            const avgScore = validScores.length > 0
              ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
              : null;

            return (
              <div
                key={result.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isVocab ? (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <SpellCheck className="w-3.5 h-3.5" />
                          <span>Kiểm tra Từ Vựng</span>
                        </span>
                      ) : (
                        <SkillBadge skill={result.skill as any} />
                      )}

                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {result.className}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {result.date}
                      </span>
                      {result.sessionNumber && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                          Buổi {result.sessionNumber}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Thang: {result.scoreType === 'words' ? `Tối đa ${result.maxScore} từ` : result.scoreType === 'band' ? 'Band 0-9.0' : result.scoreType === 'percentage' ? '100%' : `${result.maxScore}đ`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {result.title}
                      </h3>
                      {result.topic && (
                        <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Nội dung: {result.topic}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Summary Score */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {avgScore && (
                      <div className="text-right px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-2xl">
                        <div className="text-[10px] font-bold text-blue-600 uppercase">Điểm TB Lớp</div>
                        <div className="text-sm sm:text-base font-black text-blue-900 font-mono">
                          {result.scoreType === 'words' 
                            ? `${avgScore}/${result.maxScore} từ` 
                            : result.scoreType === 'band' 
                            ? `Band ${avgScore}` 
                            : `${avgScore} / ${result.maxScore}${result.scoreUnit || 'đ'}`}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {/* Auto-report for Parents / Zalo Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenReportModal(result)}
                        title="Báo cáo tự động gửi phụ huynh & nhóm Zalo"
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Báo Cáo Phụ Huynh / Zalo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(result)}
                        title="Chỉnh sửa điểm bài tập trên lớp"
                        className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteResult(result.id, result.title)}
                        title="Xóa bài tập này"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedCardId(isExpanded ? null : result.id)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Thu gọn' : `Xem điểm (${result.entries.length} HS)`}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* General Teacher Notes if any */}
                {result.generalNotes && (
                  <div className="px-5 py-2.5 bg-amber-50/60 border-b border-amber-100/60 text-xs text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Ghi chú chung của buổi học:</strong> {result.generalNotes}</span>
                  </div>
                )}

                {/* Expanded Students Score Table */}
                {isExpanded && (
                  <div className="p-4 sm:p-5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Học sinh</th>
                            <th className="py-2.5 px-3">Trạng thái</th>
                            <th className="py-2.5 px-3">
                              {isVocab ? 'Số từ vựng đúng' : 'Kết quả đạt được'}
                            </th>
                            <th className="py-2.5 px-3">Nhận xét trực tiếp của GV</th>
                            <th className="py-2.5 px-3 text-right">Hồ sơ HS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {result.entries.map((entry) => {
                            const studentObj = students.find((s) => s.id === entry.studentId);
                            const badge = formatScoreBadge(entry.score, result.maxScore, result.scoreType, result.scoreUnit);
                            
                            return (
                              <tr key={entry.studentId} className="hover:bg-slate-50/80">
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={entry.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                      alt={entry.studentName}
                                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                    />
                                    <div>
                                      <span className="font-bold text-slate-900 block">{entry.studentName}</span>
                                      <span className="text-[10px] text-slate-400">ID: {entry.studentId}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-3">
                                  {entry.status === 'completed' ? (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Đã làm
                                    </span>
                                  ) : entry.status === 'absent' ? (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                      Vắng mặt
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                      Chưa nộp
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-3">
                                  {entry.status === 'absent' ? (
                                    <span className="text-slate-400 font-mono italic">—</span>
                                  ) : (
                                    <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${badge.badgeClass}`}>
                                      {badge.text}
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-slate-700 max-w-sm">
                                  {entry.notes ? (
                                    <span className="line-clamp-2">{entry.notes}</span>
                                  ) : (
                                    <span className="text-slate-400 italic">Chưa có nhận xét riêng</span>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-right">
                                  {studentObj && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenStudentProfile(studentObj)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                                    >
                                      <span>Xem Hồ Sơ</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          AUTO-REPORT MODAL (GỬI BÁO CÁO PHỤ HUYNH / ZALO)
      ========================================================================= */}
      {reportModalResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Báo Cáo Kết Quả Tự Động (Zalo / Phụ Huynh)
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    Nội dung được định dạng chuyên nghiệp, sẵn sàng copy 1 chạm để gửi ngay.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalResult(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Type Switcher */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setReportType('class_zalo')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    reportType === 'class_zalo' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>1. Mẫu Gửi Nhóm Lớp (Zalo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('student_parent')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    reportType === 'student_parent' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>2. Mẫu Gửi Riêng Phụ Huynh</span>
                </button>
              </div>

              {/* Student Selector when reportType is student_parent */}
              {reportType === 'student_parent' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Chọn học sinh cần gửi báo cáo:
                  </label>
                  <select
                    value={reportSelectedStudentId}
                    onChange={(e) => setReportSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {reportModalResult.entries.map((e) => (
                      <option key={e.studentId} value={e.studentId}>
                        {e.studentName} ({e.status === 'absent' ? 'Vắng' : `${e.score}/${reportModalResult.maxScore}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preview Text Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Xem trước nội dung tin nhắn:
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Sẵn sàng gửi qua Zalo / SMS
                  </span>
                </div>
                <textarea
                  readOnly
                  rows={11}
                  value={generateReportText(reportModalResult, reportType, reportSelectedStudentId)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-hidden select-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setReportModalResult(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => {
                  const txt = generateReportText(reportModalResult, reportType, reportSelectedStudentId);
                  handleCopyReportContent(txt, reportModalResult.id);
                  setReportModalResult(null);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Sao Chép Tin Nhắn (Copy Zalo)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT IN-CLASS RESULT MODAL
      ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-blue-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingResultId ? 'Chỉnh Sửa Kết Quả Hoạt Động / Kiểm Tra' : 'Nhập Điểm Kiểm Tra Từ Vựng & Hoạt Động Trên Lớp'}
                  </h3>
                  <p className="text-xs text-blue-200/80">
                    Lưu trữ kết quả từ vựng linh hoạt (ví dụ 19/20 từ) hoặc band điểm, tự động hiển thị trong hồ sơ học sinh.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveResult} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Quick Template Suggestions */}
              {!editingResultId && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Gợi ý mẫu kiểm tra nhanh:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATE_SUGGESTIONS.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left flex items-center gap-1"
                      >
                        <span>⚡</span>
                        <span>{tpl.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* General Activity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Class */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Lớp học áp dụng *</label>
                  <select
                    value={formClassId}
                    onChange={(e) => handleFormClassChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.studentCount} HS)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ngày làm bài *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Session number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Buổi học số</label>
                  <input
                    type="number"
                    min="1"
                    value={formSessionNumber}
                    onChange={(e) => setFormSessionNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Title */}
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tên bài tập / Hoạt động kiểm tra trên lớp *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Kiểm tra 20 từ vựng Unit 4, Speaking Part 1 Warm-up, Vocab Quiz..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Skill */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kỹ năng *</label>
                  <select
                    value={formSkill}
                    onChange={(e) => {
                      const newSkill = e.target.value as any;
                      setFormSkill(newSkill);
                      if (newSkill === 'vocabulary') {
                        setFormScoreType('words');
                        setFormMaxScore(20);
                        setFormScoreUnit('từ');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="vocabulary">📖 Kiểm Tra Từ Vựng (Vocabulary)</option>
                    <option value="speaking">🎤 Speaking (Nói phản xạ)</option>
                    <option value="writing">✍️ Writing (Viết tại lớp)</option>
                    <option value="reading">📖 Reading (Đọc & Scanning)</option>
                    <option value="listening">🎧 Listening (Nghe & Quiz)</option>
                    <option value="Grammar & Vocab">⚡ Grammar & Vocab</option>
                  </select>
                </div>

                {/* Score Type & Max Score */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Định dạng & Thang điểm chấm</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formScoreType}
                      onChange={(e) => {
                        const newType = e.target.value as InClassScoreType;
                        setFormScoreType(newType);
                        if (newType === 'words') {
                          setFormMaxScore(20);
                          setFormScoreUnit('từ');
                        } else if (newType === 'band') {
                          setFormMaxScore(9.0);
                          setFormScoreUnit('band');
                        } else if (newType === 'points') {
                          setFormMaxScore(10);
                          setFormScoreUnit('điểm');
                        } else if (newType === 'percentage') {
                          setFormMaxScore(100);
                          setFormScoreUnit('%');
                        } else {
                          setFormMaxScore(30);
                          setFormScoreUnit('câu');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="words">Số từ vựng đúng (vd: 19/20 từ)</option>
                      <option value="points">Thang điểm 10 (0 - 10đ)</option>
                      <option value="band">Band IELTS (0 - 9.0)</option>
                      <option value="percentage">Phần trăm (0 - 100%)</option>
                      <option value="custom">Thang điểm tự chọn (Custom)</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step={formScoreType === 'band' ? '0.5' : '1'}
                        value={formMaxScore}
                        onChange={(e) => setFormMaxScore(Number(e.target.value))}
                        placeholder="Điểm tối đa"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                      />
                      <input
                        type="text"
                        value={formScoreUnit}
                        onChange={(e) => setFormScoreUnit(e.target.value)}
                        placeholder="Đơn vị (từ, câu, đ)"
                        className="w-16 px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Topic */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Chủ đề / Yêu cầu trọng tâm</label>
                  <input
                    type="text"
                    placeholder="VD: 20 từ vựng Topic Environment, Collocations Unit 4..."
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Students Score Entry Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Nhập điểm & Nhận xét cho từng học sinh ({formEntries.length} học viên)</span>
                  </h4>
                  <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                    Thang: Tối đa {formMaxScore} {formScoreUnit}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {formEntries.map((entry) => (
                    <div key={entry.studentId} className="p-3 sm:p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <img
                          src={entry.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={entry.studentName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{entry.studentName}</div>
                          <div className="text-[10px] text-slate-400">ID: {entry.studentId}</div>
                        </div>
                      </div>

                      {/* Status toggle */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[
                          { id: 'completed', label: 'Đã làm', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                          { id: 'absent', label: 'Vắng mặt', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => handleUpdateEntry(entry.studentId, { status: st.id as any })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              entry.status === st.id ? st.bg : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>

                      {/* Score Input */}
                      {entry.status !== 'absent' ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold text-slate-500">
                            {formScoreType === 'words' ? 'Số từ đúng:' : 'Điểm:'}
                          </span>
                          <input
                            type="number"
                            step={formScoreType === 'band' ? '0.5' : formScoreType === 'percentage' ? '1' : '0.5'}
                            min="0"
                            max={formMaxScore}
                            value={entry.score}
                            onChange={(e) => handleUpdateEntry(entry.studentId, { score: Number(e.target.value) })}
                            className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-purple-700 text-center focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                          />
                          <span className="text-xs font-mono text-slate-400">/ {formMaxScore} {formScoreUnit}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-500 italic shrink-0">Học sinh vắng</span>
                      )}

                      {/* Notes Input */}
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Nhận xét (VD: Thuộc 19/20 từ, nhớ collocation tốt, cần ôn phát âm...)"
                          value={entry.notes || ''}
                          onChange={(e) => handleUpdateEntry(entry.studentId, { notes: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Pedagogical Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ghi chú chung của giáo viên cho buổi này (Tùy chọn)</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú tổng thể tình hình học tập của cả lớp trong buổi làm bài này..."
                  value={formGeneralNotes}
                  onChange={(e) => setFormGeneralNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingResultId ? 'Lưu Thay Đổi' : 'Lưu Kết Quả & Đồng Bộ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

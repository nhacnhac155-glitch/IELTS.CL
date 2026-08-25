import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Headphones,
  HelpCircle,
  Layers,
  MessageSquare,
  Mic,
  PenTool,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
  AlertCircle,
  Hash,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import { ClassGroup, Student, TestCategory, TestRecord, TestStudentScoreEntry, SkillType, TestScoreScale } from '../types';
import { StorageService } from '../services/storage';
import { ClassBadge } from './ClassBadge';
import { getBandColorClass, roundIELTSBand, calculateIELTSOverall } from '../utils/formatters';

interface TestResultsManagementProps {
  classes: ClassGroup[];
  students: Student[];
  onOpenStudentProfile?: (student: Student) => void;
}

type EvaluatedSkillItem = SkillType | 'grammar' | 'vocabulary';

const AVAILABLE_SKILLS: { id: EvaluatedSkillItem; label: string; icon: string; defaultName: string }[] = [
  { id: 'listening', label: '🎧 Nghe (Listening)', icon: '🎧', defaultName: 'Nghe' },
  { id: 'reading', label: '📖 Đọc (Reading)', icon: '📖', defaultName: 'Đọc' },
  { id: 'writing', label: '✍️ Viết (Writing)', icon: '✍️', defaultName: 'Viết' },
  { id: 'speaking', label: '🗣️ Nói (Speaking)', icon: '🗣️', defaultName: 'Nói' },
  { id: 'grammar', label: '🔤 Ngữ Pháp (Grammar)', icon: '🔤', defaultName: 'Ngữ pháp' },
  { id: 'vocabulary', label: '📚 Từ Vựng (Vocabulary)', icon: '📚', defaultName: 'Từ vựng' },
];

export const TestResultsManagement: React.FC<TestResultsManagementProps> = ({
  classes,
  students,
  onOpenStudentProfile,
}) => {
  const [testRecords, setTestRecords] = useState<TestRecord[]>(() => StorageService.getTestRecords());
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | TestCategory>('all');
  const [selectedScaleFilter, setSelectedScaleFilter] = useState<'all' | TestScoreScale>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Create / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [formClassId, setFormClassId] = useState<string>(classes[0]?.id || '');
  const [formType, setFormType] = useState<TestCategory>('mid_test');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formFormat, setFormFormat] = useState<'four_skills' | 'single_skill' | 'custom'>('four_skills');
  const [formScoreScale, setFormScoreScale] = useState<TestScoreScale>('ielts_band');
  const [formMaxScore, setFormMaxScore] = useState<number>(9.0);
  const [formScoreUnit, setFormScoreUnit] = useState<string>('Band');
  const [formSkillsEvaluated, setFormSkillsEvaluated] = useState<EvaluatedSkillItem[]>([
    'listening',
    'reading',
    'writing',
    'speaking',
  ]);
  const [formAutoBandConversion, setFormAutoBandConversion] = useState<boolean>(false);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formGeneralNotes, setFormGeneralNotes] = useState<string>('');
  const [formResults, setFormResults] = useState<TestStudentScoreEntry[]>([]);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTest, setReportTest] = useState<TestRecord | null>(null);
  const [reportType, setReportType] = useState<'class_zalo' | 'student_parent' | 'comparison'>('class_zalo');
  const [reportStudentId, setReportStudentId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to calculate IELTS overall band from 4 skills (rounded to nearest 0.5 following official IELTS rules)
  const calculateIeltsOverall = (l?: number, r?: number, w?: number, s?: number): number => {
    return calculateIELTSOverall([l, r, w, s]);
  };

  // Convert raw/points to IELTS Band Equivalent
  const convertPointsToBandEquivalent = (score: number, maxScore: number): number => {
    if (maxScore <= 0 || score <= 0) return 3.5;
    const ratio = score / maxScore;
    if (ratio >= 0.92) return 8.0;
    if (ratio >= 0.84) return 7.5;
    if (ratio >= 0.75) return 7.0;
    if (ratio >= 0.66) return 6.5;
    if (ratio >= 0.58) return 6.0;
    if (ratio >= 0.50) return 5.5;
    if (ratio >= 0.42) return 5.0;
    if (ratio >= 0.35) return 4.5;
    if (ratio >= 0.25) return 4.0;
    return 3.5;
  };

  // Calculate Overall for any scale
  const calculateOverallForScale = (
    scores: { [key in EvaluatedSkillItem]?: number },
    scale: TestScoreScale,
    maxScore: number,
    evaluatedSkills: EvaluatedSkillItem[]
  ): { overall: number; bandEquivalent?: number } => {
    const validScores: number[] = [];
    evaluatedSkills.forEach((sk) => {
      const val = scores[sk];
      if (typeof val === 'number' && !isNaN(val)) {
        validScores.push(val);
      }
    });

    if (validScores.length === 0) {
      return { overall: 0 };
    }

    if (scale === 'ielts_band') {
      const l = scores['listening'];
      const r = scores['reading'];
      const w = scores['writing'];
      const s = scores['speaking'];
      return { overall: calculateIeltsOverall(l, r, w, s) };
    }

    if (scale === 'points_10') {
      const avg = validScores.reduce((sum, v) => sum + v, 0) / validScores.length;
      const rounded = Math.round(avg * 10) / 10;
      return {
        overall: rounded,
        bandEquivalent: convertPointsToBandEquivalent(rounded, 10),
      };
    }

    if (scale === 'points_100' || scale === 'percentage') {
      const avg = validScores.reduce((sum, v) => sum + v, 0) / validScores.length;
      const rounded = Math.round(avg);
      return {
        overall: rounded,
        bandEquivalent: convertPointsToBandEquivalent(rounded, 100),
      };
    }

    if (scale === 'raw_points') {
      // If single skill or sum of questions
      const sum = validScores.reduce((acc, v) => acc + v, 0);
      const val = validScores.length === 1 ? validScores[0] : Math.round((sum / validScores.length) * 10) / 10;
      return {
        overall: val,
        bandEquivalent: convertPointsToBandEquivalent(val, maxScore),
      };
    }

    const avg = validScores.reduce((sum, v) => sum + v, 0) / validScores.length;
    return { overall: Math.round(avg * 10) / 10 };
  };

  // Helper to format any test score for display
  const formatScoreDisplay = (
    score: number | undefined,
    scale: TestScoreScale = 'ielts_band',
    maxScore: number = 9.0,
    unit: string = 'Band',
    bandEquivalent?: number
  ) => {
    if (score === undefined || score === null) return '—';
    if (scale === 'ielts_band') {
      return `Band ${score.toFixed(1)}`;
    }
    if (scale === 'points_10') {
      return `${score.toFixed(1)} / 10đ`;
    }
    if (scale === 'points_100') {
      return `${score} / 100đ`;
    }
    if (scale === 'percentage') {
      return `${score}%`;
    }
    if (scale === 'raw_points') {
      return `${score} / ${maxScore} ${unit || 'câu'}`;
    }
    return `${score} ${unit}`;
  };

  // Filtered Test Records
  const filteredTests = testRecords.filter((t) => {
    const scale = t.scoreScale || (t.scoreType === 'band' ? 'ielts_band' : 'points_10');
    const matchClass = selectedClassId === 'all' || t.classId === selectedClassId;
    const matchCategory = selectedCategory === 'all' || t.type === selectedCategory;
    const matchScale = selectedScaleFilter === 'all' || scale === selectedScaleFilter;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.results.some((r) => r.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchClass && matchCategory && matchScale && matchSearch;
  });

  // Summary Metrics
  const totalTests = testRecords.length;
  const miniTestsCount = testRecords.filter((t) => t.type === 'mini_test').length;
  const midTestsCount = testRecords.filter((t) => t.type === 'mid_test').length;
  const finalTestsCount = testRecords.filter((t) => t.type === 'final_test').length;

  const nonIeltsTestsCount = testRecords.filter(
    (t) => t.scoreScale && t.scoreScale !== 'ielts_band'
  ).length;

  const allCompletedEntries = testRecords.flatMap((t) => t.results.filter((r) => r.status === 'completed'));
  const targetAchievedCount = allCompletedEntries.filter((r) => r.targetAchieved).length;
  const targetRate = allCompletedEntries.length > 0
    ? Math.round((targetAchievedCount / allCompletedEntries.length) * 100)
    : 0;

  // Change Scale Handler in Modal
  const handleSelectScale = (scale: TestScoreScale) => {
    setFormScoreScale(scale);
    let newMax = 9.0;
    let newUnit = 'Band';

    if (scale === 'ielts_band') {
      newMax = 9.0;
      newUnit = 'Band';
      setFormSkillsEvaluated(['listening', 'reading', 'writing', 'speaking']);
    } else if (scale === 'points_10') {
      newMax = 10;
      newUnit = 'điểm';
      if (formSkillsEvaluated.length === 0) {
        setFormSkillsEvaluated(['reading', 'grammar', 'vocabulary']);
      }
    } else if (scale === 'points_100') {
      newMax = 100;
      newUnit = 'điểm';
    } else if (scale === 'percentage') {
      newMax = 100;
      newUnit = '%';
    } else if (scale === 'raw_points') {
      newMax = 40;
      newUnit = 'câu';
    }

    setFormMaxScore(newMax);
    setFormScoreUnit(newUnit);

    // Recompute results with new scale defaults
    setFormResults((prev) =>
      prev.map((r) => {
        let initialVal = scale === 'ielts_band' ? 6.5 : scale === 'points_10' ? 8.0 : scale === 'raw_points' ? 32 : 80;
        const newScores: any = {};
        formSkillsEvaluated.forEach((sk) => {
          newScores[sk] = initialVal;
        });
        const calc = calculateOverallForScale(newScores, scale, newMax, formSkillsEvaluated);
        return {
          ...r,
          scores: {
            ...newScores,
            overall: calc.overall,
            bandEquivalent: calc.bandEquivalent,
          },
        };
      })
    );
  };

  // Toggle Skill in Evaluated Skills
  const handleToggleSkill = (skillId: EvaluatedSkillItem) => {
    let nextSkills: EvaluatedSkillItem[];
    if (formSkillsEvaluated.includes(skillId)) {
      if (formSkillsEvaluated.length === 1) {
        showToast('Bài test phải có ít nhất 1 kỹ năng hoặc nội dung đánh giá!');
        return;
      }
      nextSkills = formSkillsEvaluated.filter((s) => s !== skillId);
    } else {
      nextSkills = [...formSkillsEvaluated, skillId];
    }
    setFormSkillsEvaluated(nextSkills);

    // Recalculate overall for all students
    setFormResults((prev) =>
      prev.map((r) => {
        const calc = calculateOverallForScale(r.scores, formScoreScale, formMaxScore, nextSkills);
        return {
          ...r,
          scores: {
            ...r.scores,
            overall: calc.overall,
            bandEquivalent: calc.bandEquivalent,
          },
        };
      })
    );
  };

  // Preset Template Helper
  const applyPresetTemplate = (type: TestCategory) => {
    setFormType(type);
    const targetClass = classes.find((c) => c.id === formClassId) || classes[0];
    const classSuffix = targetClass ? `[${targetClass.name}]` : '';

    if (type === 'mini_test') {
      setFormTitle(`Mini-Test Định Kỳ: Đọc & Ngữ Pháp ${classSuffix}`);
      setFormDescription('Kiểm tra nhanh 30-45 phút trên lớp nhằm rà soát nền tảng từ vựng, ngữ pháp & kỹ năng đọc hiểu.');
    } else if (type === 'mid_test') {
      setFormTitle(`Đề Thi Giữa Khóa Mid-Term Assessment ${classSuffix}`);
      setFormDescription('Kỳ thi khảo sát giữa kỳ đánh giá năng lực và sự tiến bộ của học viên sau nửa chặng đường.');
    } else if (type === 'final_test') {
      setFormTitle(`Kỳ Thi Thử Tốt Nghiệp Final Mock Test ${classSuffix}`);
      setFormDescription('Bài thi khảo sát tốt nghiệp cuối khóa đánh giá toàn diện chuẩn đầu ra.');
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = (category: TestCategory = 'mid_test', existingTest?: TestRecord) => {
    if (existingTest) {
      setEditingTestId(existingTest.id);
      setFormClassId(existingTest.classId);
      setFormType(existingTest.type);
      setFormTitle(existingTest.title);
      setFormDate(existingTest.date);
      setFormFormat(existingTest.format || 'four_skills');
      const scScale = existingTest.scoreScale || (existingTest.scoreType === 'band' ? 'ielts_band' : 'points_10');
      setFormScoreScale(scScale);
      setFormMaxScore(existingTest.maxScore || (scScale === 'ielts_band' ? 9.0 : 10));
      setFormScoreUnit(existingTest.scoreUnit || (scScale === 'ielts_band' ? 'Band' : 'điểm'));
      setFormSkillsEvaluated((existingTest.skillsEvaluated as EvaluatedSkillItem[]) || ['listening', 'reading', 'writing', 'speaking']);
      setFormAutoBandConversion(existingTest.autoBandConversion || false);
      setFormDescription(existingTest.description || '');
      setFormGeneralNotes(existingTest.generalNotes || '');
      setFormResults([...existingTest.results]);
    } else {
      const clsId = selectedClassId !== 'all' ? selectedClassId : classes[0]?.id || '';
      setEditingTestId(null);
      setFormClassId(clsId);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormGeneralNotes('');
      setFormFormat('four_skills');
      setFormScoreScale('ielts_band');
      setFormMaxScore(9.0);
      setFormScoreUnit('Band');
      setFormSkillsEvaluated(['listening', 'reading', 'writing', 'speaking']);
      setFormAutoBandConversion(false);
      applyPresetTemplate(category);

      // Initialize students from selected class
      const classStudents = students.filter((s) => s.classId === clsId);
      const initialResults: TestStudentScoreEntry[] = classStudents.map((st) => {
        const est = st.currentEstimatedBand || 6.5;
        return {
          studentId: st.id,
          studentName: st.name,
          studentAvatar: st.avatar,
          scores: {
            listening: est,
            reading: est,
            writing: Math.max(5.0, est - 0.5),
            speaking: est,
            overall: est,
          },
          targetBand: st.targetBand || 6.5,
          targetScore: 8.0,
          targetAchieved: est >= (st.targetBand || 6.5),
          status: 'completed',
          strengths: '',
          improvements: '',
          notes: '',
        };
      });
      setFormResults(initialResults);
    }

    setIsModalOpen(true);
  };

  // When class changes in Create Modal, re-populate students if creating new
  const handleClassChangeInModal = (newClassId: string) => {
    setFormClassId(newClassId);
    if (!editingTestId) {
      const classStudents = students.filter((s) => s.classId === newClassId);
      const initialResults: TestStudentScoreEntry[] = classStudents.map((st) => {
        const est = st.currentEstimatedBand || (formScoreScale === 'points_10' ? 8.0 : 6.5);
        const newScores: any = {};
        formSkillsEvaluated.forEach((sk) => {
          newScores[sk] = est;
        });
        const calc = calculateOverallForScale(newScores, formScoreScale, formMaxScore, formSkillsEvaluated);
        return {
          studentId: st.id,
          studentName: st.name,
          studentAvatar: st.avatar,
          scores: {
            ...newScores,
            overall: calc.overall,
            bandEquivalent: calc.bandEquivalent,
          },
          targetBand: st.targetBand || 6.5,
          targetScore: formScoreScale === 'points_10' ? 8.0 : 6.5,
          targetAchieved: true,
          status: 'completed',
          strengths: '',
          improvements: '',
          notes: '',
        };
      });
      setFormResults(initialResults);
    }
  };

  // Update specific student score in modal
  const handleUpdateStudentScore = (
    studentId: string,
    field: EvaluatedSkillItem,
    value: number
  ) => {
    setFormResults((prev) =>
      prev.map((r) => {
        if (r.studentId !== studentId) return r;
        const newScores = { ...r.scores, [field]: value };
        const calc = calculateOverallForScale(
          newScores,
          formScoreScale,
          formMaxScore,
          formSkillsEvaluated
        );
        const achieved = formScoreScale === 'ielts_band'
          ? (r.targetBand ? calc.overall >= r.targetBand : true)
          : (r.targetScore ? calc.overall >= r.targetScore : true);

        return {
          ...r,
          scores: {
            ...newScores,
            overall: calc.overall,
            bandEquivalent: calc.bandEquivalent,
          },
          targetAchieved: achieved,
        };
      })
    );
  };

  // Quick fill sample scores
  const handleQuickFillScores = () => {
    setFormResults((prev) =>
      prev.map((r) => {
        let val = 6.5;
        if (formScoreScale === 'points_10') val = 8.5;
        else if (formScoreScale === 'points_100' || formScoreScale === 'percentage') val = 85;
        else if (formScoreScale === 'raw_points') val = Math.round(formMaxScore * 0.8);

        const newScores: any = {};
        formSkillsEvaluated.forEach((sk) => {
          newScores[sk] = val;
        });

        const calc = calculateOverallForScale(newScores, formScoreScale, formMaxScore, formSkillsEvaluated);
        return {
          ...r,
          scores: {
            ...newScores,
            overall: calc.overall,
            bandEquivalent: calc.bandEquivalent,
          },
          status: 'completed',
          targetAchieved: true,
        };
      })
    );
    showToast(`Đã điền điểm mẫu theo thang ${formScoreScale === 'ielts_band' ? 'Band 6.5' : formScoreScale === 'points_10' ? '8.5/10đ' : `${formMaxScore * 0.8}/${formMaxScore}`}`);
  };

  // Save Modal
  const handleSaveTestRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Vui lòng nhập tên bài kiểm tra / kỳ thi!');
      return;
    }

    const targetClass = classes.find((c) => c.id === formClassId);
    const className = targetClass ? targetClass.name : 'Target Class';

    const testData: TestRecord = {
      id: editingTestId || `test-${formType}-${Date.now()}`,
      classId: formClassId,
      className,
      type: formType,
      title: formTitle.trim(),
      date: formDate,
      format: formFormat,
      skillsEvaluated: formSkillsEvaluated,
      scoreScale: formScoreScale,
      maxScore: formMaxScore,
      scoreUnit: formScoreUnit,
      scoreType: formScoreScale === 'ielts_band' ? 'band' : formScoreScale === 'percentage' ? 'percentage' : 'points',
      autoBandConversion: formAutoBandConversion,
      description: formDescription.trim(),
      generalNotes: formGeneralNotes.trim(),
      createdAt: editingTestId
        ? testRecords.find((t) => t.id === editingTestId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      results: formResults,
    };

    if (editingTestId) {
      StorageService.updateTestRecord(testData);
      showToast(`Đã cập nhật kết quả: "${testData.title}"`);
    } else {
      StorageService.addTestRecord(testData);
      showToast(`Đã lưu bài kiểm tra mới: "${testData.title}"`);
    }

    setTestRecords(StorageService.getTestRecords());
    setIsModalOpen(false);
  };

  // Delete
  const handleDeleteTest = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài kiểm tra: "${title}"?`)) {
      StorageService.deleteTestRecord(id);
      setTestRecords(StorageService.getTestRecords());
      showToast(`Đã xóa bài test "${title}"`);
    }
  };

  // Open Report Modal
  const handleOpenReportModal = (test: TestRecord) => {
    setReportTest(test);
    setReportType('class_zalo');
    const firstStudent = test.results[0];
    if (firstStudent) setReportStudentId(firstStudent.studentId);
    setIsReportModalOpen(true);
  };

  // Generate Report Text
  const generateTestReportText = (
    test: TestRecord,
    type: 'class_zalo' | 'student_parent' | 'comparison',
    studentId?: string
  ) => {
    const scale = test.scoreScale || (test.scoreType === 'band' ? 'ielts_band' : 'points_10');
    const max = test.maxScore || (scale === 'ielts_band' ? 9.0 : 10);
    const unit = test.scoreUnit || (scale === 'ielts_band' ? 'Band' : 'điểm');

    const categoryName =
      test.type === 'mini_test'
        ? 'BÀI KIỂM TRA ĐỊNH KỲ (MINI-TEST)'
        : test.type === 'mid_test'
        ? 'KỲ THI KHẢO SÁT GIỮA KHÓA (MID-TERM TEST)'
        : 'KỲ THI THỬ TỐT NGHIỆP (FINAL MOCK TEST)';

    const scaleNote =
      scale === 'ielts_band'
        ? 'Thang điểm IELTS Band (0.0 - 9.0)'
        : scale === 'points_10'
        ? 'Thang điểm 10 chuẩn'
        : scale === 'points_100'
        ? 'Thang điểm 100'
        : `Thang điểm ${max} ${unit}`;

    if (type === 'student_parent' && studentId) {
      const entry = test.results.find((r) => r.studentId === studentId);
      if (!entry) return '';

      const targetText = entry.targetBand
        ? `Mục tiêu Target: Band ${entry.targetBand.toFixed(1)} -> ${
            entry.targetAchieved
              ? '✅ ĐÃ ĐẠT MỤC TIÊU'
              : `⚠️ Cần cải thiện thêm +${(entry.targetBand - entry.scores.overall).toFixed(1)}`
          }`
        : entry.targetScore
        ? `Mục tiêu điểm số: ${entry.targetScore}/${max} -> ${entry.targetAchieved ? '✅ ĐÃ ĐẠT' : '⚠️ Cần cố gắng hơn'}`
        : '';

      const skillLines = (test.skillsEvaluated || ['listening', 'reading', 'writing', 'speaking']).map((sk) => {
        const found = AVAILABLE_SKILLS.find((s) => s.id === sk);
        const name = found ? found.label : sk;
        const val = (entry.scores as any)[sk];
        return `  • ${name}: ${val !== undefined ? `${val} ${unit}` : '—'}`;
      });

      const bandEqText = entry.scores.bandEquivalent ? ` (Tương đương Band IELTS ~${entry.scores.bandEquivalent})` : '';

      return [
        `📩 [PHIẾU BÁO ĐIỂM KIỂM TRA HỌC VIÊN]`,
        `Kính gửi Quý Phụ Huynh em: ${entry.studentName}`,
        `Lớp học: ${test.className}`,
        `Kỳ thi: ${test.title}`,
        `📅 Ngày thi: ${test.date}`,
        `🏷️ Thang điểm: ${scaleNote}`,
        `----------------------------------------`,
        `🏆 KẾT QUẢ CHI TIẾT TỪNG PHẦN:`,
        ...skillLines,
        `  👉 ĐIỂM TỔNG KẾT (OVERALL): ${entry.scores.overall} / ${max} ${unit}${bandEqText}`,
        `----------------------------------------`,
        targetText ? `🎯 ${targetText}` : '',
        entry.strengths ? `🌟 Điểm mạnh nổi bật: ${entry.strengths}` : '',
        entry.improvements ? `💡 Điểm cần rèn luyện thêm: ${entry.improvements}` : '',
        entry.notes ? `📝 Lời khuyên của Giáo viên: ${entry.notes}` : '',
        test.generalNotes ? `📌 Đánh giá chung của lớp: ${test.generalNotes}` : '',
        `----------------------------------------`,
        `Kính mong Quý Phụ Huynh tiếp tục đồng hành và động viên con duy trì việc học tập đều đặn!`,
        `Trân trọng cảm ơn Quý Phụ Huynh!`
      ].filter(Boolean).join('\n');
    }

    // Default Class Zalo Report
    const completedList = [...test.results.filter((r) => r.status === 'completed')].sort(
      (a, b) => b.scores.overall - a.scores.overall
    );
    const absentList = test.results.filter((r) => r.status === 'absent');

    const avgScore =
      completedList.length > 0
        ? (completedList.reduce((acc, c) => acc + c.scores.overall, 0) / completedList.length).toFixed(1)
        : '0.0';

    return [
      `📢 [BÁO CÁO KẾT QUẢ ${categoryName}] - LỚP ${test.className.toUpperCase()}`,
      `📌 Kỳ thi: ${test.title}`,
      `📅 Ngày thi: ${test.date} | 🏷️ Thang điểm: ${scaleNote}`,
      `👥 Sĩ số dự thi: ${completedList.length}/${test.results.length} học viên | Điểm TB lớp: ${avgScore} ${unit}`,
      `----------------------------------------`,
      `🏆 BẢNG XẾP HẠNG & KẾT QUẢ ĐIỂM TEST:`,
      completedList
        .map((r, idx) => {
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '▫️';
          const targetStatus = r.targetAchieved ? ' (✅ Đạt Target)' : ' (⚠️ Cần cố gắng)';
          const bandEq = r.scores.bandEquivalent ? ` [~Band ${r.scores.bandEquivalent}]` : '';
          return `${medal} ${idx + 1}. ${r.studentName}: ${r.scores.overall}/${max} ${unit}${bandEq}${targetStatus}`;
        })
        .join('\n'),
      absentList.length > 0
        ? `\n⚠️ Học viên vắng mặt (chưa thi):\n${absentList.map((r, i) => `   ${i + 1}. ${r.studentName}`).join('\n')}`
        : '',
      `----------------------------------------`,
      test.description ? `📖 Nội dung bài thi: ${test.description}` : '',
      test.generalNotes ? `💡 Nhận xét của Giáo viên: ${test.generalNotes}` : '',
      `Thầy/Cô tuyên dương các bạn đã nỗ lực làm bài và chúc cả lớp giữ vững phong độ!`
    ].filter(Boolean).join('\n');
  };

  // Helper Badge for Test Type
  const renderTypePill = (type: TestCategory) => {
    switch (type) {
      case 'mini_test':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Mini Test (Định kỳ)</span>
          </span>
        );
      case 'mid_test':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mid-Term Test (Giữa kỳ)</span>
          </span>
        );
      case 'final_test':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            <span>Final Mock Test (Cuối khóa)</span>
          </span>
        );
    }
  };

  // Render scale badge on test card
  const renderScalePill = (scale: TestScoreScale = 'ielts_band', maxScore: number = 9, unit: string = 'Band') => {
    if (scale === 'ielts_band') {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
          <span>🎯 Band 0 - 9.0</span>
        </span>
      );
    }
    if (scale === 'points_10') {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
          <span>🔟 Thang Điểm 10</span>
        </span>
      );
    }
    if (scale === 'points_100' || scale === 'percentage') {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
          <span>💯 Thang 100 (%)</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
        <span>📝 Thang {maxScore} {unit || 'câu'}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-[#0c1427] via-[#112046] to-[#1e3a8a] text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/30 border border-blue-400/30 rounded-2xl text-blue-300">
                <Award className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Quản Lý &amp; Nhập Kết Quả Bài Test
                  </h2>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Thang Điểm Linh Hoạt (IELTS / Thang 10 / Số Câu)</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/90 mt-1 max-w-2xl leading-relaxed">
                  Hỗ trợ đầy đủ các thang điểm từ <strong>IELTS Band 0-9.0</strong>, <strong>Thang điểm 10</strong> cho lớp mới/ngữ pháp, <strong>Thang 100</strong> và <strong>Số câu đúng</strong>. Tùy chọn kỹ năng đánh giá, tự động tính Overall và xuất phiếu báo điểm Zalo gửi phụ huynh.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Arranged Vertically */}
          <div className="flex flex-col gap-2 w-full sm:w-auto items-stretch sm:items-end shrink-0">
            <button
              type="button"
              onClick={() => handleOpenCreateModal('mini_test')}
              className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>+ Nhập Điểm Mini-Test</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateModal('mid_test')}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>+ Nhập Điểm Mid-Term Test</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateModal('final_test')}
              className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>+ Nhập Điểm Final Mock Test</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-blue-800/40">
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-blue-300 font-semibold">Tổng các bài kiểm tra</div>
            <div className="text-2xl font-black text-white mt-1">{totalTests} bài test</div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Mini-Test định kỳ</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{miniTestsCount} bài</div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Thang điểm linh hoạt</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {nonIeltsTestsCount} bài non-IELTS
            </div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-blue-300 font-semibold">Tỷ lệ đạt Mục tiêu</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{targetRate}%</div>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả ({totalTests})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('mini_test')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'mini_test'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>1. Mini-Test ({miniTestsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('mid_test')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'mid_test'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>2. Mid-Term Test ({midTestsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('final_test')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'final_test'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
              <span>3. Final Mock Test ({finalTestsCount})</span>
            </button>
          </div>

          {/* Scale Filter & Class selector & Search */}
          <div className="flex items-center gap-2.5 flex-1 md:max-w-xl flex-wrap sm:flex-nowrap">
            {/* Thang điểm filter */}
            <select
              value={selectedScaleFilter}
              onChange={(e) => setSelectedScaleFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0"
            >
              <option value="all">📊 Mọi thang điểm</option>
              <option value="ielts_band">🎯 Thang Band (0-9.0)</option>
              <option value="points_10">🔟 Thang Điểm 10</option>
              <option value="points_100">💯 Thang Điểm 100</option>
              <option value="raw_points">📝 Số Câu Đúng</option>
            </select>

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0"
            >
              <option value="all">Tất cả lớp học</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.code ? `[${c.code}]` : ''}
                </option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[150px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên bài test hoặc học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Records List */}
      {filteredTests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Chưa có bài test nào phù hợp với bộ lọc
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Nhấn vào các nút nhập điểm Mini-Test, Mid-Term Test hoặc Final Mock Test ở trên để bắt đầu lưu điểm linh hoạt theo thang 10 hoặc Band IELTS.
          </p>
          <button
            type="button"
            onClick={() => handleOpenCreateModal('mini_test')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bài Test Mới</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTests.map((test) => {
            const isExpanded = expandedTestId === test.id || filteredTests.length === 1;
            const completedResults = test.results.filter((r) => r.status === 'completed');
            const scale = test.scoreScale || (test.scoreType === 'band' ? 'ielts_band' : 'points_10');
            const max = test.maxScore || (scale === 'ielts_band' ? 9.0 : 10);
            const unit = test.scoreUnit || (scale === 'ielts_band' ? 'Band' : 'điểm');

            const avgScoreVal =
              completedResults.length > 0
                ? (
                    completedResults.reduce((sum, r) => sum + r.scores.overall, 0) /
                    completedResults.length
                  ).toFixed(1)
                : '0.0';

            const highestScoreVal = completedResults.length > 0
              ? Math.max(...completedResults.map((r) => r.scores.overall)).toFixed(1)
              : '0.0';

            const achievedInThisTest = completedResults.filter((r) => r.targetAchieved).length;
            const passRate = completedResults.length > 0
              ? Math.round((achievedInThisTest / completedResults.length) * 100)
              : 0;

            const skillsToRender = test.skillsEvaluated || ['listening', 'reading', 'writing', 'speaking'];

            return (
              <div
                key={test.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header Row */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 border-b border-slate-200/80">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {renderTypePill(test.type)}
                        {renderScalePill(scale, max, unit)}
                        <ClassBadge classId={test.classId} classes={classes} size="sm" />
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngày thi: {test.date}</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {test.title}
                        </h3>
                        {test.description && (
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {test.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Test Summary Metrics & Actions */}
                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2 bg-slate-100/80 px-3.5 py-2 rounded-2xl border border-slate-200/70">
                        <div className="text-center px-2 border-r border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Điểm TB Lớp
                          </span>
                          <span className="text-sm sm:text-base font-black text-blue-700 font-mono">
                            {scale === 'ielts_band' ? `Band ${avgScoreVal}` : `${avgScoreVal} / ${max}${unit}`}
                          </span>
                        </div>
                        <div className="text-center px-2 border-r border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Cao Nhất
                          </span>
                          <span className="text-sm sm:text-base font-black text-amber-600 font-mono">
                            {scale === 'ielts_band' ? `Band ${highestScoreVal}` : `${highestScoreVal} ${unit}`}
                          </span>
                        </div>
                        <div className="text-center px-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Đạt Mục Tiêu
                          </span>
                          <span className="text-sm sm:text-base font-black text-emerald-600 font-mono">
                            {passRate}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(test)}
                          className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                          title="Tạo báo cáo gửi Zalo / Phụ huynh"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="hidden sm:inline">Báo Cáo Zalo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCreateModal(test.type, test)}
                          className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                          title="Chỉnh sửa điểm bài test"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Sửa Điểm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTest(test.id, test.title)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Xóa bài test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Matrix Table (Expandable) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-4">
                    {test.generalNotes && (
                      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Đánh giá chung của Giáo viên: </strong>
                          <span>{test.generalNotes}</span>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                            <th className="py-3 px-3.5 rounded-l-xl">Học Viên</th>
                            {skillsToRender.map((sk) => {
                              const found = AVAILABLE_SKILLS.find((s) => s.id === sk);
                              return (
                                <th key={sk} className="py-3 px-2.5 text-center whitespace-nowrap">
                                  {found ? found.label : sk}
                                </th>
                              );
                            })}
                            <th className="py-3 px-3 text-center bg-blue-50/70 text-blue-900">
                              🏆 Điểm Tổng (Overall)
                            </th>
                            <th className="py-3 px-3 text-center">Mục Tiêu</th>
                            <th className="py-3 px-3.5">Nhận Xét &amp; Hướng Cải Thiện</th>
                            <th className="py-3 px-3 text-center rounded-r-xl">Báo Cáo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {test.results.map((res, rIdx) => {
                            const studentObj = students.find((s) => s.id === res.studentId);
                            const targetVal = scale === 'ielts_band' ? res.targetBand : res.targetScore;
                            const targetDiff = targetVal
                              ? (res.scores.overall - targetVal).toFixed(1)
                              : null;

                            return (
                              <tr
                                key={res.studentId}
                                className="hover:bg-slate-50/90 transition-colors"
                              >
                                {/* Student Info */}
                                <td className="py-3.5 px-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-[11px] font-bold text-slate-400 w-4 text-center">
                                      {rIdx + 1}
                                    </span>
                                    <img
                                      src={
                                        res.studentAvatar ||
                                        studentObj?.avatar ||
                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                                      }
                                      alt={res.studentName}
                                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                    />
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (studentObj && onOpenStudentProfile) {
                                            onOpenStudentProfile(studentObj);
                                          }
                                        }}
                                        className="font-bold text-slate-800 hover:text-blue-600 transition-colors text-left block"
                                      >
                                        {res.studentName}
                                      </button>
                                      <span className="text-[10px] text-slate-400">
                                        {studentObj?.email || 'Học viên'}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Dynamic Skill Scores */}
                                {skillsToRender.map((sk) => {
                                  const val = (res.scores as any)[sk];
                                  return (
                                    <td key={sk} className="py-3.5 px-2.5 text-center font-mono font-bold text-slate-700">
                                      {res.status === 'absent' ? (
                                        <span className="text-slate-400 italic">Vắng</span>
                                      ) : (
                                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg">
                                          {val !== undefined ? val : '—'}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}

                                {/* Overall Score */}
                                <td className="py-3.5 px-3 text-center bg-blue-50/40">
                                  {res.status === 'absent' ? (
                                    <span className="px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                                      Vắng thi
                                    </span>
                                  ) : scale === 'ielts_band' ? (
                                    <span
                                      className={`px-3 py-1 rounded-xl font-mono font-black text-sm shadow-2xs inline-block ${getBandColorClass(
                                        res.scores.overall
                                      )}`}
                                    >
                                      Band {res.scores.overall.toFixed(1)}
                                    </span>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <span className="px-2.5 py-1 rounded-xl font-mono font-black text-xs sm:text-sm bg-blue-600 text-white shadow-2xs inline-block">
                                        {res.scores.overall} <span className="text-[10px] font-normal opacity-80">/ {max}{unit}</span>
                                      </span>
                                      {res.scores.bandEquivalent && (
                                        <span className="text-[10px] text-slate-500 font-bold block">
                                          ~ Band {res.scores.bandEquivalent}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Target Comparison */}
                                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                  {targetVal ? (
                                    <div className="space-y-0.5">
                                      <div className="text-[11px] font-bold text-slate-600">
                                        Target {targetVal}
                                      </div>
                                      {res.status === 'completed' && (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                            res.targetAchieved
                                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                                          }`}
                                        >
                                          {res.targetAchieved ? '✅ Đạt' : `⚠️ Còn ${targetDiff}`}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-mono">—</span>
                                  )}
                                </td>

                                {/* Feedback & Advice */}
                                <td className="py-3.5 px-3.5 max-w-xs">
                                  <div className="space-y-1">
                                    {res.strengths && (
                                      <p className="text-[11px] text-emerald-700">
                                        <strong className="font-semibold">Điểm mạnh:</strong>{' '}
                                        {res.strengths}
                                      </p>
                                    )}
                                    {res.improvements && (
                                      <p className="text-[11px] text-amber-700">
                                        <strong className="font-semibold">Cần rèn:</strong>{' '}
                                        {res.improvements}
                                      </p>
                                    )}
                                    {res.notes && (
                                      <p className="text-[11px] text-slate-600 italic">
                                        "{res.notes}"
                                      </p>
                                    )}
                                    {!res.strengths && !res.improvements && !res.notes && (
                                      <span className="text-[11px] text-slate-400 italic">
                                        Chưa có nhận xét
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Quick Action */}
                                <td className="py-3.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReportTest(test);
                                      setReportType('student_parent');
                                      setReportStudentId(res.studentId);
                                      setIsReportModalOpen(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Tạo phiếu gửi phụ huynh"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
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
          CREATE / EDIT TEST RECORD MODAL (WITH FLEXIBLE SCORING SETUP)
      ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-blue-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTestId ? 'Chỉnh Sửa Kết Quả Bài Test' : 'Nhập Kết Quả Bài Test Mới'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Hỗ trợ thang điểm linh hoạt (IELTS Band 0-9, Thang 10, Thang 100, Số câu) phù hợp cho mọi trình độ
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

            {/* Modal Body */}
            <form onSubmit={handleSaveTestRecord} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* 1. Scale Selector (Thang điểm linh hoạt) */}
              <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Chọn Thang Điểm Đánh Giá (Scoring Scale)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Linh hoạt cho lớp mới hoặc lớp luyện IELTS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Option 1: IELTS Band */}
                  <button
                    type="button"
                    onClick={() => handleSelectScale('ielts_band')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formScoreScale === 'ielts_band'
                        ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-base font-black">🎯 Band 0 - 9.0</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">IELTS chuẩn 4 kỹ năng</div>
                  </button>

                  {/* Option 2: Thang 10 */}
                  <button
                    type="button"
                    onClick={() => handleSelectScale('points_10')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formScoreScale === 'points_10'
                        ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-base font-black">🔟 Thang Điểm 10</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Lớp mới / Ngữ pháp / Starter</div>
                  </button>

                  {/* Option 3: Thang 100 */}
                  <button
                    type="button"
                    onClick={() => handleSelectScale('points_100')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formScoreScale === 'points_100'
                        ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 text-teal-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-base font-black">💯 Thang 100 (%)</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Trắc nghiệm / CEFR / Cambridge</div>
                  </button>

                  {/* Option 4: Số câu đúng */}
                  <button
                    type="button"
                    onClick={() => handleSelectScale('raw_points')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formScoreScale === 'raw_points'
                        ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-base font-black">📝 Số Câu Đúng</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Tùy chỉnh số câu (vd: 40 câu)</div>
                  </button>
                </div>

                {/* Custom scale configuration parameters */}
                {formScoreScale === 'raw_points' && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">Tổng số câu tối đa:</label>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={formMaxScore}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 40;
                          setFormMaxScore(v);
                        }}
                        className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-center focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">Đơn vị:</label>
                      <input
                        type="text"
                        value={formScoreUnit}
                        onChange={(e) => setFormScoreUnit(e.target.value)}
                        className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-center focus:ring-2 focus:ring-amber-500"
                        placeholder="câu"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Evaluated Skills Selector (Chọn kỹ năng đánh giá) */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Kỹ Năng &amp; Nội Dung Kiểm Tra ({formSkillsEvaluated.length} kỹ năng):
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.map((sk) => {
                    const isSelected = formSkillsEvaluated.includes(sk.id);
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => handleToggleSkill(sk.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{sk.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Top Configuration (Loại bài, Lớp, Ngày) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Category Switcher */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Loại bài kiểm tra:
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => applyPresetTemplate(e.target.value as TestCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="mini_test">⚡ 1. Mini-Test (Định kỳ)</option>
                    <option value="mid_test">🏆 2. Mid-Term Test (Giữa kỳ)</option>
                    <option value="final_test">🎓 3. Final Mock Test (Cuối khóa)</option>
                  </select>
                </div>

                {/* 2. Class Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Chọn lớp áp dụng:
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => handleClassChangeInModal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.code ? `[${c.code}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Test Date */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Ngày thi / kiểm tra:
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Tiêu đề bài kiểm tra <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Đề Thi Giữa Khóa Mid-Term Thang 10 Điểm"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Mô tả phạm vi đề thi / Dặn dò:
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="VD: Kiểm tra kiến thức Ngữ pháp thì Hiện tại & Từ vựng chủ đề School..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Live Student Score Matrix Entry */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Bảng Nhập Điểm Học Viên ({formResults.length} học sinh)
                    </h4>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      Tự động tính Điểm Tổng
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickFillScores}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    ⚡ Điền Nhanh Mẫu
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Học sinh</th>
                        <th className="py-2.5 px-2 text-center">Trạng thái</th>
                        {formSkillsEvaluated.map((sk) => {
                          const found = AVAILABLE_SKILLS.find((s) => s.id === sk);
                          return (
                            <th key={sk} className="py-2.5 px-2 text-center whitespace-nowrap">
                              {found ? found.defaultName : sk}
                            </th>
                          );
                        })}
                        <th className="py-2.5 px-3 text-center bg-blue-50 text-blue-900">
                          Điểm Tổng (Overall)
                        </th>
                        <th className="py-2.5 px-3">Điểm Mạnh &amp; Nhận Xét</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formResults.map((r) => (
                        <tr key={r.studentId} className="hover:bg-slate-50/80">
                          {/* Student */}
                          <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{r.studentName}</span>
                              {r.targetBand && formScoreScale === 'ielts_band' && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  (Target {r.targetBand})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-2 text-center">
                            <select
                              value={r.status}
                              onChange={(e) => {
                                const st = e.target.value as 'completed' | 'absent' | 'incomplete';
                                setFormResults((prev) =>
                                  prev.map((item) =>
                                    item.studentId === r.studentId ? { ...item, status: st } : item
                                  )
                                );
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold"
                            >
                              <option value="completed">Có mặt</option>
                              <option value="absent">Vắng thi</option>
                            </select>
                          </td>

                          {/* Dynamic Inputs for evaluated skills */}
                          {formSkillsEvaluated.map((sk) => {
                            const val = (r.scores as any)[sk];
                            const stepVal = formScoreScale === 'ielts_band' ? 0.5 : formScoreScale === 'points_10' ? 0.25 : 1;
                            const maxInput = formMaxScore;

                            return (
                              <td key={sk} className="py-2.5 px-2 text-center">
                                <input
                                  type="number"
                                  step={stepVal}
                                  min="0"
                                  max={maxInput}
                                  disabled={r.status === 'absent'}
                                  value={val ?? ''}
                                  onChange={(e) =>
                                    handleUpdateStudentScore(
                                      r.studentId,
                                      sk,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-14 px-1.5 py-1 text-center font-bold font-mono bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            );
                          })}

                          {/* Overall */}
                          <td className="py-2.5 px-3 text-center bg-blue-50/60 font-mono font-black text-blue-700 whitespace-nowrap">
                            {r.status === 'absent' ? (
                              '—'
                            ) : (
                              <div>
                                <span>{r.scores.overall}</span>
                                {r.scores.bandEquivalent && formScoreScale !== 'ielts_band' && (
                                  <span className="text-[10px] text-slate-500 block font-normal">
                                    ~ Band {r.scores.bandEquivalent}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Notes */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              placeholder="Nhận xét điểm mạnh / cần cải thiện..."
                              value={r.notes || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormResults((prev) =>
                                  prev.map((item) =>
                                    item.studentId === r.studentId ? { ...item, notes: val } : item
                                  )
                                );
                              }}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Teacher Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Đánh giá &amp; Nhận xét chung toàn lớp:
                </label>
                <textarea
                  rows={3}
                  value={formGeneralNotes}
                  onChange={(e) => setFormGeneralNotes(e.target.value)}
                  placeholder="VD: Cả lớp làm bài nghiêm túc, kỹ năng đọc và nhận diện từ vựng tốt. Cần ôn tập thêm cấu trúc câu điều kiện..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTestId ? 'Cập Nhật Kết Quả' : 'Lưu Kết Quả Bài Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUTO-REPORT MODAL (GỬI PHIẾU BÁO ĐIỂM TEST CHO PHỤ HUYNH / ZALO)
      ========================================================================= */}
      {isReportModalOpen && reportTest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-blue-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Báo Cáo Điểm Test Tự Động (Zalo / Phụ Huynh)
                  </h3>
                  <p className="text-xs text-blue-200">
                    Bài thi: <strong>{reportTest.title}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
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
                    reportType === 'class_zalo'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>1. Bảng Điểm Nhóm Lớp Zalo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('student_parent')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    reportType === 'student_parent'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>2. Phiếu Điểm Riêng Phụ Huynh</span>
                </button>
              </div>

              {/* Student Selector when sending private */}
              {reportType === 'student_parent' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Chọn học sinh gửi báo cáo:
                  </label>
                  <select
                    value={reportStudentId}
                    onChange={(e) => setReportStudentId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {reportTest.results.map((r) => (
                      <option key={r.studentId} value={r.studentId}>
                        {r.studentName} — Điểm: {r.scores.overall}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Xem trước nội dung tin nhắn:
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Đã chuẩn bị sẵn mẫu tin theo thang điểm
                  </span>
                </div>
                <textarea
                  readOnly
                  rows={12}
                  value={generateTestReportText(reportTest, reportType, reportStudentId)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-hidden select-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => {
                  const txt = generateTestReportText(reportTest, reportType, reportStudentId);
                  navigator.clipboard.writeText(txt);
                  showToast('Đã sao chép phiếu báo điểm vào bộ nhớ tạm (sẵn sàng dán vào Zalo)!');
                  setIsReportModalOpen(false);
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
    </div>
  );
};

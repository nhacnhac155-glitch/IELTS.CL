import { Question, QuestionType, SkillType } from '../types';

export interface QuestionTypeMeta {
  type: QuestionType;
  category: 'completion' | 'choice' | 'identification' | 'matching' | 'visual';
  categoryLabel: string;
  title: string;
  titleEn: string;
  badge: string;
  badgeColor: string;
  description: string;
  applicableSkills: SkillType[];
  createDefault: (idx?: number) => Question;
}

export const IELTS_QUESTION_TYPES_CONFIG: QuestionTypeMeta[] = [
  // 1. Identification
  {
    type: 'true_false_ng',
    category: 'identification',
    categoryLabel: 'Xác Thực Thông Tin',
    title: 'True / False / Not Given',
    titleEn: 'Identifying Information (Factual)',
    badge: 'T / F / NG',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Xác thực thông tin sự thật trong bài đọc IELTS (TRUE / FALSE / NOT GIVEN)',
    applicableSkills: ['reading'],
    createDefault: (idx = 1) => ({
      id: `q-tfng-${Date.now()}-${idx}`,
      type: 'true_false_ng',
      questionText: 'The author states that modern urban infrastructure relies predominantly on renewable energy.',
      instruction: 'Do the following statements agree with the information given in the Reading Passage? Write TRUE, FALSE or NOT GIVEN.',
      correctAnswer: 'TRUE',
      explanation: 'Đoạn 1 nêu rõ các thành phố hiện đại đang chuyển dịch sang năng lượng tái tạo.'
    })
  },
  {
    type: 'yes_no_ng',
    category: 'identification',
    categoryLabel: 'Xác Thực Thông Tin',
    title: 'Yes / No / Not Given',
    titleEn: "Identifying Writer's Views / Claims",
    badge: 'Y / N / NG',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    description: 'Nhận định quan điểm, lập luận hoặc ý kiến của tác giả (YES / NO / NOT GIVEN)',
    applicableSkills: ['reading'],
    createDefault: (idx = 1) => ({
      id: `q-ynng-${Date.now()}-${idx}`,
      type: 'yes_no_ng',
      questionText: 'Governments have demonstrated sufficient commitment to combating global carbon emissions.',
      instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
      correctAnswer: 'NO',
      explanation: 'Tác giả lập luận rằng các chính phủ vẫn chưa hành động quyết liệt đúng mức.'
    })
  },

  // 2. Choice
  {
    type: 'multiple_choice',
    category: 'choice',
    categoryLabel: 'Trắc Nghiệm',
    title: 'Multiple Choice (1 Đáp Án)',
    titleEn: 'Multiple Choice (Single Answer)',
    badge: 'MCQ (1)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Chọn 1 đáp án chính xác nhất trong 4 lựa chọn (A, B, C, D)',
    applicableSkills: ['reading', 'listening', 'vocabulary'],
    createDefault: (idx = 1) => ({
      id: `q-mcq-${Date.now()}-${idx}`,
      type: 'multiple_choice',
      questionText: 'What is the primary factor contributing to the decline in marine biodiversity?',
      instruction: 'Choose the correct letter, A, B, C or D.',
      options: [
        'A. Unregulated commercial overfishing and habitat loss',
        'B. Seasonal climate variations in equatorial waters',
        'C. Natural migration patterns of apex marine predators',
        'D. Periodic fluctuations in ocean surface temperatures'
      ],
      correctAnswer: 'A',
      explanation: 'Đoạn văn nhấn mạnh hoạt động đánh bắt quá mức và mất môi trường sống là nguyên nhân chính.'
    })
  },
  {
    type: 'multiple_choice_multi',
    category: 'choice',
    categoryLabel: 'Trắc Nghiệm',
    title: 'Multiple Choice (Nhiều Đáp Án)',
    titleEn: 'Multiple Choice (Choose Two or More)',
    badge: 'MCQ (Nhiều)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Chọn 2 hoặc nhiều chữ cái chính xác từ danh sách 5-7 phương án (A-E / A-G)',
    applicableSkills: ['reading', 'listening'],
    createDefault: (idx = 1) => ({
      id: `q-mcq-multi-${Date.now()}-${idx}`,
      type: 'multiple_choice_multi',
      questionText: 'Which TWO of the following benefits of remote working are mentioned in the text?',
      instruction: 'Choose TWO letters, A-E.',
      options: [
        'A. Substantial reduction in daily commuting expenses and transit stress',
        'B. Guaranteed promotions for autonomous employees',
        'C. Enhanced flexibility in managing personal and professional schedules',
        'D. Complete elimination of all workplace conflict',
        'E. Higher corporate subsidies for residential utilities'
      ],
      correctAnswer: ['A', 'C'],
      explanation: 'Bài đề cập rõ ràng đến việc tiết kiệm chi phí đi lại (A) và sự linh hoạt thời gian (C).'
    })
  },

  // 3. Matching
  {
    type: 'heading_matching',
    category: 'matching',
    categoryLabel: 'Dạng Nối (Matching)',
    title: 'Matching Headings',
    titleEn: 'Matching Headings to Paragraphs',
    badge: 'Headings (i-vii)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Nối tiêu đề số La Mã (i, ii, iii, iv...) phù hợp cho từng đoạn văn',
    applicableSkills: ['reading'],
    createDefault: (idx = 1) => ({
      id: `q-head-${Date.now()}-${idx}`,
      type: 'heading_matching',
      paragraphLabel: `Paragraph ${String.fromCharCode(64 + idx)}`,
      questionText: `Chọn tiêu đề phù hợp nhất cho Paragraph ${String.fromCharCode(64 + idx)}`,
      instruction: 'The Reading Passage has several paragraphs. Choose the correct heading for each paragraph from the list of headings below.',
      headings: [
        'i. Technological innovations in agricultural irrigation',
        'ii. The economic ramifications of prolonged drought',
        'iii. Historical background of ancient water management',
        'iv. Environmental resistance and community scepticism',
        'v. Future projections and global recommendations',
        'vi. Comparison between traditional and modern techniques'
      ],
      correctAnswer: 'ii',
      explanation: 'Đoạn văn tập trung phân tích thiệt hại kinh tế do hạn hán kéo dài.'
    })
  },
  {
    type: 'matching_information',
    category: 'matching',
    categoryLabel: 'Dạng Nối (Matching)',
    title: 'Matching Information',
    titleEn: 'Which paragraph contains the information?',
    badge: 'Match Info (A-F)',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    description: 'Xác định thông tin/dữ kiện được nêu thuộc đoạn văn nào (Paragraph A, B, C...)',
    applicableSkills: ['reading', 'listening'],
    createDefault: (idx = 1) => ({
      id: `q-minfo-${Date.now()}-${idx}`,
      type: 'matching_information',
      questionText: 'A detailed reference to the financial grants provided by international organisations.',
      instruction: 'Which paragraph contains the following information? Write the correct letter, A-F.',
      options: ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F'],
      correctAnswer: 'C',
      explanation: 'Thông tin về tài trợ tài chính quốc tế nằm ở đoạn C.'
    })
  },
  {
    type: 'matching_features',
    category: 'matching',
    categoryLabel: 'Dạng Nối (Matching)',
    title: 'Matching Features / Names',
    titleEn: 'Matching People, Findings or Categories',
    badge: 'Features',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    description: 'Nối câu nhận định với tên nhà nghiên cứu, địa điểm hoặc nhóm đặc tính',
    applicableSkills: ['reading', 'listening'],
    createDefault: (idx = 1) => ({
      id: `q-feat-${Date.now()}-${idx}`,
      type: 'matching_features',
      questionText: 'Stated that linguistic diversity is directly linked to cultural resilience.',
      instruction: 'Look at the following statements and the list of researchers below. Match each statement with the correct researcher, A-D.',
      options: [
        'A. Dr. Arthur Miller',
        'B. Professor Elena Rostova',
        'C. Dr. Marcus Chen',
        'D. Dr. Fiona Gallagher'
      ],
      correctAnswer: 'B',
      explanation: 'Giáo sư Elena Rostova là người đưa ra kết luận về mối quan hệ giữa đa dạng ngôn ngữ và văn hoá.'
    })
  },
  {
    type: 'matching_sentence_endings',
    category: 'matching',
    categoryLabel: 'Dạng Nối (Matching)',
    title: 'Matching Sentence Endings',
    titleEn: 'Completing sentences from a list of endings',
    badge: 'Endings',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
    description: 'Nối nửa đầu câu hỏi với nửa câu kết thúc thích hợp trong danh sách A-G',
    applicableSkills: ['reading'],
    createDefault: (idx = 1) => ({
      id: `q-ending-${Date.now()}-${idx}`,
      type: 'matching_sentence_endings',
      questionText: 'Early prototypes of automated navigation systems...',
      instruction: 'Complete each sentence with the correct ending, A-E, below.',
      options: [
        'A. suffered from intermittent signal latency in dense urban areas.',
        'B. received immediate unanimous endorsement from civil aviation bodies.',
        'C. were rapidly abandoned due to prohibitive manufacturing expenses.',
        'D. established the foundational algorithms for modern spatial mapping.',
        'E. failed to comply with fundamental maritime safety directives.'
      ],
      correctAnswer: 'D',
      explanation: 'Trong bài nêu các nguyên mẫu đầu tiên đã đặt nền móng thuật toán cho bản đồ hiện đại.'
    })
  },

  // 4. Completion
  {
    type: 'fill_blank',
    category: 'completion',
    categoryLabel: 'Điền Từ (Completion)',
    title: 'Sentence Completion',
    titleEn: 'Fill in the Blank (Sentence Completion)',
    badge: 'Điền từ',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Điền từ chính xác vào chỗ trống trong câu (có giới hạn từ)',
    applicableSkills: ['reading', 'listening', 'vocabulary'],
    createDefault: (idx = 1) => ({
      id: `q-fill-${Date.now()}-${idx}`,
      type: 'fill_blank',
      questionText: 'The newly constructed research laboratory is powered primarily by [BLANK] harvested on site.',
      instruction: 'Complete the sentence below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
      wordLimit: 'NO MORE THAN TWO WORDS',
      correctAnswer: 'solar energy',
      explanation: 'Đoạn văn nói phòng nghiên cứu sử dụng năng lượng mặt trời (solar energy).'
    })
  },
  {
    type: 'summary_completion',
    category: 'completion',
    categoryLabel: 'Điền Từ (Completion)',
    title: 'Summary / Note / Table Completion',
    titleEn: 'Summary, Note, Table, Flow-chart Completion',
    badge: 'Tóm tắt/Bảng',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Điền từ vào đoạn tóm tắt, ghi chú bài nghe Section 1/4 hoặc bảng tổng hợp',
    applicableSkills: ['reading', 'listening'],
    createDefault: (idx = 1) => ({
      id: `q-sum-${Date.now()}-${idx}`,
      type: 'summary_completion',
      questionText: 'In the early phase of the project, engineers encountered unexpected issues with [BLANK] due to high humidity.',
      instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
      wordLimit: 'ONE WORD ONLY',
      summaryText: 'Summary: Project Milestones\nIn the early phase of the project, engineers encountered unexpected issues with [BLANK] due to high humidity.',
      correctAnswer: 'corrosion',
      explanation: 'Bài viết chỉ ra vấn đề ăn mòn kim loại (corrosion) trong môi trường độ ẩm cao.'
    })
  },
  {
    type: 'short_answer',
    category: 'completion',
    categoryLabel: 'Điền Từ (Completion)',
    title: 'Short-Answer Questions',
    titleEn: 'Short-Answer Questions',
    badge: 'Trả lời ngắn',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Trả lời câu hỏi trực tiếp bằng từ ngữ từ bài đọc/nghe (tối đa 1-3 từ)',
    applicableSkills: ['reading', 'listening'],
    createDefault: (idx = 1) => ({
      id: `q-short-${Date.now()}-${idx}`,
      type: 'short_answer',
      questionText: 'What specific material was utilized to insulate the exterior facade of the building?',
      instruction: 'Answer the question below. Choose NO MORE THAN THREE WORDS from the passage for each answer.',
      wordLimit: 'NO MORE THAN THREE WORDS',
      correctAnswer: 'recycled cellulose fiber',
      explanation: 'Vật liệu được nhắc đến trực tiếp là recycled cellulose fiber.'
    })
  },

  // 5. Visuals
  {
    type: 'diagram_labeling',
    category: 'visual',
    categoryLabel: 'Sơ Đồ / Bản Đồ',
    title: 'Map / Plan / Diagram Labeling',
    titleEn: 'Labeling a Map, Plan or Diagram',
    badge: 'Bản đồ / Sơ đồ',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Gán nhãn các vị trí (A-H) trên bản đồ mặt bằng hoặc sơ đồ quy trình kỹ thuật',
    applicableSkills: ['reading', 'listening'],
    createDefault: (idx = 1) => ({
      id: `q-diag-${Date.now()}-${idx}`,
      type: 'diagram_labeling',
      questionText: 'New Student Advisory Center & Information Desk:',
      instruction: 'Label the map below. Write the correct letter, A-G, next to Questions.',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      correctAnswer: 'C',
      explanation: 'Phòng tư vấn sinh viên nằm ở vị trí C trên bản đồ bên cạnh cổng chính.'
    })
  }
];

export const CAMBRIDGE_PRESET_TEMPLATES = [
  {
    id: 'reading-passage-1',
    skill: 'reading' as SkillType,
    name: 'Reading Passage 1: Descriptive & Factual',
    taskType: 'Academic Reading Passage 1',
    timeLimitMinutes: 20,
    description: 'Bộ câu hỏi chuẩn Passage 1: True/False/Not Given + Sentence Completion + Note Completion.',
    questions: [
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'true_false_ng')!.createDefault(1),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'true_false_ng')!.createDefault(2),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'fill_blank')!.createDefault(3),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'summary_completion')!.createDefault(4)
    ]
  },
  {
    id: 'reading-passage-2',
    skill: 'reading' as SkillType,
    name: 'Reading Passage 2: Analytical & Matching',
    taskType: 'Academic Reading Passage 2',
    timeLimitMinutes: 20,
    description: 'Bộ câu hỏi chuẩn Passage 2: Matching Headings (i-vi) + Matching Information + Multiple Choice.',
    questions: [
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'heading_matching')!.createDefault(1),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'matching_information')!.createDefault(2),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'matching_features')!.createDefault(3),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'multiple_choice')!.createDefault(4)
    ]
  },
  {
    id: 'reading-passage-3',
    skill: 'reading' as SkillType,
    name: 'Reading Passage 3: Complex Discussion & Claims',
    taskType: 'Academic Reading Passage 3',
    timeLimitMinutes: 20,
    description: 'Bộ câu hỏi chuẩn Passage 3: Yes/No/Not Given + Multiple Choice Multi (Chọn 2) + Matching Sentence Endings.',
    questions: [
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'yes_no_ng')!.createDefault(1),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'multiple_choice_multi')!.createDefault(2),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'matching_sentence_endings')!.createDefault(3),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'short_answer')!.createDefault(4)
    ]
  },
  {
    id: 'listening-section-1',
    skill: 'listening' as SkillType,
    name: 'Listening Section 1: Form & Table Completion',
    taskType: 'Listening Section 1 - Dialogue & Form',
    timeLimitMinutes: 10,
    description: 'Điền thông tin vào mẫu đơn/ghi chú (Tên, địa chỉ, số điện thoại, ngày giờ).',
    questions: [
      {
        ...IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'fill_blank')!.createDefault(1),
        questionText: 'Customer Contact Number: 07823 [BLANK]',
        wordLimit: 'ONE WORD AND/OR A NUMBER',
        correctAnswer: '992014',
        explanation: 'Người gọi đọc số điện thoại 07823 992014.'
      },
      {
        ...IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'fill_blank')!.createDefault(2),
        questionText: 'Preferred delivery day: [BLANK]',
        wordLimit: 'ONE WORD ONLY',
        correctAnswer: 'Thursday',
        explanation: 'Khách hàng yêu cầu giao vào thứ Năm.'
      }
    ]
  },
  {
    id: 'listening-section-2',
    skill: 'listening' as SkillType,
    name: 'Listening Section 2: Map Labeling & Monologue',
    taskType: 'Listening Section 2 - Local Map / Tour',
    timeLimitMinutes: 10,
    description: 'Gán nhãn sơ đồ/bản đồ khu vực + Câu hỏi trắc nghiệm A/B/C.',
    questions: [
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'diagram_labeling')!.createDefault(1),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'multiple_choice')!.createDefault(2)
    ]
  },
  {
    id: 'listening-section-3',
    skill: 'listening' as SkillType,
    name: 'Listening Section 3: Academic Discussion & Multi-MCQ',
    taskType: 'Listening Section 3 - University Tutorial',
    timeLimitMinutes: 12,
    description: 'Thảo luận học thuật giữa 2-3 sinh viên/giảng viên: MCQ chọn nhiều đáp án + Matching Features.',
    questions: [
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'multiple_choice_multi')!.createDefault(1),
      IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'matching_features')!.createDefault(2)
    ]
  },
  {
    id: 'listening-section-4',
    skill: 'listening' as SkillType,
    name: 'Listening Section 4: Academic Lecture Notes',
    taskType: 'Listening Section 4 - Academic Monologue',
    timeLimitMinutes: 15,
    description: 'Điền từ vào ghi chú bài giảng khoa học (ONE WORD ONLY).',
    questions: [
      {
        ...IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'summary_completion')!.createDefault(1),
        questionText: 'The main barrier to widespread adoption is high initial [BLANK] expenditure.',
        wordLimit: 'ONE WORD ONLY',
        correctAnswer: 'capital',
        explanation: 'Giáo sư nhấn mạnh chi phí vốn ban đầu (capital expenditure).'
      },
      {
        ...IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'fill_blank')!.createDefault(2),
        questionText: 'Marine ecosystems are increasingly vulnerable to ocean [BLANK] caused by carbon absorption.',
        wordLimit: 'ONE WORD ONLY',
        correctAnswer: 'acidification',
        explanation: 'Hiện tượng axit hoá đại dương (acidification).'
      }
    ]
  }
];

// Normalize strings for comparison
export function normalizeIeltsAnswer(str: string | undefined): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/^["']|["']$/g, '') // remove surrounding quotes
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ') // replace punctuation with space
    .replace(/\s+/g, ' ') // collapse multi-spaces
    .trim();
}

// Evaluate single question response
export function evaluateIeltsAnswer(question: Question, rawStudentAnswer: any): { isCorrect: boolean; normalizedStudent: string; normalizedCorrect: string } {
  if (rawStudentAnswer === undefined || rawStudentAnswer === null || rawStudentAnswer === '') {
    return { isCorrect: false, normalizedStudent: '(Chưa làm)', normalizedCorrect: formatCorrectAnswerDisplay(question.correctAnswer) };
  }

  const { type, correctAnswer } = question;
  if (!correctAnswer) {
    return { isCorrect: false, normalizedStudent: String(rawStudentAnswer), normalizedCorrect: '—' };
  }

  // Handle Multi-choice multi-select (e.g. ['A', 'C'])
  if (type === 'multiple_choice_multi') {
    const studentArr: string[] = Array.isArray(rawStudentAnswer) 
      ? rawStudentAnswer 
      : String(rawStudentAnswer).split(/[,;\s]+/).filter(Boolean);

    const correctArr: string[] = Array.isArray(correctAnswer) 
      ? correctAnswer 
      : String(correctAnswer).split(/[,;\s]+/).filter(Boolean);

    const normStudentSet = new Set(studentArr.map(s => s.trim().toUpperCase().charAt(0)));
    const normCorrectSet = new Set(correctArr.map(c => c.trim().toUpperCase().charAt(0)));

    if (normStudentSet.size !== normCorrectSet.size) {
      return { 
        isCorrect: false, 
        normalizedStudent: Array.from(normStudentSet).sort().join(', '), 
        normalizedCorrect: Array.from(normCorrectSet).sort().join(', ') 
      };
    }

    let isAllMatch = true;
    for (const item of normCorrectSet) {
      if (!normStudentSet.has(item)) {
        isAllMatch = false;
        break;
      }
    }

    return {
      isCorrect: isAllMatch,
      normalizedStudent: Array.from(normStudentSet).sort().join(', '),
      normalizedCorrect: Array.from(normCorrectSet).sort().join(', ')
    };
  }

  // Single string comparison
  const studentStr = String(rawStudentAnswer).trim();
  const correctStr = Array.isArray(correctAnswer) ? correctAnswer.join(', ') : String(correctAnswer).trim();

  // True/False/Not Given shortcuts
  if (type === 'true_false_ng') {
    const sUpper = studentStr.toUpperCase();
    const cUpper = correctStr.toUpperCase();
    const isCorrect = (sUpper === cUpper) ||
      (sUpper === 'T' && cUpper === 'TRUE') ||
      (sUpper === 'F' && cUpper === 'FALSE') ||
      (sUpper === 'NG' && cUpper === 'NOT GIVEN');
    return { isCorrect, normalizedStudent: sUpper, normalizedCorrect: cUpper };
  }

  // Yes/No/Not Given shortcuts
  if (type === 'yes_no_ng') {
    const sUpper = studentStr.toUpperCase();
    const cUpper = correctStr.toUpperCase();
    const isCorrect = (sUpper === cUpper) ||
      (sUpper === 'Y' && cUpper === 'YES') ||
      (sUpper === 'N' && cUpper === 'NO') ||
      (sUpper === 'NG' && cUpper === 'NOT GIVEN');
    return { isCorrect, normalizedStudent: sUpper, normalizedCorrect: cUpper };
  }

  // Multiple Choice Single / Matching letter (A, B, C, D...)
  if (type === 'multiple_choice' || type === 'matching_information' || type === 'matching_features' || type === 'matching_sentence_endings' || type === 'diagram_labeling') {
    // Check first letter if single letter choice
    const sLetter = studentStr.trim().toUpperCase().charAt(0);
    const cLetter = correctStr.trim().toUpperCase().charAt(0);

    const isMatch = (sLetter === cLetter) || (normalizeIeltsAnswer(studentStr) === normalizeIeltsAnswer(correctStr));
    return {
      isCorrect: isMatch,
      normalizedStudent: studentStr,
      normalizedCorrect: correctStr
    };
  }

  // Heading Matching (i, ii, iii, iv, v, vi, vii, viii, ix, x)
  if (type === 'heading_matching') {
    const sHeading = studentStr.trim().toLowerCase().replace(/^heading\s*/i, '');
    const cHeading = correctStr.trim().toLowerCase().replace(/^heading\s*/i, '');
    const isMatch = sHeading === cHeading || normalizeIeltsAnswer(studentStr) === normalizeIeltsAnswer(correctStr);
    return {
      isCorrect: isMatch,
      normalizedStudent: studentStr,
      normalizedCorrect: correctStr
    };
  }

  // Completion (fill_blank, summary_completion, short_answer)
  // Supports slash `/` or `or` alternatives in correct answer key (e.g. "solar energy / solar power")
  const normalizedStud = normalizeIeltsAnswer(studentStr);
  const possibleAnswers = correctStr.split(/[\/;|]|\s+or\s+/i).map(ans => normalizeIeltsAnswer(ans));

  const isCorrect = possibleAnswers.some(ans => ans === normalizedStud && ans.length > 0);

  return {
    isCorrect,
    normalizedStudent: studentStr,
    normalizedCorrect: correctStr
  };
}

export function evaluateAnswerSheetItem(
  studentAnswer: string | undefined,
  correctAnswer: string | undefined,
  acceptableAnswers?: string[]
): { isCorrect: boolean; normalizedStudent: string; normalizedCorrect: string } {
  const studStr = String(studentAnswer || '').trim();
  const corrStr = String(correctAnswer || '').trim();

  if (!studStr) {
    return { isCorrect: false, normalizedStudent: '(Chưa làm)', normalizedCorrect: corrStr };
  }

  // Check True/False/Not Given
  const studUpper = studStr.toUpperCase();
  const corrUpper = corrStr.toUpperCase();

  if (['TRUE', 'FALSE', 'NOT GIVEN', 'T', 'F', 'NG'].includes(corrUpper)) {
    const isTfNgMatch = (studUpper === corrUpper) ||
      (studUpper === 'T' && corrUpper === 'TRUE') ||
      (studUpper === 'TRUE' && corrUpper === 'T') ||
      (studUpper === 'F' && corrUpper === 'FALSE') ||
      (studUpper === 'FALSE' && corrUpper === 'F') ||
      (studUpper === 'NG' && corrUpper === 'NOT GIVEN') ||
      (studUpper === 'NOT GIVEN' && corrUpper === 'NG');
    if (isTfNgMatch) return { isCorrect: true, normalizedStudent: studUpper, normalizedCorrect: corrUpper };
  }

  // Check Yes/No/Not Given
  if (['YES', 'NO', 'NOT GIVEN', 'Y', 'N', 'NG'].includes(corrUpper)) {
    const isYnMatch = (studUpper === corrUpper) ||
      (studUpper === 'Y' && corrUpper === 'YES') ||
      (studUpper === 'YES' && corrUpper === 'Y') ||
      (studUpper === 'N' && corrUpper === 'NO') ||
      (studUpper === 'NO' && corrUpper === 'N') ||
      (studUpper === 'NG' && corrUpper === 'NOT GIVEN') ||
      (studUpper === 'NOT GIVEN' && corrUpper === 'NG');
    if (isYnMatch) return { isCorrect: true, normalizedStudent: studUpper, normalizedCorrect: corrUpper };
  }

  // Check Single letter A, B, C, D...
  if (/^[A-H]$/i.test(corrStr) && /^[A-H]$/i.test(studStr)) {
    if (studUpper === corrUpper) {
      return { isCorrect: true, normalizedStudent: studUpper, normalizedCorrect: corrUpper };
    }
  }

  // Check Roman numerals i, ii, iii, iv, v, vi, vii, viii, ix, x
  const romanPattern = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)$/i;
  if (romanPattern.test(corrStr.trim()) && romanPattern.test(studStr.trim())) {
    if (corrStr.trim().toLowerCase() === studStr.trim().toLowerCase()) {
      return { isCorrect: true, normalizedStudent: studStr.trim().toLowerCase(), normalizedCorrect: corrStr.trim().toLowerCase() };
    }
  }

  // Text normalization and alternative splits
  const allAcceptable: string[] = [];
  if (corrStr) {
    allAcceptable.push(...corrStr.split(/[\/;|]|\s+or\s+/i).map(s => s.trim()).filter(Boolean));
  }
  if (Array.isArray(acceptableAnswers)) {
    allAcceptable.push(...acceptableAnswers.map(s => s.trim()).filter(Boolean));
  }

  const normStud = normalizeIeltsAnswer(studStr);
  const isMatch = allAcceptable.some(acc => {
    const normAcc = normalizeIeltsAnswer(acc);
    return normAcc === normStud && normAcc.length > 0;
  });

  return {
    isCorrect: isMatch,
    normalizedStudent: studStr,
    normalizedCorrect: corrStr
  };
}

export function formatCorrectAnswerDisplay(correctAnswer: string | string[] | undefined): string {
  if (!correctAnswer) return '—';
  if (Array.isArray(correctAnswer)) return correctAnswer.join(', ');
  return String(correctAnswer);
}

export const IELTS_QUESTION_TYPES_MAP: Record<string, QuestionTypeMeta> = IELTS_QUESTION_TYPES_CONFIG.reduce((acc, curr) => {
  acc[curr.type] = curr;
  return acc;
}, {} as Record<string, QuestionTypeMeta>);

export function getIeltsQuestionTypeMeta(type: string): QuestionTypeMeta {
  return IELTS_QUESTION_TYPES_MAP[type] || {
    type: type as any,
    category: 'choice',
    categoryLabel: 'IELTS Standard',
    title: type,
    titleEn: type,
    badge: type.toUpperCase(),
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: '',
    applicableSkills: ['reading', 'listening'],
    createDefault: () => ({ id: `q-${Date.now()}`, type: type as any, questionText: '' })
  };
}

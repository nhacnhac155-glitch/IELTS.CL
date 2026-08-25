import { Assignment, AttendanceRecord, ClassGroup, ClassScheduleSession, InClassResult, Student, Submission, UserAccount, AuthUser, TestRecord } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_ASSIGNMENTS, INITIAL_CLASSES, INITIAL_SCHEDULES, INITIAL_STUDENTS, INITIAL_SUBMISSIONS } from '../mockData';
import { roundIELTSBand } from '../utils/formatters';

const STORAGE_KEYS = {
  ACCOUNTS: 'ielts_app_accounts_v1',
  AUTH_SESSION: 'ielts_app_auth_session_v1',
  ASSIGNMENTS: 'ielts_app_assignments_v1',
  STUDENTS: 'ielts_app_students_v1',
  SUBMISSIONS: 'ielts_app_submissions_v1',
  CLASSES: 'ielts_app_classes_v1',
  ATTENDANCE: 'ielts_app_attendance_v1',
  SCHEDULES: 'ielts_app_schedules_v1',
  IN_CLASS_RESULTS: 'ielts_app_in_class_results_v1',
  TEST_RECORDS: 'ielts_app_test_records_v1',
};

const INITIAL_TEST_RECORDS: TestRecord[] = [
  {
    id: 'test-mini-01',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive Target 6.5+ (K88)',
    type: 'mini_test',
    title: 'Mini-Test Định Kỳ 01: Listening & Reading Section 1-2',
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    format: 'custom',
    skillsEvaluated: ['listening', 'reading'],
    scoreScale: 'ielts_band',
    maxScore: 9.0,
    scoreUnit: 'Band',
    scoreType: 'band',
    description: 'Kiểm tra 45 phút kỹ năng Listening & Reading dạng bài Gap-fill và Multiple Choice.',
    generalNotes: 'Cả lớp nắm chắc chiến thuật bắt từ khóa, tuy nhiên Reading Section 2 còn nhầm lẫn phần True/False/Not Given.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    results: [
      {
        studentId: 'std-01',
        studentName: 'Nguyễn Minh Anh',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        scores: {
          listening: 7.5,
          reading: 8.0,
          overall: 8.0,
        },
        targetBand: 7.0,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Khả năng skimming & scanning rất nhanh, không bị bẫy từ đồng nghĩa.',
        improvements: 'Chú ý tốc độ làm bài khi gặp bài đọc dài.',
        notes: 'Vượt mục tiêu Target 7.0 một cách thuyết phục!',
      },
      {
        studentId: 'std-02',
        studentName: 'Trần Hoàng Long',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        scores: {
          listening: 6.5,
          reading: 6.5,
          overall: 6.5,
        },
        targetBand: 6.5,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Listening Part 1 đúng tuyệt đối 10/10.',
        improvements: 'Phần Reading Matching Headings cần đọc kỹ câu chủ đề của đoạn văn.',
        notes: 'Đạt đúng chỉ tiêu target 6.5 đề ra.',
      },
      {
        studentId: 'std-03',
        studentName: 'Lê Thu Thảo',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        scores: {
          listening: 6.0,
          reading: 5.5,
          overall: 6.0,
        },
        targetBand: 6.0,
        targetAchieved: false,
        status: 'completed',
        strengths: 'Nghe hiểu ý chính tốt.',
        improvements: 'Cần tăng cường vốn từ học thuật Academic Word List để làm bài Reading Passage 2.',
        notes: 'Cần thêm 0.5 band Reading để cán mốc mục tiêu 6.0.',
      },
    ],
  },
  {
    id: 'test-foundation-01',
    classId: 'class-foundation-55',
    className: 'IELTS Foundation 5.0-5.5 (K12)',
    type: 'mini_test',
    title: 'Kiểm Tra Tiến Độ Tháng 1: Thang Điểm 10 (Ngữ Pháp, Từ Vựng & Đọc Cơ Bản)',
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    format: 'custom',
    skillsEvaluated: ['reading', 'grammar', 'vocabulary'],
    scoreScale: 'points_10',
    maxScore: 10,
    scoreUnit: 'điểm',
    scoreType: 'points',
    autoBandConversion: true,
    description: 'Dành riêng cho lớp mới làm quen nền tảng Tiếng Anh, chấm điểm thang 10 chuẩn trước khi bước vào luyện đề IELTS 4 kỹ năng.',
    generalNotes: 'Học viên nắm vững ngữ pháp câu đơn và thì cơ bản, từ vựng theo chủ đề gia đình & trường học làm rất tốt.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    results: [
      {
        studentId: 'std-05',
        studentName: 'Vũ Hải Yến',
        studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        scores: {
          reading: 8.5,
          grammar: 9.0,
          vocabulary: 8.0,
          overall: 8.5,
          bandEquivalent: 6.0,
        },
        targetScore: 8.0,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Ngữ pháp rất chắc (9.0/10), phát âm và nhận diện từ vựng tốt.',
        improvements: 'Tăng tốc độ đọc hiểu văn bản dài.',
        notes: 'Đạt 8.5/10 điểm (Tương đương Band 6.0 IELTS), tiến bộ rất nhanh!',
      },
    ],
  },
  {
    id: 'test-mid-01',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive Target 6.5+ (K88)',
    type: 'mid_test',
    title: 'Đề Thi Giữa Khóa Mid-Term Assessment: Đánh Giá Toàn Diện 4 Kỹ Năng',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    format: 'four_skills',
    skillsEvaluated: ['listening', 'reading', 'writing', 'speaking'],
    maxScore: 9.0,
    scoreType: 'band',
    description: 'Kỳ thi giữa kỳ đánh giá tiến độ học viên sau 6 tuần học tập. Bài thi chuẩn đề thi thật Cambridge IELTS.',
    generalNotes: 'Mặt bằng chung kỹ năng Listening & Reading có sự bứt phá. Kỹ năng Writing Task 2 cần tập trung phát triển ý và hạn chế lỗi ngữ pháp câu phức.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    results: [
      {
        studentId: 'std-01',
        studentName: 'Nguyễn Minh Anh',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        scores: {
          listening: 7.5,
          reading: 8.0,
          writing: 7.0,
          speaking: 7.0,
          overall: 7.5,
        },
        targetBand: 7.0,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Toàn diện cả 4 kỹ năng. Writing mạch lạc, lập luận chặt chẽ; Speaking lưu loát và tự nhiên.',
        improvements: 'Duy trì phong độ và luyện thêm dạng bài Map Labelling trong Listening.',
        notes: 'Đạt danh hiệu Thủ khoa Mid-term của lớp (Band 7.5)!',
      },
      {
        studentId: 'std-02',
        studentName: 'Trần Hoàng Long',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        scores: {
          listening: 7.0,
          reading: 6.5,
          writing: 6.0,
          speaking: 6.5,
          overall: 6.5,
        },
        targetBand: 6.5,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Listening và Speaking tiến bộ rõ rệt so với đầu khóa (+0.5 band).',
        improvements: 'Writing Task 1 cần phân tích xu hướng và chọn số liệu nổi bật thay vì liệt kê.',
        notes: 'Đã hoàn thành mục tiêu 6.5, có tiềm năng bứt phá lên 7.0 nếu chăm chỉ hơn.',
      },
      {
        studentId: 'std-03',
        studentName: 'Lê Thu Thảo',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        scores: {
          listening: 6.0,
          reading: 6.0,
          writing: 5.5,
          speaking: 6.0,
          overall: 6.0,
        },
        targetBand: 6.0,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Speaking tự tin hơn hẳn, phát âm rõ âm cuối.',
        improvements: 'Writing Task 2 cần căn chỉnh thời gian làm bài, chú ý không viết lạc đề đoạn thân bài 2.',
        notes: 'Chạm mốc mục tiêu 6.0, cần tiếp tục giữ vững động lực ở giai đoạn 2.',
      },
    ],
  },
  {
    id: 'test-final-01',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive Target 6.5+ (K88)',
    type: 'final_test',
    title: 'Kỳ Thi Thử Tốt Nghiệp Final Mock Test: Chuẩn Khung Khảo Thí Quốc Tế',
    date: new Date().toISOString().split('T')[0],
    format: 'four_skills',
    skillsEvaluated: ['listening', 'reading', 'writing', 'speaking'],
    maxScore: 9.0,
    scoreType: 'band',
    description: 'Thi thử tốt nghiệp cuối khóa sát với độ khó đề thi thật IDP/BC 2024-2025. Phỏng vấn Speaking 1-1 với giám khảo.',
    generalNotes: 'Buổi thi nghiêm túc, chấm chéo 2 giáo viên để đảm bảo tính khách quan tối đa.',
    createdAt: new Date().toISOString(),
    results: [
      {
        studentId: 'std-01',
        studentName: 'Nguyễn Minh Anh',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        scores: {
          listening: 8.0,
          reading: 8.5,
          writing: 7.0,
          speaking: 7.5,
          overall: 8.0,
        },
        targetBand: 7.0,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Reading & Listening xuất sắc (8.0-8.5). Speaking phản xạ lưu loát chuẩn C1.',
        improvements: 'Tự tin bước vào kỳ thi thật sắp tới.',
        notes: 'Chúc mừng em tốt nghiệp xuất sắc khóa học với Band 8.0!',
      },
      {
        studentId: 'std-02',
        studentName: 'Trần Hoàng Long',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        scores: {
          listening: 7.0,
          reading: 7.0,
          writing: 6.5,
          speaking: 6.5,
          overall: 7.0,
        },
        targetBand: 6.5,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Đều cả 4 kỹ năng không bị lệch. Writing Task 1 và Task 2 đều đạt 6.5.',
        improvements: 'Chuẩn bị tâm lý thi thật bình tĩnh.',
        notes: 'Vượt mục tiêu ban đầu từ 6.5 lên 7.0! Kết quả rất xứng đáng.',
      },
      {
        studentId: 'std-03',
        studentName: 'Lê Thu Thảo',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        scores: {
          listening: 6.5,
          reading: 6.5,
          writing: 6.0,
          speaking: 6.5,
          overall: 6.5,
        },
        targetBand: 6.0,
        targetAchieved: true,
        status: 'completed',
        strengths: 'Bứt phá ngoạn mục kỹ năng Nghe và Nói trong tuần cuối.',
        improvements: 'Giữ vững phong độ từ vựng.',
        notes: 'Vượt mục tiêu 6.0 đề ra, đạt Band 6.5 Final Mock Test!',
      },
    ],
  },
];

const INITIAL_IN_CLASS_RESULTS: InClassResult[] = [
  {
    id: 'icr-000-vocab',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive Target 6.5+ (K88)',
    title: 'Kiểm Tra 20 Từ Vựng & Collocations: Topic Environment & Climate',
    date: new Date().toISOString().split('T')[0],
    skill: 'vocabulary',
    scoreType: 'words',
    maxScore: 20,
    scoreUnit: 'từ',
    topic: '20 từ vựng & Academic Collocations Unit 4 (Spelling + Meaning + Example)',
    sessionNumber: 3,
    generalNotes: 'Kiểm tra 15 phút đầu giờ. Học sinh làm bài viết nghĩa và đặt câu trực tiếp tại lớp.',
    createdAt: new Date().toISOString(),
    entries: [
      {
        studentId: 'std-01',
        studentName: 'Nguyễn Minh Anh',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        score: 19,
        maxScore: 20,
        scoreType: 'words',
        scoreUnit: 'từ',
        bandEquivalent: 8.0,
        status: 'completed',
        notes: 'Xuất sắc! Đúng 19/20 từ, nhớ chính xác cả collocation "biodiversity loss" và "carbon footprint".'
      },
      {
        studentId: 'std-02',
        studentName: 'Trần Hoàng Long',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        score: 17,
        maxScore: 20,
        scoreType: 'words',
        scoreUnit: 'từ',
        bandEquivalent: 7.0,
        status: 'completed',
        notes: 'Đạt 17/20 từ. Sai chính tả từ "irreversible", cần ôn lại các tiền tố phủ định.'
      },
      {
        studentId: 'std-03',
        studentName: 'Lê Thu Thảo',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        score: 15,
        maxScore: 20,
        scoreType: 'words',
        scoreUnit: 'từ',
        bandEquivalent: 6.5,
        status: 'completed',
        notes: 'Đạt 15/20 từ. Nắm nghĩa tiếng Việt tốt nhưng viết câu còn thiếu giới từ đi kèm.'
      }
    ]
  },
  {
    id: 'icr-001',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive Target 6.5+ (K88)',
    title: 'Speaking Part 1 Warm-up: Topic Accommodation & Leisure',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    skill: 'speaking',
    scoreType: 'band',
    maxScore: 9.0,
    scoreUnit: 'band',
    topic: 'Part 1 Fluency & Lexical Resource',
    sessionNumber: 1,
    generalNotes: 'Kiểm tra phản xạ nói đầu giờ, cả lớp tích cực trao đổi theo cặp.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    entries: [
      {
        studentId: 'std-01',
        studentName: 'Nguyễn Minh Anh',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        score: 7.0,
        maxScore: 9.0,
        scoreType: 'band',
        scoreUnit: 'band',
        bandEquivalent: 7.0,
        status: 'completed',
        notes: 'Phát âm rõ ràng, ngữ điệu tự nhiên. Dùng tốt collocations về nơi ở.'
      },
      {
        studentId: 'std-02',
        studentName: 'Trần Hoàng Long',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        score: 6.5,
        maxScore: 9.0,
        scoreType: 'band',
        scoreUnit: 'band',
        bandEquivalent: 6.5,
        status: 'completed',
        notes: 'Nói trôi chảy nhưng còn ngập ngừng khi kéo dài câu trả lời, cần thêm linking words.'
      },
      {
        studentId: 'std-03',
        studentName: 'Lê Thu Thảo',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        score: 6.0,
        maxScore: 9.0,
        scoreType: 'band',
        scoreUnit: 'band',
        bandEquivalent: 6.0,
        status: 'completed',
        notes: 'Đến muộn 15p, hoàn thành phần nói sau. Cần chú ý phát âm âm đuôi /s/ và /t/.'
      }
    ]
  },
  {
    id: 'icr-002',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive Target 6.5+ (K88)',
    title: 'Writing Task 2: Outline & Introduction Practice',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    skill: 'writing',
    scoreType: 'band',
    maxScore: 9.0,
    scoreUnit: 'band',
    topic: 'Agree/Disagree Essay Structure (15 phút viết nháp mở bài & outline)',
    sessionNumber: 2,
    generalNotes: 'Thực hành lập dàn ý 4 đoạn và viết mở bài chuẩn band 6.5+.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    entries: [
      {
        studentId: 'std-01',
        studentName: 'Nguyễn Minh Anh',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        score: 7.5,
        maxScore: 9.0,
        scoreType: 'band',
        scoreUnit: 'band',
        bandEquivalent: 7.5,
        status: 'completed',
        notes: 'Thesis statement rất sắc bén, paraphrase đề bài tốt và lập luận chặt chẽ.'
      },
      {
        studentId: 'std-02',
        studentName: 'Trần Hoàng Long',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        score: 0,
        maxScore: 9.0,
        scoreType: 'band',
        scoreUnit: 'band',
        status: 'absent',
        notes: 'Vắng có phép (thi giữa kỳ), đã gửi đề bài về nhà làm bù.'
      },
      {
        studentId: 'std-03',
        studentName: 'Lê Thu Thảo',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        score: 6.5,
        maxScore: 9.0,
        scoreType: 'band',
        scoreUnit: 'band',
        bandEquivalent: 6.5,
        status: 'completed',
        notes: 'Ý tưởng phong phú, tuy nhiên mở bài hơi dài, cần rút gọn vào trọng tâm.'
      }
    ]
  },
  {
    id: 'icr-003',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive Target 6.5+ (K88)',
    title: 'Quick Vocabulary Check: Academic Collocations Unit 3',
    date: new Date().toISOString().split('T')[0],
    skill: 'vocabulary',
    scoreType: 'points',
    maxScore: 10,
    scoreUnit: 'điểm',
    topic: '20 cụm từ vựng Topic Education & Employment',
    sessionNumber: 3,
    generalNotes: 'Kiểm tra trắc nghiệm 10 câu đầu giờ học.',
    createdAt: new Date().toISOString(),
    entries: [
      {
        studentId: 'std-01',
        studentName: 'Nguyễn Minh Anh',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        score: 9.5,
        maxScore: 10,
        scoreType: 'points',
        scoreUnit: 'điểm',
        bandEquivalent: 8.0,
        status: 'completed',
        notes: 'Thuộc hầu hết collocations khó, sai 1 câu về giới từ.'
      },
      {
        studentId: 'std-02',
        studentName: 'Trần Hoàng Long',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        score: 8.0,
        maxScore: 10,
        scoreType: 'points',
        scoreUnit: 'điểm',
        bandEquivalent: 6.5,
        status: 'completed',
        notes: 'Nắm chắc từ vựng cơ bản, cần ôn thêm cụm từ học thuật C1.'
      },
      {
        studentId: 'std-03',
        studentName: 'Lê Thu Thảo',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        score: 7.0,
        maxScore: 10,
        scoreType: 'points',
        scoreUnit: 'điểm',
        bandEquivalent: 6.0,
        status: 'completed',
        notes: 'Làm đúng 7/10 câu, cần chép lại các từ hay nhầm lẫn vào vở từ vựng.'
      }
    ]
  },
  {
    id: 'icr-004',
    classId: 'class-foundation-55',
    className: 'IELTS Foundation 5.0-5.5 (K12)',
    title: 'Reading Speed Scanning Exercise: Passage 1',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    skill: 'reading',
    scoreType: 'points',
    maxScore: 10,
    scoreUnit: 'điểm',
    topic: 'Kỹ năng định vị từ khóa (Keywords Locating) trong 10 phút',
    sessionNumber: 1,
    generalNotes: 'Luyện tập kỹ thuật Skimming & Scanning trực tiếp trên lớp.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    entries: [
      {
        studentId: 'std-05',
        studentName: 'Vũ Hải Yến',
        studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        score: 8.5,
        maxScore: 10,
        scoreType: 'points',
        scoreUnit: 'điểm',
        bandEquivalent: 6.0,
        status: 'completed',
        notes: 'Tìm thông tin nhanh và chính xác, chỉ vấp ở câu chứa từ đồng nghĩa nâng cao.'
      }
    ]
  }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Earlier dates in current month (August 2026) - creating realistic test cases for attendance alerts
  { id: 'att-080', studentId: 'std-03', studentName: 'Lê Thu Thảo', classId: 'class-intensive-65', date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0], status: 'absent', notes: 'Vắng không phép' },
  { id: 'att-081', studentId: 'std-03', studentName: 'Lê Thu Thảo', classId: 'class-intensive-65', date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], status: 'absent', notes: 'Bận việc gia đình' },
  { id: 'att-082', studentId: 'std-03', studentName: 'Lê Thu Thảo', classId: 'class-intensive-65', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], status: 'excused', notes: 'Xin phép nghỉ ốm' },

  // Session 1 (5 days ago) - IELTS Intensive K88
  { id: 'att-101', studentId: 'std-01', studentName: 'Nguyễn Minh Anh', classId: 'class-intensive-65', sessionId: 'sch-01', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], status: 'present' },
  { id: 'att-102', studentId: 'std-02', studentName: 'Trần Hoàng Long', classId: 'class-intensive-65', sessionId: 'sch-01', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], status: 'present' },
  { id: 'att-103', studentId: 'std-03', studentName: 'Lê Thu Thảo', classId: 'class-intensive-65', sessionId: 'sch-01', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], status: 'late', notes: 'Kẹt xe, đến muộn 15 phút' },

  // Session 1 (5 days ago) - IELTS Foundation K12
  { id: 'att-104', studentId: 'std-05', studentName: 'Vũ Hải Yến', classId: 'class-foundation-55', sessionId: 'sch-01b', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], status: 'present' },

  // Session 2 (2 days ago) - IELTS Intensive K88
  { id: 'att-201', studentId: 'std-01', studentName: 'Nguyễn Minh Anh', classId: 'class-intensive-65', sessionId: 'sch-02', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'present' },
  { id: 'att-202', studentId: 'std-02', studentName: 'Trần Hoàng Long', classId: 'class-intensive-65', sessionId: 'sch-02', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'excused', notes: 'Xin phép thi giữa kỳ đại học' },
  { id: 'att-203', studentId: 'std-03', studentName: 'Lê Thu Thảo', classId: 'class-intensive-65', sessionId: 'sch-02', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'present' },

  // Session 1 (2 days ago) - IELTS Master K75
  { id: 'att-204', studentId: 'std-04', studentName: 'Phạm Đức Duy', classId: 'class-master-75', sessionId: 'sch-02b', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'present' },

  // Today (Session 3) - IELTS Intensive K88
  { id: 'att-301', studentId: 'std-01', studentName: 'Nguyễn Minh Anh', classId: 'class-intensive-65', sessionId: 'sch-03', date: new Date().toISOString().split('T')[0], status: 'present' },
  { id: 'att-302', studentId: 'std-02', studentName: 'Trần Hoàng Long', classId: 'class-intensive-65', sessionId: 'sch-03', date: new Date().toISOString().split('T')[0], status: 'present' },
  { id: 'att-303', studentId: 'std-03', studentName: 'Lê Thu Thảo', classId: 'class-intensive-65', sessionId: 'sch-03', date: new Date().toISOString().split('T')[0], status: 'present' },

  // Today (Session 2) - IELTS Foundation K12
  { id: 'att-304', studentId: 'std-05', studentName: 'Vũ Hải Yến', classId: 'class-foundation-55', sessionId: 'sch-04', date: new Date().toISOString().split('T')[0], status: 'present' },
];

// Safe LocalStorage helpers
export const StorageService = {
  getAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
        return INITIAL_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  saveAccounts(accounts: UserAccount[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to localStorage', e);
    }
  },

  getAuthSession(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  saveAuthSession(user: AuthUser | null) {
    try {
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      } else {
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to save auth session', e);
    }
  },

  createStudentAccount(account: Omit<UserAccount, 'id' | 'createdAt' | 'isActive'>): UserAccount {
    const accounts = this.getAccounts();
    const newAcc: UserAccount = {
      ...account,
      id: `acc-std-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    accounts.push(newAcc);
    this.saveAccounts(accounts);
    return newAcc;
  },

  updateAccount(updated: UserAccount) {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === updated.id);
    if (idx >= 0) {
      accounts[idx] = updated;
      this.saveAccounts(accounts);
    }
  },

  deleteAccount(id: string) {
    const accounts = this.getAccounts().filter((a) => a.id !== id);
    this.saveAccounts(accounts);
  },

  getClasses(): ClassGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
        return INITIAL_CLASSES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CLASSES;
    }
  },

  saveClasses(classes: ClassGroup[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Failed to save classes to localStorage', e);
    }
  },

  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
        return INITIAL_ATTENDANCE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ATTENDANCE;
    }
  },

  saveAttendance(records: AttendanceRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save attendance to localStorage', e);
    }
  },

  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }
      const parsed: Student[] = JSON.parse(data);
      // Đảm bảo band ước tính luôn tuân thủ quy tắc làm tròn 0.5 chuẩn IELTS
      return parsed.map((st) => {
        const skills = st.skillScores;
        const normalizedSkills = skills ? {
          reading: roundIELTSBand(skills.reading || 6.0),
          listening: roundIELTSBand(skills.listening || 6.0),
          writing: roundIELTSBand(skills.writing || 6.0),
          speaking: roundIELTSBand(skills.speaking || 6.0),
        } : st.skillScores;

        let estimated = st.currentEstimatedBand;
        if (normalizedSkills) {
          const avg = (normalizedSkills.reading + normalizedSkills.listening + normalizedSkills.writing + normalizedSkills.speaking) / 4;
          estimated = roundIELTSBand(avg);
        } else if (typeof estimated === 'number') {
          estimated = roundIELTSBand(estimated);
        }

        return {
          ...st,
          currentEstimatedBand: estimated,
          targetBand: roundIELTSBand(st.targetBand || 6.5),
          skillScores: normalizedSkills,
        };
      });
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  },

  updateStudent(student: Student) {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.unshift(student);
    }
    this.saveStudents(students);
  },

  getAssignments(): Assignment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
        return INITIAL_ASSIGNMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  },

  saveAssignments(assignments: Assignment[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignments to localStorage', e);
    }
  },

  addAssignment(assignment: Assignment) {
    const list = this.getAssignments();
    list.unshift(assignment);
    this.saveAssignments(list);
  },

  updateAssignment(assignment: Assignment) {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) {
      list[idx] = assignment;
      this.saveAssignments(list);
    }
  },

  deleteAssignment(id: string) {
    const list = this.getAssignments().filter((a) => a.id !== id);
    this.saveAssignments(list);
  },

  getSubmissions(): Submission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  },

  saveSubmissions(submissions: Submission[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save submissions to localStorage', e);
    }
  },

  addSubmission(submission: Submission) {
    const list = this.getSubmissions();
    const existingIndex = list.findIndex(
      (s) => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId
    );
    if (existingIndex >= 0) {
      list[existingIndex] = submission;
    } else {
      list.unshift(submission);
    }
    this.saveSubmissions(list);

    // Update student's total count
    const students = this.getStudents();
    const sIdx = students.findIndex((s) => s.id === submission.studentId);
    if (sIdx >= 0) {
      students[sIdx].totalSubmissions += 1;
      this.saveStudents(students);
    }
  },

  gradeSubmission(updatedSub: Submission) {
    const list = this.getSubmissions();
    const idx = list.findIndex((s) => s.id === updatedSub.id);
    if (idx >= 0) {
      list[idx] = {
        ...updatedSub,
        status: 'graded',
        gradedByTeacher: true,
        gradedAt: new Date().toISOString(),
      };
      this.saveSubmissions(list);

      // Recalculate student band
      if (updatedSub.overallBand) {
        this.recalculateStudentBand(updatedSub.studentId);
      }
    }
  },

  recalculateStudentBand(studentId: string) {
    const subs = this.getSubmissions().filter((s) => s.studentId === studentId && s.status === 'graded');
    if (subs.length === 0) return;

    const students = this.getStudents();
    const stIdx = students.findIndex((s) => s.id === studentId);
    if (stIdx < 0) return;

    const skills: ('reading' | 'listening' | 'writing' | 'speaking')[] = ['reading', 'listening', 'writing', 'speaking'];
    const currentScores = { ...students[stIdx].skillScores };

    skills.forEach((skill) => {
      const skillSubs = subs.filter((s) => s.assignmentSkill === skill && s.overallBand);
      if (skillSubs.length > 0) {
        const sum = skillSubs.reduce((acc, curr) => acc + (curr.overallBand || 0), 0);
        currentScores[skill] = roundIELTSBand(sum / skillSubs.length); // round to IELTS 0.5 rules
      }
    });

    // Overall Band = average of 4 skills rounded according to official IELTS rules
    const avg = (currentScores.reading + currentScores.listening + currentScores.writing + currentScores.speaking) / 4;
    const overallEstimated = roundIELTSBand(avg);

    students[stIdx].skillScores = currentScores;
    students[stIdx].currentEstimatedBand = overallEstimated;
    this.saveStudents(students);
  },

  getSchedules(): ClassScheduleSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
        return INITIAL_SCHEDULES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SCHEDULES;
    }
  },

  saveSchedules(schedules: ClassScheduleSession[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch (e) {
      console.error('Failed to save schedules to localStorage', e);
    }
  },

  addScheduleSession(session: ClassScheduleSession) {
    const list = this.getSchedules();
    list.unshift(session);
    this.saveSchedules(list);
  },

  updateScheduleSession(session: ClassScheduleSession) {
    const list = this.getSchedules();
    const idx = list.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      list[idx] = session;
      this.saveSchedules(list);
    }
  },

  deleteScheduleSession(id: string) {
    const list = this.getSchedules().filter((s) => s.id !== id);
    this.saveSchedules(list);
  },

  getInClassResults(): InClassResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IN_CLASS_RESULTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.IN_CLASS_RESULTS, JSON.stringify(INITIAL_IN_CLASS_RESULTS));
        return INITIAL_IN_CLASS_RESULTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_IN_CLASS_RESULTS;
    }
  },

  saveInClassResults(results: InClassResult[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.IN_CLASS_RESULTS, JSON.stringify(results));
    } catch (e) {
      console.error('Failed to save in-class results to localStorage', e);
    }
  },

  addInClassResult(result: InClassResult) {
    const list = this.getInClassResults();
    list.unshift(result);
    this.saveInClassResults(list);
  },

  updateInClassResult(result: InClassResult) {
    const list = this.getInClassResults();
    const idx = list.findIndex((r) => r.id === result.id);
    if (idx >= 0) {
      list[idx] = result;
      this.saveInClassResults(list);
    }
  },

  deleteInClassResult(id: string) {
    const list = this.getInClassResults().filter((r) => r.id !== id);
    this.saveInClassResults(list);
  },

  getTestRecords(): TestRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEST_RECORDS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TEST_RECORDS, JSON.stringify(INITIAL_TEST_RECORDS));
        return INITIAL_TEST_RECORDS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TEST_RECORDS;
    }
  },

  saveTestRecords(records: TestRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEST_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save test records to localStorage', e);
    }
  },

  addTestRecord(record: TestRecord) {
    const list = this.getTestRecords();
    list.unshift(record);
    this.saveTestRecords(list);
  },

  updateTestRecord(record: TestRecord) {
    const list = this.getTestRecords();
    const idx = list.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      list[idx] = record;
      this.saveTestRecords(list);
    }
  },

  deleteTestRecord(id: string) {
    const list = this.getTestRecords().filter((r) => r.id !== id);
    this.saveTestRecords(list);
  },

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.IN_CLASS_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.TEST_RECORDS);
    window.location.reload();
  }
};

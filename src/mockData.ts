import { Assignment, ClassGroup, ClassScheduleSession, Student, Submission, UserAccount } from './types';

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-teacher-01',
    username: 'teacher',
    password: '123',
    name: 'Cô Celina Phạm',
    email: 'celinapham.1559@gmail.com',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-std-01',
    username: 'minhanh',
    password: '123',
    name: 'Nguyễn Minh Anh',
    email: 'minhanh.ielts@gmail.com',
    role: 'student',
    studentProfileId: 'std-01',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-06-15',
  },
  {
    id: 'acc-std-02',
    username: 'hoanglong',
    password: '123',
    name: 'Trần Hoàng Long',
    email: 'hoanglong.tran@gmail.com',
    role: 'student',
    studentProfileId: 'std-02',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-06-15',
  },
  {
    id: 'acc-std-03',
    username: 'thuthao',
    password: '123',
    name: 'Lê Thu Thảo',
    email: 'thuthao.le@gmail.com',
    role: 'student',
    studentProfileId: 'std-03',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-06-20',
  },
  {
    id: 'acc-std-04',
    username: 'ducduy',
    password: '123',
    name: 'Phạm Đức Duy',
    email: 'ducduy.ielts@gmail.com',
    role: 'student',
    studentProfileId: 'std-04',
    classId: 'class-master-75',
    className: 'IELTS Master 7.5+ (Cuối Tuần)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-05-10',
  },
  {
    id: 'acc-std-05',
    username: 'haiyen',
    password: '123',
    name: 'Vũ Hải Yến',
    email: 'haiyen.vu@gmail.com',
    role: 'student',
    studentProfileId: 'std-05',
    classId: 'class-foundation-55',
    className: 'IELTS Foundation 5.5 (Tối 3-5-7)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-07-01',
  }
];

export const INITIAL_CLASSES: ClassGroup[] = [
  {
    id: 'class-intensive-65',
    code: 'INT-88',
    name: 'IELTS Intensive K88',
    level: 'Target Band 6.5 - 7.0',
    schedule: 'T3 - T5 - T7 (18:00 - 20:00)',
    studentCount: 3,
    averageBand: 6.5,
    teacherName: 'Teacher Celina Phạm (IELTS 8.5)',
    color: 'indigo'
  },
  {
    id: 'class-foundation-55',
    code: 'FND-12',
    name: 'IELTS Foundation K12',
    level: 'Target Band 5.0 - 5.5',
    schedule: 'T2 - T4 - T6 (19:30 - 21:00)',
    studentCount: 1,
    averageBand: 5.5,
    teacherName: 'Teacher Celina Phạm (IELTS 8.5)',
    color: 'emerald'
  },
  {
    id: 'class-master-75',
    code: 'MAS-75',
    name: 'IELTS Master K75',
    level: 'Target Band 7.5 - 8.0',
    schedule: 'T7 - CN (14:00 - 16:30)',
    studentCount: 2,
    averageBand: 7.5,
    teacherName: 'Teacher Celina Phạm (IELTS 8.5)',
    color: 'amber'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-01',
    name: 'Nguyễn Minh Anh',
    email: 'minhanh.ielts@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive K88',
    classIds: ['class-intensive-65', 'class-master-75'],
    classNames: ['IELTS Intensive K88', 'IELTS Master K75'],
    phone: '0912 345 678',
    targetBand: 7.0,
    currentEstimatedBand: 6.5,
    skillScores: {
      reading: 7.0,
      listening: 6.5,
      writing: 6.0,
      speaking: 6.5
    },
    totalSubmissions: 12,
    onTimeSubmissions: 11,
    lateSubmissions: 1,
    joinedDate: '2026-06-15',
    expectedEndDate: '2026-09-15',
    notes: 'Kỹ năng Writing Task 2 còn thiếu Coherence & Cohesion. Đang học đồng thời 2 lớp Intensive và Master để bứt phá band 7.5.'
  },
  {
    id: 'std-02',
    name: 'Trần Hoàng Long',
    email: 'hoanglong.tran@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    phone: '0988 776 655',
    targetBand: 7.0,
    currentEstimatedBand: 7.0,
    skillScores: {
      reading: 7.5,
      listening: 7.0,
      writing: 6.5,
      speaking: 6.0
    },
    totalSubmissions: 14,
    onTimeSubmissions: 14,
    lateSubmissions: 0,
    joinedDate: '2026-06-15',
    expectedEndDate: '2026-09-15',
    notes: 'Speaking phát âm tốt nhưng Part 2 còn thiếu ý tưởng triển khai dài. Reading rất vững vàng.'
  },
  {
    id: 'std-03',
    name: 'Lê Thu Thảo',
    email: 'thuthao.le@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    phone: '0903 112 233',
    targetBand: 6.5,
    currentEstimatedBand: 6.0,
    skillScores: {
      reading: 6.0,
      listening: 6.5,
      writing: 5.5,
      speaking: 6.0
    },
    totalSubmissions: 10,
    onTimeSubmissions: 8,
    lateSubmissions: 2,
    joinedDate: '2026-06-20',
    expectedEndDate: '2026-09-20',
    notes: 'Có xu hướng nộp trễ deadline. Cần nhắc nhở căn thời gian 60 phút khi làm bài full Reading.'
  },
  {
    id: 'std-04',
    name: 'Phạm Đức Duy',
    email: 'ducduy.ielts@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: 'class-master-75',
    className: 'IELTS Master 7.5+ (Cuối Tuần)',
    phone: '0977 445 566',
    targetBand: 8.0,
    currentEstimatedBand: 8.0,
    skillScores: {
      reading: 8.5,
      listening: 8.0,
      writing: 7.0,
      speaking: 7.5
    },
    totalSubmissions: 16,
    onTimeSubmissions: 16,
    lateSubmissions: 0,
    joinedDate: '2026-05-10',
    expectedEndDate: '2026-08-30',
    notes: 'Học sinh xuất sắc. Đang luyện viết Task 1 dạng Maps & Process và các dạng bài Writing Task 2 nâng cao.'
  },
  {
    id: 'std-05',
    name: 'Vũ Hải Yến',
    email: 'haiyen.vu@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: 'class-foundation-55',
    className: 'IELTS Foundation 5.5 (Tối 3-5-7)',
    phone: '0945 678 901',
    targetBand: 5.5,
    currentEstimatedBand: 5.5,
    skillScores: {
      reading: 5.5,
      listening: 5.0,
      writing: 5.0,
      speaking: 5.5
    },
    totalSubmissions: 9,
    onTimeSubmissions: 9,
    lateSubmissions: 0,
    joinedDate: '2026-07-01',
    expectedEndDate: '2026-10-30',
    notes: 'Tiến bộ rõ rệt ở phần Listening Section 1 & 2. Đang học cấu trúc câu phức trong Writing.'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-w-01',
    title: 'Writing Task 2: Artificial Intelligence in Modern Education',
    skill: 'writing',
    taskType: 'Task 2 - Opinion Essay',
    description: 'Viết bài luận tối thiểu 250 từ thể hiện quan điểm của bạn về việc ứng dụng AI trong học tập và giảng dạy.',
    targetBand: '6.5 - 7.5',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    timeLimitMinutes: 40,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    writingPrompt: `Some people believe that artificial intelligence will eventually replace human teachers in the classroom, while others argue that the role of teachers remains irreplaceable.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words. You should spend about 40 minutes on this task.`,
    writingMinWords: 250,
    questions: [
      {
        id: 'q-w1',
        type: 'essay',
        questionText: 'Nộp bài luận Writing Task 2 (tối thiểu 250 từ)'
      }
    ],
    authorTeacher: 'Teacher Celina Phạm',
    status: 'active'
  },
  {
    id: 'assign-r-01',
    title: 'Reading Academic: The Impact of Microplastics on Marine Ecosystems',
    skill: 'reading',
    taskType: 'Academic Reading Passage 2',
    description: 'Đọc kỹ đoạn văn học thuật về vi nhựa đại dương và trả lời 5 câu hỏi True/False/Not Given và Trắc nghiệm.',
    targetBand: '6.5 - 7.0',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    timeLimitMinutes: 20,
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    readingPassage: `THE THREAT OF MICROPLASTICS IN OCEANS

Paragraph A
Microplastics—plastic particles smaller than 5 millimeters across—have become one of the most ubiquitous environmental contaminants on Earth. Originating from the fragmentation of larger plastic debris, synthetic textiles, and industrial cosmetics, these minuscule fragments now permeate every layer of the marine environment, from surface sea spray to the deepest oceanic trenches such as the Mariana Trench.

Paragraph B
Marine biologists have discovered that marine organisms at nearly all trophic levels ingest microplastics, frequently mistaking them for natural prey like plankton and fish eggs. When ingested, these particles can cause physical blockages in digestive tracts, reduce the organism's sensation of hunger, and lead to malnutrition. Furthermore, plastics contain various chemical additives such as phthalates and bisphenol A (BPA), which can leach into the tissues of marine fauna and disrupt endocrine functions.

Paragraph C
Recent studies conducted by the Global Oceanic Research Institute highlight a secondary peril: toxic chemical adsorption. Because of their hydrophobic surfaces, microplastics act as sponges for hazardous environmental pollutants already present in seawater, including polychlorinated biphenyls (PCBs) and heavy metals. Consequently, when smaller fish consume contaminated particles, these concentrated toxins bioaccumulate up the marine food chain, potentially endangering apex predators and human seafood consumers alike.

Paragraph D
Addressing this global ecological crisis demands coordinated international policy interventions alongside technological innovation. While biodegradable polymers offer promising alternatives, wastewater treatment facilities must also upgrade filtration mechanisms to intercept microfibers shed during domestic laundering before they discharge into municipal waterways and oceans.`,
    questions: [
      {
        id: 'r-q1',
        type: 'true_false_ng',
        questionText: 'Microplastics are only found near coastal shorelines and surface ocean waters.',
        correctAnswer: 'FALSE',
        explanation: 'Paragraph A states they permeate every layer, from surface sea spray to the deepest oceanic trenches such as the Mariana Trench.'
      },
      {
        id: 'r-q2',
        type: 'true_false_ng',
        questionText: 'Microplastics can absorb dangerous environmental pollutants like PCBs and heavy metals from seawater.',
        correctAnswer: 'TRUE',
        explanation: 'Paragraph C states: Because of their hydrophobic surfaces, microplastics act as sponges for hazardous environmental pollutants already present in seawater.'
      },
      {
        id: 'r-q3',
        type: 'true_false_ng',
        questionText: 'Biodegradable polymers have already completely eliminated plastic pollution in major European rivers.',
        correctAnswer: 'NOT GIVEN',
        explanation: 'Paragraph D mentions biodegradable polymers as promising alternatives, but no mention of eliminating pollution in European rivers.'
      },
      {
        id: 'r-q4',
        type: 'multiple_choice',
        questionText: 'According to Paragraph B, what is one direct effect of marine organisms consuming microplastics?',
        options: [
          'A. Rapid increase in reproductive capacity',
          'B. Digestive tract blockages and decreased appetite leading to starvation',
          'C. Immediate immunity against oceanic waterborne pathogens',
          'D. Accelerated growth of aquatic plant life'
        ],
        correctAnswer: 'B. Digestive tract blockages and decreased appetite leading to starvation',
        explanation: 'Paragraph B indicates particles cause physical blockages in digestive tracts and reduce hunger sensation.'
      },
      {
        id: 'r-q5',
        type: 'fill_blank',
        questionText: 'Wastewater treatment plants must upgrade their filtration systems to stop _____ from being released into waterways.',
        correctAnswer: 'microfibers',
        explanation: 'Paragraph D: wastewater treatment facilities must also upgrade filtration mechanisms to intercept microfibers shed during laundering.'
      }
    ],
    maxScore: 5,
    authorTeacher: 'Teacher Celina Phạm',
    status: 'active'
  },
  {
    id: 'assign-s-01',
    title: 'Speaking Part 2 & 3: Describe an Environmental Initiative',
    skill: 'speaking',
    taskType: 'Speaking Part 2 Cue Card & Part 3 Discussion',
    description: 'Chuẩn bị 1 phút, sau đó thu âm bài nói Part 2 (1.5 - 2 phút) và trả lời 2 câu hỏi mở rộng của Part 3.',
    targetBand: '6.5+',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    timeLimitMinutes: 15,
    deadline: new Date(Date.now() + 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    speakingCueCard: {
      topic: 'Describe an environmental rule or project in your local area that helps protect nature.',
      bulletPoints: [
        'What the rule or project is',
        'Where and when it was introduced',
        'How it encourages people to participate',
        'And explain how effective you think it is in preserving the environment'
      ],
      followUpQuestions: [
        'Do you believe individual actions or government regulations are more impactful in protecting wildlife?',
        'How can schools educate younger generations to adopt sustainable eco-friendly habits?'
      ],
      prepTimeSeconds: 60
    },
    questions: [
      {
        id: 's-q1',
        type: 'speaking_prompt',
        questionText: 'Ghi âm bài nói IELTS Speaking Part 2 và câu trả lời Part 3 (sử dụng micro trực tiếp)'
      }
    ],
    authorTeacher: 'Teacher Celina Phạm',
    status: 'active'
  },
  {
    id: 'assign-l-01',
    title: 'Listening Section 2: Guided Tour of Green Valley Botanic Garden',
    skill: 'listening',
    taskType: 'Section 2 - Monologue with Map & Form',
    description: 'Nghe hướng dẫn viên giới thiệu về Vườn Bách Thảo và trả lời 5 câu hỏi thông tin & trắc nghiệm.',
    targetBand: '6.5',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    timeLimitMinutes: 15,
    deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    listeningAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    listeningScript: `Welcome everyone to Green Valley Botanic Garden! My name is Sarah and I will be guiding your tour today. Before we begin our walk through the tropical conservatory, please note a few important visitor guidelines. The garden is open daily from 8:30 AM until 6:00 PM, with last entry permitted strictly at 5:15 PM. Admission for adults is twelve dollars fifty, but students with a valid photo ID receive a discounted rate of eight dollars. If you are interested in our famous Orchid Pavilion, it is located directly behind the Heritage Fountain, just a two-minute stroll past the Rose Arbor. Complimentary drinking water dispensers and restrooms are accessible next to the East Pavilion Cafe. Please remember that picking flowers or stepping on flowerbeds is strictly prohibited. Let us start our tour!`,
    questions: [
      {
        id: 'l-q1',
        type: 'fill_blank',
        questionText: 'Last entry to the garden is strictly permitted at (Time): _____',
        correctAnswer: '5:15 PM',
        explanation: 'Audio says: with last entry permitted strictly at 5:15 PM.'
      },
      {
        id: 'l-q2',
        type: 'fill_blank',
        questionText: 'Discounted admission price for students with photo ID: $_____',
        correctAnswer: '8',
        explanation: 'Audio says: students with a valid photo ID receive a discounted rate of eight dollars.'
      },
      {
        id: 'l-q3',
        type: 'multiple_choice',
        questionText: 'Where is the famous Orchid Pavilion located relative to the Heritage Fountain?',
        options: [
          'A. In front of the main visitor car park',
          'B. Directly behind the Heritage Fountain past the Rose Arbor',
          'C. Inside the East Pavilion Cafe',
          'D. Next to the gift shop ticket counter'
        ],
        correctAnswer: 'B. Directly behind the Heritage Fountain past the Rose Arbor',
        explanation: 'Audio: located directly behind the Heritage Fountain, just a two-minute stroll past the Rose Arbor.'
      }
    ],
    maxScore: 3,
    authorTeacher: 'Teacher Celina Phạm',
    status: 'active'
  },
  {
    id: 'assign-v-01',
    title: 'IELTS Band 8.0 Vocabulary: Global Environmental Crisis & Sustainable Energy',
    skill: 'vocabulary',
    taskType: 'Topic Vocabulary (Band 7.5 - 8.5)',
    description: 'Học 5 từ vựng học thuật trọng điểm chủ đề Môi trường & Năng lượng tái tạo qua Flashcards tương tác kèm phát âm Audio và làm bài tập Quiz trắc nghiệm / điền từ.',
    targetBand: '7.5 - 8.5',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive 6.5+ (Tối 2-4-6)',
    timeLimitMinutes: 15,
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    vocabularyTopic: 'Environmental Crisis & Sustainable Energy',
    vocabularyList: [
      {
        id: 'v1',
        word: 'unprecedented',
        phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
        partOfSpeech: 'adjective',
        vietnameseMeaning: 'chưa từng có tiền lệ, chưa từng thấy trước đây',
        englishDefinition: 'Never having happened or existed in the past.',
        exampleSentence: 'The coastal cities are confronting unprecedented levels of sea level rise attributable to global warming.',
        collocations: ['unprecedented scale', 'unprecedented challenge', 'unprecedented ecological disaster'],
        synonyms: ['unparalleled', 'exceptional', 'unrivaled'],
        band: '8.0'
      },
      {
        id: 'v2',
        word: 'biodiversity',
        phonetic: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
        partOfSpeech: 'noun',
        vietnameseMeaning: 'đa dạng sinh học',
        englishDefinition: 'The variety of plant and animal life in a particular habitat or in the world.',
        exampleSentence: 'Unchecked deforestation poses an existential threat to the rich biodiversity of tropical rainforests.',
        collocations: ['preserve biodiversity', 'loss of biodiversity', 'marine biodiversity'],
        synonyms: ['ecological diversity', 'biological variety'],
        band: '7.5'
      },
      {
        id: 'v3',
        word: 'mitigate',
        phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
        partOfSpeech: 'verb',
        vietnameseMeaning: 'giảm nhẹ, làm dịu bớt tác hại, hạn chế tổn thất',
        englishDefinition: 'To make something less harmful, unpleasant, or bad.',
        exampleSentence: 'International agreements seek to mitigate climate change through binding carbon emission quotas.',
        collocations: ['mitigate the impact', 'mitigate climate change', 'mitigate environmental risks'],
        synonyms: ['alleviate', 'attenuate', 'lessen'],
        band: '8.0'
      },
      {
        id: 'v4',
        word: 'ubiquitous',
        phonetic: '/juːˈbɪk.wɪ.təs/',
        partOfSpeech: 'adjective',
        vietnameseMeaning: 'có mặt ở khắp nơi, phổ biến rộng rãi',
        englishDefinition: 'Present, appearing, or found everywhere.',
        exampleSentence: 'Single-use plastic containers have unfortunately become ubiquitous in modern urban lifestyles.',
        collocations: ['ubiquitous presence', 'become ubiquitous', 'ubiquitous phenomenon'],
        synonyms: ['omnipresent', 'pervasive', 'widespread'],
        band: '8.5'
      },
      {
        id: 'v5',
        word: 'sustainable',
        phonetic: '/səˈsteɪ.nə.bəl/',
        partOfSpeech: 'adjective',
        vietnameseMeaning: 'bền vững, thân thiện với môi trường',
        englishDefinition: 'Causing little or no damage to the environment and therefore able to continue for a long time.',
        exampleSentence: 'Investing in sustainable renewable energy infrastructure accelerates the transition towards net-zero emissions.',
        collocations: ['sustainable development', 'sustainable agriculture', 'sustainable energy'],
        synonyms: ['renewable', 'eco-friendly', 'viable'],
        band: '7.5'
      }
    ],
    questions: [
      {
        id: 'vq-1',
        type: 'multiple_choice',
        questionText: 'Chọn từ đồng nghĩa thích hợp nhất với "unprecedented" trong ngữ cảnh bài viết IELTS:',
        options: [
          'A. Unparalleled',
          'B. Conventional',
          'C. Predictable',
          'D. Insignificant'
        ],
        correctAnswer: 'A. Unparalleled',
        explanation: '"Unprecedented" nghĩa là chưa từng có tiền lệ, tương đương với "Unparalleled" (vô song, không gì sánh bằng).'
      },
      {
        id: 'vq-2',
        type: 'fill_blank',
        questionText: 'Governments must implement strict regulations to [BLANK] the catastrophic effects of greenhouse gases.',
        correctAnswer: 'mitigate',
        explanation: '"mitigate" (động từ) mang nghĩa giảm nhẹ tác hại.'
      },
      {
        id: 'vq-3',
        type: 'multiple_choice',
        questionText: 'Cụm collocation nào sau đây thường được dùng nhất trong chủ đề Môi trường IELTS?',
        options: [
          'A. Loss of biodiversity',
          'B. Gain of biodiversity',
          'C. Fast biodiversity',
          'D. Sound biodiversity'
        ],
        correctAnswer: 'A. Loss of biodiversity',
        explanation: '"Loss of biodiversity" (sự suy giảm đa dạng sinh học) là một collocation học thuật chuẩn trong IELTS.'
      }
    ],
    maxScore: 3,
    authorTeacher: 'Teacher Celina Phạm',
    status: 'active'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-01',
    assignmentId: 'assign-w-01',
    assignmentTitle: 'Writing Task 2: Artificial Intelligence in Modern Education',
    assignmentSkill: 'writing',
    studentId: 'std-01',
    studentName: 'Nguyễn Minh Anh',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    submittedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    timeSpentSeconds: 2240, // ~37 mins
    timeLimitMinutes: 40,
    status: 'graded',
    answers: {},
    wordCount: 285,
    essayContent: `In the contemporary era, the rapid proliferation of artificial intelligence has initiated passionate debates regarding the future landscape of education. While some proponents argue that intelligent computing systems will supersede traditional instructors, I firmly believe that human educators possess irreplaceable pedagogical and empathetic qualities that machines cannot emulate.

On the one hand, advocates of AI highlight the unprecedented efficiency and customization that algorithms offer. AI-powered platforms can assess a learner's strengths and weaknesses instantaneously, tailoring personalized exercises to optimize retention. For instance, intelligent tutoring systems in mathematics can deliver adaptive problem sets, allowing students to progress at their own pace without burdening human teachers. Furthermore, automated grading significantly reduces administrative workload, granting institutions higher operational efficiency.

On the other hand, the holistic development of students fundamentally relies on human connection and emotional intelligence. Teachers do not merely disseminate factual knowledge; they act as mentors who cultivate critical thinking, ethical reasoning, and social collaboration. During moments of academic frustration or emotional distress, an empathetic educator provides personalized encouragement and morale support that synthetic algorithms inherently lack. In addition, classroom discussions guided by human instructors inspire spontaneous debates and deep philosophical inquiry.

In conclusion, although artificial intelligence will undeniably revolutionize personalized learning tools, it should serve as a complementary aid rather than a complete substitute for human teachers. The synergy between technological convenience and human empathy forms the ultimate foundation for high-quality education.`,
    overallBand: 7.0,
    criteriaScores: {
      taskAchievement: 7.5,
      coherenceCohesion: 7.0,
      lexicalResource: 7.0,
      grammarAccuracy: 7.0
    },
    teacherFeedback: 'Bài viết rất mạch lạc, lập luận chặt chẽ và từ vựng Academic được sử dụng tự nhiên (unprecedented efficiency, holistic development, synthetic algorithms). Hãy lưu ý thêm một số cấu trúc câu đảo ngữ hoặc cleft sentences để bứt phá lên Band 7.5+ nhé!',
    strengths: [
      'Task Response xuất sắc: Trả lời đầy đủ 2 vế và khẳng định quan điểm xuyên suốt từ mở bài đến kết bài.',
      'Từ vựng phong phú, collocations chuẩn Academic (proponents argue, instantaneous assessment, holistic development).',
      'Đoạn văn phân bổ cân đối, ý tưởng phát triển rõ ràng với ví dụ bổ trợ thuyết phục.'
    ],
    weaknesses: [
      'Một số từ nối còn ở mức cơ bản (On the one hand, On the other hand, In conclusion). Có thể đa dạng hóa với "From one perspective...", "Conversely...".',
      'Cần phát triển thêm cấu trúc ngữ pháp phức tạp và linh hoạt hơn ở phần body 1.'
    ],
    inlineCorrections: [
      {
        original: 'On the one hand, advocates of AI highlight...',
        corrected: 'From a technological standpoint, proponents of AI frequently highlight...',
        explanation: 'Giúp bài viết mang phong thái học thuật và tự nhiên hơn việc lặp lại khuôn mẫu "On the one hand".',
        category: 'cohesion'
      },
      {
        original: 'granting institutions higher operational efficiency',
        corrected: 'thereby bolstering institutional productivity',
        explanation: 'Nâng cấp từ vựng Band 8.0 cho cụm operational efficiency.',
        category: 'vocabulary'
      }
    ],
    sampleUpgrade: 'From a technological perspective, proponents of AI emphasize how adaptive algorithmic frameworks enable bespoke learning trajectories, thereby bolstering institutional productivity.',
    gradedByTeacher: true,
    gradedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    gradedBy: 'Teacher Celina Phạm'
  },
  {
    id: 'sub-02',
    assignmentId: 'assign-w-01',
    assignmentTitle: 'Writing Task 2: Artificial Intelligence in Modern Education',
    assignmentSkill: 'writing',
    studentId: 'std-02',
    studentName: 'Trần Hoàng Long',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    timeSpentSeconds: 2380, // ~39 mins
    timeLimitMinutes: 40,
    status: 'submitted', // waiting for teacher grading!
    answers: {},
    wordCount: 262,
    essayContent: `It is widely argued whether artificial intelligence will completely replace teachers in schools or if teachers will continue to play an essential role. In my perspective, while AI brings great benefits to education, teachers cannot be replaced because of their emotional support and moral guidance.

First of all, AI can process huge amounts of data and provide students with immediate feedback. For example, language learning applications can point out grammar mistakes right away and suggest correct answers. This helps students learn faster and study anytime they want without waiting for teacher correction.

However, human teachers do much more than giving information. Teachers can understand when a student is stressed or unmotivated, and they know how to encourage them properly. A computer cannot feel sympathy or teach students about moral values like honesty and kindness. Moreover, group discussions led by teachers help students develop teamwork skills.

To summarize, AI is a powerful assistant in modern classrooms, but it cannot take over the human element of teaching. A combination of both will create the best learning environment.`,
    gradedByTeacher: false
  },
  {
    id: 'sub-03',
    assignmentId: 'assign-r-01',
    assignmentTitle: 'Reading Academic: The Impact of Microplastics on Marine Ecosystems',
    assignmentSkill: 'reading',
    studentId: 'std-01',
    studentName: 'Nguyễn Minh Anh',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    timeSpentSeconds: 1050, // 17 mins 30s
    timeLimitMinutes: 20,
    status: 'graded',
    answers: {
      'r-q1': 'FALSE',
      'r-q2': 'TRUE',
      'r-q3': 'NOT GIVEN',
      'r-q4': 'B. Digestive tract blockages and decreased appetite leading to starvation',
      'r-q5': 'microfibers'
    },
    rawScore: 5,
    maxRawScore: 5,
    overallBand: 8.5,
    teacherFeedback: 'Tuyệt vời! Làm đúng 5/5 câu hỏi Reading Passage 2 trong thời gian 17 phút 30 giây (nhanh hơn giới hạn 20 phút). Duy trì phong độ này nhé!',
    gradedByTeacher: true,
    gradedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    gradedBy: 'Hệ thống tự động chấm & Giáo viên xác nhận'
  },
  {
    id: 'sub-04',
    assignmentId: 'assign-s-01',
    assignmentTitle: 'Speaking Part 2 & 3: Describe an Environmental Initiative',
    assignmentSkill: 'speaking',
    studentId: 'std-02',
    studentName: 'Trần Hoàng Long',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    timeSpentSeconds: 420,
    timeLimitMinutes: 15,
    status: 'graded',
    answers: {},
    audioDurationSeconds: 118,
    speakingTranscript: `I would like to talk about the "Green Weekend" campaign that was implemented in my residential district in Hanoi about two years ago. The main purpose of this campaign is to minimize single-use plastics and encourage local households to classify household trash into recyclable and organic bins.\n\nEvery Saturday morning, volunteers set up collection booths where residents can exchange plastic bottles and cardboard boxes for small potted plants or organic vegetable vouchers. This incentivizes people, especially families with young kids, to participate actively.\n\nIn my opinion, this initiative is remarkably effective because it transforms environmental consciousness into tangible, rewarding habits. Not only has our neighborhood become noticeably cleaner, but it has also fostered a strong sense of community solidarity.`,
    overallBand: 6.5,
    criteriaScores: {
      taskAchievement: 7.0,
      coherenceCohesion: 6.5,
      lexicalResource: 6.5,
      grammarAccuracy: 6.5,
      pronunciation: 6.5
    },
    teacherFeedback: 'Bài nói Part 2 có cấu trúc rõ ràng, sử dụng tốt các từ vựng chủ đề môi trường (residential district, single-use plastics, tangible habits, community solidarity). Chú ý kiểm soát tốc độ nói ở các đoạn chuyển ý và kéo dài Part 3 hơn với ví dụ thực tế.',
    strengths: [
      'Fluency tốt, rất ít ngập ngừng trong 2 phút nói.',
      'Từ vựng chủ đề môi trường và cộng đồng phong phú.',
      'Ý tưởng thực tế, bám sát các câu hỏi gợi ý của Cue card.'
    ],
    weaknesses: [
      'Cần phát âm rõ hơn các âm đuôi /s/, /z/, /tʃ/ ở các từ như "incentivizes", "conscious", "cardboard boxes".',
      'Có thể mở rộng thêm một câu so sánh với các chiến dịch thất bại khác để tăng tính phản biện.'
    ],
    gradedByTeacher: true,
    gradedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    gradedBy: 'Teacher Celina Phạm'
  }
];

export const INITIAL_SCHEDULES: ClassScheduleSession[] = [
  {
    id: 'sch-01',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive K88',
    sessionNumber: 1,
    title: 'Writing Task 2: Cấu trúc bài luận Opinion / Agree or Disagree',
    topic: 'Phân tích đề bài, lập dàn ý 4 đoạn cân bằng, phát triển luận điểm (Idea Generation), liên từ chuyển ý Cohesive Devices.',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:00',
    skillFocus: 'Writing',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Viết bài luận hoàn chỉnh chủ đề Education & Technology (giao trong mục Bài Tập)',
    notes: 'Học sinh cần nắm vững cách viết câu Thesis Statement và Topic Sentence.',
    status: 'completed',
    roomOrLink: 'Phòng học 302 - Cơ sở Quận 1'
  },
  {
    id: 'sch-01b',
    classId: 'class-foundation-55',
    className: 'IELTS Foundation K12',
    sessionNumber: 1,
    title: 'Pronunciation & Phonetics: IPA Symbols & Word Stress',
    topic: 'Quy tắc phát âm 44 âm IPA, trọng âm từ 2 và 3 âm tiết, ngữ điệu lên xuống cơ bản trong câu hỏi và câu trần thuật.',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '10:30',
    skillFocus: 'Speaking',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Luyện đọc 20 cặp từ tối thiểu phân biệt /iː/ và /ɪ/, /s/ và /ʃ/',
    notes: 'Kiểm tra phát âm từng học viên trong 15 phút đầu.',
    status: 'completed',
    roomOrLink: 'Phòng 201 - Cơ sở Quận 1'
  },
  {
    id: 'sch-02',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive K88',
    sessionNumber: 2,
    title: 'Speaking Part 2 & 3: Environmental Issues & Social Campaigns',
    topic: 'Chiến thuật kéo dài câu trả lời Part 2 trong 2 phút (PPPP method: Past - Present - Future - Personal experience), từ vựng C1 về bảo vệ môi trường.',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:00',
    skillFocus: 'Speaking',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Ghi âm bài nói Part 2 & 3 nộp trên hệ thống trước 23:59 ngày mai',
    notes: 'Luyện tập phát âm đuôi /s/, /ed/ và ngữ điệu câu phức.',
    status: 'completed',
    roomOrLink: 'Phòng học 302 - Cơ sở Quận 1'
  },
  {
    id: 'sch-02b',
    classId: 'class-master-75',
    className: 'IELTS Master K75',
    sessionNumber: 1,
    title: 'Writing Task 1: Complex Flowcharts & Multi-charts Comparison',
    topic: 'Phân tích quy trình tuần hoàn / phi tuần hoàn, cấu trúc ngữ pháp bị động nâng cao, nhóm dữ liệu thông minh trong biểu đồ kết hợp.',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:30',
    skillFocus: 'Writing',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Viết Task 1 chủ đề Water Treatment Process',
    notes: 'Yêu cầu sử dụng ít nhất 4 cấu trúc câu phức đảo ngữ và phân từ.',
    status: 'completed',
    roomOrLink: 'Phòng VIP 401 - Cơ sở Quận 1'
  },
  {
    id: 'sch-03',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive K88',
    sessionNumber: 3,
    title: 'Reading: True / False / Not Given & Matching Headings Mastery',
    topic: 'Kỹ thuật Skimming & Scanning bài báo khoa học, nhận diện bẫy Qualified statements (always, often, rarely, only).',
    date: new Date(Date.now()).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:00',
    skillFocus: 'Reading',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Hoàn thành Passage 2 & 3 Cam 18 Test 2',
    notes: 'Giải thích kỹ sự khác biệt giữa FALSE và NOT GIVEN qua 10 ví dụ thực chiến.',
    status: 'upcoming',
    roomOrLink: 'Phòng học 302 - Cơ sở Quận 1'
  },
  {
    id: 'sch-04',
    classId: 'class-foundation-55',
    className: 'IELTS Foundation K12',
    sessionNumber: 2,
    title: 'Listening Section 1 & 2: Form Completion & Spelling',
    topic: 'Luyện nghe số điện thoại, tên riêng đánh vần, giá tiền và bản đồ chỉ đường (Map Labelling).',
    date: new Date(Date.now()).toISOString().split('T')[0],
    startTime: '19:30',
    endTime: '21:00',
    skillFocus: 'Listening',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Làm 2 bài nghe Section 1 trong giáo trình Foundation Unit 3',
    notes: 'Củng cố quy tắc đánh vần nguyên âm và phụ âm kép.',
    status: 'upcoming',
    roomOrLink: 'Zoom Online: 889 1234 5678 (Pass: 123456)'
  },
  {
    id: 'sch-05',
    classId: 'class-master-75',
    className: 'IELTS Master K75',
    sessionNumber: 2,
    title: 'Speaking Part 3: Abstract Debate & Philosophical Inquiries',
    topic: 'Phát triển luận điểm phản biện, sử dụng các cấu trúc Hypothetical / Counter-argument, nâng cấp Lexical Resource chủ đề Triết học & Trí tuệ nhân tạo.',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:30',
    skillFocus: 'Speaking',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Luyện nói 5 chủ đề phản biện xã hội và ghi âm câu trả lời',
    notes: 'Tập trung vào Fluency & Coherence và tính tự nhiên của ngữ điệu.',
    status: 'upcoming',
    roomOrLink: 'Phòng VIP 401 - Cơ sở Quận 1'
  },
  {
    id: 'sch-06',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive K88',
    sessionNumber: 4,
    title: 'Listening Section 3 & 4: Academic Discussions & Monologues',
    topic: 'Chiến thuật bẫy Distractors, nhận diện Signal Words trong bài giảng học thuật, kỹ năng tốc ký Note-taking tốc độ cao.',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:00',
    skillFocus: 'Listening',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Hoàn thành Test 3 Section 3 & 4 Cam 18',
    notes: 'Nhắc học viên ôn lại từ vựng chuyên ngành sinh học và khảo cổ.',
    status: 'upcoming',
    roomOrLink: 'Phòng học 302 - Cơ sở Quận 1'
  },
  {
    id: 'sch-tutoring-01',
    classId: 'class-intensive-65',
    className: 'IELTS Intensive K88',
    sessionNumber: 1,
    title: 'Phụ Đạo 1:1 - Luyện Phản Xạ Speaking Part 1 & Sửa Lỗi Ngữ Pháp',
    topic: 'Chỉnh phát âm ending sounds /s/, /z/, /tʃ/ và luyện phản xạ 10 câu hỏi Speaking Part 1 chủ đề Hometown & Technology.',
    date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    startTime: '19:30',
    endTime: '20:30',
    skillFocus: 'Speaking',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Thu âm lại 5 câu trả lời Speaking Part 1 sau khi được giáo viên sửa lỗi',
    notes: 'Học sinh Nguyễn Minh Anh cần luyện thêm phát âm âm đuôi và phản xạ nhanh không ậm ừ.',
    status: 'upcoming',
    roomOrLink: 'Google Meet: https://meet.google.com/ielts-minhanh-1on1',
    isIndividualTutoring: true,
    studentId: 'std-01',
    studentName: 'Nguyễn Minh Anh',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tutoringGoal: 'Sửa lỗi phát âm âm đuôi và tăng độ trôi chảy phản xạ Speaking Part 1'
  },
  {
    id: 'sch-tutoring-02',
    classId: 'class-master-75',
    className: 'IELTS Master K75',
    sessionNumber: 1,
    title: 'Phụ Đạo 1:1 - Nâng Cấp Cấu Trúc Writing Task 2 Nâng Cao',
    topic: 'Phân tích các cấu trúc câu đảo ngữ (Inversion), Cleft sentences và từ vựng C1-C2 chủ đề Artificial Intelligence.',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    startTime: '20:30',
    endTime: '21:30',
    skillFocus: 'Writing',
    materialsUrl: 'https://drive.google.com',
    homeworkSummary: 'Viết lại đoạn Body 2 bài AI in Education nộp lại giáo viên chấm',
    notes: 'Học sinh tiếp thu rất nhanh, đã áp dụng thành công câu đảo ngữ.',
    status: 'completed',
    roomOrLink: 'Phòng VIP 401 - Cơ sở Quận 1',
    isIndividualTutoring: true,
    studentId: 'std-01',
    studentName: 'Nguyễn Minh Anh',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tutoringGoal: 'Nâng cấp từ vựng C1-C2 và cấu trúc câu phức Writing Task 2'
  }
];


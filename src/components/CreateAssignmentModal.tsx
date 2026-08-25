import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Calendar, 
  BookOpen, 
  PenTool, 
  Mic, 
  Headphones, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Loader2, 
  ListPlus, 
  HelpCircle, 
  Upload, 
  Music, 
  Play, 
  Pause, 
  RotateCcw, 
  BookA, 
  Wand2, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Image as ImageIcon, 
  Link2, 
  Eye, 
  FileImage,
  ArrowLeft,
  Layers,
  ChevronDown,
  BookCheck,
  CheckSquare,
  FileText,
  ListOrdered
} from 'lucide-react';
import { Assignment, ClassGroup, Question, QuestionType, SkillType, VocabularyItem, AnswerKeyItem } from '../types';
import { IELTS_QUESTION_TYPES_CONFIG, CAMBRIDGE_PRESET_TEMPLATES, QuestionTypeMeta } from '../utils/ieltsQuestionConstants';
import { FreeformQuestionsAndAnswerSheetEditor } from './FreeformQuestionsAndAnswerSheetEditor';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Assignment) => void;
  classes: ClassGroup[];
  defaultClassId?: string;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  classes,
  defaultClassId = 'class-intensive-65',
}) => {
  const [skill, setSkill] = useState<SkillType>('writing');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('Task 2 - Essay');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState(defaultClassId);
  const [targetBand, setTargetBand] = useState('6.5 - 7.0');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(40);
  
  // Default deadline 2 days ahead
  const defaultDeadline = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16);
  const [deadline, setDeadline] = useState(defaultDeadline);

  // Content state
  const [readingPassage, setReadingPassage] = useState('');
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingMinWords, setWritingMinWords] = useState(250);
  const [speakingTopic, setSpeakingTopic] = useState('');
  const [speakingBullets, setSpeakingBullets] = useState<string[]>([
    'What the place or experience is',
    'When and where it took place',
    'Who you were with',
    'And explain why it was memorable to you'
  ]);
  const [speakingFollowUps, setSpeakingFollowUps] = useState<string[]>([
    'How have travel habits changed in your country over the past decade?',
    'Do you think modern technology makes tourism more convenient or less authentic?'
  ]);
  const [listeningScript, setListeningScript] = useState('');
  const [listeningAudioUrl, setListeningAudioUrl] = useState<string>('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [listeningAudioFileName, setListeningAudioFileName] = useState<string>('IELTS_Listening_Section2_Sample.mp3');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Images state (charts, graphs, maps, question illustrations)
  const [assignmentImages, setAssignmentImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showImageUrlField, setShowImageUrlField] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`Ảnh "${file.name}" vượt quá 8MB. Vui lòng chọn ảnh nhỏ hơn.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setAssignmentImages((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setAssignmentImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
    setShowImageUrlField(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setAssignmentImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Vocabulary Content state
  const [vocabularyTopic, setVocabularyTopic] = useState<string>('Environment & Sustainable Development');
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([
    {
      id: 'voc-1',
      word: 'unprecedented',
      phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
      partOfSpeech: 'adjective',
      vietnameseMeaning: 'chưa từng có tiền lệ, chưa từng thấy trước đây',
      englishDefinition: 'Never having happened or existed in the past.',
      exampleSentence: 'The coastal cities are facing unprecedented levels of sea rise due to global warming.',
      collocations: ['unprecedented scale', 'unprecedented challenge', 'unprecedented growth'],
      synonyms: ['unparalleled', 'exceptional', 'unrivaled'],
      band: '8.0'
    },
    {
      id: 'voc-2',
      word: 'biodiversity',
      phonetic: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'đa dạng sinh học',
      englishDefinition: 'The variety of plant and animal life in a particular habitat.',
      exampleSentence: 'Deforestation poses an existential threat to the rich biodiversity of tropical rainforests.',
      collocations: ['preserve biodiversity', 'loss of biodiversity', 'marine biodiversity'],
      synonyms: ['ecological diversity', 'biological variety'],
      band: '7.5'
    },
    {
      id: 'voc-3',
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
  ]);

  // AI Vocabulary Auto-Fill states
  const [loadingVocabMap, setLoadingVocabMap] = useState<Record<string, boolean>>({});
  const [lookupSuccessMap, setLookupSuccessMap] = useState<Record<string, boolean>>({});
  const [isAutoFillingAll, setIsAutoFillingAll] = useState<boolean>(false);
  const [isBatchVocabModalOpen, setIsBatchVocabModalOpen] = useState<boolean>(false);
  const [batchVocabInput, setBatchVocabInput] = useState<string>('');
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);

  // Audio Upload handler (file to base64 / blob object URL)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.m4a') && !file.name.endsWith('.ogg')) {
      alert('Vui lòng chọn file định dạng âm thanh (.mp3, .wav, .m4a, .ogg)');
      return;
    }

    // Read as Data URL to store persistently in localStorage or blob URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setListeningAudioUrl(event.target.result as string);
        setListeningAudioFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePreviewAudio = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play().then(() => setIsPlayingPreview(true)).catch(() => {});
    }
  };

  // Questions (legacy structure)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-1',
      type: 'essay',
      questionText: 'Nộp bài viết Writing Task 2 (tối thiểu 250 từ)'
    }
  ]);

  // Freeform Questions (Markdown / Tables / Headings / Gap-fills)
  const [questionsContent, setQuestionsContent] = useState<string>(`### Questions 1-4
Do the following statements agree with the information given in the passage?
In boxes 1-4 on your answer sheet, write:
- **TRUE** if the statement agrees with the information
- **FALSE** if the statement contradicts the information
- **NOT GIVEN** if there is no information on this

1. Microplastics are only found in surface ocean waters and along coastlines.
2. Microplastics have the capacity to absorb toxic chemical pollutants from surrounding seawater.
3. Biodegradable polymers have completely resolved marine pollution problems in European waters.
4. Marine organisms often mistake small plastic debris for natural prey like plankton.

---

### Questions 5-8 (Table Completion)
Complete the table below.
Choose **NO MORE THAN TWO WORDS** from the passage for each answer.

| Threat Category | Biological & Environmental Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Physical Ingestion** | Blockages in digestive tracts & malnutrition | Upgraded filtration |
| **Chemical Leaching** | Disruption of (5) [_______] | Strict additive bans |
| **Toxic Adsorption** | Bioaccumulation in (6) [_______] | Advanced (7) [_______] |
| **Policy Action** | Need for international (8) [_______] | Global research treaties |`);

  // Dedicated Answer Key List for Official IELTS Answer Sheet
  const [answerKeyList, setAnswerKeyList] = useState<AnswerKeyItem[]>([
    { questionNumber: 1, correctAnswer: 'FALSE', explanation: 'Paragraph A: Discovered even in deep ocean trenches.' },
    { questionNumber: 2, correctAnswer: 'TRUE', explanation: 'Paragraph C: Hydrophobic surfaces act as chemical sponges.' },
    { questionNumber: 3, correctAnswer: 'NOT GIVEN', explanation: 'Paragraph D mentions polymers as potential, but not completely resolved.' },
    { questionNumber: 4, correctAnswer: 'TRUE', explanation: 'Paragraph B: Frequently mistaken for plankton and fish eggs.' },
    { questionNumber: 5, correctAnswer: 'hormones / endocrine functions', acceptableAnswers: ['endocrine functions', 'hormone systems'], explanation: 'Paragraph B: Disrupting endocrine and reproductive systems.' },
    { questionNumber: 6, correctAnswer: 'marine fauna / food chain', acceptableAnswers: ['food chains', 'marine organisms'], explanation: 'Paragraph C: Bioaccumulation throughout marine trophic levels.' },
    { questionNumber: 7, correctAnswer: 'wastewater treatment / filtration', acceptableAnswers: ['filtration facilities', 'treatment plants'], explanation: 'Paragraph D: Upgrading wastewater treatment facilities.' },
    { questionNumber: 8, correctAnswer: 'regulations / policy frameworks', acceptableAnswers: ['treaties', 'policy interventions'], explanation: 'Paragraph D: Coordinated policy frameworks.' }
  ]);

  // UI state for IELTS question selection
  const [selectedQuestionCategoryFilter, setSelectedQuestionCategoryFilter] = useState<'all' | 'completion' | 'choice' | 'identification' | 'matching' | 'visual'>('all');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Assignment Generation
  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) {
      alert('Vui lòng nhập chủ đề muốn tạo đề bằng AI.');
      return;
    }
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/generate-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          topic: aiTopic.trim(),
          targetBand,
          questionCount: questions.length || 5,
          taskType
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        if (d.title) setTitle(d.title);
        if (d.instructions) setDescription(d.instructions);
        if (d.recommendedMinutes) setTimeLimitMinutes(d.recommendedMinutes);
        if (skill === 'reading' && d.passageOrPrompt) setReadingPassage(d.passageOrPrompt);
        if (skill === 'writing' && d.passageOrPrompt) setWritingPrompt(d.passageOrPrompt);
        if (skill === 'listening' && d.passageOrPrompt) setListeningScript(d.passageOrPrompt);
        if (skill === 'speaking' && d.passageOrPrompt) setSpeakingTopic(d.passageOrPrompt);
        if (Array.isArray(d.vocabularyList) && d.vocabularyList.length > 0) setVocabularyList(d.vocabularyList);
        if (Array.isArray(d.questions) && d.questions.length > 0) {
          setQuestions(d.questions.map((q: any, i: number) => ({
            id: q.id || `q-ai-${Date.now()}-${i + 1}`,
            type: q.type || 'multiple_choice',
            questionText: q.questionText || '',
            instruction: q.instruction,
            wordLimit: q.wordLimit,
            options: q.options,
            matchingOptions: q.matchingOptions,
            summaryText: q.summaryText,
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || ''
          })));
        }
      } else {
        setAiError(data.error || 'Không thể tạo đề bằng AI.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tạo đề bằng AI:', err);
      setAiError('Không thể kết nối đến máy chủ AI. Vui lòng thử lại.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSkillChange = (newSkill: SkillType) => {
    setSkill(newSkill);
    if (newSkill === 'writing') {
      setTaskType('Task 2 - Essay');
      setTimeLimitMinutes(40);
      setWritingMinWords(250);
      setQuestions([{ id: `q-${Date.now()}`, type: 'essay', questionText: 'Nộp bài viết luận IELTS' }]);
    } else if (newSkill === 'reading') {
      setTaskType('Academic Reading Passage 1');
      setTimeLimitMinutes(20);
      const preset = CAMBRIDGE_PRESET_TEMPLATES.find(p => p.id === 'reading-passage-1');
      if (preset) {
        setQuestions(preset.questions);
      } else {
        setQuestions([
          IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'true_false_ng')!.createDefault(1),
          IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'fill_blank')!.createDefault(2)
        ]);
      }
    } else if (newSkill === 'speaking') {
      setTaskType('Speaking Part 2 & Part 3');
      setTimeLimitMinutes(15);
      setQuestions([{ id: `q-${Date.now()}`, type: 'speaking_prompt', questionText: 'Ghi âm bài nói IELTS Speaking' }]);
    } else if (newSkill === 'listening') {
      setTaskType('Listening Section 1 - Dialogue & Form');
      setTimeLimitMinutes(10);
      const preset = CAMBRIDGE_PRESET_TEMPLATES.find(p => p.id === 'listening-section-1');
      if (preset) {
        setQuestions(preset.questions);
      } else {
        setQuestions([
          IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'fill_blank')!.createDefault(1),
          IELTS_QUESTION_TYPES_CONFIG.find(q => q.type === 'fill_blank')!.createDefault(2)
        ]);
      }
    } else if (newSkill === 'vocabulary') {
      setTaskType('IELTS Topic Vocabulary (Band 7.5+)');
      setTimeLimitMinutes(15);
      setQuestions([
        { 
          id: `q-${Date.now()}-1`, 
          type: 'multiple_choice', 
          questionText: 'Từ nào đồng nghĩa với "unprecedented" trong ngữ cảnh học thuật IELTS?', 
          options: ['A. Unparalleled', 'B. Conventional', 'C. Ordinary', 'D. Minor'], 
          correctAnswer: 'A',
          explanation: '"Unprecedented" mang nghĩa chưa từng có tiền lệ, phi thường.'
        },
        {
          id: `q-${Date.now()}-2`,
          type: 'fill_blank',
          questionText: 'Deforestation poses an existential threat to the rich [BLANK] of tropical rainforests.',
          wordLimit: 'ONE WORD ONLY',
          correctAnswer: 'biodiversity',
          explanation: 'Đáp án là "biodiversity" (sự đa dạng sinh học).'
        }
      ]);
    }
  };

  const handleApplyPresetTemplate = (presetId: string) => {
    const preset = CAMBRIDGE_PRESET_TEMPLATES.find(p => p.id === presetId);
    if (!preset) return;
    if (questions.length > 0 && !window.confirm(`Bạn có muốn tải mẫu đề "${preset.name}"? Các câu hỏi hiện tại sẽ được thay thế.`)) {
      return;
    }
    setTaskType(preset.taskType);
    setTimeLimitMinutes(preset.timeLimitMinutes);
    // Clone questions with unique IDs
    setQuestions(preset.questions.map((q, idx) => ({ ...q, id: `q-preset-${Date.now()}-${idx + 1}` })));
  };

  const handleAddQuestion = (type: QuestionType) => {
    const meta = IELTS_QUESTION_TYPES_CONFIG.find(c => c.type === type);
    const newQ: Question = meta 
      ? meta.createDefault(questions.length + 1)
      : {
          id: `q-${Date.now()}`,
          type,
          questionText: 'Nội dung câu hỏi...',
          correctAnswer: ''
        };
    setQuestions([...questions, newQ]);
    setShowAddQuestionModal(false);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleAddVocabItem = () => {
    const newItem: VocabularyItem = {
      id: `voc-${Date.now()}`,
      word: '',
      phonetic: '',
      partOfSpeech: 'noun',
      vietnameseMeaning: '',
      englishDefinition: '',
      exampleSentence: '',
      collocations: [],
      synonyms: [],
      band: '7.5'
    };
    setVocabularyList([...vocabularyList, newItem]);
  };

  const handleRemoveVocabItem = (id: string) => {
    setVocabularyList(vocabularyList.filter((v) => v.id !== id));
  };

  const handleUpdateVocabItem = (id: string, updates: Partial<VocabularyItem>) => {
    setVocabularyList(vocabularyList.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  // AI Single Word Auto-Fill
  const handleAiLookupWord = async (itemId: string, wordOverride?: string) => {
    const item = vocabularyList.find((v) => v.id === itemId);
    const wordToLookup = (wordOverride !== undefined ? wordOverride : item?.word || '').trim();
    if (!wordToLookup) {
      alert('Vui lòng nhập từ vựng (keyword) trước khi tra cứu AI.');
      return;
    }

    setLoadingVocabMap((prev) => ({ ...prev, [itemId]: true }));
    try {
      const res = await fetch('/api/gemini/lookup-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: wordToLookup,
          topic: vocabularyTopic || title || 'IELTS Academic Vocabulary',
          targetBand: targetBand || '7.5'
        })
      });

      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        handleUpdateVocabItem(itemId, {
          word: d.word || wordToLookup,
          phonetic: d.phonetic || '',
          partOfSpeech: d.partOfSpeech || 'noun',
          vietnameseMeaning: d.vietnameseMeaning || '',
          englishDefinition: d.englishDefinition || '',
          exampleSentence: d.exampleSentence || '',
          collocations: Array.isArray(d.collocations) ? d.collocations : [],
          synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
          band: d.band || '7.5'
        });

        setLookupSuccessMap((prev) => ({ ...prev, [itemId]: true }));
        setTimeout(() => {
          setLookupSuccessMap((prev) => ({ ...prev, [itemId]: false }));
        }, 3000);
      } else {
        alert(result.error || 'Không thể tra cứu thông tin từ vựng.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tra cứu từ vựng AI:', err);
      alert('Không thể kết nối với AI Gemini để tra cứu từ vựng.');
    } finally {
      setLoadingVocabMap((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // AI Auto-Fill all pending words
  const handleAutoFillAllWords = async () => {
    const pendingWords = vocabularyList.filter((v) => v.word && v.word.trim());
    if (pendingWords.length === 0) {
      alert('Vui lòng nhập ít nhất 1 từ vựng (keyword) trong danh sách.');
      return;
    }
    setIsAutoFillingAll(true);
    try {
      for (const item of pendingWords) {
        await handleAiLookupWord(item.id, item.word);
      }
    } finally {
      setIsAutoFillingAll(false);
    }
  };

  // AI Batch Import multiple words
  const handleBatchImportWords = async () => {
    const rawWords = batchVocabInput
      .split(/[\n,;]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (rawWords.length === 0) {
      alert('Vui lòng nhập ít nhất một từ vựng.');
      return;
    }

    setIsBatchProcessing(true);
    try {
      const res = await fetch('/api/gemini/batch-lookup-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: rawWords,
          topic: vocabularyTopic || title || 'IELTS Academic Topics',
          targetBand: targetBand || '7.5'
        })
      });

      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const newItems: VocabularyItem[] = result.data.map((d: any, idx: number) => ({
          id: `voc-${Date.now()}-${idx}`,
          word: d.word || rawWords[idx] || '',
          phonetic: d.phonetic || '',
          partOfSpeech: d.partOfSpeech || 'noun',
          vietnameseMeaning: d.vietnameseMeaning || '',
          englishDefinition: d.englishDefinition || '',
          exampleSentence: d.exampleSentence || '',
          collocations: Array.isArray(d.collocations) ? d.collocations : [],
          synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
          band: d.band || '7.5'
        }));

        // Filter out empty blank cards if any
        const existingValid = vocabularyList.filter((v) => v.word.trim() !== '');
        setVocabularyList([...existingValid, ...newItems]);
        setIsBatchVocabModalOpen(false);
        setBatchVocabInput('');
      } else {
        alert(result.error || 'Không thể tạo thẻ từ vựng hàng loạt bằng AI.');
      }
    } catch (err: any) {
      console.error('Lỗi khi import từ vựng hàng loạt:', err);
      alert('Lỗi kết nối tới AI. Vui lòng thử lại.');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài tập');
      return;
    }

    const selectedClass = classes.find((c) => c.id === classId);

    // Backward-compatible question synthesis
    let finalQuestions: Question[] = [];
    if (skill === 'reading' || skill === 'listening' || skill === 'vocabulary') {
      if (answerKeyList.length > 0) {
        finalQuestions = answerKeyList.map((item) => ({
          id: `q-${item.questionNumber}`,
          type: 'fill_blank',
          questionText: `Câu ${item.questionNumber}`,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation
        }));
      } else {
        finalQuestions = questions;
      }
    } else {
      finalQuestions = questions;
    }

    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      title: title.trim(),
      skill,
      taskType,
      description: description.trim() || `Bài tập luyện ${skill.toUpperCase()} IELTS`,
      targetBand,
      classId,
      className: selectedClass ? selectedClass.name : 'Lớp IELTS',
      timeLimitMinutes: Number(timeLimitMinutes) || 0,
      deadline: new Date(deadline).toISOString(),
      createdAt: new Date().toISOString(),
      readingPassage: skill === 'reading' ? readingPassage : undefined,
      writingPrompt: skill === 'writing' ? writingPrompt : undefined,
      writingMinWords: skill === 'writing' ? writingMinWords : undefined,
      listeningAudioUrl: skill === 'listening' ? listeningAudioUrl : undefined,
      listeningScript: skill === 'listening' ? listeningScript : undefined,
      speakingCueCard: skill === 'speaking' ? {
        topic: speakingTopic || title,
        bulletPoints: speakingBullets,
        followUpQuestions: speakingFollowUps,
        prepTimeSeconds: 60
      } : undefined,
      vocabularyTopic: skill === 'vocabulary' ? (vocabularyTopic || title) : undefined,
      vocabularyList: skill === 'vocabulary' ? vocabularyList : undefined,
      assignmentImageUrl: assignmentImages.length > 0 ? assignmentImages[0] : undefined,
      assignmentImages: assignmentImages.length > 0 ? assignmentImages : undefined,
      questions: finalQuestions,
      questionsContent: (skill === 'reading' || skill === 'listening' || skill === 'vocabulary') ? questionsContent : undefined,
      answerKeyList: (skill === 'reading' || skill === 'listening' || skill === 'vocabulary') ? answerKeyList : undefined,
      maxScore: (skill === 'reading' || skill === 'listening' || skill === 'vocabulary') 
        ? (answerKeyList.length || finalQuestions.length)
        : finalQuestions.length,
      authorTeacher: 'Teacher Celina Phạm',
      status: 'active'
    };

    onSave(newAssignment);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      {/* Top Global Navigation Bar */}
      <header className="bg-slate-950 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            title="Quay lại danh sách (phím Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quản Lý Bài Tập</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-bold tracking-tight">Giao Bài Tập IELTS Mới</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 font-mono font-bold border border-blue-700/50 uppercase">
              {skill}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <span>Hủy</span>
          </button>
          <button
            type="submit"
            form="create-assignment-form"
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Giao Bài Cho Lớp</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Layout Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
        <div className="max-w-[1500px] mx-auto">
          <form id="create-assignment-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-7">
          
          {/* Skill Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Chọn Kỹ Năng IELTS
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'writing', label: 'Writing (Viết)', icon: PenTool },
                { id: 'reading', label: 'Reading (Đọc)', icon: BookOpen },
                { id: 'speaking', label: 'Speaking (Nói)', icon: Mic },
                { id: 'listening', label: 'Listening (Nghe)', icon: Headphones },
                { id: 'vocabulary', label: 'Vocabulary (Từ Vựng)', icon: BookA },
              ].map((item) => (
                <label key={item.id} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="skill"
                    value={item.id}
                    checked={skill === item.id}
                    onChange={() => handleSkillChange(item.id as SkillType)}
                    className="sr-only peer"
                  />
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 border-2 border-slate-200 rounded-xl transition-all peer-checked:border-teal-600 peer-checked:bg-teal-50/80 peer-checked:text-teal-950 peer-checked:font-bold text-slate-700 hover:bg-slate-50 text-xs sm:text-sm text-center">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* AI Generator Box (Special Feature for IELTS Teachers) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 via-sky-50/40 to-slate-50 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-blue-950">
                  Tạo Đề IELTS Chuẩn Cambridge Bằng AI (Gemini Flash)
                </span>
              </div>
              <span className="text-[11px] text-blue-600 font-medium hidden sm:inline">
                Tự động sinh đề + bài đọc + câu hỏi + đáp án
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nhập chủ đề muốn tạo (vd: Renewable Energy, AI in Healthcare, Urban Traffic, Travel Memory)..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-all whitespace-nowrap cursor-pointer"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tạo đề...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo Đề Nhanh</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-md border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* Core Info: Title, Class, Target Band */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tiêu đề bài tập *
              </label>
              <input
                type="text"
                required
                placeholder="vd: Writing Task 2: Artificial Intelligence in Education"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dạng bài / Task Type
              </label>
              <input
                type="text"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giao cho Lớp học *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Band mục tiêu
              </label>
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="5.0 - 5.5">Band 5.0 - 5.5 (Foundation)</option>
                <option value="6.0 - 6.5">Band 6.0 - 6.5 (Intermediate)</option>
                <option value="6.5 - 7.0">Band 6.5 - 7.0 (Intensive)</option>
                <option value="7.5 - 8.0+">Band 7.5 - 8.0+ (Master)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mô tả ngắn
              </label>
              <input
                type="text"
                placeholder="Hướng dẫn chung cho học sinh..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Time Limit & Deadline Control (CRITICAL USER REQUEST) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              2. Thiết lập Giới Hạn Thời Gian & Hạn Nộp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Duration Timer limit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Giới hạn thời gian làm bài (Phút)</span>
                  <span className="text-blue-600 font-bold">
                    {timeLimitMinutes === 0 ? 'Không giới hạn' : `${timeLimitMinutes} phút`}
                  </span>
                </label>
                
                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    { label: '15 phút (Speaking/Quiz)', value: 15 },
                    { label: '20 phút (Task 1 / 1 Passage)', value: 20 },
                    { label: '40 phút (Task 2)', value: 40 },
                    { label: '60 phút (Full Test)', value: 60 },
                    { label: 'Không giới hạn', value: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setTimeLimitMinutes(preset.value)}
                      className={`px-2.5 py-1 text-[11px] rounded-md font-medium border transition-colors cursor-pointer ${
                        timeLimitMinutes === preset.value
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500">phút (Nhập số phút tùy chỉnh)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Khi học sinh bấm "Bắt đầu làm bài", đồng hồ đếm ngược sẽ chạy và tự động nộp khi hết giờ.
                </p>
              </div>

              {/* Deadline Setting */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Hạn chót nộp bài (Deadline)</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </label>

                {/* Deadline Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    { label: '+1 ngày', hours: 24 },
                    { label: '+2 ngày', hours: 48 },
                    { label: '+3 ngày', hours: 72 },
                    { label: '+1 tuần', hours: 168 },
                  ].map((p) => (
                    <button
                      key={p.hours}
                      type="button"
                      onClick={() => {
                        const newD = new Date(Date.now() + p.hours * 3600000).toISOString().slice(0, 16);
                        setDeadline(newD);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-md font-medium border bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  * Sau thời gian này, học sinh nộp sẽ bị đánh dấu là "Nộp trễ" (Late submission).
                </p>
              </div>

            </div>
          </div>

          {/* Image & Diagram Attachment Section */}
          <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Đính Kèm Hình Ảnh, Biểu Đồ & Sơ Đồ Đề Bài</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Đặc biệt hữu ích cho IELTS Writing Task 1 (Bar chart, Line graph, Pie chart, Table, Map, Process) hoặc hình minh họa câu hỏi
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh từ máy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageUrlField(!showImageUrlField)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Thêm Link ảnh</span>
                </button>
              </div>
            </div>

            {/* Hidden Multiple Image File Input */}
            <input
              type="file"
              ref={imageFileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageFileUpload}
            />

            {/* URL Input Box */}
            {showImageUrlField && (
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-blue-200 shadow-2xs">
                <input
                  type="url"
                  placeholder="Dán đường dẫn ảnh trực tiếp (vd: https://images.unsplash.com/... hoặc link ảnh biểu đồ)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Thêm
                </button>
              </div>
            )}

            {/* Image List Preview */}
            {assignmentImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {assignmentImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs aspect-video flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={`Đề bài đính kèm ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewImage(imgUrl)}
                        title="Xem ảnh phóng to"
                        className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Xóa ảnh này"
                        className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-900/70 text-white text-[10px] font-bold rounded-md backdrop-blur-xs">
                      Ảnh #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => imageFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white/60 hover:bg-blue-50/40 rounded-xl p-4 text-center cursor-pointer transition-colors"
              >
                <FileImage className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">Chưa có ảnh nào được đính kèm</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Bấm vào đây để tải lên biểu đồ đề bài, sơ đồ hoặc hình minh họa bài test
                </p>
              </div>
            )}
          </div>

          {/* Skill-Specific Content Form */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Nội Dung Bài Tập & Đề Bài
            </h3>

            {skill === 'writing' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Đề bài Writing Prompt *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Số từ tối thiểu:</span>
                      <select
                        value={writingMinWords}
                        onChange={(e) => setWritingMinWords(Number(e.target.value))}
                        className="text-xs font-semibold px-2 py-0.5 border border-slate-200 rounded bg-white"
                      >
                        <option value={150}>150 từ (Task 1)</option>
                        <option value={250}>250 từ (Task 2)</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nhập đề bài IELTS Writing..."
                    value={writingPrompt}
                    onChange={(e) => setWritingPrompt(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            )}

            {skill === 'reading' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nội dung đoạn văn Reading Passage *
                  </label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Dán nội dung đoạn văn bài đọc (có phân chia Paragraph A, B, C, D)..."
                    value={readingPassage}
                    onChange={(e) => setReadingPassage(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {skill === 'speaking' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chủ đề Cue Card (Part 2) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Describe an environmental project in your local area..."
                    value={speakingTopic}
                    onChange={(e) => setSpeakingTopic(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gợi ý ý tưởng (Bullet points)
                  </label>
                  <div className="space-y-1.5">
                    {speakingBullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const updated = [...speakingBullets];
                            updated[idx] = e.target.value;
                            setSpeakingBullets(updated);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {skill === 'listening' && (
              <div className="space-y-4">
                
                {/* Audio Upload Box */}
                <div className="p-4 bg-purple-50/70 rounded-2xl border-2 border-dashed border-purple-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-purple-950">
                          Tải Lên File Audio Bài Nghe (Listening Track) *
                        </h4>
                        <p className="text-[11px] text-purple-700">
                          Hỗ trợ định dạng MP3, WAV, M4A, OGG dung lượng lên đến 50MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn file từ máy</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />

                  {/* Audio URL input fallback */}
                  <div className="pt-2 border-t border-purple-200/60">
                    <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                      Hoặc dán trực tiếp đường link Audio URL (MP3 Online):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/audio/ielts-listening-section-2.mp3"
                        value={listeningAudioUrl}
                        onChange={(e) => {
                          setListeningAudioUrl(e.target.value);
                          setListeningAudioFileName(e.target.value.split('/').pop() || 'Online_Audio_Track.mp3');
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono text-purple-950"
                      />
                    </div>
                  </div>

                  {/* Sample Audio Presets */}
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-purple-800 font-semibold">Audio mẫu có sẵn:</span>
                    {[
                      { name: 'IELTS Section 1 (Conversation)', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
                      { name: 'IELTS Section 2 (Guided Tour)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                      { name: 'IELTS Section 4 (Lecture)', url: 'https://actions.google.com/sounds/v1/science/morse_code.ogg' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setListeningAudioUrl(preset.url);
                          setListeningAudioFileName(preset.name + '.mp3');
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        🎵 {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Audio Preview Card */}
                  {listeningAudioUrl && (
                    <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {listeningAudioFileName}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Đã nạp file âm thanh thành công
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <audio
                          ref={audioPreviewRef}
                          src={listeningAudioUrl}
                          onEnded={() => setIsPlayingPreview(false)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={togglePreviewAudio}
                          className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {isPlayingPreview ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Dừng nghe thử</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Nghe thử audio</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Listening Script (Kịch bản bài nghe - dùng để hiển thị khi chữa bài)
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Dán nội dung transcript/script bài nghe..."
                    value={listeningScript}
                    onChange={(e) => setListeningScript(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            )}

            {/* ================= VOCABULARY LESSON EDITOR ================= */}
            {skill === 'vocabulary' && (
              <div className="space-y-4 p-4 rounded-xl bg-teal-50/50 border border-teal-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                      <BookA className="w-4 h-4 text-teal-600" />
                      Danh Sách Thẻ Từ Vựng IELTS ({vocabularyList.length} từ)
                    </h4>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Nhập từ vựng tiếng Anh, AI Gemini sẽ tự động điền phiên âm IPA, nghĩa tiếng Việt, định nghĩa Anh-Anh, ví dụ và collocations!
                    </p>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-1.5">
                    {/* Batch import button */}
                    <button
                      type="button"
                      onClick={() => setIsBatchVocabModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      title="Dán danh sách nhiều từ cùng lúc để AI tự tra cứu và tạo thẻ bài học"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Nhập Nhanh Nhiều Từ AI</span>
                    </button>

                    {/* Auto-fill all button */}
                    <button
                      type="button"
                      disabled={isAutoFillingAll || vocabularyList.length === 0}
                      onClick={handleAutoFillAllWords}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      title="AI quét tất cả các từ trong danh sách và tự động điền các ô còn trống"
                    >
                      {isAutoFillingAll ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>{isAutoFillingAll ? 'Đang Điền Tất Cả...' : 'AI Điền Tất Cả'}</span>
                    </button>

                    {/* Add blank button */}
                    <button
                      type="button"
                      onClick={handleAddVocabItem}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Từ</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {vocabularyList.map((item, idx) => {
                    const isLoading = !!loadingVocabMap[item.id];
                    const isSuccess = !!lookupSuccessMap[item.id];

                    return (
                      <div 
                        key={item.id || idx} 
                        className={`p-3.5 bg-white border rounded-xl space-y-3 shadow-2xs transition-all ${
                          isLoading 
                            ? 'border-teal-400 ring-2 ring-teal-200 bg-teal-50/20' 
                            : isSuccess 
                            ? 'border-emerald-400 bg-emerald-50/20' 
                            : 'border-teal-200'
                        }`}
                      >
                        {/* Row 1: Word, Phonetic, POS, Band, Delete */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-4">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase">
                                Từ Vựng (Keyword) *
                              </label>
                              <button
                                type="button"
                                disabled={!item.word.trim() || isLoading}
                                onClick={() => handleAiLookupWord(item.id)}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  isSuccess
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : item.word.trim()
                                    ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                                title="Bấm để AI Gemini tự động phân tích và điền toàn bộ phiên âm IPA, nghĩa, định nghĩa, ví dụ, collocations"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                                    <span>Đang tra...</span>
                                  </>
                                ) : isSuccess ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Đã điền AI!</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 text-teal-600" />
                                    <span>✨ AI Điền Tự Động</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                required
                                placeholder="vd: sustainable, unprecedented..."
                                value={item.word}
                                onChange={(e) => handleUpdateVocabItem(item.id, { word: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && item.word.trim()) {
                                    e.preventDefault();
                                    handleAiLookupWord(item.id);
                                  }
                                }}
                                onBlur={() => {
                                  // Auto trigger if keyword entered and details are empty
                                  if (
                                    item.word.trim().length >= 3 && 
                                    !item.vietnameseMeaning && 
                                    !isLoading
                                  ) {
                                    handleAiLookupWord(item.id, item.word);
                                  }
                                }}
                                className="w-full pr-8 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold text-slate-900"
                              />
                              {isLoading ? (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                                </div>
                              ) : item.word.trim() ? (
                                <button
                                  type="button"
                                  onClick={() => handleAiLookupWord(item.id)}
                                  title="Tra cứu từ vựng này với Gemini AI"
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              ) : null}
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Phiên âm IPA
                            </label>
                            <input
                              type="text"
                              placeholder="vd: /səˈsteɪ.nə.bəl/"
                              value={item.phonetic || ''}
                              onChange={(e) => handleUpdateVocabItem(item.id, { phonetic: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Loại từ
                            </label>
                            <select
                              value={item.partOfSpeech || 'noun'}
                              onChange={(e) => handleUpdateVocabItem(item.id, { partOfSpeech: e.target.value })}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
                            >
                              <option value="noun">noun (danh từ)</option>
                              <option value="verb">verb (động từ)</option>
                              <option value="adjective">adjective (tính từ)</option>
                              <option value="adverb">adverb (trạng từ)</option>
                              <option value="phrase">phrase (cụm từ)</option>
                              <option value="collocation">collocation</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Band level
                            </label>
                            <select
                              value={item.band || '7.5'}
                              onChange={(e) => handleUpdateVocabItem(item.id, { band: e.target.value })}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-700"
                            >
                              <option value="6.5">Band 6.5</option>
                              <option value="7.0">Band 7.0</option>
                              <option value="7.5">Band 7.5</option>
                              <option value="8.0">Band 8.0</option>
                              <option value="8.5+">Band 8.5+</option>
                            </select>
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              title="Xóa từ"
                              onClick={() => handleRemoveVocabItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Vietnamese meaning & English definition */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Nghĩa Tiếng Việt *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="vd: bền vững, thân thiện với môi trường"
                              value={item.vietnameseMeaning}
                              onChange={(e) => handleUpdateVocabItem(item.id, { vietnameseMeaning: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Định nghĩa tiếng Anh (English definition)
                            </label>
                            <input
                              type="text"
                              placeholder="vd: Able to continue over a period of time without harming environment"
                              value={item.englishDefinition || ''}
                              onChange={(e) => handleUpdateVocabItem(item.id, { englishDefinition: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Row 3: Example sentence & Collocations */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Câu ví dụ ngữ cảnh IELTS (Example Sentence)
                            </label>
                            <input
                              type="text"
                              placeholder="vd: Transitioning to renewable energy is essential for sustainable growth."
                              value={item.exampleSentence || ''}
                              onChange={(e) => handleUpdateVocabItem(item.id, { exampleSentence: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-serif"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Collocations & Từ đồng nghĩa (Synonyms)
                            </label>
                            <input
                              type="text"
                              placeholder="vd: sustainable development, sustainable agriculture, sustainable practices"
                              value={item.collocations?.join(', ') || ''}
                              onChange={(e) => {
                                const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                handleUpdateVocabItem(item.id, { collocations: list });
                              }}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-indigo-700"
                            />
                          </div>
                        </div>

                        {/* Status notification when loading */}
                        {isLoading && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-100/70 border border-teal-300 rounded-lg text-[11px] text-teal-900 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>🤖 Gemini AI đang phân tích từ <strong>"{item.word}"</strong> (phiên âm IPA, nghĩa tiếng Việt, ví dụ band 8.0 và collocations)...</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          {/* Freeform Question & Table & Image Editor (For Reading, Listening & Vocabulary) */}
          {(skill === 'reading' || skill === 'listening' || skill === 'vocabulary') && (
            <FreeformQuestionsAndAnswerSheetEditor
              questionsContent={questionsContent}
              onChangeQuestionsContent={setQuestionsContent}
              answerKeyList={answerKeyList}
              onChangeAnswerKeyList={setAnswerKeyList}
              skill={skill}
              images={assignmentImages}
              onAddImage={(url) => setAssignmentImages((prev) => [...prev, url])}
              onRemoveImage={(idx) => setAssignmentImages((prev) => prev.filter((_, i) => i !== idx))}
              passageText={readingPassage}
              onChangePassageText={setReadingPassage}
            />
          )}

          {/* Legacy Question List Editor for vocabulary */}
          {false && (
            <div className="space-y-4 pt-3 border-t border-slate-200">
              {/* Header with Quick Presets & Add Question Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <BookCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      4. Bộ Câu Hỏi IELTS Chuẩn ({questions.length} câu)
                    </h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                      {skill === 'reading' ? 'IELTS Reading' : skill === 'listening' ? 'IELTS Listening' : 'IELTS Vocabulary'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ đầy đủ 12 dạng câu hỏi IELTS Reading & Listening: Matching Headings, True/False/NG, Summary Completion, v.v.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Preset Dropdown / Quick buttons */}
                  {skill === 'reading' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-medium text-slate-500">Mẫu Cambridge:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('reading-passage-1')}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        title="Passage 1: True/False/NG + Sentence Completion + Note Completion"
                      >
                        Passage 1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('reading-passage-2')}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        title="Passage 2: Matching Headings + Matching Info + Multiple Choice"
                      >
                        Passage 2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('reading-passage-3')}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        title="Passage 3: Yes/No/NG + MCQ Multi + Sentence Endings"
                      >
                        Passage 3
                      </button>
                    </div>
                  )}

                  {skill === 'listening' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-medium text-slate-500">Mẫu Section:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('listening-section-1')}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        title="Section 1: Form & Table Completion"
                      >
                        Sec 1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('listening-section-2')}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        title="Section 2: Map / Plan Labeling + MCQ"
                      >
                        Sec 2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('listening-section-3')}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        title="Section 3: Multi-MCQ + Matching Features"
                      >
                        Sec 3
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('listening-section-4')}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        title="Section 4: Academic Monologue Lecture Notes"
                      >
                        Sec 4
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(true)}
                    className="px-3.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Dạng Câu Hỏi IELTS</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {questions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <ListOrdered className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Chưa có câu hỏi nào trong bài tập</p>
                    <p className="text-xs text-slate-500">Bấm nút "+ Thêm Dạng Câu Hỏi IELTS" hoặc chọn mẫu đề Cambridge phía trên để bắt đầu.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Thêm Dạng Câu Hỏi Đầu Tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const meta = IELTS_QUESTION_TYPES_CONFIG.find(c => c.type === q.type);
                    const isMultiChoiceMulti = q.type === 'multiple_choice_multi';
                    const isMultiChoice = q.type === 'multiple_choice';
                    const isTFNG = q.type === 'true_false_ng';
                    const isYNNG = q.type === 'yes_no_ng';
                    const isHeadings = q.type === 'heading_matching';
                    const isMatchingInfo = q.type === 'matching_information';
                    const isMatchingFeatures = q.type === 'matching_features';
                    const isMatchingSentenceEndings = q.type === 'matching_sentence_endings';
                    const isCompletion = q.type === 'fill_blank' || q.type === 'summary_completion' || q.type === 'short_answer';
                    const isDiagram = q.type === 'diagram_labeling';

                    return (
                      <div 
                        key={q.id} 
                        className="p-4.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3.5 transition-all hover:border-slate-300"
                      >
                        {/* Question Card Header */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${meta?.badgeColor || 'bg-slate-100 text-slate-800'}`}>
                              {meta?.title || q.type}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                              • {meta?.categoryLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Instruction / Word Limit / Paragraph Tag */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Hướng Dẫn Đề Bài (Instruction):
                            </label>
                            <input
                              type="text"
                              placeholder="vd: Choose NO MORE THAN TWO WORDS, Write TRUE, FALSE or NOT GIVEN..."
                              value={q.instruction || ''}
                              onChange={(e) => handleUpdateQuestion(q.id, { instruction: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            />
                          </div>

                          {isCompletion && (
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Giới Hạn Từ (Word Limit Rule):
                              </label>
                              <select
                                value={q.wordLimit || 'NO MORE THAN TWO WORDS'}
                                onChange={(e) => handleUpdateQuestion(q.id, { wordLimit: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-amber-900 font-semibold"
                              >
                                <option value="ONE WORD ONLY">ONE WORD ONLY (Chỉ 1 từ duy nhất)</option>
                                <option value="NO MORE THAN TWO WORDS">NO MORE THAN TWO WORDS (Tối đa 2 từ)</option>
                                <option value="NO MORE THAN THREE WORDS">NO MORE THAN THREE WORDS (Tối đa 3 từ)</option>
                                <option value="NO MORE THAN TWO WORDS AND/OR A NUMBER">NO MORE THAN TWO WORDS AND/OR A NUMBER (Tối đa 2 từ và/hoặc 1 số)</option>
                                <option value="ONE WORD AND/OR A NUMBER">ONE WORD AND/OR A NUMBER (1 từ và/hoặc 1 số)</option>
                              </select>
                            </div>
                          )}

                          {isHeadings && (
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Đoạn Văn Cần Nối (Paragraph Label):
                              </label>
                              <input
                                type="text"
                                placeholder="vd: Paragraph A, Section B..."
                                value={q.paragraphLabel || `Paragraph ${String.fromCharCode(65 + (idx % 8))}`}
                                onChange={(e) => handleUpdateQuestion(q.id, { paragraphLabel: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-purple-900 font-bold"
                              />
                            </div>
                          )}
                        </div>

                        {/* Question Text / Summary Text */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            {isHeadings ? 'Câu Hỏi / Yêu Cầu Nối Tiêu Đề:' : isCompletion ? 'Nội Dung Câu / Đoạn Điền Từ (Đặt [BLANK] tại vị trí cần điền):' : 'Nội Dung Câu Hỏi:'}
                          </label>
                          <textarea
                            rows={isCompletion && q.type === 'summary_completion' ? 3 : 2}
                            placeholder={isCompletion ? 'vd: In the 19th century, the expansion of railway networks facilitated rapid [BLANK] across Europe.' : 'Nhập câu hỏi hoặc nhận định...'}
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestion(q.id, { questionText: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-hidden"
                          />
                        </div>

                        {/* Special Editors by Question Type */}

                        {/* 1. Matching Headings Editor */}
                        {isHeadings && (
                          <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-950">
                                📑 Danh Sách Tiêu Đề Số La Mã (List of Headings):
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentHeadings = q.headings || ['i. Heading 1', 'ii. Heading 2', 'iii. Heading 3'];
                                  const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
                                  const nextRoman = romanNumerals[currentHeadings.length] || `${currentHeadings.length + 1}`;
                                  handleUpdateQuestion(q.id, { headings: [...currentHeadings, `${nextRoman}. New Heading`] });
                                }}
                                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm Tiêu Đề
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {(q.headings || ['i. Technological innovations in agricultural irrigation', 'ii. The economic ramifications of prolonged drought', 'iii. Historical background of ancient water management', 'iv. Environmental resistance and community scepticism']).map((hd, hIdx) => (
                                <div key={hIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={hd}
                                    onChange={(e) => {
                                      const newHeadings = [...(q.headings || [])];
                                      newHeadings[hIdx] = e.target.value;
                                      handleUpdateQuestion(q.id, { headings: newHeadings });
                                    }}
                                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-purple-200 rounded-md font-mono text-purple-950"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newHeadings = (q.headings || []).filter((_, i) => i !== hIdx);
                                      handleUpdateQuestion(q.id, { headings: newHeadings });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. Multiple Choice (Single or Multi) Options Editor */}
                        {(isMultiChoice || isMultiChoiceMulti || isMatchingFeatures || isMatchingSentenceEndings || isDiagram || isMatchingInfo) && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">
                                {isMultiChoice ? 'Các Lựa Chọn A, B, C, D:' : isMultiChoiceMulti ? 'Các Lựa Chọn A, B, C, D, E... (Chọn 2 hoặc nhiều):' : isMatchingFeatures ? 'Danh Sách Nhân Vật / Đặc Điểm (A, B, C, D):' : isMatchingSentenceEndings ? 'Danh Sách Nửa Câu Kết Thúc (A - G):' : isMatchingInfo ? 'Danh Sách Đoạn Văn (Paragraph A - F):' : 'Danh Sách Vị Trí Bản Đồ (A - G):'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentOpts = q.options || ['A', 'B', 'C', 'D'];
                                  const nextLetter = String.fromCharCode(65 + currentOpts.length);
                                  handleUpdateQuestion(q.id, { options: [...currentOpts, `${nextLetter}. Lựa chọn ${nextLetter}`] });
                                }}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm Lựa Chọn
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {(q.options || ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']).map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(q.options || [])];
                                      newOpts[oIdx] = e.target.value;
                                      handleUpdateQuestion(q.id, { options: newOpts });
                                    }}
                                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md font-medium text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newOpts = (q.options || []).filter((_, i) => i !== oIdx);
                                      handleUpdateQuestion(q.id, { options: newOpts });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Correct Answer Selection Panel */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Thiết Lập Đáp Án Chuẩn (Answer Key):
                            </span>
                            <span className="text-[10px] font-medium text-emerald-700">
                              Hệ thống sẽ tự động chấm điểm bài làm của học sinh
                            </span>
                          </div>

                          {/* 1. True / False / Not Given */}
                          {isTFNG && (
                            <div className="flex items-center gap-2">
                              {['TRUE', 'FALSE', 'NOT GIVEN'].map((val) => {
                                const selected = (q.correctAnswer || 'TRUE') === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleUpdateQuestion(q.id, { correctAnswer: val })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      selected 
                                        ? 'bg-emerald-600 text-white shadow-xs scale-102' 
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-100/50'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* 2. Yes / No / Not Given */}
                          {isYNNG && (
                            <div className="flex items-center gap-2">
                              {['YES', 'NO', 'NOT GIVEN'].map((val) => {
                                const selected = (q.correctAnswer || 'YES') === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleUpdateQuestion(q.id, { correctAnswer: val })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      selected 
                                        ? 'bg-teal-600 text-white shadow-xs scale-102' 
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-100/50'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* 3. Multiple Choice Single Answer */}
                          {isMultiChoice && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {(q.options || ['A', 'B', 'C', 'D']).map((opt, oIdx) => {
                                const letter = String.fromCharCode(65 + oIdx);
                                const selected = (typeof q.correctAnswer === 'string' && q.correctAnswer.charAt(0).toUpperCase() === letter) || q.correctAnswer === opt;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleUpdateQuestion(q.id, { correctAnswer: letter })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                                      selected
                                        ? 'bg-blue-600 text-white shadow-xs scale-102'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50'
                                    }`}
                                  >
                                    <span>Đáp án {letter}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* 4. Multiple Choice Multi-Select (Choose 2 or more letters) */}
                          {isMultiChoiceMulti && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] text-indigo-900 font-medium block">
                                Chọn tất cả các chữ cái đúng (ví dụ: chọn A và C):
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {(q.options || ['A', 'B', 'C', 'D', 'E']).map((opt, oIdx) => {
                                  const letter = String.fromCharCode(65 + oIdx);
                                  const currentArr: string[] = Array.isArray(q.correctAnswer) 
                                    ? q.correctAnswer 
                                    : (typeof q.correctAnswer === 'string' ? q.correctAnswer.split(/[,;\s]+/).filter(Boolean) : ['A', 'C']);
                                  const isSelected = currentArr.some(c => c.trim().toUpperCase() === letter);

                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      onClick={() => {
                                        let updated: string[];
                                        if (isSelected) {
                                          updated = currentArr.filter(c => c.trim().toUpperCase() !== letter);
                                        } else {
                                          updated = [...currentArr, letter].sort();
                                        }
                                        handleUpdateQuestion(q.id, { correctAnswer: updated });
                                      }}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white shadow-xs'
                                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50'
                                      }`}
                                    >
                                      <CheckSquare className="w-3.5 h-3.5" />
                                      <span>Đáp án {letter}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 5. Matching Headings Selector */}
                          {isHeadings && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] text-purple-950 font-bold block">
                                Chọn tiêu đề La Mã đúng cho đoạn này:
                              </span>
                              <select
                                value={typeof q.correctAnswer === 'string' ? q.correctAnswer : 'i'}
                                onChange={(e) => handleUpdateQuestion(q.id, { correctAnswer: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-lg text-purple-950 font-bold"
                              >
                                {(q.headings || ['i', 'ii', 'iii', 'iv', 'v', 'vi']).map((hd, hIdx) => {
                                  const romanCode = hd.split('.')[0].trim();
                                  return (
                                    <option key={hIdx} value={romanCode}>
                                      {hd}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}

                          {/* 6. Matching Features / Information / Sentence Endings / Diagram */}
                          {(isMatchingFeatures || isMatchingInfo || isMatchingSentenceEndings || isDiagram) && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] text-slate-700 font-bold">Đáp án đúng:</span>
                              {(q.options || ['A', 'B', 'C', 'D', 'E']).map((opt, oIdx) => {
                                const letter = String.fromCharCode(65 + oIdx);
                                const selected = (typeof q.correctAnswer === 'string' && q.correctAnswer.charAt(0).toUpperCase() === letter) || q.correctAnswer === opt;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleUpdateQuestion(q.id, { correctAnswer: letter })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      selected
                                        ? 'bg-emerald-600 text-white shadow-xs scale-102'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
                                    }`}
                                  >
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* 7. Sentence & Summary Completion / Short Answer */}
                          {isCompletion && (
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Nhập đáp án chuẩn (Dùng dấu gạch chéo / cho nhiều cách viết đúng, vd: solar energy / solar power)"
                                value={typeof q.correctAnswer === 'string' ? q.correctAnswer : Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : ''}
                                onChange={(e) => handleUpdateQuestion(q.id, { correctAnswer: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg text-emerald-950 font-bold placeholder:font-normal"
                              />
                              <p className="text-[10px] text-emerald-800">
                                💡 Tip: Bạn có thể nhập nhiều đáp án được chấp nhận phân tách bởi dấu " / " (ví dụ: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">1985 / nineteen eighty-five</code> hoặc <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">color / colour</code>).
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Explanation / Quote from passage */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            💡 Giải Thích Đáp Án & Dẫn Chứng Trích Đoạn (Explanation & Evidence):
                          </label>
                          <input
                            type="text"
                            placeholder="vd: Đoạn 2, dòng 4 nêu rõ: 'Researchers observed a 45% increase...'"
                            value={q.explanation || ''}
                            onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Add IELTS Question Type Modal / Drawer */}
          {showAddQuestionModal && (
            <div 
              className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setShowAddQuestionModal(false)}
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Chọn Dạng Câu Hỏi IELTS Cần Thêm
                      </h3>
                      <p className="text-xs text-slate-500">
                        Hỗ trợ đầy đủ các dạng bài thi Cambridge IELTS Reading & Listening
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
                  {[
                    { key: 'all', label: 'Tất Cả Dạng' },
                    { key: 'identification', label: 'Xác Thực Thông Tin' },
                    { key: 'choice', label: 'Trắc Nghiệm (MCQ)' },
                    { key: 'matching', label: 'Dạng Nối (Matching)' },
                    { key: 'completion', label: 'Điền Từ (Completion)' },
                    { key: 'visual', label: 'Sơ Đồ / Bản Đồ' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedQuestionCategoryFilter(tab.key as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                        selectedQuestionCategoryFilter === tab.key
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Question Types Grid */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {IELTS_QUESTION_TYPES_CONFIG
                    .filter((item) => {
                      if (selectedQuestionCategoryFilter === 'all') return true;
                      return item.category === selectedQuestionCategoryFilter;
                    })
                    .map((item) => (
                      <div
                        key={item.type}
                        onClick={() => handleAddQuestion(item.type)}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-md transition-all cursor-pointer space-y-2 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {item.categoryLabel}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600">
                          <span>+ Thêm câu này</span>
                          <span className="text-xs">➔</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Kỹ năng:</span>
              <span className="uppercase font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200">{skill}</span>
              <span>•</span>
              <span>Thời gian làm bài: <strong className="text-slate-800 font-semibold">{timeLimitMinutes} phút</strong></span>
              {(skill === 'reading' || skill === 'listening') ? (
                <>
                  <span>•</span>
                  <span>Tổng số câu hỏi: <strong className="text-emerald-700 font-bold">{answerKeyList.length} câu</strong></span>
                </>
              ) : questions.length > 0 ? (
                <>
                  <span>•</span>
                  <span>Tổng số câu hỏi: <strong className="text-emerald-700 font-bold">{questions.length} câu</strong></span>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Giao Bài Tập Cho Lớp Ngay</span>
              </button>
            </div>
          </div>

        </form>
        </div>
      </div>

      {/* Batch Import Vocabulary Modal */}
      {isBatchVocabModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ⚡ Nhập Nhanh Danh Sách Từ Vựng Bằng AI
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    AI Gemini sẽ tự động tra phiên âm IPA, nghĩa, ví dụ và collocations cho tất cả các từ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchVocabModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Danh sách từ vựng tiếng Anh (phân cách bằng dấu phẩy hoặc dòng mới):
              </label>
              <textarea
                rows={5}
                value={batchVocabInput}
                onChange={(e) => setBatchVocabInput(e.target.value)}
                placeholder={"vd:\nunprecedented\nbiodiversity\nmitigate\nubiquitous\nsustainable\nproliferation"}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 leading-relaxed"
              />
            </div>

            {/* Quick Sample Sets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gợi ý từ vựng theo chủ đề:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setBatchVocabInput("sustainable, mitigate, biodiversity, depletion, hazardous")}
                  className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-semibold rounded-lg border border-teal-200"
                >
                  🌱 Môi Trường & Sinh Thái
                </button>
                <button
                  type="button"
                  onClick={() => setBatchVocabInput("automation, artificial intelligence, state-of-the-art, unprecedented, obsolete")}
                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-semibold rounded-lg border border-indigo-200"
                >
                  🤖 Công Nghệ & AI
                </button>
                <button
                  type="button"
                  onClick={() => setBatchVocabInput("urbanization, demographic, infrastructure, overcrowding, cosmopolitan")}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-lg border border-amber-200"
                >
                  🏙️ Xã Hội & Đô Thị
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBatchVocabModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isBatchProcessing || !batchVocabInput.trim()}
                onClick={handleBatchImportWords}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isBatchProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini AI Đang Phân Tích...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tạo Thẻ Từ Vựng Bằng AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Preview Lightbox */}
      {selectedPreviewImage && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPreviewImage}
              alt="Phóng to ảnh đề bài"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

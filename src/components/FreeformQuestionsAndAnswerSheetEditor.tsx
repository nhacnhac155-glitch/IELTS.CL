import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Table as TableIcon, 
  FileText, 
  Eye, 
  Edit3, 
  Plus, 
  Trash2, 
  Sparkles, 
  ClipboardPaste, 
  HelpCircle, 
  CheckCircle2, 
  ListOrdered,
  Heading,
  Bold,
  Italic,
  SplitSquareVertical,
  Wand2,
  Image as ImageIcon,
  Upload,
  ZoomIn,
  X,
  FileImage,
  Link2,
  BookOpen,
  LayoutGrid,
  Columns,
  Rows,
  Check,
  RotateCcw,
  Maximize2,
  Layers,
  ArrowRight,
  DownloadCloud
} from 'lucide-react';
import { AnswerKeyItem } from '../types';

interface FreeformQuestionsAndAnswerSheetEditorProps {
  questionsContent: string;
  onChangeQuestionsContent: (content: string) => void;
  answerKeyList: AnswerKeyItem[];
  onChangeAnswerKeyList: (list: AnswerKeyItem[]) => void;
  skill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary';
  images?: string[];
  onAddImage?: (imageUrl: string) => void;
  onRemoveImage?: (index: number) => void;
  passageText?: string;
  onChangePassageText?: (passage: string) => void;
}

export const FreeformQuestionsAndAnswerSheetEditor: React.FC<FreeformQuestionsAndAnswerSheetEditorProps> = ({
  questionsContent,
  onChangeQuestionsContent,
  answerKeyList,
  onChangeAnswerKeyList,
  skill,
  images = [],
  onAddImage,
  onRemoveImage,
  passageText,
  onChangePassageText,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  
  // Visual Table Builder state
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableHeaders, setTableHeaders] = useState<string[]>(['Giai đoạn / Tiêu chí', 'Phương pháp thực hiện', 'Kết quả quan sát']);
  const [tableData, setTableData] = useState<string[][]>([
    ['Phase 1: Sampling', 'Acoustic sonar scanning', 'Discovered (1) [_______]'],
    ['Phase 2: Analysis', 'Water filtration testing', 'High levels of (2) [_______]'],
    ['Phase 3: Impact', 'Ecological modelling', 'Threat to local (3) [_______]']
  ]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Smart 1-Click Parser Modal
  const [showSmartParserModal, setShowSmartParserModal] = useState(false);
  const [smartInputText, setSmartInputText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    passage?: string;
    questions?: string;
    keys: AnswerKeyItem[];
  } | null>(null);

  // Quick Preset Selector Modal
  const [showPresetModal, setShowPresetModal] = useState(false);

  // Quick Paste Key Modal
  const [showPasteKeyModal, setShowPasteKeyModal] = useState(false);
  const [pasteKeyText, setPasteKeyText] = useState('');

  // Image Upload / Insertion state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Insert text at cursor position in textarea
  const insertTextAtCursor = (snippet: string) => {
    if (!textareaRef.current) {
      onChangeQuestionsContent((questionsContent ? questionsContent + '\n\n' : '') + snippet);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = questionsContent;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newContent = before + (before.endsWith('\n') || before === '' ? '' : '\n\n') + snippet + (after.startsWith('\n') ? '' : '\n\n') + after;
    onChangeQuestionsContent(newContent);
  };

  // Clipboard Paste listener for images
  const handleTextareaPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const resultUrl = event.target?.result as string;
            if (resultUrl && onAddImage) {
              onAddImage(resultUrl);
              insertTextAtCursor(`![Hình ảnh đính kèm](${resultUrl})`);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Visual Table Builder actions
  const handleAddTableRow = () => {
    setTableData(prev => [...prev, Array(tableHeaders.length).fill('')]);
  };

  const handleRemoveTableRow = (rIdx: number) => {
    if (tableData.length <= 1) return;
    setTableData(prev => prev.filter((_, idx) => idx !== rIdx));
  };

  const handleAddTableCol = () => {
    setTableHeaders(prev => [...prev, `Cột ${prev.length + 1}`]);
    setTableData(prev => prev.map(row => [...row, '']));
  };

  const handleRemoveTableCol = (cIdx: number) => {
    if (tableHeaders.length <= 1) return;
    setTableHeaders(prev => prev.filter((_, idx) => idx !== cIdx));
    setTableData(prev => prev.map(row => row.filter((_, idx) => idx !== cIdx)));
  };

  const handleInsertSlotInCell = (rIdx: number, cIdx: number) => {
    const nextSlotNum = answerKeyList.length > 0 ? Math.max(...answerKeyList.map(a => a.questionNumber)) + 1 : 1;
    const currentVal = tableData[rIdx][cIdx] || '';
    const updatedVal = currentVal ? `${currentVal} (${nextSlotNum}) [_______]` : `(${nextSlotNum}) [_______]`;
    
    const nextData = [...tableData];
    nextData[rIdx][cIdx] = updatedVal;
    setTableData(nextData);

    // Auto-add slot to answer key list
    if (!answerKeyList.some(a => a.questionNumber === nextSlotNum)) {
      onChangeAnswerKeyList([...answerKeyList, { questionNumber: nextSlotNum, correctAnswer: '', explanation: '' }]);
    }
  };

  const handleApplyPresetTable = (type: 'summary' | 'flowchart' | 'matching' | 'collocations' | 'synonyms') => {
    if (type === 'summary') {
      setTableHeaders(['Research Stage', 'Key Methodology', 'Observed Finding']);
      setTableData([
        ['Phase 1: Sampling', 'Acoustic sonar scanning', 'Discovered (1) [_______]'],
        ['Phase 2: Analysis', 'Water filtration testing', 'High levels of (2) [_______]'],
        ['Phase 3: Impact', 'Ecological modelling', 'Threat to local (3) [_______]']
      ]);
    } else if (type === 'flowchart') {
      setTableHeaders(['Stage & Phase', 'Action & Operation', 'Output / Outcome']);
      setTableData([
        ['Step 1', 'Collection of plastic waste', 'Initial sorting'],
        ['Step 2', 'Chemical (4) [_______]', 'Purified flakes'],
        ['Step 3', 'High-pressure (5) [_______]', 'Recycled filament']
      ]);
    } else if (type === 'collocations') {
      setTableHeaders(['Base Word', 'Noun Form', 'Adjective Form', 'IELTS Collocation']);
      setTableData([
        ['Sustain', 'Sustainability', '(1) [_______]', '(2) [_______] development'],
        ['Mitigate', '(3) [_______]', 'Mitigating', '(4) [_______] climate risks'],
        ['Precedent', '(5) [_______]', '(6) [_______]', '(7) [_______] scale of growth']
      ]);
    } else if (type === 'synonyms') {
      setTableHeaders(['Target Word', 'Part of Speech', 'Definition / Synonym (A-G)']);
      setTableData([
        ['1. Unprecedented', 'Adjective', '(1) [___]'],
        ['2. Biodegradable', 'Adjective', '(2) [___]'],
        ['3. Proliferation', 'Noun', '(3) [___]'],
        ['4. Detrimental', 'Adjective', '(4) [___]']
      ]);
    } else if (type === 'matching') {
      setTableHeaders(['Characteristic / Feature', 'Classification Category (A, B, C)']);
      setTableData([
        ['Highest concentration of synthetic microfibers', '(6) [___]'],
        ['Extreme pressure and minimal temperature fluctuation', '(7) [___]'],
        ['Rapid seasonal ice melt acceleration', '(8) [___]']
      ]);
    }
  };

  const handleInsertVisualTableIntoMarkdown = () => {
    const headerCols = tableHeaders.join(' | ');
    const dividerCols = tableHeaders.map(() => ':---').join(' | ');
    const rows = tableData.map(row => `| ${row.map(cell => cell.trim() || '-').join(' | ')} |`).join('\n');
    const markdownTable = `| ${headerCols} |\n| ${dividerCols} |\n${rows}`;
    
    insertTextAtCursor(markdownTable);
    setShowTableModal(false);
  };

  // Smart Parser Engine: Parses raw paste into Passage, Questions, and Answer Keys
  const handleRunSmartParser = () => {
    if (!smartInputText.trim()) return;

    let text = smartInputText;
    let extractedPassage = '';
    let extractedQuestions = '';
    const extractedKeys: AnswerKeyItem[] = [];

    // Check if there is an explicit "Answer Key" / "Đáp án" section
    const answerKeySplitRegex = /(?:^|\n)(?:Answer\s*Keys?|Answers?|Đáp\s*Án|Key\s*Đáp\s*Án)[\s\:\-\=]+/i;
    const splitParts = text.split(answerKeySplitRegex);

    let mainContent = splitParts[0] || '';
    let keySection = splitParts.length > 1 ? splitParts.slice(1).join('\n') : '';

    // Check if there is a Reading Passage vs Questions divider
    const passageSplitRegex = /(?:^|\n)(?:Questions?\s*\d+|Passage\s*Questions|Phần\s*Câu\s*Hỏi)[\s\:\-\=]+/i;
    if (passageSplitRegex.test(mainContent)) {
      const pParts = mainContent.split(passageSplitRegex);
      extractedPassage = pParts[0].trim();
      extractedQuestions = mainContent.substring(extractedPassage.length).trim();
    } else {
      extractedQuestions = mainContent.trim();
    }

    // Extract Answer keys: from keySection OR scan from whole text
    const textToScanKeys = keySection || mainContent;
    
    // Pattern 1: Lines like "1. TRUE", "1/ B", "1 - solar energy", "Q1: TRUE"
    const lineRegex = /(?:(?:Q|Question)?\s*(\d{1,2})[\.\:\-\)\/\s]+)([^\n\r\,]+)/gi;
    let match;
    const seenNums = new Set<number>();

    while ((match = lineRegex.exec(textToScanKeys)) !== null) {
      const qNum = parseInt(match[1], 10);
      const rawAns = match[2].trim();
      if (qNum >= 1 && qNum <= 40 && rawAns && !seenNums.has(qNum)) {
        // Clean out trailing comma or notes
        const [ansPart, notePart] = rawAns.split(/\s*(?:\/\/|;|->)\s*/);
        if (ansPart && !ansPart.toLowerCase().startsWith('questions') && !ansPart.toLowerCase().startsWith('passage')) {
          extractedKeys.push({
            questionNumber: qNum,
            correctAnswer: ansPart.replace(/[\.\,\;]+$/, '').trim(),
            explanation: notePart ? notePart.trim() : ''
          });
          seenNums.add(qNum);
        }
      }
    }

    // If no numbered keys found, try comma-separated tokens (e.g. "TRUE, FALSE, NOT GIVEN, A, B, solar")
    if (extractedKeys.length === 0 && keySection) {
      const tokens = keySection.split(/[\n,;]+/).map(t => t.trim()).filter(Boolean);
      tokens.forEach((token, idx) => {
        extractedKeys.push({
          questionNumber: idx + 1,
          correctAnswer: token,
          explanation: ''
        });
      });
    }

    extractedKeys.sort((a, b) => a.questionNumber - b.questionNumber);

    setParsedPreview({
      passage: extractedPassage || undefined,
      questions: extractedQuestions || undefined,
      keys: extractedKeys
    });
  };

  const handleApplySmartParser = () => {
    if (!parsedPreview) return;

    if (parsedPreview.passage && onChangePassageText) {
      onChangePassageText(parsedPreview.passage);
    }
    if (parsedPreview.questions) {
      onChangeQuestionsContent(parsedPreview.questions);
    }
    if (parsedPreview.keys && parsedPreview.keys.length > 0) {
      onChangeAnswerKeyList(parsedPreview.keys);
    }

    setShowSmartParserModal(false);
    setSmartInputText('');
    setParsedPreview(null);
  };

  // Ready-Made Presets
  const handleLoadPreset = (presetKey: string) => {
    if (presetKey === 'reading_microplastics') {
      if (onChangePassageText) {
        onChangePassageText(`### READING PASSAGE 1: MICROPLASTICS IN THE MARINE ENVIRONMENT

Microplastics, defined as plastic particles less than five millimeters in diameter, have emerged as one of the most pervasive anthropogenic pollutants in modern ecosystems. First observed in marine surface waters during the 1970s, their proliferation has accelerated dramatically over the past two decades.

Scientific surveys indicate that these synthetic particles originate from two primary sources: primary microplastics, manufactured intentionally for commercial use in cosmetics and industrial abrasives; and secondary microplastics, which result from the physical fragmentation and chemical degradation of larger debris such as packaging materials, synthetic textiles, and discarded fishing gear.

Recent oceanographic expeditions to the Mariana Trench—the deepest oceanic depression on Earth—have revealed synthetic fibers embedded within the digestive tracts of benthic amphipods inhabiting depths exceeding 10,000 meters. This discovery confirms that no marine zone remains pristine.

Beyond mechanical blockages, microplastics act as vectors for hazardous chemical additives, including phthalates and bisphenol A (BPA), which leach directly into aquatic fauna. Furthermore, the hydrophobic surface of microplastics attracts persistent organic pollutants (POPs) from seawater, creating concentrated toxic pellets ingested by plankton and fish.`);
      }

      onChangeQuestionsContent(`### Questions 1-4 (True / False / Not Given)
Do the following statements agree with the information given in Reading Passage 1?
In boxes 1-4 on your answer sheet, write:
- **TRUE** if the statement agrees with the information
- **FALSE** if the statement contradicts the information
- **NOT GIVEN** if there is no information on this

1. Microplastics are only found in surface ocean waters and along tourist coastlines.
2. Synthetic textiles are a recognized contributor to secondary microplastic contamination.
3. European legislation has successfully banned all primary microplastics in industrial manufacturing.
4. Deep-sea benthic organisms in the Mariana Trench have ingested synthetic fibers.

---

### Questions 5-9 (Table Completion)
Complete the table below.
Choose **NO MORE THAN TWO WORDS** from the passage for each answer.

| Threat Category | Physical / Chemical Mechanism | Observed Environmental Impact |
| :--- | :--- | :--- |
| **Mechanical Hazard** | Blockage in digestive tract | Starvation and physical (5) [_______] |
| **Chemical Leaching** | Release of additives like (6) [_______] | Disruption of endocrine systems |
| **Toxic Adsorption** | Attracts hydrophobic (7) [_______] | Creation of concentrated toxic pellets |
| **Origin Tracing** | Degradation of discarded (8) [_______] | Accumulation of secondary microplastics |
| **Global Reach** | Exploration of benthic (9) [_______] | Proof of contamination in deepest trenches |

---

### Questions 10-13 (Multiple Choice)
Choose the correct letter, **A, B, C, or D**.

10. According to the second paragraph, primary microplastics are distinct because they:
    A. Are formed through natural weathering and ocean waves
    B. Are deliberately produced for cosmetics and industrial uses
    C. Dissolve completely in warm tropical waters
    D. Pose significantly less toxicity than secondary microplastics

11. Why did researchers specifically investigate the Mariana Trench?
    A. To verify whether pollution had penetrated the deepest marine zones
    B. To evaluate the commercial feasibility of deep-sea mining
    C. To test new acoustic sonar tracking equipment
    D. To harvest pristine deep-sea microorganisms

12. The term "hydrophobic surface" suggests that microplastics:
    A. Absorb large volumes of salt water
    B. Repel water while attracting organic pollutants
    C. Decompose rapidly when exposed to ultraviolet light
    D. Form magnetic bonds with seabed minerals

13. What is the primary purpose of the author in this passage?
    A. To advocate for the complete ban of all industrial plastics
    B. To detail the sources, global spread, and ecological risks of microplastics
    C. To compare plastic pollution levels between the Atlantic and Pacific oceans
    D. To criticize international marine conservation treaties`);

      onChangeAnswerKeyList([
        { questionNumber: 1, correctAnswer: 'FALSE', explanation: 'Đoạn 3: Found in benthic trench at 10,000m depth' },
        { questionNumber: 2, correctAnswer: 'TRUE', explanation: 'Đoạn 2: synthetic textiles result in secondary microplastics' },
        { questionNumber: 3, correctAnswer: 'NOT GIVEN', explanation: 'Không có thông tin về European legislation' },
        { questionNumber: 4, correctAnswer: 'TRUE', explanation: 'Đoạn 3: Amphipods in Mariana Trench contained fibers' },
        { questionNumber: 5, correctAnswer: 'blockages / blockage', explanation: 'Đoạn 4: Mechanical blockages' },
        { questionNumber: 6, correctAnswer: 'phthalates / BPA', explanation: 'Đoạn 4: chemical additives including phthalates and BPA' },
        { questionNumber: 7, correctAnswer: 'pollutants / POPs', explanation: 'Đoạn 4: persistent organic pollutants (POPs)' },
        { questionNumber: 8, correctAnswer: 'fishing gear', explanation: 'Đoạn 2: discarded fishing gear' },
        { questionNumber: 9, correctAnswer: 'trenches / depression', explanation: 'Đoạn 3: deepest oceanic depression' },
        { questionNumber: 10, correctAnswer: 'B', explanation: 'Đoạn 2: manufactured intentionally for commercial use' },
        { questionNumber: 11, correctAnswer: 'A', explanation: 'Đoạn 3: confirms that no marine zone remains pristine' },
        { questionNumber: 12, correctAnswer: 'B', explanation: 'Đoạn 4: hydrophobic surface attracts organic pollutants' },
        { questionNumber: 13, correctAnswer: 'B', explanation: 'Toàn bài: nguồn gốc, sự lan rộng và tác hại' },
      ]);
    } else if (presetKey === 'listening_section1') {
      onChangeQuestionsContent(`### SECTION 1: ACCOMMODATION BOOKING & ENQUIRY
Complete the notes below.
Write **ONE WORD AND/OR A NUMBER** for each answer.

### Student Accommodation Request Form

| Field | Details |
| :--- | :--- |
| **Applicant Name:** | Sarah (1) [_______] |
| **Contact Number:** | 07892 (2) [_______] |
| **Course of Study:** | Master of Environmental (3) [_______] |
| **Preferred Location:** | Near the central (4) [_______] |
| **Room Type:** | Single ensuite with shared (5) [_______] |
| **Max Weekly Budget:** | £ (6) [_______] per week (including utilities) |
| **Move-in Date:** | (7) 15th [_______] |
| **Dietary Requirement:** | (8) [_______] meals only |
| **Special Request:** | Quiet room away from the main (9) [_______] |
| **Deposit Amount:** | £ (10) [_______] payable in advance |`);

      onChangeAnswerKeyList([
        { questionNumber: 1, correctAnswer: 'Jenkins / JENKINS', explanation: 'Spelled J-E-N-K-I-N-S' },
        { questionNumber: 2, correctAnswer: '445890', explanation: 'Phone number' },
        { questionNumber: 3, correctAnswer: 'Management / Science', explanation: 'Major course' },
        { questionNumber: 4, correctAnswer: 'library / station', explanation: 'Location preference' },
        { questionNumber: 5, correctAnswer: 'kitchen', explanation: 'Shared facilities' },
        { questionNumber: 6, correctAnswer: '180 / 180 pounds', explanation: 'Weekly budget' },
        { questionNumber: 7, correctAnswer: 'September / Sept', explanation: 'Move in month' },
        { questionNumber: 8, correctAnswer: 'Vegetarian', explanation: 'Dietary preference' },
        { questionNumber: 9, correctAnswer: 'road / street', explanation: 'Quiet location requirement' },
        { questionNumber: 10, correctAnswer: '300 / 300 pounds', explanation: 'Refundable deposit' },
      ]);
    } else if (presetKey === 'vocab_sustainability') {
      onChangeQuestionsContent(`### IELTS Academic Vocabulary: Environment & Sustainability

### Part 1: Word Forms & Collocations Table (Questions 1-5)
Complete the table below with the appropriate academic word forms.

| Base Word | Noun Form | Adjective Form | Academic Collocation |
| :--- | :--- | :--- | :--- |
| **Sustain** | Sustainability | (1) [_______] | (2) [_______] agriculture |
| **Mitigate** | (3) [_______] | Mitigating | (4) [_______] carbon emissions |
| **Degrade** | Degradation | (5) [_______] | Environmental decline |

---

### Part 2: Collocations in Context (Questions 6-10)
Choose the correct word from the **Word Bank** to complete each sentence.

> #### Word Bank
> **[ unprecedented • biodiversity • ecological • vulnerable • renewable ]**

6. Deforestation poses a critical threat to the tropical (6) [_______] of the Amazon basin.
7. Coastal delta communities are exceptionally (7) [_______] to rising sea levels and typhoons.
8. The government made an (8) [_______] investment in solar and wind power infrastructure.
9. Human activity has disrupted the fragile (9) [_______] equilibrium of the coral reefs.
10. Shifting towards (10) [_______] energy sources is imperative for achieving carbon neutrality.`);

      onChangeAnswerKeyList([
        { questionNumber: 1, correctAnswer: 'sustainable', explanation: 'Adjective form of sustain' },
        { questionNumber: 2, correctAnswer: 'sustainable', explanation: 'Sustainable agriculture collocation' },
        { questionNumber: 3, correctAnswer: 'mitigation', explanation: 'Noun form of mitigate' },
        { questionNumber: 4, correctAnswer: 'mitigate / mitigating', explanation: 'Mitigate carbon emissions' },
        { questionNumber: 5, correctAnswer: 'degradable / degrading', explanation: 'Adjective form of degrade' },
        { questionNumber: 6, correctAnswer: 'biodiversity', explanation: 'Biological variety of flora and fauna' },
        { questionNumber: 7, correctAnswer: 'vulnerable', explanation: 'Vulnerable to rising sea levels' },
        { questionNumber: 8, correctAnswer: 'unprecedented', explanation: 'Unprecedented investment' },
        { questionNumber: 9, correctAnswer: 'ecological', explanation: 'Ecological equilibrium / balance' },
        { questionNumber: 10, correctAnswer: 'renewable', explanation: 'Renewable energy sources' },
      ]);
    }

    setShowPresetModal(false);
  };

  // Quick Slot Setting
  const handleSetQuickSlots = (count: number) => {
    const newList: AnswerKeyItem[] = Array.from({ length: count }, (_, i) => {
      const existing = answerKeyList.find(a => a.questionNumber === i + 1);
      return existing || {
        questionNumber: i + 1,
        correctAnswer: '',
        explanation: ''
      };
    });
    onChangeAnswerKeyList(newList);
  };

  const handleAddSingleSlot = () => {
    const nextNum = answerKeyList.length > 0 ? Math.max(...answerKeyList.map(a => a.questionNumber)) + 1 : 1;
    onChangeAnswerKeyList([
      ...answerKeyList,
      {
        questionNumber: nextNum,
        correctAnswer: '',
        explanation: ''
      }
    ]);
  };

  const handleUpdateKeyItem = (num: number, updates: Partial<AnswerKeyItem>) => {
    onChangeAnswerKeyList(
      answerKeyList.map(item => item.questionNumber === num ? { ...item, ...updates } : item)
    );
  };

  const handleRemoveKeyItem = (num: number) => {
    const filtered = answerKeyList.filter(item => item.questionNumber !== num);
    const reindexed = filtered.map((item, idx) => ({ ...item, questionNumber: idx + 1 }));
    onChangeAnswerKeyList(reindexed);
  };

  const handleUppercaseAllKeys = () => {
    onChangeAnswerKeyList(
      answerKeyList.map(item => ({
        ...item,
        correctAnswer: item.correctAnswer ? item.correctAnswer.toUpperCase() : ''
      }))
    );
  };

  const handleClearAllKeys = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ danh sách đáp án?')) {
      onChangeAnswerKeyList([]);
    }
  };

  const handleProcessPasteKeys = () => {
    if (!pasteKeyText.trim()) return;
    
    // Support either multi-line or comma-separated tokens
    const rawLines = pasteKeyText.split(/[\n;]+/).map(l => l.trim()).filter(Boolean);
    const parsed: AnswerKeyItem[] = [];

    rawLines.forEach((line, idx) => {
      // Matches "1. TRUE", "1/ TRUE", "Q1: TRUE", "1 - TRUE"
      const match = line.match(/^(?:(?:Q|Question)?\s*(\d+)[\.\:\-\)\s\/]+)?(.+)$/i);
      if (match) {
        const qNum = match[1] ? parseInt(match[1], 10) : idx + 1;
        const answerAndNote = match[2].trim();
        const [ansPart, notePart] = answerAndNote.split(/\s*(?:\/\/|;|->)\s*/);
        parsed.push({
          questionNumber: qNum,
          correctAnswer: ansPart || '',
          explanation: notePart || ''
        });
      }
    });

    if (parsed.length > 0) {
      parsed.sort((a, b) => a.questionNumber - b.questionNumber);
      onChangeAnswerKeyList(parsed);
      setShowPasteKeyModal(false);
      setPasteKeyText('');
    } else {
      alert('Không nhận diện được đáp án. Vui lòng định dạng: 1. TRUE hoặc 1. solar energy');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (resultUrl && onAddImage) {
          onAddImage(resultUrl);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
    setShowImageModal(false);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (onAddImage) {
      onAddImage(imageUrlInput.trim());
    }
    setImageUrlInput('');
    setShowImageModal(false);
  };

  const handleInsertImageIntoMarkdown = (imgUrl: string, idx: number) => {
    const snippet = `![Hình ảnh/Sơ đồ ${idx + 1}](${imgUrl})`;
    insertTextAtCursor(snippet);
  };

  return (
    <div className="space-y-4 pt-3 border-t border-slate-200">
      
      {/* Super Top Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-400">
              <FileText className="w-4 h-4" />
            </span>
            <h4 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
              Soạn Đề & Bảng Đáp Án IELTS Tự Động
            </h4>
            <span className="px-2.5 py-0.5 text-xs font-black bg-amber-400 text-slate-950 rounded-full shadow-xs">
              {answerKeyList.length} câu hỏi
            </span>
          </div>
          <p className="text-xs text-blue-200/80 leading-relaxed">
            Dán bài tập, tạo bảng biểu & phiếu đáp án tự động chấm điểm cho học sinh.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Smart Parser Button */}
          <button
            type="button"
            onClick={() => setShowSmartParserModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            title="Dán toàn bộ đề + đáp án vào một ô, hệ thống tự tách và điền tất cả"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>⚡ Nhập Đề Nhanh 1 Chạm</span>
          </button>

          {/* Load Sample Presets */}
          <button
            type="button"
            onClick={() => setShowPresetModal(true)}
            className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl border border-indigo-400/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
            <span>Đề Mẫu IELTS</span>
          </button>
        </div>
      </div>

      {/* Main Split / Edit View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Area: Questions & Table Editor (7 cols on split) */}
        <div className="lg:col-span-7 space-y-2.5">
          
          {/* Top Bar with View Mode and Quick Inserts */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider pl-1">
                Nội Dung Đề Bài
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'split' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem song song soạn thảo và kết quả"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Song Song</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Soạn Thảo</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trước</span>
              </button>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-500 pl-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Chèn:
            </span>

            {/* Visual Table Creator */}
            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded-lg shadow-2xs transition-all flex items-center gap-1"
            >
              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Bảng Biểu Trực Quan</span>
            </button>

            {/* Upload Image */}
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-lg shadow-2xs transition-all flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Ảnh Đề ({images.length})</span>
            </button>

            {/* Quick Slot [_______] */}
            <button
              type="button"
              onClick={() => {
                const nextNum = answerKeyList.length > 0 ? Math.max(...answerKeyList.map(a => a.questionNumber)) + 1 : 1;
                insertTextAtCursor(`(${nextNum}) [_______]`);
                if (!answerKeyList.some(a => a.questionNumber === nextNum)) {
                  onChangeAnswerKeyList([...answerKeyList, { questionNumber: nextNum, correctAnswer: '', explanation: '' }]);
                }
              }}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 font-mono text-[11px] font-bold border border-amber-200 rounded-lg shadow-2xs transition-all"
              title="Chèn ô điền từ và tự động thêm vào phiếu đáp án"
            >
              + Ô Điền Từ [_______]
            </button>

            {/* Text Formatting Shortcuts */}
            <button
              type="button"
              onClick={() => insertTextAtCursor('### Questions 1-5\n')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg text-xs"
              title="Chèn tiêu đề phần câu hỏi"
            >
              Tiêu Đề (H3)
            </button>

            <button
              type="button"
              onClick={() => insertTextAtCursor('**in đậm**')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg text-xs"
            >
              <Bold className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => insertTextAtCursor('> **TRUE / FALSE / NOT GIVEN**')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg text-xs"
            >
              Trích Dẫn &gt;
            </button>
          </div>

          {/* Attached Images Mini Gallery */}
          {images.length > 0 && (
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Ảnh/Sơ đồ đã đính kèm ({images.length}):
                </span>
                <span className="text-[10px] text-indigo-600 font-medium">Bấm "Chèn vào đề" để hiển thị hình trong nội dung câu hỏi</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group bg-white rounded-lg border border-indigo-200 overflow-hidden shadow-2xs p-1">
                    <img 
                      src={imgUrl} 
                      alt={`Ảnh ${idx + 1}`} 
                      className="w-full h-16 object-contain rounded bg-slate-900 cursor-pointer"
                      onClick={() => setPreviewZoomImage(imgUrl)}
                    />
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleInsertImageIntoMarkdown(imgUrl, idx)}
                        className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded transition-colors"
                        title="Chèn ảnh này vào vị trí con trỏ trong văn bản đề"
                      >
                        + Chèn vào đề
                      </button>
                      {onRemoveImage && (
                        <button
                          type="button"
                          onClick={() => onRemoveImage(idx)}
                          className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor Body */}
          {viewMode === 'edit' && (
            <div className="space-y-1">
              <textarea
                ref={textareaRef}
                value={questionsContent}
                onChange={(e) => onChangeQuestionsContent(e.target.value)}
                onPaste={handleTextareaPaste}
                rows={18}
                placeholder={`Nhập toàn bộ câu hỏi đề thi tại đây hoặc bấm "⚡ Nhập Đề Nhanh 1 Chạm" ở trên.
Bạn cũng có thể dán ảnh trực tiếp (Ctrl+V) vào đây!

Ví dụ:
### Questions 1-5
Do the following statements agree with the information given in the passage?
1. First statement...
2. Second statement...`}
                className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 shadow-inner"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>💡 Có thể dán ảnh chụp màn hình trực tiếp vào khung (Ctrl+V)</span>
                <span>{questionsContent ? questionsContent.length : 0} ký tự</span>
              </div>
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="p-5 bg-white border border-slate-300 rounded-xl min-h-[420px] max-h-[550px] overflow-y-auto shadow-inner">
              {questionsContent ? (
                <div className="prose prose-sm prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-3">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-3 border border-slate-300 rounded-xl shadow-xs">
                          <table className="min-w-full divide-y divide-slate-300 text-xs text-left" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-slate-100 font-bold text-slate-800" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="px-3.5 py-2.5 border-b border-slate-300 font-bold text-slate-900 bg-slate-100" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="px-3.5 py-2 border-b border-slate-200 bg-white font-normal text-slate-800" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-blue-500 bg-blue-50/60 p-3 rounded-r-lg italic text-slate-700 my-2" {...props} />
                      ),
                      img: ({ node, ...props }) => (
                        <img className="max-h-80 mx-auto rounded-xl border border-slate-200 shadow-xs my-2 object-contain" {...props} />
                      )
                    }}
                  >
                    {questionsContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Eye className="w-8 h-8 text-slate-300" />
                  <p className="text-xs">Chưa có nội dung đề bài. Hãy chuyển sang tab "Soạn Thảo" hoặc bấm "⚡ Nhập Đề Nhanh".</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-blue-600" />
                  <span>Soạn Thảo (Markdown & Bảng)</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={questionsContent}
                  onChange={(e) => onChangeQuestionsContent(e.target.value)}
                  onPaste={handleTextareaPaste}
                  rows={15}
                  placeholder="Nhập nội dung câu hỏi tại đây..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-emerald-600" />
                  <span>Xem Trước Học Sinh Thấy</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl h-[330px] overflow-y-auto text-xs leading-relaxed">
                  {questionsContent ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-2 border border-slate-300 rounded-lg">
                            <table className="min-w-full divide-y divide-slate-300 text-[11px] text-left" {...props} />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th className="px-2 py-1.5 border-b border-slate-300 font-bold bg-slate-200 text-slate-900" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-2 py-1 border-b border-slate-200 bg-white text-slate-800" {...props} />
                        )
                      }}
                    >
                      {questionsContent}
                    </ReactMarkdown>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-[11px]">
                      Nội dung xem trước sẽ hiển thị ở đây...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Area: Answer Key Sheet Setup (5 cols on split) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            
            {/* Header of Answer Key */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
              <div>
                <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bảng Đáp Án ({answerKeyList.length} câu)
                </h5>
                <span className="text-[11px] text-slate-500">
                  Dùng để tự động chấm điểm bài làm của học sinh
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPasteKeyModal(true)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 transition-all flex items-center gap-1 cursor-pointer"
                  title="Dán nhanh danh sách đáp án dạng văn bản"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Dán Đáp Án</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddSingleSlot}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Câu</span>
                </button>
              </div>
            </div>

            {/* Quick Generator & Utility Buttons */}
            <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500">Tạo:</span>
                {[5, 10, 13, 14, 20, 40].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSetQuickSlots(num)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md border transition-all ${
                      answerKeyList.length === num
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUppercaseAllKeys}
                  className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200"
                  title="Chuyển toàn bộ đáp án thành IN HOA (TRUE, A, B...)"
                >
                  IN HOA (A-Z)
                </button>
                {answerKeyList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllKeys}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Xóa toàn bộ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Answer Key Rows Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-3 py-2 grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                <div className="col-span-2 text-center">Câu</div>
                <div className="col-span-6">Đáp Án Chuẩn</div>
                <div className="col-span-3">Ghi Chú</div>
                <div className="col-span-1 text-center">Xóa</div>
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 bg-white">
                {answerKeyList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <ListOrdered className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">Chưa có ô đáp án nào.</p>
                    <p className="text-[11px] text-slate-400">
                      Bấm nút "Tạo 13" ở trên hoặc dùng "⚡ Nhập Đề Nhanh 1 Chạm"
                    </p>
                  </div>
                ) : (
                  answerKeyList.map((item) => (
                    <div key={item.questionNumber} className="px-2.5 py-1.5 grid grid-cols-12 gap-2 items-center hover:bg-blue-50/40 transition-colors">
                      
                      {/* Question Number Badge */}
                      <div className="col-span-2 flex justify-center">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                          {item.questionNumber}
                        </span>
                      </div>

                      {/* Correct Answer Input */}
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.correctAnswer || ''}
                          onChange={(e) => handleUpdateKeyItem(item.questionNumber, { correctAnswer: e.target.value })}
                          placeholder="vd: TRUE, B, solar energy"
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Explanation / Note Input */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={item.explanation || ''}
                          onChange={(e) => handleUpdateKeyItem(item.questionNumber, { explanation: e.target.value })}
                          placeholder="Đoạn A,..."
                          className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      {/* Delete button */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyItem(item.questionNumber)}
                          className="text-slate-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Xóa câu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-normal">
              💡 <strong>Lưu ý:</strong> Hỗ trợ nhiều đáp án tương đương bằng dấu gạch chéo <code>/</code> (vd: <code>solar energy / solar power</code>). Hệ thống tự động bỏ qua viết hoa/thường khi chấm điểm.
            </div>

          </div>
        </div>

      </div>

      {/* ================= MODAL 1: SMART 1-CLICK PARSER ================= */}
      {showSmartParserModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    ⚡ Nhập Nhanh Toàn Bộ Đề Thi & Đáp Án
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tự động nhận diện Đoạn văn, Câu hỏi và Bảng đáp án chỉ bằng 1 thao tác dán
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSmartParserModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Dán toàn bộ nội dung đề bài & đáp án vào đây:
                </label>
                <textarea
                  value={smartInputText}
                  onChange={(e) => {
                    setSmartInputText(e.target.value);
                    if (parsedPreview) setParsedPreview(null);
                  }}
                  rows={8}
                  placeholder={`Ví dụ bạn có thể dán nguyên bài test từ Word/Web:

READING PASSAGE 1:
Microplastics are pervasive pollutants found in ocean waters...

Questions 1-4
Do the following statements agree with the information given?
1. Microplastics are only found in surface ocean waters.
2. Synthetic textiles are a contributor to pollution.
3. European laws banned all plastics.
4. Organisms in Mariana Trench ingested fibers.

Answer Key:
1. FALSE
2. TRUE
3. NOT GIVEN
4. TRUE
5. blockages`}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Action: Run Parser */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRunSmartParser}
                  disabled={!smartInputText.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Phân Tích & Quét Tự Động</span>
                </button>

                {parsedPreview && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    ✓ Đã nhận diện {parsedPreview.keys.length} câu hỏi & đáp án
                  </span>
                )}
              </div>

              {/* Parsed Preview Section */}
              {parsedPreview && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Kết Quả Tự Động Phân Tách:
                  </h4>

                  {parsedPreview.passage && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <strong className="text-blue-700 block mb-1">Đoạn Văn Bài Đọc:</strong>
                      <p className="text-slate-600 line-clamp-3 italic">{parsedPreview.passage}</p>
                    </div>
                  )}

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <strong className="text-indigo-700 block mb-1">Nội Dung Câu Hỏi:</strong>
                    <p className="text-slate-600 line-clamp-3 whitespace-pre-wrap">{parsedPreview.questions}</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <strong className="text-emerald-700 block">
                      Bảng Đáp Án Chuẩn ({parsedPreview.keys.length} câu):
                    </strong>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {parsedPreview.keys.map((k) => (
                        <span key={k.questionNumber} className="px-2 py-0.5 bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 rounded text-[11px]">
                          {k.questionNumber}. {k.correctAnswer || '(trống)'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowSmartParserModal(false)}
                className="px-4 py-2 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!parsedPreview}
                onClick={handleApplySmartParser}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Áp Dụng Vào Bài Tập Ngay</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 2: VISUAL INTERACTIVE TABLE BUILDER ================= */}
      {showTableModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <TableIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Trình Tạo Bảng Biểu IELTS Trực Quan (WYSIWYG)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chỉnh sửa nội dung từng ô trực tiếp, chèn ô điền từ (1) [_______] chỉ với 1 click
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Presets Row */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Chọn mẫu bảng IELTS có sẵn:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyPresetTable('summary')}
                  className="px-2.5 py-1 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg"
                >
                  Bảng Tóm Tắt (Summary)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTable('flowchart')}
                  className="px-2.5 py-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg"
                >
                  Quy Trình (Flow-chart)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTable('collocations')}
                  className="px-2.5 py-1 text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg"
                >
                  Word Forms & Collocations
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTable('synonyms')}
                  className="px-2.5 py-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg"
                >
                  Ghép Từ Đồng Nghĩa
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTable('matching')}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg"
                >
                  Phân Loại (Classification)
                </button>
              </div>
            </div>

            {/* Interactive Grid Table Editor */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              
              {/* Table Toolbar */}
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddTableCol}
                    className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Columns className="w-3 h-3 text-blue-600" />
                    <span>+ Thêm Cột</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTableRow}
                    className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Rows className="w-3 h-3 text-emerald-600" />
                    <span>+ Thêm Dòng</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  {tableHeaders.length} Cột × {tableData.length} Dòng
                </span>
              </div>

              {/* The Live Grid */}
              <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="w-8 px-2 py-2 text-center text-[10px] font-bold text-slate-400">#</th>
                      {tableHeaders.map((header, cIdx) => (
                        <th key={cIdx} className="p-2 border-r border-slate-200">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={header}
                              onChange={(e) => {
                                const nextHeaders = [...tableHeaders];
                                nextHeaders[cIdx] = e.target.value;
                                setTableHeaders(nextHeaders);
                              }}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-black text-slate-900 text-xs"
                              placeholder={`Tiêu đề cột ${cIdx + 1}`}
                            />
                            {tableHeaders.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTableCol(cIdx)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                title="Xóa cột này"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="w-10 px-2 py-2 text-center text-[10px] font-bold text-slate-400">Xóa</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {tableData.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/60">
                        <td className="px-2 py-2 text-center text-[11px] font-bold text-slate-400 bg-slate-50">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 border-r border-slate-100">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const nextData = [...tableData];
                                  nextData[rIdx][cIdx] = e.target.value;
                                  setTableData(nextData);
                                }}
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                                placeholder={`Nội dung ô (${rIdx + 1}, ${cIdx + 1})`}
                              />
                              <button
                                type="button"
                                onClick={() => handleInsertSlotInCell(rIdx, cIdx)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors"
                              >
                                + Chèn [_______]
                              </button>
                            </div>
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center">
                          {tableData.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTableRow(rIdx)}
                              className="text-slate-300 hover:text-rose-600 p-1"
                              title="Xóa dòng này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertVisualTableIntoMarkdown}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <TableIcon className="w-4 h-4" />
                <span>Chèn Bảng Vào Đề Bài</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 3: IELTS PRESET LIBRARY ================= */}
      {showPresetModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Thư Viện Đề Mẫu Chuẩn IELTS (1-Click)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chọn một bộ đề mẫu hoàn chỉnh để sử dụng ngay hoặc chỉnh sửa lại theo ý bạn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Presets List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              
              {/* Preset 1: Reading Cambridge */}
              <div 
                onClick={() => handleLoadPreset('reading_microplastics')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                    IELTS Reading Academic
                  </span>
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Nạp đề này <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  Cambridge Reading: Microplastics in Marine Environment
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Đầy đủ bài đọc hoàn chỉnh + 13 câu hỏi (True/False/Not Given + Summary Table + MCQ) kèm trọn bộ bảng đáp án và giải thích.
                </p>
              </div>

              {/* Preset 2: Listening Section 1 */}
              <div 
                onClick={() => handleLoadPreset('listening_section1')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                    IELTS Listening Section 1
                  </span>
                  <span className="text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Nạp đề này <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  Section 1: Student Accommodation Booking Form
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bảng form điền thông tin 10 câu (Họ tên, số điện thoại, ngân sách, phòng...) kèm bảng đáp án chi tiết.
                </p>
              </div>

              {/* Preset 3: Vocabulary Environment */}
              <div 
                onClick={() => handleLoadPreset('vocab_sustainability')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-black uppercase">
                    IELTS Academic Vocabulary
                  </span>
                  <span className="text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Nạp đề này <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  Topic: Environment & Sustainability (Band 7.5+)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bảng Word Forms & Collocations + 10 câu luyện tập ngữ cảnh (Word Bank Gap-fill) kèm bảng đáp án chuẩn.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 4: DÁN NHANH ĐÁP ÁN ================= */}
      {showPasteKeyModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <ClipboardPaste className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Dán Nhanh Danh Sách Đáp Án</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteKeyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Dán danh sách đáp án (mỗi câu 1 dòng hoặc cách nhau bằng dấu phẩy). Hệ thống tự tách số câu:
              </p>
              <textarea
                value={pasteKeyText}
                onChange={(e) => setPasteKeyText(e.target.value)}
                rows={9}
                placeholder={`1. TRUE // Đoạn A
2. FALSE // Đoạn B
3. NOT GIVEN
4. B
5. solar energy / solar power
6. microfibers
7. Paragraph C`}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPasteKeyModal(false)}
                className="px-4 py-2 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleProcessPasteKeys}
                className="px-5 py-2 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-all cursor-pointer"
              >
                Nhập Vào Bảng Đáp Án
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: TẢI ẢNH ĐỀ BÀI ================= */}
      {showImageModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Tải Lên Hình Ảnh / Sơ Đồ Đề</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                1. Chọn file ảnh từ máy tính (PNG, JPG, WEBP):
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl text-center text-xs font-black text-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Bấm vào đây để chọn ảnh từ máy</span>
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  2. Hoặc dán đường dẫn ảnh Online (URL):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/diagram.png"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    disabled={!imageUrlInput.trim()}
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: ZOOM LIGHTBOX ================= */}
      {previewZoomImage && (
        <div 
          className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-2 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewZoomImage}
              alt="Phóng to ảnh đề bài"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl mx-auto"
            />
          </div>
        </div>
      )}

    </div>
  );
};

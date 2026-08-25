import React, { useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, ArrowDown, ArrowUp, Zap, HelpCircle } from 'lucide-react';
import { AnswerKeyItem, Question } from '../types';

interface IeltsAnswerSheetProps {
  totalQuestions: number;
  answers: Record<string, string>;
  onAnswerChange: (questionKey: string, value: string) => void;
  answerKeyList?: AnswerKeyItem[];
  questions?: Question[];
  skill: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary';
  themeColor?: 'blue' | 'purple' | 'indigo' | 'emerald' | 'teal';
}

export const IeltsAnswerSheet: React.FC<IeltsAnswerSheetProps> = ({
  totalQuestions,
  answers,
  onAnswerChange,
  answerKeyList,
  questions,
  skill,
  themeColor = 'blue'
}) => {
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [activeQuestionNum, setActiveQuestionNum] = React.useState<number>(1);

  // Derive total count
  const count = totalQuestions > 0 
    ? totalQuestions 
    : (answerKeyList && answerKeyList.length > 0)
    ? answerKeyList.length
    : (questions && questions.length > 0)
    ? questions.length
    : 10;

  const answeredCount = Array.from({ length: count }, (_, i) => i + 1).filter(
    (num) => {
      const qKey = String(num);
      const qId = questions?.[num - 1]?.id || `q-${num}`;
      return Boolean((answers[qKey] || answers[qId] || '').trim());
    }
  ).length;

  const progressPercent = count > 0 ? Math.round((answeredCount / count) * 100) : 0;

  const getAnswerValue = (num: number): string => {
    const qKey = String(num);
    const qId = questions?.[num - 1]?.id;
    return answers[qKey] || (qId ? answers[qId] : '') || '';
  };

  const handleSetAnswer = (num: number, val: string, autoAdvance = false) => {
    const qKey = String(num);
    const qId = questions?.[num - 1]?.id;
    
    // Set both key string and qId for compatibility
    onAnswerChange(qKey, val);
    if (qId && qId !== qKey) {
      onAnswerChange(qId, val);
    }

    if (autoAdvance && num < count) {
      const nextNum = num + 1;
      setActiveQuestionNum(nextNum);
      inputRefs.current[nextNum]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, num: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (num < count) {
        setActiveQuestionNum(num + 1);
        inputRefs.current[num + 1]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (num > 1) {
        setActiveQuestionNum(num - 1);
        inputRefs.current[num - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-md">
      
      {/* Header of Answer Sheet */}
      <div className="p-4 bg-slate-900 text-white shrink-0 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              IELTS Official Answer Sheet
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {answeredCount}/{count} ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Numbered Quick Jump Palette */}
        <div className="pt-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Bảng chuyển câu nhanh:</span>
            <span className="text-emerald-400">{answeredCount} đã điền</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap max-h-20 overflow-y-auto p-1 bg-slate-950/60 rounded-lg border border-slate-800">
            {Array.from({ length: count }, (_, i) => i + 1).map((num) => {
              const val = getAnswerValue(num);
              const isFilled = Boolean(val.trim());
              const isActive = activeQuestionNum === num;

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveQuestionNum(num);
                    inputRefs.current[num]?.focus();
                  }}
                  className={`w-6 h-6 rounded text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isActive
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-110 shadow-xs'
                      : isFilled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={`Câu ${num}: ${isFilled ? val : 'Chưa điền'}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Answer Slots List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        
        {/* Quick Click Shortcut Bar for active item */}
        <div className="p-2.5 bg-white rounded-xl border border-blue-200 shadow-xs space-y-1.5 sticky top-0 z-10">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1 text-blue-700">
              <Zap className="w-3.5 h-3.5" />
              Điền nhanh cho Câu {activeQuestionNum}:
            </span>
            <span className="text-slate-400 font-normal">Click để điền & chuyển câu tiếp</span>
          </div>
          
          <div className="flex items-center gap-1 flex-wrap">
            {/* T / F / NG */}
            {['TRUE', 'FALSE', 'NOT GIVEN'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSetAnswer(activeQuestionNum, chip, true)}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs"
              >
                {chip}
              </button>
            ))}

            {/* Y / N / NG */}
            {['YES', 'NO'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSetAnswer(activeQuestionNum, chip, true)}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors shadow-2xs"
              >
                {chip}
              </button>
            ))}

            {/* A, B, C, D, E */}
            {['A', 'B', 'C', 'D', 'E'].map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleSetAnswer(activeQuestionNum, letter, true)}
                className="w-5 h-5 text-[10px] font-bold rounded bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors shadow-2xs flex items-center justify-center"
              >
                {letter}
              </button>
            ))}

            {/* Headings i, ii, iii, iv, v, vi, vii */}
            {['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'].map((rom) => (
              <button
                key={rom}
                type="button"
                onClick={() => handleSetAnswer(activeQuestionNum, rom, true)}
                className="px-1.5 py-0.5 text-[10px] font-serif font-bold rounded bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors shadow-2xs"
              >
                {rom}
              </button>
            ))}
          </div>
        </div>

        {/* Answer Rows 1 to N */}
        <div className="space-y-2.5">
          {Array.from({ length: count }, (_, i) => i + 1).map((num) => {
            const currentVal = getAnswerValue(num);
            const isFilled = Boolean(currentVal.trim());
            const isActive = activeQuestionNum === num;

            return (
              <div
                key={num}
                onClick={() => setActiveQuestionNum(num)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                    : isFilled
                    ? 'bg-white border-emerald-200 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Number Badge */}
                  <div className="flex items-center justify-center shrink-0">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isFilled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {num}
                    </span>
                  </div>

                  {/* Input Box */}
                  <div className="flex-1">
                    <input
                      ref={(el) => { inputRefs.current[num] = el; }}
                      type="text"
                      value={currentVal}
                      onFocus={() => setActiveQuestionNum(num)}
                      onChange={(e) => handleSetAnswer(num, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, num)}
                      placeholder={`Nhập đáp án câu ${num}...`}
                      className={`w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all focus:outline-hidden ${
                        isActive
                          ? 'bg-white border-blue-500 text-slate-900 ring-1 ring-blue-400'
                          : isFilled
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
                      }`}
                    />
                  </div>

                  {/* Check Indicator */}
                  <div className="shrink-0">
                    {isFilled ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">
                        •
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer Helper */}
      <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 text-center shrink-0">
        Dùng phím <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Tab</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Enter</kbd> để nhảy xuống câu tiếp theo.
      </div>

    </div>
  );
};

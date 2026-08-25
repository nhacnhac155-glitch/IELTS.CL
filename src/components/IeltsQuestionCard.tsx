import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Question } from '../types';
import { getIeltsQuestionTypeMeta } from '../utils/ieltsQuestionConstants';

interface IeltsQuestionCardProps {
  question: Question;
  index: number;
  value: string;
  onChange: (val: string) => void;
  theme?: 'blue' | 'purple' | 'emerald';
  disabled?: boolean;
}

export const IeltsQuestionCard: React.FC<IeltsQuestionCardProps> = ({
  question,
  index,
  value = '',
  onChange,
  theme = 'blue',
  disabled = false
}) => {
  const config = getIeltsQuestionTypeMeta(question.type);

  const themeBorder = theme === 'purple' ? 'focus:border-purple-500' : 'focus:border-blue-500';
  const themeRing = theme === 'purple' ? 'focus:ring-purple-500' : 'focus:ring-blue-500';
  const activeBg = theme === 'purple' 
    ? 'bg-purple-600 text-white border-purple-600 shadow-xs' 
    : 'bg-blue-600 text-white border-blue-600 shadow-xs';
  const activeLight = theme === 'purple' 
    ? 'bg-purple-50 border-purple-400 text-purple-950 font-semibold' 
    : 'bg-blue-50 border-blue-400 text-blue-950 font-semibold';
  const numBadgeBg = theme === 'purple'
    ? 'bg-purple-100 text-purple-800'
    : 'bg-blue-100 text-blue-800';

  // Multi-choice multi-select helper
  const selectedMultiAnswers = value ? value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : [];

  const handleToggleMulti = (optLetter: string) => {
    if (disabled) return;
    const cleanLetter = optLetter.trim().toUpperCase();
    let next: string[];
    if (selectedMultiAnswers.includes(cleanLetter)) {
      next = selectedMultiAnswers.filter(l => l !== cleanLetter);
    } else {
      next = [...selectedMultiAnswers, cleanLetter].sort();
    }
    onChange(next.join(', '));
  };

  // Word count check for text inputs
  const currentWordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const wordLimitMax = question.wordLimit === 'ONE WORD ONLY' 
    ? 1 
    : question.wordLimit === 'NO MORE THAN TWO WORDS' 
    ? 2 
    : question.wordLimit === 'NO MORE THAN THREE WORDS' 
    ? 3 
    : undefined;
  const isOverWordLimit = wordLimitMax !== undefined && currentWordCount > wordLimitMax;

  return (
    <div id={`question-${question.id}`} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 transition-all hover:border-slate-300">
      
      {/* Header with Question Number, Type Badge & Instruction */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`w-6 h-6 rounded-full ${numBadgeBg} font-bold text-xs flex items-center justify-center shrink-0`}>
            {index + 1}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${config.badgeColor} uppercase tracking-wider`}>
            {config.badge || config.title}
          </span>
          {question.wordLimit && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
              {question.wordLimit}
            </span>
          )}
        </div>
      </div>

      {/* Instruction text if available */}
      {question.instruction && (
        <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 italic border border-slate-200/70">
          💡 {question.instruction}
        </div>
      )}

      {/* Summary Text / Lead-in Text */}
      {question.summaryText && (
        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs sm:text-sm text-slate-800 font-serif leading-relaxed">
          {question.summaryText}
        </div>
      )}

      {/* Question Text */}
      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
        {question.questionText}
      </p>

      {/* Render input by type */}
      <div className="pt-1">
        
        {/* TRUE / FALSE / NOT GIVEN */}
        {question.type === 'true_false_ng' && (
          <div className="flex flex-wrap gap-2">
            {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => {
              const isSelected = value.trim().toUpperCase() === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(opt)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isSelected ? activeBg : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* YES / NO / NOT GIVEN */}
        {question.type === 'yes_no_ng' && (
          <div className="flex flex-wrap gap-2">
            {['YES', 'NO', 'NOT GIVEN'].map((opt) => {
              const isSelected = value.trim().toUpperCase() === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(opt)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isSelected ? activeBg : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* SINGLE-SELECT MULTIPLE CHOICE */}
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-1.5">
            {question.options.map((option, oIdx) => {
              // Option might start with "A. " or just be raw text
              const optLetter = String.fromCharCode(65 + oIdx);
              const isSelected = value === option || value.trim().toUpperCase() === optLetter;
              return (
                <label
                  key={oIdx}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? activeLight
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    disabled={disabled}
                    checked={isSelected}
                    onChange={() => onChange(option)}
                    className="accent-blue-600"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* MULTI-SELECT MULTIPLE CHOICE (e.g. Choose TWO letters, A-E) */}
        {question.type === 'multiple_choice_multi' && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500">
              Chọn các đáp án đúng (Click để chọn/bỏ chọn):
            </div>
            <div className="space-y-1.5">
              {(question.options && question.options.length > 0 
                ? question.options 
                : ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D', 'E. Option E']
              ).map((opt, oIdx) => {
                const optLetter = String.fromCharCode(65 + oIdx);
                const isSelected = selectedMultiAnswers.includes(optLetter) || selectedMultiAnswers.includes(opt.slice(0, 1).toUpperCase());
                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggleMulti(optLetter)}
                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? activeLight
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs border ${
                      isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-300'
                    }`}>
                      {optLetter}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
            {selectedMultiAnswers.length > 0 && (
              <div className="text-xs font-bold text-blue-700 pt-1">
                Đã chọn: {selectedMultiAnswers.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* MATCHING HEADINGS */}
        {((question.type as string) === 'heading_matching' || (question.type as string) === 'matching_headings') && (
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-600">
              Chọn Heading phù hợp từ danh sách (List of Headings):
            </label>
            <select
              disabled={disabled}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg ${themeBorder} ${themeRing} focus:outline-hidden font-medium`}
            >
              <option value="">-- Chọn tiêu đề phù hợp (Heading) --</option>
              {(question.matchingOptions && question.matchingOptions.length > 0
                ? question.matchingOptions
                : [
                    'i. The original purpose of the project',
                    'ii. Financial constraints and funding issues',
                    'iii. Technological breakthrough in renewable energy',
                    'iv. Community resistance and ecological impact',
                    'v. Future prospects and expansion plans',
                    'vi. Historical background of the region',
                    'vii. Unexpected positive environmental outcomes'
                  ]
              ).map((heading, hIdx) => (
                <option key={hIdx} value={heading}>
                  {heading}
                </option>
              ))}
            </select>
            {value && (
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs font-semibold text-blue-900">
                Đã chọn: {value}
              </div>
            )}
          </div>
        )}

        {/* MATCHING INFORMATION (Paragraph A, B, C, D, E, F...) */}
        {question.type === 'matching_information' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              Thông tin này nằm trong đoạn văn nào?
            </span>
            <div className="flex flex-wrap gap-2">
              {(question.matchingOptions && question.matchingOptions.length > 0
                ? question.matchingOptions
                : ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F']
              ).map((pOpt, pIdx) => {
                const isSelected = value.trim().toLowerCase() === pOpt.trim().toLowerCase() ||
                                  value.trim().toUpperCase() === pOpt.replace('Paragraph ', '').trim().toUpperCase();
                return (
                  <button
                    key={pIdx}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(pOpt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isSelected ? activeBg : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pOpt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MATCHING FEATURES / MATCHING SENTENCE ENDINGS / DIAGRAM LABELING */}
        {(question.type === 'matching_features' || 
          question.type === 'matching_sentence_endings' || 
          question.type === 'diagram_labeling') && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              Chọn đáp án ghép nối tương ứng:
            </span>
            {question.matchingOptions && question.matchingOptions.length > 0 ? (
              <div className="space-y-1.5">
                {question.matchingOptions.map((mOpt: any, mIdx) => {
                  const optStr = typeof mOpt === 'string' ? mOpt : `${mOpt.key}. ${mOpt.label || mOpt.text || ''}`;
                  const isSelected = value === optStr || value.trim().toLowerCase() === optStr.trim().toLowerCase();
                  return (
                    <label
                      key={mIdx}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                        isSelected ? activeLight : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`m-${question.id}`}
                        disabled={disabled}
                        checked={isSelected}
                        onChange={() => onChange(optStr)}
                        className="accent-blue-600"
                      />
                      <span>{optStr}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) => {
                  const isSelected = value.trim().toUpperCase() === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(letter)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                        isSelected ? activeBg : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TEXT INPUT / SUMMARY / COMPLETION / SHORT ANSWER */}
        {(question.type === 'fill_blank' ||
          question.type === 'summary_completion' ||
          question.type === 'short_answer' ||
          (question.type as string) === 'table_completion' ||
          (question.type as string) === 'flow_chart_completion' ||
          (question.type as string) === 'sentence_completion') && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={disabled}
                placeholder={
                  question.wordLimit 
                    ? `Nhập câu trả lời (${question.wordLimit})...` 
                    : "Nhập từ/cụm từ trả lời..."
                }
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full sm:w-80 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border rounded-lg ${themeBorder} ${themeRing} focus:outline-hidden font-medium ${
                  isOverWordLimit ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {value && (
                <span className="text-[11px] font-semibold text-slate-400">
                  {currentWordCount} từ
                </span>
              )}
            </div>

            {/* Word limit warning */}
            {isOverWordLimit && (
              <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Bạn đã nhập quá số từ quy định ({question.wordLimit}). Hãy rút gọn lại!</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

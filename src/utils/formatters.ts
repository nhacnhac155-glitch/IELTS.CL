export function formatMinutes(minutes: number): string {
  if (minutes === 0) return 'Không giới hạn';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`;
  }
  return `${minutes} phút`;
}

export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

export function getTimeRemaining(deadlineIso: string): { text: string; isOverdue: boolean; isUrgent: boolean } {
  try {
    const now = Date.now();
    const target = new Date(deadlineIso).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { text: 'Đã hết hạn nộp', isOverdue: true, isUrgent: false };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;

    if (days > 0) {
      return { text: `Còn ${days} ngày ${remHours}h`, isOverdue: false, isUrgent: days <= 1 };
    }
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `Còn ${hours}h ${mins}p`, isOverdue: false, isUrgent: true };
  } catch {
    return { text: 'Không xác định', isOverdue: false, isUrgent: false };
  }
}

export function getBandColorClass(band: number | undefined): string {
  if (!band) return 'text-slate-500 bg-slate-100 border-slate-200';
  if (band >= 8.0) return 'text-emerald-700 bg-emerald-50 border-emerald-300 font-bold';
  if (band >= 7.0) return 'text-blue-700 bg-blue-50 border-blue-300 font-bold';
  if (band >= 6.0) return 'text-amber-700 bg-amber-50 border-amber-300 font-bold';
  return 'text-rose-700 bg-rose-50 border-rose-300 font-bold';
}

/**
 * Quy tắc làm tròn điểm Overall chuẩn của kỳ thi IELTS:
 * - Lấy điểm trung bình cộng của 4 kỹ năng (hoặc các kỹ năng có điểm)
 * - Nếu phần thập phân < 0.25 -> Làm tròn xuống số nguyên (.0)
 * - Nếu 0.25 <= phần thập phân < 0.75 -> Làm tròn thành nửa band (.5)
 * - Nếu phần thập phân >= 0.75 -> Làm tròn lên số nguyên tiếp theo (.0)
 *
 * Ví dụ chuẩn IELTS:
 * - 6.125 -> 6.0
 * - 6.25  -> 6.5 (Làm tròn lên 0.5)
 * - 6.375 -> 6.5
 * - 6.5   -> 6.5
 * - 6.625 -> 6.5
 * - 6.75  -> 7.0 (Làm tròn lên 7.0)
 * - 6.875 -> 7.0
 */
export function roundIELTSBand(score: number): number {
  if (typeof score !== 'number' || isNaN(score) || score <= 0) return 0;
  // Tránh sai số dấu phẩy động (floating-point precision)
  const normalized = Math.round(score * 1000) / 1000;
  const intPart = Math.floor(normalized);
  const fracPart = Math.round((normalized - intPart) * 1000) / 1000;

  if (fracPart < 0.25) {
    return intPart;
  } else if (fracPart < 0.75) {
    return intPart + 0.5;
  } else {
    return intPart + 1.0;
  }
}

/**
 * Tính điểm Band Overall ước tính từ danh sách kỹ năng theo chuẩn IELTS
 */
export function calculateIELTSOverall(scores: (number | undefined | null)[]): number {
  const valid = scores.filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);
  if (valid.length === 0) return 0;
  const avg = valid.reduce((sum, v) => sum + v, 0) / valid.length;
  return roundIELTSBand(avg);
}


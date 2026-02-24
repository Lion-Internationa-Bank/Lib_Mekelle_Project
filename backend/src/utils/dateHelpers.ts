export const dateHelpers = {
  isDateLessThanNow(date: Date): boolean {
    return date < new Date();
  },

  getDaysDifference(fromDate: Date, toDate: Date): number {
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  getCurrentFiscalYear(): number {
    const now = new Date();
    const year = now.getFullYear();
    // Ethiopian fiscal year starts on July 8 (or July 7 in leap years)
    // Simplified: if current month is before July, fiscal year is previous year
    // if (now.getMonth() < 6) { // Months are 0-indexed, 6 = July
    //   return year - 1;
    // }
    return year;
  },

  formatDateForLog(date: Date): string {
    return date.toISOString();
  }
};
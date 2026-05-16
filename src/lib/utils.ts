import { format } from 'date-fns';

export function formatSafeDate(date: any, formatStr: string = 'MMM dd, yyyy'): string {
  if (!date) return 'N/A';
  
  // Handle Firestore Timestamp
  if (typeof date.toDate === 'function') {
    return format(date.toDate(), formatStr);
  }
  
  // Handle ISO strings or other date objects
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return format(parsedDate, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

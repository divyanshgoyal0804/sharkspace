
import { format, isToday, isSameDay, startOfDay, endOfDay, addMinutes, isAfter, isBefore } from 'date-fns';

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM dd, yyyy HH:mm');
}

export function isDateToday(date: Date): boolean {
  return isToday(date);
}

export function isSameDate(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function isTimeAfter(date1: Date, date2: Date): boolean {
  return isAfter(date1, date2);
}

export function isTimeBefore(date1: Date, date2: Date): boolean {
  return isBefore(date1, date2);
}

export function generateTimeSlots(date: Date, startHour: number = 9, endHour: number = 21): Date[] {
  const slots: Date[] = [];
  const baseDate = new Date(date);
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const slot = new Date(baseDate);
      slot.setHours(hour, minute, 0, 0);
      slots.push(slot);
    }
  }
  
  return slots;
}

export function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
}

export function minutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

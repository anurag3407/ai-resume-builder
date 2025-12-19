import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateFilename(userName, jobRole) {
  const date = new Date().toISOString().split('T')[0];
  const safeName = (userName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  const safeRole = (jobRole || 'Resume').replace(/[^a-zA-Z0-9]/g, '_');
  return `${safeName}_${safeRole}_Resume_${date}.pdf`;
}

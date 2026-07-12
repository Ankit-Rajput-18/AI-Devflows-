export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(text: string, suffix?: string): string {
  const baseSlug = generateSlug(text);
  if (suffix) return baseSlug + '-' + suffix;
  return baseSlug + '-' + Date.now().toString(36);
}

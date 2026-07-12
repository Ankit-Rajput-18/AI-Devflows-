// DevFlow AI - Shared Validators

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const CODE_MAX_LENGTH = 50000;

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) errors.push('Password must be at least 8 characters');
  if (password.length > PASSWORD_MAX_LENGTH) errors.push('Password must not exceed 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^*(),.?{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
  return { valid: errors.length === 0, errors };
}

export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (name.length < NAME_MIN_LENGTH) return { valid: false, error: 'Project name must be at least 2 characters' };
  if (name.length > NAME_MAX_LENGTH) return { valid: false, error: 'Project name must not exceed 50 characters' };
  return { valid: true };
}

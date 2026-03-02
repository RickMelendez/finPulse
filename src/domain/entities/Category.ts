export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
  isSystem: boolean;
  createdAt: Date;
}

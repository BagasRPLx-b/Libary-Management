export interface Book {
  id: string | number;
  title: string;
  author: string;
  isbn: string;
  category: string | { id: string | number; name: string; slug?: string; created_at?: string; updated_at?: string };
  publisher?: string;
  year?: number;
  pages?: number;
  language?: string;
  description?: string;
  available_copies: number;
  total_copies?: number;
}

export interface Member {
  id: string | number;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
}

export interface Transaction {
  id: string | number;
  member: { id: string | number; name: string };
  book: { id: string | number; title: string };
  type: 'issue' | 'return';
  created_at: string;
}

export interface OverdueLoan {
  id: string | number;
  member: { id: string | number; name: string };
  book: { id: string | number; title: string };
  due_date: string;
  fine_amount: number;
}

export interface Loan {
  id: string | number;
  book: { id: string | number; title: string };
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'overdue' | 'returned';
  fine_amount?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiMessageResponse {
  message: string;
  data?: any;
}

export type UserRole = 'Admin' | 'Staff' | 'Member';
export type MemberStatus = 'active' | 'suspended' | 'Active' | 'Suspended';
export type LoanStatus = 'active' | 'overdue' | 'returned';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Book {
  id: number;
  category_id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  total_copies: number;
  available_copies: number;
  category?: Category;
  description?: string;
  language?: string;
  pages?: number;
  year?: number;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category_id: number;
  publication_year?: number;
  total_copies: number;
  publisher?: string;
}

export interface BooksResponse {
  data: Book[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BookParams {
  search?: string;
  author?: string;
  category_id?: string;
  per_page?: number;
  page?: number;
}

export interface Member {
  id: number;
  member_id?: number;
  member_code?: string;
  name: string;
  email: string;
  phone: string;
  status: MemberStatus;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MemberUpdateData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ActiveLoan {
  id: number;
  member_id?: number;
  book_id?: number;
  member?: { id?: number; name: string; user_id?: number; member_code?: string };
  book?: { id?: number; title: string; author?: string };
  borrowed_at?: string;
  borrow_date?: string;
  due_date?: string;
  returned_at?: string;
  return_date?: string;
  status: LoanStatus | string;
  fine_amount?: number | string;
  member_name?: string;
}

export interface Loan {
  id: number;
  member_id: number;
  book_id: number;
  book: {
    id: number;
    title: string;
    author?: string;
    category?: string;
  };
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: LoanStatus;
  fine_amount: number;
  created_at: string;
  updated_at: string;
  borrowed_at?: string;
  returned_at?: string;
}

export interface ScannedBook extends Book {
  active_loans?: ActiveLoan[];
}

export interface TodayTransaction {
  id: number;
  member: string;
  book: string;
  type: 'Issue' | 'Return';
  time: string;
  status: string;
}

export interface OverdueLoan {
  id: number;
  member_id?: number;
  book_id?: number;
  borrowed_at: string;
  due_date: string;
  returned_at?: string | null;
  fine_amount: string | number;
  estimated_fine?: number;
  status: string;
  days_overdue?: number;
  created_at?: string;
  updated_at?: string;
  member: {
    id: number;
    member_code?: string;
    name: string;
    email?: string;
    phone?: string;
    status?: string;
    user_id?: number;
  };
  book: {
    id: number;
    category_id?: number;
    isbn?: string;
    title: string;
    author?: string;
    publisher?: string;
    publication_year?: number;
    total_copies?: number;
    available_copies?: number;
  };
}

export interface FormattedOverdueLoan {
  id: number;
  member: string;
  book: string;
  due_date: string;
  borrowed_at: string;
  fine_amount: number;
  status: string;
  days_overdue: number;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  phone: string;
  member_code: string;
  status: 'active' | 'suspended';
  joined_date?: string;
  valid_until?: string;
  total_borrowed?: number;
  active_fine?: number;
  active_loans_count?: number;
  loans?: Loan[];
  active_loans?: number;
}

export interface Transaction {
  id: string | number;
  member: { id: string | number; name: string };
  book: { id: string | number; title: string };
  type: 'issue' | 'return';
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiMessageResponse {
  message: string;
  data?: unknown;
}

export interface OverdueResponse {
  count: number;
  overdue_loans: OverdueLoan[];
}

export interface ReturnBookResponse {
  message: string;
  fine?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface ReservationParams {
  status?: string;
  member_id?: number;
}

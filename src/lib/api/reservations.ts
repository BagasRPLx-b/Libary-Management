import apiClient from './client';

export interface Reservation {
  id: number;
  book_id: number;
  member_id: number;
  status: 'pending' | 'ready' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  book?: {
    id: number;
    title: string;
    author: string;
    isbn?: string;
  };
  member?: {
    id: number;
    name: string;
    email: string;
  };
}

export const reservationApi = {
  // POST /reservations - Reserve a book
  create: (data: { book_id: number; member_id?: number }) => {
    return apiClient.post('/reservations', data);
  },

  // GET /reservations - Get reservations (members get their own, admin/staff get all)
  getAll: (params?: any) => {
    return apiClient.get('/reservations', { params });
  },

  // DELETE /reservations/{id} - Cancel a hold/reservation
  cancel: (id: number) => {
    return apiClient.delete(`/reservations/${id}`);
  },
};

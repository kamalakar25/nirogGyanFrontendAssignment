import { Appointment, BookingFormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      response.status === 429
        ? 'Too many requests'
        : `HTTP error! Status: ${response.status}`
    );
    (error as any).message = errorText || response.statusText;
    throw error;
  }
  return response.json();
};

export const apiService = {
  async getDoctors(params: {
    search?: string;
    specialization?: string;
    availability?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_URL}/doctors?${query}`);
    return handleResponse(response);
  },

  async getDoctor(id: string) {
    const response = await fetch(`${API_URL}/doctors/${id}`);
    return handleResponse(response);
  },

  async getSpecializations() {
    const response = await fetch(`${API_URL}/specializations`);
    return handleResponse(response);
  },

  async getAppointments(email?: string) {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const response = await fetch(`${API_URL}/appointments${query}`);
    return handleResponse(response);
  },

  async bookAppointment(
    data: BookingFormData
  ): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async cancelAppointment(id: string) {
    const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },

  async getAnalytics() {
    const response = await fetch(`${API_URL}/analytics`);
    return handleResponse(response);
  },

  async healthCheck() {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse(response);
  },
};

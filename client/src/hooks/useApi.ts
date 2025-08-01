import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDoctors = (params: {
  search?: string;
  specialization?: string;
  availability?: string;
}): UseApiResult<any> => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getDoctors(params);
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // Stringify to prevent unnecessary re-renders

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return { data, loading, error, refetch: fetchDoctors };
};

export const useAppointments = (email?: string): UseApiResult<any> => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!email) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const response = await apiService.getAppointments(email);
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { data, loading, error, refetch: fetchAppointments };
};

export const useAnalytics = (): UseApiResult<AnalyticsData> => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAnalytics();
      console.log('Analytics response:', response);
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
};

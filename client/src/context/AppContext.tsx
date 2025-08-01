// src/context/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { useDoctors, useAppointments } from '../hooks/useApi';
import { apiService } from '../services/api';
import { Doctor, Appointment, BookingFormData, AnalyticsData } from '../types';

interface AppState {
  doctors: Doctor[];
  appointments: Appointment[];
  searchQuery: string;
  selectedSpecialization: string;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_DOCTORS'; payload: Doctor[] }
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_SPECIALIZATION'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_DOCTOR_AVAILABILITY'; payload: { doctorId: string; date: string; time: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  bookAppointment: (appointmentData: BookingFormData) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  getAnalytics: () => Promise<AnalyticsData>;
  getFilteredDoctors: () => Doctor[];
}

const initialState: AppState = {
  doctors: [],
  appointments: [],
  searchQuery: '',
  selectedSpecialization: '',
  loading: true,
  error: null,
};

const AppContext = createContext<AppContextType | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DOCTORS':
      return { ...state, doctors: action.payload };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_SPECIALIZATION':
      return { ...state, selectedSpecialization: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_DOCTOR_AVAILABILITY':
      return {
        ...state,
        doctors: state.doctors.map(doctor => {
          if (doctor.id === action.payload.doctorId) {
            return {
              ...doctor,
              availableSlots: doctor.availableSlots
                .map(slot => {
                  if (slot.date === action.payload.date) {
                    return {
                      ...slot,
                      slots: slot.slots.filter(time => time !== action.payload.time),
                    };
                  }
                  return slot;
                })
                .filter(slot => slot.slots.length > 0),
            };
          }
          return doctor;
        }),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch doctors using the useDoctors hook
  const {
    data: doctorsData,
    loading: doctorsLoading,
    error: doctorsError,
    refetch: refetchDoctors,
  } = useDoctors({
    search: state.searchQuery,
    specialization: state.selectedSpecialization,
  });

  // Fetch appointments using the useAppointments hook
  const {
    data: appointmentsData,
    loading: appointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useAppointments();

  // Update state when API data changes
  useEffect(() => {
    let isMounted = true;
    const loading = doctorsLoading || appointmentsLoading;
    const error = doctorsError || appointmentsError;

    if (isMounted) {
      if (doctorsData) {
        dispatch({ type: 'SET_DOCTORS', payload: doctorsData });
      }
      if (appointmentsData) {
        dispatch({ type: 'SET_APPOINTMENTS', payload: appointmentsData });
      }
      dispatch({ type: 'SET_LOADING', payload: loading });
      dispatch({ type: 'SET_ERROR', payload: error });
    }

    return () => {
      isMounted = false;
    };
  }, [
    doctorsData,
    appointmentsData,
    doctorsLoading,
    appointmentsLoading,
    doctorsError,
    appointmentsError,
  ]);

  // Function to book an appointment and update state
  const bookAppointment = async (appointmentData: BookingFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiService.bookAppointment(appointmentData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to book appointment');
      }

      dispatch({ type: 'ADD_APPOINTMENT', payload: response.data });
      dispatch({
        type: 'UPDATE_DOCTOR_AVAILABILITY',
        payload: {
          doctorId: appointmentData.doctorId,
          date: appointmentData.date,
          time: appointmentData.time,
        },
      });

      await refetchAppointments();
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to cancel an appointment
  const cancelAppointment = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.cancelAppointment(id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel appointment');
      }

      dispatch({
        type: 'SET_APPOINTMENTS',
        payload: state.appointments.filter(appt => appt.id !== id),
      });

      await refetchAppointments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to fetch analytics
  const getAnalytics = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getAnalytics();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch analytics');
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Selector for filtered doctors
  const getFilteredDoctors = () => {
    return state.doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchesSpecialization = state.selectedSpecialization 
        ? doctor.specialization === state.selectedSpecialization 
        : true;
      return matchesSearch && matchesSpecialization;
    });
  };

  // Memoized context value
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    bookAppointment,
    cancelAppointment,
    getAnalytics,
    getFilteredDoctors,
  }), [state]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
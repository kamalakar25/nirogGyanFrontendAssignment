import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  IndianRupee,
} from "lucide-react";
import { Doctor, BookingFormData, Appointment } from "../types";
import { useApp } from "../context/AppContext";
import { apiService } from "../services/api";
import { formatINR } from "../utils/currency";

interface BookingModalProps {
  doctor: Doctor;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose }) => {
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState<"form" | "confirmation">(
    "form"
  );
  const [formData, setFormData] = useState<BookingFormData>({
    doctorId: doctor.id,
    patientName: "",
    patientEmail: "",
    date: "",
    time: "",
  });
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [bookedAppointment, setBookedAppointment] =
    useState<Appointment | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.date);

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Full name is required";
    } else if (formData.patientName.trim().length < 2) {
      newErrors.patientName = "Full name must be at least 2 characters";
    }

    if (!formData.patientEmail.trim()) {
      newErrors.patientEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.patientEmail = "Please enter a valid email address";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else if (selectedDate < today) {
      newErrors.date = "Please select a future date";
    }

    if (!formData.time) {
      newErrors.time = "Please select a time slot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      setApiError(null);
      const response = await apiService.bookAppointment(formData);
      if (response.success) {
        dispatch({ type: "ADD_APPOINTMENT", payload: response.data });
        dispatch({
          type: "UPDATE_DOCTOR_AVAILABILITY",
          payload: {
            doctorId: doctor.id,
            date: formData.date,
            time: formData.time,
          },
        });
        setBookedAppointment(response.data);
        setCurrentStep("confirmation");
      } else {
        setApiError(response.message || "Failed to book appointment");
      }
    } catch (error) {
      setApiError(
        error instanceof Error && error.message.includes("429")
          ? "Too many requests. Please try again later."
          : "Failed to book appointment. Please try again."
      );
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getAvailableTimesForDate = (date: string) => {
    const slot = doctor.availableSlots.find((s) => s.date === date);
    return slot ? slot.slots : [];
  };

  if (currentStep === "confirmation") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Appointment Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked with {doctor.name}.
            </p>

            {bookedAppointment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Appointment Details
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Doctor:</span>
                    <span className="font-medium">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {new Date(bookedAppointment.date).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {bookedAppointment.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patient:</span>
                    <span className="font-medium">
                      {bookedAppointment.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultation Fee:</span>
                    <span className="font-medium">
                      {formatINR(doctor.consultationFee)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-6">
              A confirmation email has been sent to {formData.patientEmail}.
              Please arrive 15 minutes before your appointment time.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Book Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-3">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                <p className="text-sm text-blue-600">{doctor.specialization}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {apiError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {apiError}
            </div>
          )}
          <div className="space-y-6">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) =>
                  handleInputChange("patientName", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.patientName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
              />
              {errors.patientName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.patientName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.patientEmail}
                onChange={(e) =>
                  handleInputChange("patientEmail", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.patientEmail ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your email address"
              />
              {errors.patientEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.patientEmail}
                </p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Date *
              </label>
              <select
                value={formData.date}
                onChange={(e) => {
                  handleInputChange("date", e.target.value);
                  handleInputChange("time", ""); // Reset time when date changes
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Choose a date</option>
                {doctor.availableSlots.map((slot, index) => (
                  <option key={index} value={slot.date}>
                    {new Date(slot.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </option>
                ))}
              </select>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Time Selection */}
            {formData.date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Select Time *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableTimesForDate(formData.date).map(
                    (time, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleInputChange("time", time)}
                        className={`p-3 border rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.time === time
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {time}
                      </button>
                    )
                  )}
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Consultation Fee
              </h4>
              <div className="flex items-center">
                <IndianRupee className="w-6 h-6 text-blue-900 mr-1" />
                <p className="text-2xl font-bold text-blue-900">
                  {formatINR(doctor.consultationFee)}
                </p>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Payment can be made at the clinic or through our secure online
                portal.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

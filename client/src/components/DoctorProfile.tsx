import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Star, MapPin, Clock, IndianRupee, Calendar, Users, Award, Languages } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BookingModal from './BookingModal';
import { formatINR } from '../utils/currency';

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const doctor = state.doctors.find((d) => d.id === id);

  if (!doctor) {
    return <Navigate to="/" replace />;
  }

  const getAvailabilityStatus = () => {
    switch (doctor.availabilityStatus) {
      case 'available':
        return {
          text: 'Available Today',
          color: 'text-green-600 bg-green-50 border-green-200',
          dot: 'bg-green-500',
        };
      case 'busy':
        return {
          text: 'Limited Availability',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          dot: 'bg-yellow-500',
        };
      case 'unavailable':
        return {
          text: 'Currently Unavailable',
          color: 'text-red-600 bg-red-50 border-red-200',
          dot: 'bg-red-500',
        };
      default:
        return {
          text: 'Status Unknown',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          dot: 'bg-gray-500',
        };
    }
  };

  const availability = getAvailabilityStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {state.error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">
            {state.error.includes('429')
              ? 'Too many requests. Please try again later.'
              : `Error: ${state.error}`}
          </p>
        </div>
      )}

      {/* Doctor Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-50"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className={`w-4 h-4 rounded-full ${availability.dot}`}></div>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
              <p className="text-xl text-blue-600 font-semibold mb-4">{doctor.specialization}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="font-semibold">{doctor.rating}/5</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{doctor.experience} years</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="truncate">{doctor.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <IndianRupee className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{formatINR(doctor.consultationFee)}</span>
                </div>
              </div>

              <div className={`inline-flex items-center px-4 py-2 rounded-full border ${availability.color} mb-6`}>
                <div className={`w-2 h-2 rounded-full ${availability.dot} mr-2`}></div>
                <span className="font-medium">{availability.text}</span>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                disabled={doctor.availabilityStatus === 'unavailable'}
                className="bg-blue-600 text-white ml-1 px-4 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
              >
                {doctor.availabilityStatus === 'unavailable' ? 'Currently Unavailable' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              About Dr. {doctor.name.split(' ')[1]}
            </h2>
            <p className="text-gray-700 leading-relaxed">{doctor.about}</p>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Education & Training
            </h2>
            <ul className="space-y-3">
              {doctor.education.map((edu, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Languages className="w-5 h-5 mr-2 text-blue-600" />
              Languages Spoken
            </h2>
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Available Slots
            </h2>

            {doctor.availableSlots.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No slots available at the moment</p>
            ) : (
              <div className="space-y-4">
                {doctor.availableSlots.map((slot, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">
                      {new Date(slot.date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {slot.slots.map((time, timeIndex) => (
                        <div
                          key={timeIndex}
                          className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium text-center"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal doctor={doctor} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
};

export default DoctorProfile;
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, IndianRupee } from 'lucide-react';
import { Doctor } from '../types';
import { formatINR } from '../utils/currency';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const getAvailabilityStatus = () => {
    switch (doctor.availabilityStatus) {
      case 'available':
        return {
          text: 'Available Today',
          color: 'text-green-600 bg-green-50',
          dot: 'bg-green-500',
        };
      case 'busy':
        return {
          text: 'Limited Slots',
          color: 'text-yellow-600 bg-yellow-50',
          dot: 'bg-yellow-500',
        };
      case 'unavailable':
        return {
          text: 'Unavailable',
          color: 'text-red-600 bg-red-50',
          dot: 'bg-red-500',
        };
      default:
        return {
          text: 'Unknown',
          color: 'text-gray-600 bg-gray-50',
          dot: 'bg-gray-500',
        };
    }
  };

  const availability = getAvailabilityStatus();

  return (
    <Link
      to={`/doctor/${doctor.id}`}
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all duration-300"
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center`}>
              <div className={`w-3 h-3 rounded-full ${availability.dot}`}></div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {doctor.name}
            </h3>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>

            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="font-medium">{doctor.rating}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{doctor.experience} years exp</span>
              </div>
            </div>

            <div className="flex items-center mt-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{doctor.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${availability.color}`}>
            {availability.text}
          </div>

          <div className="flex items-center text-gray-900 font-semibold">
            <IndianRupee className="w-4 h-4" />
            <span>{formatINR(doctor.consultationFee)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DoctorCard;
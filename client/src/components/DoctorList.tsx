import React from 'react';
import { useApp } from '../context/AppContext';
import DoctorCard from './DoctorCard';
import SearchBar from './SearchBar';

const DoctorList: React.FC = () => {
  const { state } = useApp();

  const filteredDoctors = state.doctors.filter(doctor => {
    const matchesSearch = state.searchQuery === '' || 
      doctor.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    const matchesSpecialization = state.selectedSpecialization === '' || 
      doctor.specialization === state.selectedSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Healthcare Provider
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with experienced doctors and specialists. Book appointments easily and get the care you deserve.
        </p>
      </div>
      
      <SearchBar />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Available Doctors ({filteredDoctors.length})
        </h2>
      </div>
      
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or browse all doctors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
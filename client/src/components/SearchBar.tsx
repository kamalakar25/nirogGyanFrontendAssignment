import React, { useCallback, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { debounce } from 'lodash';

const SearchBar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [localSearchQuery, setLocalSearchQuery] = useState(state.searchQuery);

  const specializations = Array.from(
    new Set(state.doctors.map((doctor) => doctor.specialization))
  );

  // Debounce dispatch for search query
  const debouncedSearchDispatch = useCallback(
    debounce((query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    }, 500),
    [dispatch]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value); // Update local state immediately
    debouncedSearchDispatch(value); // Dispatch to context with debounce
  };

  // Debounce dispatch for specialization
  const debouncedSpecializationDispatch = useCallback(
    debounce((specialization: string) => {
      dispatch({ type: 'SET_SELECTED_SPECIALIZATION', payload: specialization });
    }, 500),
    [dispatch]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={state.selectedSpecialization}
            onChange={(e) => {
              const value = e.target.value;
              debouncedSpecializationDispatch(value);
            }}
            className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer min-w-[200px]"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
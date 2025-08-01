// import { Doctor } from '../types';

// export const doctors: Doctor[] = [
//   {
//     id: '1',
//     name: 'Dr. Navya Rao',
//     specialization: 'Cardiologist',
//     image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
//     rating: 4.9,
//     experience: 12,
//     availabilityStatus: 'available',
//     consultationFee: 1200,
//     location: 'Downtown Medical Center',
//     about: 'Dr. Navya Rao is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology and advanced cardiac interventions.',
//     education: ['MD - Harvard Medical School', 'Residency - Johns Hopkins Hospital', 'Fellowship - Mayo Clinic'],
//     languages: ['English', 'Spanish'],
//     availableSlots: [
//       {
//         date: '2025-01-10',
//         slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM']
//       },
//       {
//         date: '2025-01-11',
//         slots: ['10:00 AM', '11:30 AM', '01:00 PM', '04:00 PM']
//       },
//       {
//         date: '2025-01-12',
//         slots: ['09:30 AM', '02:30 PM', '04:30 PM']
//       }
//     ]
//   },
//   {
//     id: '2',
//     name: 'Dr. Kamalakar',
//     specialization: 'Dermatologist',
//     image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
//     rating: 4.8,
//     experience: 8,
//     availabilityStatus: 'available',
//     consultationFee: 950,
//     location: 'Skin Care Clinic',
//     about: 'Dr. Kamalakar is a renowned dermatologist specializing in medical and cosmetic dermatology. He has extensive experience in treating skin conditions and advanced cosmetic procedures.',
//     education: ['MD - Stanford University', 'Residency - UCSF Medical Center', 'Fellowship - UCLA Medical Center'],
//     languages: ['English', 'Mandarin', 'Cantonese'],
//     availableSlots: [
//       {
//         date: '2025-01-10',
//         slots: ['08:00 AM', '11:00 AM', '01:30 PM', '04:00 PM']
//       },
//       {
//         date: '2025-01-11',
//         slots: ['09:00 AM', '12:00 PM', '03:00 PM']
//       },
//       {
//         date: '2025-01-13',
//         slots: ['10:00 AM', '01:00 PM', '03:30 PM', '05:00 PM']
//       }
//     ]
//   },
//   {
//     id: '3',
//     name: 'Dr. Mahender',
//     specialization: 'Pediatrician',
//     image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
//     rating: 4.9,
//     experience: 15,
//     availabilityStatus: 'busy',
//     consultationFee: 1050,
//     location: 'Children\'s Health Center',
//     about: 'Dr. Mahender is a dedicated pediatrician with 15 years of experience in child healthcare. She specializes in developmental pediatrics and childhood nutrition.',
//     education: ['MD - Yale School of Medicine', 'Residency - Boston Children\'s Hospital', 'Fellowship - Children\'s Hospital of Philadelphia'],
//     languages: ['English', 'Spanish', 'Portuguese'],
//     availableSlots: [
//       {
//         date: '2025-01-12',
//         slots: ['04:00 PM', '05:00 PM']
//       },
//       {
//         date: '2025-01-13',
//         slots: ['11:00 AM', '02:00 PM']
//       }
//     ]
//   },
//   {
//     id: '4',
//     name: 'Dr. Simran',
//     specialization: 'Orthopedist',
//     image: 'https://images.pexels.com/photos/6205509/pexels-photo-6205509.jpeg?auto=compress&cs=tinysrgb&w=400',
//     rating: 4.7,
//     experience: 20,
//     availabilityStatus: 'available',
//     consultationFee: 1500,
//     location: 'Orthopedic Surgery Center',
//     about: 'Dr. Simran is a highly experienced orthopedic surgeon specializing in joint replacement and sports medicine. He has performed over 3000 successful surgeries.',
//     education: ['MD - University of Pennsylvania', 'Residency - Hospital for Special Surgery', 'Fellowship - Mayo Clinic'],
//     languages: ['English'],
//     availableSlots: [
//       {
//         date: '2025-01-10',
//         slots: ['07:00 AM', '08:30 AM', '12:00 PM', '02:30 PM']
//       },
//       {
//         date: '2025-01-11',
//         slots: ['08:00 AM', '10:00 AM', '01:30 PM', '04:30 PM']
//       },
//       {
//         date: '2025-01-12',
//         slots: ['09:00 AM', '11:00 AM', '03:00 PM']
//       }
//     ]
//   },
//   {
//     id: '5',
//     name: 'Dr. Adhya Sharma',
//     specialization: 'Neurologist',
//     image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
//     rating: 4.8,
//     experience: 18,
//     availabilityStatus: 'unavailable',
//     consultationFee: 1800,
//     location: 'Neurology Institute',
//     about: 'Dr. Adhya Sharma is a leading neurologist with expertise in treating neurological disorders including epilepsy, multiple sclerosis, and Parkinson\'s disease.',
//     education: ['MD - Northwestern University', 'Residency - Mayo Clinic', 'Fellowship - Johns Hopkins Hospital'],
//     languages: ['English', 'French'],
//     availableSlots: [
//       {
//         date: '2025-01-15',
//         slots: ['10:00 AM', '02:00 PM', '04:00 PM']
//       }
//     ]
//   },
//   {
//     id: '6',
//     name: 'Dr. Inaya',
//     specialization: 'Ophthalmologist',
//     image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
//     rating: 4.9,
//     experience: 14,
//     availabilityStatus: 'available',
//     consultationFee: 1300,
//     location: 'Eye Care Center',
//     about: 'Dr. Inaya is a skilled ophthalmologist specializing in cataract surgery, retinal disorders, and LASIK procedures. He has helped thousands of patients improve their vision.',
//     education: ['MD - Duke University', 'Residency - Wills Eye Hospital', 'Fellowship - Bascom Palmer Eye Institute'],
//     languages: ['English', 'Korean'],
//     availableSlots: [
//       {
//         date: '2025-01-10',
//         slots: ['08:30 AM', '10:00 AM', '01:00 PM', '03:00 PM']
//       },
//       {
//         date: '2025-01-11',
//         slots: ['09:30 AM', '12:30 PM', '02:30 PM', '04:30 PM']
//       },
//       {
//         date: '2025-01-12',
//         slots: ['08:00 AM', '11:30 AM', '02:00 PM']
//       }
//     ]
//   }
// ];
# NirogGyan - Healthcare Appointment Booking System

A comprehensive healthcare appointment booking application built with React, TypeScript, and Node.js, specifically designed for the Indian market.

## 🚀 Features

### Core Features
- **Doctor Discovery**: Browse and search doctors by name, specialization, and availability
- **Detailed Profiles**: View comprehensive doctor information including education, experience, and languages
- **Appointment Booking**: Easy-to-use booking system with real-time availability
- **Appointment Management**: View and cancel appointments with email-based lookup
- **Admin Dashboard**: Analytics and management interface for healthcare administrators

### Indian Market Localization
- **INR Currency**: All prices displayed in Indian Rupees (₹) with proper formatting
- **Indian Number System**: Numbers formatted according to Indian standards (lakhs, crores)
- **Local Context**: Doctor profiles and locations tailored for Indian healthcare system

### Technical Features
- **Responsive Design**: Mobile-first design optimized for all devices
- **Real-time Updates**: Live availability updates and booking confirmations
- **Form Validation**: Comprehensive client-side validation with user-friendly error messages
- **API Integration**: Full backend integration with RESTful APIs
- **Type Safety**: Complete TypeScript implementation for better code quality

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Custom Hooks** for API integration

### Backend
- **Node.js** with Express
- **CORS** enabled for cross-origin requests
- **Helmet** for security headers
- **Morgan** for request logging
- **UUID** for unique identifiers

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Install backend dependencies
cd server
npm install

# Start backend server
npm run dev
```

### Full Stack Development
```bash
# Run both frontend and backend simultaneously
npm run dev:full
```

## 🌐 API Endpoints

### Doctor Management
- `GET /api/doctors` - Get all doctors with filtering options
- `GET /api/doctors/:id` - Get specific doctor details
- `GET /api/specializations` - Get all available specializations

### Appointment Management
- `POST /api/appointments` - Book new appointment
- `GET /api/appointments` - Get appointments by email
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

### Analytics
- `GET /api/analytics` - Get dashboard analytics
- `GET /api/health` - Health check endpoint

## 💰 Currency Implementation

### Indian Rupee Formatting
```typescript
// Format currency with INR symbol
formatINR(1500) // Returns: ₹1,500

// Indian number formatting
formatIndianNumber(1234567) // Returns: 12,34,567

// Large number formatting with lakhs/crores
formatIndianCurrency(1000000) // Returns: ₹10.00 L
formatIndianCurrency(10000000) // Returns: ₹1.00 Cr
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: #3B82F6 (Medical trust and professionalism)
- **Success Green**: #10B981 (Positive actions and confirmations)
- **Warning Yellow**: #F59E0B (Cautions and limited availability)
- **Error Red**: #EF4444 (Errors and cancellations)
- **Neutral Grays**: Various shades for text and backgrounds

### Typography
- **Headings**: Bold, clear hierarchy with proper contrast
- **Body Text**: Readable font sizes with 150% line height
- **Interactive Elements**: Medium weight for buttons and links

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly button sizes (minimum 44px)
- Simplified navigation with collapsible menu
- Optimized form layouts for mobile input
- Swipe-friendly card interfaces

## 🔒 Security Features

- **Input Validation**: Client and server-side validation
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet.js implementation
- **Error Handling**: Comprehensive error boundaries

## 📊 Analytics Dashboard

### Key Metrics
- Total appointments booked
- Active doctors count
- Unique patients served
- Monthly revenue in INR
- Specialization distribution
- Recent appointment activity

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Deployment
```bash
# Set production environment
NODE_ENV=production

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pexels** for high-quality doctor profile images
- **Lucide** for beautiful, consistent icons
- **Tailwind CSS** for rapid UI development
- **React Community** for excellent documentation and support

## 📞 Support

For support and questions, please contact:
- Email: support@niroggyan.com
- Documentation: [docs.niroggyan.com](https://docs.niroggyan.com)

---

**NirogGyan** - Connecting you with quality healthcare providers across India. 🏥💙
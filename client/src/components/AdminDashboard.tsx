import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  IndianRupee, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatINR, formatIndianNumber } from '../utils/currency';
import { AnalyticsData } from '../types';

interface MonthlyStats {
  date: string;
  appointments: number;
  revenue: number;
}

const API_URL = 'http://localhost:5000/api';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/analytics`);
      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? 'Too many requests'
            : `HTTP error! Status: ${response.status}`
        );
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch analytics');
      }
      console.log('Fetched analytics data:', JSON.stringify(result.data, null, 2));
      setAnalytics(result.data);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  // Calculate trends safely
  const calculateTrend = (current: number, previous: number): { percentage: number; isPositive: boolean } => {
    if (previous === 0) return { percentage: 0, isPositive: true };
    const percentage = ((current - previous) / previous) * 100;
    return { percentage: Math.abs(percentage), isPositive: percentage >= 0 };
  };

  const getTrendData = () => {
    const monthlyStats = analytics?.monthlyStats || [];
    if (monthlyStats.length < 2) return { appointments: { percentage: 0, isPositive: true }, revenue: { percentage: 0, isPositive: true } };
    
    const current = monthlyStats[0];
    const previous = monthlyStats[1];
    
    return {
      appointments: calculateTrend(current.appointments || 0, previous.appointments || 0),
      revenue: calculateTrend(current.revenue || 0, previous.revenue || 0)
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Analytics</h3>
          <p className="text-red-600 mb-4">
            {error.includes('429')
              ? 'Too many requests. Please wait a moment and try again.'
              : `Error: ${error}`}
          </p>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h3>
          <p className="text-yellow-600 mb-4">No analytics data found. Please try refreshing.</p>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  const trends = getTrendData();

  const stats = [
    {
      title: 'Total Appointments',
      value: formatIndianNumber(analytics.totalAppointments || 0),
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      trend: trends.appointments,
      description: 'All confirmed bookings'
    },
    {
      title: 'Available Doctors',
      value: formatIndianNumber(analytics.availableDoctors || 0),
      icon: UserCheck,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      trend: { percentage: 0, isPositive: true },
      description: 'Currently available'
    },
    {
      title: 'Total Doctors',
      value: formatIndianNumber(analytics.totalDoctors || 0),
      icon: Users,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      trend: { percentage: 0, isPositive: true },
      description: 'All registered doctors'
    },
    {
      title: 'Total Patients',
      value: formatIndianNumber(analytics.totalPatients || 0),
      icon: Users,
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      trend: { percentage: 0, isPositive: true },
      description: 'Unique patients served'
    },
    {
      title: 'Monthly Revenue',
      value: formatINR(analytics.monthlyRevenue || 0),
      icon: IndianRupee,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      trend: trends.revenue,
      description: 'This month earnings'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-3 h-3 inline mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 inline mr-1" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor your healthcare platform performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
                {stat.trend.percentage > 0 && (
                  <div className="flex items-center">
                    {stat.trend.isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">System Health</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Total Doctors</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{formatIndianNumber(analytics.totalDoctors || 0)}</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Last Updated</span>
            </div>
            <span className="text-sm text-gray-700">
              {analytics.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Recent Appointments
            </h2>
            <span className="text-sm text-gray-500">
              {analytics.recentAppointments?.length || 0} total
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analytics.recentAppointments?.length ? (
              analytics.recentAppointments.slice(0, 8).map((appointment, index) => (
                <div
                  key={appointment.id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900 mb-1">
                      {formatINR(appointment.consultationFee)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                    >
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Specialization Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Doctor Specializations
            </h2>
            <span className="text-sm text-gray-500">Distribution</span>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.specialityStats || {}).length ? (
              Object.entries(analytics.specialityStats).map(([specialization, count], index) => {
                const percentage = ((count as number) / (analytics.totalDoctors || 1)) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{specialization}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{percentage.toFixed(0)}%</span>
                        <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No specialization data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      {analytics.monthlyStats?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Recent Appointments</h3>
              <div className="space-y-2">
                {analytics.monthlyStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {new Date(stat.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {stat.appointments} appointments
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Daily Revenue</h3>
              <div className="space-y-2">
                {analytics.monthlyStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {new Date(stat.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatINR(stat.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
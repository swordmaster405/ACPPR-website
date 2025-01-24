import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { Job, Bid, Appointment } from '../lib/supabase';

export function ContractorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      // Load active jobs (jobs with accepted bids)
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:user_id(full_name),
          services(name),
          bids!inner(*)
        `)
        .eq('bids.contractor_id', user?.id)
        .eq('bids.status', 'accepted')
        .eq('status', 'in_progress');

      if (jobsError) throw jobsError;
      setActiveJobs(jobsData || []);

      // Load recent bids
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          jobs(
            title,
            description,
            budget_range_min,
            budget_range_max,
            profiles:user_id(full_name)
          )
        `)
        .eq('contractor_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (bidsError) throw bidsError;
      setBids(bidsData || []);

      // Load upcoming appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:user_id(full_name)
        `)
        .eq('contractor_id', user?.id)
        .eq('status', 'scheduled')
        .gte('date', new Date().toISOString())
        .order('date')
        .limit(5);

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Contractor Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Active Jobs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Jobs</h2>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {activeJobs.length === 0 ? (
              <p className="text-gray-500">No active jobs</p>
            ) : (
              activeJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Client: {(job.profiles as any)?.full_name}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${job.budget_range_min} - ${job.budget_range_max}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bids</h2>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {bids.length === 0 ? (
              <p className="text-gray-500">No recent bids</p>
            ) : (
              bids.map((bid) => (
                <Link
                  key={bid.id}
                  to={`/jobs/${bid.job_id}`}
                  className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <h3 className="font-medium text-gray-900">
                    {(bid.jobs as any)?.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      Your bid: ${bid.amount}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments</p>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      {(appointment.profiles as any)?.full_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {appointment.duration && ` (${appointment.duration})`}
                  </div>
                  {appointment.notes && (
                    <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
                  )}
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={async () => {
                        await supabase
                          .from('appointments')
                          .update({ status: 'completed' })
                          .eq('id', appointment.id);
                        loadDashboardData();
                      }}
                      className="flex-1 inline-flex justify-center items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </button>
                    <button
                      onClick={async () => {
                        await supabase
                          .from('appointments')
                          .update({ status: 'cancelled' })
                          .eq('id', appointment.id);
                        loadDashboardData();
                      }}
                      className="flex-1 inline-flex justify-center items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/jobs"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Briefcase className="h-5 w-5 mr-2" />
          Browse Available Jobs
        </Link>
        <Link
          to="/appointments"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Calendar className="h-5 w-5 mr-2" />
          View All Appointments
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Update Profile
        </Link>
      </div>
    </div>
  );
}
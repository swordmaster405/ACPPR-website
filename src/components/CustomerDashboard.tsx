import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, DollarSign, Clock, CheckCircle, XCircle, MessageSquare, Search } from 'lucide-react';
import type { Job, Appointment } from '../lib/supabase';

export function CustomerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      // Load jobs with their bids
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          services(name),
          bids(
            id,
            amount,
            status,
            contractor_profiles:contractor_id(
              business_name,
              profiles:id(full_name)
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Load upcoming appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          contractor_profiles:contractor_id(
            business_name,
            profiles:id(full_name)
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'scheduled')
        .gte('date', new Date().toISOString())
        .order('date');

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <Link
          to="/jobs/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Briefcase className="h-5 w-5 mr-2" />
          Post New Job
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posted Jobs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Posted Jobs</h2>
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-gray-500">No jobs posted yet</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg bg-gray-50">
                  <Link to={`/jobs/${job.id}`} className="block">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'open' ? 'bg-green-100 text-green-800' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${job.budget_range_min} - ${job.budget_range_max}
                      </div>
                      {job.location && (
                        <div className="mt-1">Location: {job.location}</div>
                      )}
                    </div>
                    {(job.bids as any)?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {(job.bids as any).length} bid(s)
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
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
                      {(appointment.contractor_profiles as any)?.business_name || 
                       (appointment.contractor_profiles as any)?.profiles?.full_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(appointment.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {appointment.duration && ` (${appointment.duration})`}
                    </div>
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
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Link
          to="/contractors"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Search className="h-5 w-5 mr-2" />
          Find Contractors
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
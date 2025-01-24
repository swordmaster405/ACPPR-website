import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import type { Appointment } from '../lib/supabase';

export function AppointmentList() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  async function loadAppointments() {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          contractor_profiles:contractor_id(
            business_name,
            profiles:id(full_name)
          ),
          profiles:user_id(full_name)
        `)
        .or(`user_id.eq.${user?.id},contractor_id.eq.${user?.id}`)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(appointmentId: string, status: 'completed' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;
      await loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const isContractor = user?.id === appointment.contractor_id;
            const otherParty = isContractor
              ? (appointment.profiles as any)?.full_name
              : (appointment.contractor_profiles as any)?.business_name || 
                (appointment.contractor_profiles as any)?.profiles?.full_name;
            const appointmentDate = new Date(appointment.date);

            return (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Appointment with {otherParty}
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span>
                          {appointmentDate.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>
                          {appointmentDate.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {appointment.duration && ` (${appointment.duration})`}
                        </span>
                      </div>
                      {appointment.notes && (
                        <div className="text-gray-500">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                {appointment.status === 'scheduled' && (
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
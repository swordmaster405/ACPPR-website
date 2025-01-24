import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Job, Bid } from '../lib/supabase';
import { DollarSign, Clock, MapPin, Building } from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    loadJobAndBids();
  }, [id]);

  async function loadJobAndBids() {
    try {
      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:user_id(full_name),
          services(name)
        `)
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Load bids if user is the job owner or a contractor
      if (user) {
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select(`
            *,
            contractor_profiles:contractor_id(
              business_name,
              profiles:id(full_name)
            )
          `)
          .eq('job_id', id)
          .order('created_at', { ascending: false });

        if (bidsError) throw bidsError;
        setBids(bidsData || []);
      }
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBidSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !job) return;

    setError('');
    setSubmitting(true);

    try {
      const amount = parseFloat(bidAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid bid amount');
      }

      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          job_id: job.id,
          contractor_id: user.id,
          amount,
          proposal,
        });

      if (bidError) throw bidError;
      
      // Refresh bids
      await loadJobAndBids();
      
      // Clear form
      setBidAmount('');
      setProposal('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBidAction(bidId: string, status: 'accepted' | 'rejected') {
    try {
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status })
        .eq('id', bidId);

      if (bidError) throw bidError;

      if (status === 'accepted') {
        // Update job status to in_progress
        const { error: jobError } = await supabase
          .from('jobs')
          .update({ status: 'in_progress' })
          .eq('id', job?.id);

        if (jobError) throw jobError;
        
        // Show appointment scheduler
        setShowScheduler(true);
      }

      await loadJobAndBids();
    } catch (error) {
      console.error('Error updating bid:', error);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center py-8">Job not found</div>;
  }

  const isJobOwner = user?.id === job.user_id;
  const isContractor = user?.user_type === 'contractor';
  const hasUserBid = bids.some(bid => bid.contractor_id === user?.id);
  const acceptedBid = bids.find(bid => bid.status === 'accepted');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Posted by {(job.profiles as any)?.full_name || 'Anonymous'}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              job.status === 'open' ? 'bg-green-100 text-green-800' :
              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-gray-700">{job.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Building className="h-5 w-5 mr-2" />
                <span>Service: {(job.services as any)?.name}</span>
              </div>
              {job.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.budget_range_min && job.budget_range_max && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>Budget: ${job.budget_range_min} - ${job.budget_range_max}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {isContractor && job.status === 'open' && !hasUserBid && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">Submit a Bid</h2>
              <form onSubmit={handleBidSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Bid Amount ($)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="proposal" className="block text-sm font-medium text-gray-700">
                    Proposal
                  </label>
                  <textarea
                    id="proposal"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          {(isJobOwner || hasUserBid) && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">Bids</h2>
              <div className="mt-4 space-y-4">
                {bids.length === 0 ? (
                  <p className="text-gray-500">No bids yet</p>
                ) : (
                  bids.map((bid) => (
                    <div key={bid.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {(bid.contractor_profiles as any)?.business_name || 
                             (bid.contractor_profiles as any)?.profiles?.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Bid Amount: ${bid.amount}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      {bid.proposal && (
                        <p className="mt-2 text-gray-700">{bid.proposal}</p>
                      )}
                      {isJobOwner && bid.status === 'pending' && job.status === 'open' && (
                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={() => handleBidAction(bid.id, 'accepted')}
                            className="flex-1 bg-green-600 text-white py-1 px-3 rounded-md text-sm hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleBidAction(bid.id, 'rejected')}
                            className="flex-1 bg-red-600 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {showScheduler && acceptedBid && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <AppointmentScheduler
                contractorId={acceptedBid.contractor_id}
                contractorName={(acceptedBid.contractor_profiles as any)?.business_name || 
                               (acceptedBid.contractor_profiles as any)?.profiles?.full_name}
                onScheduled={() => {
                  setShowScheduler(false);
                  navigate('/appointments');
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
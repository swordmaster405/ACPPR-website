import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ContractorProfile, Service, Review } from '../lib/supabase';
import { Star, MapPin, Phone, Globe, Search, Filter } from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export function ContractorList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<ContractorProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<{ [key: string]: Review[] }>({});
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minExperience, setMinExperience] = useState('');

  useEffect(() => {
    loadContractors();
    loadServices();
  }, []);

  useEffect(() => {
    filterContractors();
  }, [contractors, selectedService, selectedLocation, minRating, minExperience]);

  async function loadServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  async function loadContractors() {
    try {
      // First, get contractor profiles
      const { data: contractorData, error: contractorError } = await supabase
        .from('contractor_profiles')
        .select(`
          *,
          profiles!contractor_profiles_id_fkey(full_name, avatar_url),
          contractor_services(
            services(id, name)
          )
        `)
        .eq('insurance_verified', true);

      if (contractorError) throw contractorError;

      // Then, get reviews for all contractors
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          rating,
          comment,
          created_at,
          contractor_id,
          profiles!reviews_user_id_fkey(full_name)
        `);

      if (reviewError) throw reviewError;
      
      // Organize reviews by contractor
      const reviewsByContractor: { [key: string]: Review[] } = {};
      reviewData?.forEach(review => {
        if (!reviewsByContractor[review.contractor_id]) {
          reviewsByContractor[review.contractor_id] = [];
        }
        reviewsByContractor[review.contractor_id].push(review);
      });
      
      setContractors(contractorData || []);
      setFilteredContractors(contractorData || []);
      setReviews(reviewsByContractor);
    } catch (error) {
      console.error('Error loading contractors:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterContractors() {
    let filtered = [...contractors];

    // Search by business name or description
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contractor => 
        (contractor.business_name?.toLowerCase().includes(term) ||
        contractor.description?.toLowerCase().includes(term) ||
        (contractor.profiles as any)?.full_name.toLowerCase().includes(term))
      );
    }

    // Filter by service
    if (selectedService) {
      filtered = filtered.filter(contractor =>
        contractor.contractor_services?.some(cs => 
          (cs.services as any)?.id === selectedService
        )
      );
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(contractor =>
        contractor.service_area?.some(area =>
          area.toLowerCase().includes(selectedLocation.toLowerCase())
        )
      );
    }

    // Filter by minimum rating
    if (minRating) {
      filtered = filtered.filter(contractor => {
        const contractorReviews = reviews[contractor.id] || [];
        if (contractorReviews.length === 0) return false;
        const avgRating = contractorReviews.reduce((acc, review) => acc + review.rating, 0) / contractorReviews.length;
        return avgRating >= parseFloat(minRating);
      });
    }

    // Filter by minimum years of experience
    if (minExperience) {
      filtered = filtered.filter(contractor =>
        contractor.years_experience >= parseInt(minExperience)
      );
    }

    setFilteredContractors(filtered);
  }

  const handleSearch = () => {
    filterContractors();
  };

  const calculateAverageRating = (contractorId: string) => {
    const contractorReviews = reviews[contractorId] || [];
    if (contractorReviews.length === 0) return 0;
    
    const sum = contractorReviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / contractorReviews.length) * 10) / 10;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">{t('loading')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('findContractors')}</h1>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search with Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchContractors')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {t('search')}
            </button>
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">{t('allServices')}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <input
              type="text"
              placeholder={t('filterByLocation')}
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">{t('minimumRating')}</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <select
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">{t('yearsExperience')}</option>
              <option value="1">1+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContractors.map((contractor) => {
          const averageRating = calculateAverageRating(contractor.id);
          const contractorReviews = reviews[contractor.id] || [];
          const hasUserReviewed = user && contractorReviews.some(
            review => (review.profiles as any)?.id === user.id
          );

          return (
            <div key={contractor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={(contractor.profiles as any)?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((contractor.profiles as any)?.full_name || '')}&background=random`}
                    alt={(contractor.profiles as any)?.full_name}
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {contractor.business_name || (contractor.profiles as any)?.full_name}
                    </h3>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        ({averageRating.toFixed(1)})
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-gray-600 line-clamp-3">
                  {contractor.description || 'Professional contractor with years of experience in the industry.'}
                </p>

                <div className="mt-4 space-y-2">
                  {contractor.service_area && contractor.service_area.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{contractor.service_area.join(', ')}</span>
                    </div>
                  )}
                  {contractor.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{contractor.phone}</span>
                    </div>
                  )}
                  {contractor.website && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setSelectedContractor(
                      selectedContractor === contractor.id ? null : contractor.id
                    )}
                    className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {contractorReviews.length} Reviews
                  </button>

                  {selectedContractor === contractor.id && (
                    <div className="mt-4 space-y-4">
                      {contractorReviews.map((review, index) => (
                        <div key={index} className="border-t pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {(review.profiles as any)?.full_name}
                              </p>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-gray-600">{review.comment}</p>
                          )}
                        </div>
                      ))}

                      {user && !hasUserReviewed && (
                        <div className="border-t pt-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">
                            Write a Review
                          </h4>
                          <ReviewForm
                            contractorId={contractor.id}
                            onReviewSubmitted={loadContractors}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContractors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}
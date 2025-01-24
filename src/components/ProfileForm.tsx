import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { updateProfile } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Profile, Service } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [contractorData, setContractorData] = useState({
    business_name: '',
    description: '',
    license_number: '',
    years_experience: 0,
    service_area: [] as string[],
    website: '',
    phone: '',
    selectedServices: [] as string[],
    certifications: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
      });
      loadContractorProfile();
      loadServices();
    }
  }, [user]);

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

  async function loadContractorProfile() {
    if (user?.user_type !== 'contractor') return;

    try {
      // Load contractor profile
      const { data: contractorProfile, error: profileError } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Load contractor services
      const { data: contractorServices, error: servicesError } = await supabase
        .from('contractor_services')
        .select('service_id')
        .eq('contractor_id', user.id);

      if (servicesError) throw servicesError;

      if (contractorProfile) {
        setContractorData({
          ...contractorData,
          business_name: contractorProfile.business_name || '',
          description: contractorProfile.description || '',
          license_number: contractorProfile.license_number || '',
          years_experience: contractorProfile.years_experience || 0,
          service_area: contractorProfile.service_area || [],
          website: contractorProfile.website || '',
          phone: contractorProfile.phone || '',
          selectedServices: contractorServices?.map(cs => cs.service_id) || [],
          certifications: contractorProfile.certifications || [],
        });
      }
    } catch (error) {
      console.error('Error loading contractor profile:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile(formData);

      if (user?.user_type === 'contractor') {
        // Update contractor profile
        const { error: contractorError } = await supabase
          .from('contractor_profiles')
          .upsert({
            id: user.id,
            business_name: contractorData.business_name,
            description: contractorData.description,
            license_number: contractorData.license_number,
            years_experience: contractorData.years_experience,
            service_area: contractorData.service_area,
            website: contractorData.website,
            phone: contractorData.phone,
            certifications: contractorData.certifications,
          });

        if (contractorError) throw contractorError;

        // Update contractor services
        await supabase
          .from('contractor_services')
          .delete()
          .eq('contractor_id', user.id);

        if (contractorData.selectedServices.length > 0) {
          const { error: insertError } = await supabase
            .from('contractor_services')
            .insert(
              contractorData.selectedServices.map(serviceId => ({
                contractor_id: user.id,
                service_id: serviceId,
              }))
            );

          if (insertError) throw insertError;
        }
      }

      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const areas = e.target.value.split(',').map(area => area.trim());
    setContractorData({ ...contractorData, service_area: areas });
  };

  const handleCertificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const certs = e.target.value.split(',').map(cert => cert.trim());
    setContractorData({ ...contractorData, certifications: certs });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Profile Fields */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Contractor-specific Fields */}
          {user.user_type === 'contractor' && (
            <>
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  id="business_name"
                  value={contractorData.business_name}
                  onChange={(e) => setContractorData({ ...contractorData, business_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <textarea
                  id="description"
                  value={contractorData.description}
                  onChange={(e) => setContractorData({ ...contractorData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Provided
                </label>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-md border-gray-300">
                  {services.map((service) => (
                    <label key={service.id} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={contractorData.selectedServices.includes(service.id)}
                        onChange={(e) => {
                          const newServices = e.target.checked
                            ? [...contractorData.selectedServices, service.id]
                            : contractorData.selectedServices.filter(id => id !== service.id);
                          setContractorData({ ...contractorData, selectedServices: newServices });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="years_experience"
                  min="0"
                  value={contractorData.years_experience}
                  onChange={(e) => setContractorData({ ...contractorData, years_experience: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="service_area" className="block text-sm font-medium text-gray-700">
                  Service Areas (comma-separated)
                </label>
                <input
                  type="text"
                  id="service_area"
                  value={contractorData.service_area.join(', ')}
                  onChange={handleServiceAreaChange}
                  placeholder="e.g., New York, Brooklyn, Queens"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                  Certifications & Licenses (comma-separated)
                </label>
                <input
                  type="text"
                  id="certifications"
                  value={contractorData.certifications.join(', ')}
                  onChange={handleCertificationsChange}
                  placeholder="e.g., Master Plumber License, Electrical Contractor License"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">
                  Primary License Number
                </label>
                <input
                  type="text"
                  id="license_number"
                  value={contractorData.license_number}
                  onChange={(e) => setContractorData({ ...contractorData, license_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={contractorData.website}
                  onChange={(e) => setContractorData({ ...contractorData, website: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={contractorData.phone}
                  onChange={(e) => setContractorData({ ...contractorData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm">Profile updated successfully!</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
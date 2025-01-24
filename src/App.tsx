import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Briefcase, Calendar, Search, Star, Users, LogOut } from 'lucide-react';
import { AuthProvider } from './components/AuthContext';
import { LanguageProvider } from './components/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { useLanguage } from './components/LanguageContext';
import { useAuth } from './components/AuthContext';
import { signOut } from './lib/auth';
import { SignInForm } from './components/SignInForm';
import { SignUpForm } from './components/SignUpForm';
import { JobList } from './components/JobList';
import { JobDetails } from './components/JobDetails';
import { CreateJob } from './components/CreateJob';
import { ContractorList } from './components/ContractorList';
import { AppointmentList } from './components/AppointmentList';
import { ProfileForm } from './components/ProfileForm';
import { ContractorDashboard } from './components/ContractorDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';

// Update the Navigation component to use translations
function Navigation() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/'; // Redirect to home after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">ACPPR</a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <LanguageSelector />
            {user?.user_type === 'contractor' ? (
              <>
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                  <Briefcase size={20} />
                  Dashboard
                </a>
                <a href="/jobs" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                  <Search size={20} />
                  {t('jobs')}
                </a>
              </>
            ) : user?.user_type === 'user' ? (
              <>
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                  <Briefcase size={20} />
                  Dashboard
                </a>
                <a href="/contractors" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                  <Search size={20} />
                  {t('findContractors')}
                </a>
              </>
            ) : (
              <a href="/contractors" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                <Search size={20} />
                {t('findContractors')}
              </a>
            )}
            {user ? (
              <>
                <a href="/appointments" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                  <Calendar size={20} />
                  {t('appointments')}
                </a>
                <div className="relative group">
                  <a href="/profile" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                    <Users size={20} />
                    {t('profile')}
                  </a>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <a href="/signin" className="text-gray-700 hover:text-blue-600">{t('signIn')}</a>
                <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  {t('signUp')}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Update the Home component to use translations
function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Redirect users to their respective dashboards
  if (user?.user_type === 'contractor') {
    return <Navigate to="/dashboard" replace />;
  } else if (user?.user_type === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">{t('heroTitle')}</span>
              <span className="block text-blue-600">{t('heroSubtitle')}</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              {t('heroDescription')}
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a href="/contractors" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                  {t('findContractorsButton')}
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a href="/jobs/create" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  {t('postJobButton')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t('postJobsTitle')}</h3>
              <p className="mt-2 text-gray-500">{t('postJobsDescription')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t('scheduleAppointmentsTitle')}</h3>
              <p className="mt-2 text-gray-500">{t('scheduleAppointmentsDescription')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t('readReviewsTitle')}</h3>
              <p className="mt-2 text-gray-500">{t('readReviewsDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Update the ProtectedRoute component to handle children correctly
function ProtectedRoute({ children }: { children: React.ReactNode | ((props: { user: any }) => React.ReactNode) }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please sign in to access this page.</div>;
  }

  if (typeof children === 'function') {
    return <>{children({ user })}</>;
  }

  return <>{children}</>;
}

// Update the main App component to include LanguageProvider
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignInForm />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/contractors" element={<ContractorList />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  {({ user }) => 
                    user.user_type === 'contractor' ? <ContractorDashboard /> : <CustomerDashboard />
                  }
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <JobList />
                </ProtectedRoute>
              } />
              <Route path="/jobs/create" element={
                <ProtectedRoute>
                  <CreateJob />
                </ProtectedRoute>
              } />
              <Route path="/jobs/:id" element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <AppointmentList />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
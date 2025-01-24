export type Language = 'en' | 'es';
export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Navigation
    findContractors: "Find Contractors",
    jobs: "Jobs",
    appointments: "Appointments",
    profile: "Profile",
    signIn: "Sign In",
    signUp: "Sign Up",
    dashboard: "Dashboard",
    myDashboard: "My Dashboard",
    contractorDashboard: "Contractor Dashboard",

    // Dashboard Sections
    activeJobs: "Active Jobs",
    recentBids: "Recent Bids",
    upcomingAppointments: "Upcoming Appointments",
    myPostedJobs: "My Posted Jobs",
    noActiveJobs: "No active jobs",
    noRecentBids: "No recent bids",
    noUpcomingAppointments: "No upcoming appointments",
    noJobsPosted: "No jobs posted yet",

    // Job Status
    open: "Open",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",

    // Actions
    postNewJob: "Post New Job",
    browseJobs: "Browse Available Jobs",
    findContractorsButton: "Find Contractors",
    viewAllAppointments: "View All Appointments",
    updateProfile: "Update Profile",
    complete: "Complete",
    cancel: "Cancel",
    viewDetails: "View Details",

    // Job Details
    client: "Client",
    yourBid: "Your bid",
    budget: "Budget",
    location: "Location",
    duration: "Duration",
    notes: "Notes",

    // Hero Section
    heroTitle: "Find Professional Contractors",
    heroSubtitle: "For Your Home Improvement Projects",
    heroDescription: "Connect with verified contractors, get quotes, and manage your home improvement projects all in one place.",
    postJobButton: "Post a Job",

    // Features Section
    postJobsTitle: "Post Jobs",
    postJobsDescription: "Easily post your home improvement projects and receive competitive bids from qualified contractors.",
    scheduleAppointmentsTitle: "Schedule Appointments",
    scheduleAppointmentsDescription: "Book and manage appointments with contractors directly through our platform.",
    readReviewsTitle: "Read Reviews",
    readReviewsDescription: "Make informed decisions based on genuine reviews from other homeowners.",

    // Search and Filters
    searchJobs: "Search jobs...",
    searchContractors: "Search contractors...",
    allServices: "All Services",
    allStatuses: "All Statuses",
    filterByLocation: "Filter by location...",
    minBudget: "Min Budget",
    maxBudget: "Max Budget",
    yearsExperience: "Years of Experience",
    minimumRating: "Minimum Rating",

    // Messages
    loading: "Loading...",
    noResults: "No results found",
    errorOccurred: "An error occurred",
    pleaseSignIn: "Please sign in to access this page",
    successfullyUpdated: "Successfully updated",
  },
  es: {
    // Navigation
    findContractors: "Encontrar Contratistas",
    jobs: "Trabajos",
    appointments: "Citas",
    profile: "Perfil",
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    dashboard: "Panel de Control",
    myDashboard: "Mi Panel",
    contractorDashboard: "Panel del Contratista",

    // Dashboard Sections
    activeJobs: "Trabajos Activos",
    recentBids: "Ofertas Recientes",
    upcomingAppointments: "Próximas Citas",
    myPostedJobs: "Mis Trabajos Publicados",
    noActiveJobs: "Sin trabajos activos",
    noRecentBids: "Sin ofertas recientes",
    noUpcomingAppointments: "Sin citas próximas",
    noJobsPosted: "Aún no hay trabajos publicados",

    // Job Status
    open: "Abierto",
    inProgress: "En Progreso",
    completed: "Completado",
    cancelled: "Cancelado",
    pending: "Pendiente",
    accepted: "Aceptado",
    rejected: "Rechazado",

    // Actions
    postNewJob: "Publicar Nuevo Trabajo",
    browseJobs: "Explorar Trabajos Disponibles",
    findContractorsButton: "Encontrar Contratistas",
    viewAllAppointments: "Ver Todas las Citas",
    updateProfile: "Actualizar Perfil",
    complete: "Completar",
    cancel: "Cancelar",
    viewDetails: "Ver Detalles",

    // Job Details
    client: "Cliente",
    yourBid: "Tu oferta",
    budget: "Presupuesto",
    location: "Ubicación",
    duration: "Duración",
    notes: "Notas",

    // Hero Section
    heroTitle: "Encuentra Contratistas Profesionales",
    heroSubtitle: "Para Tus Proyectos de Mejora del Hogar",
    heroDescription: "Conéctate con contratistas verificados, obtén presupuestos y gestiona tus proyectos de mejora del hogar en un solo lugar.",
    postJobButton: "Publicar Trabajo",

    // Features Section
    postJobsTitle: "Publicar Trabajos",
    postJobsDescription: "Publica fácilmente tus proyectos de mejora del hogar y recibe ofertas competitivas de contratistas calificados.",
    scheduleAppointmentsTitle: "Programar Citas",
    scheduleAppointmentsDescription: "Programa y gestiona citas con contratistas directamente a través de nuestra plataforma.",
    readReviewsTitle: "Leer Reseñas",
    readReviewsDescription: "Toma decisiones informadas basadas en reseñas genuinas de otros propietarios.",

    // Search and Filters
    searchJobs: "Buscar trabajos...",
    searchContractors: "Buscar contratistas...",
    allServices: "Todos los Servicios",
    allStatuses: "Todos los Estados",
    filterByLocation: "Filtrar por ubicación...",
    minBudget: "Presupuesto Mínimo",
    maxBudget: "Presupuesto Máximo",
    yearsExperience: "Años de Experiencia",
    minimumRating: "Calificación Mínima",

    // Messages
    loading: "Cargando...",
    noResults: "No se encontraron resultados",
    errorOccurred: "Ocurrió un error",
    pleaseSignIn: "Por favor, inicia sesión para acceder a esta página",
    successfullyUpdated: "Actualizado con éxito",
  }
};
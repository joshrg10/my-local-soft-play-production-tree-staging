import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PerformanceMonitor from './components/PerformanceMonitor';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import { initGA, trackPageView } from './lib/analytics';

// Eagerly load HomePage for faster initial render
import HomePage from './pages/HomePage';

// Lazy load non-critical pages
const ListingPage = lazy(() => import('./pages/ListingPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CityPage = lazy(() => import('./pages/CityPage'));
const SoftPlayNearMePage = lazy(() => import('./pages/SoftPlayNearMePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminBlogPage = lazy(() => import('./pages/AdminBlogPage'));

// Loading fallback component
const PageLoading = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
  </div>
);

// Analytics wrapper component
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname + location.search);
  }, [location]);

  return <>{children}</>;
};

// Layout wrapper for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Header />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
    <CookieBanner />
  </>
);

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AnalyticsWrapper>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={
              <Suspense fallback={<PageLoading />}>
                <AdminLoginPage />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<PageLoading />}>
                <AdminPage />
              </Suspense>
            }>
              <Route path="blog" element={
                <Suspense fallback={<PageLoading />}>
                  <AdminBlogPage />
                </Suspense>
              } />
              {/* Add more admin routes here */}
            </Route>

            {/* Public Routes */}
            <Route path="/" element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            } />
            
            <Route path="/soft-play/:city/:slug" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <ListingPage />
                </Suspense>
              </PublicLayout>
            } />
            
            <Route path="/soft-play/:city" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <CityPage />
                </Suspense>
              </PublicLayout>
            } />
            
            <Route path="/search" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <SearchResultsPage />
                </Suspense>
              </PublicLayout>
            } />
            
            <Route path="/about" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <AboutPage />
                </Suspense>
              </PublicLayout>
            } />
            
            <Route path="/contact" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <ContactPage />
                </Suspense>
              </PublicLayout>
            } />
            
            <Route path="/privacy-policy" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <PrivacyPolicyPage />
                </Suspense>
              </PublicLayout>
            } />
            
            <Route path="/soft-play-near-me" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <SoftPlayNearMePage />
                </Suspense>
              </PublicLayout>
            } />
            
            <Route path="*" element={
              <PublicLayout>
                <Suspense fallback={<PageLoading />}>
                  <NotFoundPage />
                </Suspense>
              </PublicLayout>
            } />
          </Routes>
          {import.meta.env.DEV && <PerformanceMonitor />}
        </div>
      </AnalyticsWrapper>
    </Router>
  );
}

export default App;

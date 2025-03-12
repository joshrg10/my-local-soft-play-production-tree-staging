import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Defer check until after main thread work with queueMicrotask
    const timeoutId = setTimeout(() => {
      if (!Cookies.get('cookie-consent')) {
        // Batch state updates with requestAnimationFrame
        requestAnimationFrame(() => setShowBanner(true));
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleConsent = (consentType: string) => {
    Cookies.set('cookie-consent', consentType, { expires: 365 });
    setShowBanner(false);
    if (consentType === 'declined') {
      window['ga-disable-G-XXXXXXXXXX'] = true;
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transform translate-y-0 transition-transform duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-gray-700 text-sm md:text-base">
              We use cookies and similar technologies to enhance your experience and analyze site traffic. This includes essential cookies for site functionality and analytics cookies to help us improve our services. By continuing to visit this site you agree to our use of cookies.{' '}
              <Link to="/privacy-policy" className="text-pink-500 hover:text-pink-600 underline">
                Learn more
              </Link>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleConsent('declined')}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Decline
            </button>
            <button
              onClick={() => handleConsent('accepted')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Accept Cookies
            </button>
            <button
              onClick={() => handleConsent('declined')}
              className="text-gray-400 hover:text-gray-600 md:hidden"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CookieBanner);

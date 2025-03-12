import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, MapPin, LogOut } from 'lucide-react';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data, error } = await supabase.rpc('is_admin', {
        user_id: session.user.id
      });

      if (error) throw error;

      setIsAdmin(data);
      if (!data) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/admin" className="text-2xl font-bold text-gray-800">
              Admin Portal
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/admin/blog"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Blog Posts
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/listings"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Listings
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

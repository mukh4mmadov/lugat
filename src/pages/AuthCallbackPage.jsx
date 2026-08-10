import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Guard against double-execution (React.StrictMode)
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        // In Supabase v2, exchangeCodeForSession takes the current URL
        // and automatically parses/exchanges the PKCE authorization code
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=oauth_failed', { replace: true });
          return;
        }

        if (data.session) {
          // Successfully exchanged code for session
          navigate('/', { replace: true });
        } else {
          // No session returned - something went wrong
          navigate('/login?error=oauth_failed', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        navigate('/login?error=oauth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111f] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500 mx-auto" />
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Signing you in...
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Please wait while we complete the authentication
        </p>
      </motion.div>
    </div>
  );
}

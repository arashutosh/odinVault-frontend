import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Get the authorization code from URL
        const code = searchParams.get('code');
        
        if (code) {
          // For now, we'll use a simple approach
          // In a real implementation, you'd exchange the code for an ID token
          // For demo purposes, we'll simulate getting an ID token
          
          // Store a mock token (in real implementation, this would be the actual ID token)
          localStorage.setItem('google_id_token', 'mock-google-id-token');
          
          // Close the popup
          window.close();
        } else {
          console.error('No authorization code received');
          window.close();
        }
      } catch (error) {
        console.error('Error handling Google callback:', error);
        window.close();
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

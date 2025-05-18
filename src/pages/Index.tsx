
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard
    navigate("/");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to Dashboard...</h1>
        <div className="mt-4">
          <div className="w-12 h-12 rounded-full border-4 border-drivable-purple border-t-transparent animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;

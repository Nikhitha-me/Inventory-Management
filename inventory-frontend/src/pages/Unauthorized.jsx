import React, { useState, useEffect } from "react";

const UnauthorizedPage = () => {
  const [countdown, setCountdown] = useState(30);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRedirect = () => {
    setRedirecting(true);
    // Redirect to login page - update with your actual login route
    window.location.href = "/login";
  };

  const handleManualRedirect = () => {
    handleRedirect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">🚫</div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          You don't have permission to access this page. Please log in with
          appropriate credentials.
        </p>

        {/* Countdown */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          {redirecting ? (
            <span className="text-blue-600 font-semibold">
              Redirecting to login...
            </span>
          ) : (
            <div>
              <span className="text-blue-600 font-semibold">
                Redirecting in {countdown} seconds
              </span>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Redirect Button */}
        <button
          onClick={handleManualRedirect}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Go to Login Now
        </button>

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            If you're not redirected automatically,{" "}
            <button
              onClick={handleManualRedirect}
              className="text-blue-500 hover:text-blue-600 underline focus:outline-none"
            >
              click here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

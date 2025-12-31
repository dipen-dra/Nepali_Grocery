import React from 'react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
    
  }


  return (
    
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center modal-backdrop-blur"
      onClick={onClose} 
    >
      <div 
        className="bg-white p-8 rounded-2xl shadow-xl m-4 max-w-2xl w-full"
        onClick={e => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors"
              aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="text-gray-600 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
          <p>Please read these terms and conditions carefully before creating an account and using Our Service.</p>
          
          <ol className="list-decimal list-inside space-y-4">
            <li><strong>Eligibility:</strong> You must be at least 18 years of age.</li>
            <li><strong>Account Responsibility:</strong> You are responsible for safeguarding your password.</li>
            <li><strong>User Content:</strong> You are responsible for the content you post.</li>
            <li><strong>Prohibited Conduct:</strong> Do not use the service for any unlawful purpose.</li>
            <li><strong>Termination:</strong> We may terminate your account if you breach the Terms.</li>
            <li><strong>Changes to Terms:</strong> We reserve the right to modify these Terms at any time.</li>
          </ol>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 hover:bg-green-700"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
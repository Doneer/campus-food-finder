import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { GoogleSheetsAPI } from './GoogleSheetsAPI';

export const AdminPanel = () => {
  const { user } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadPendingSubmissions();
    }
  }, [user]);

  const loadPendingSubmissions = async () => {
    setLoading(true);
    try {
      const submissions = await GoogleSheetsAPI.getPendingSubmissions();
      setPendingSubmissions(submissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
    setLoading(false);
  };

  const handleApproval = async (submission, action) => {
	  try {
		console.log('=== Starting approval process ===');
		console.log('Submission:', submission);
		console.log('Action:', action);
		console.log('User email:', user.email);
		
		const result = await GoogleSheetsAPI.updateSubmissionStatus(
		  submission.id, 
		  action, 
		  user.email
		);
		
		console.log('=== API Response ===');
		console.log('Full result:', result);
		console.log('Result success:', result.success);
		console.log('Approved location:', result.approvedLocation);
		
		if (result.success) {
		  setPendingSubmissions(prev => 
			prev.filter(s => s.id !== submission.id)
		  );
		  
		  if (action === 'approved') {
			if (result.approvedLocation) {
			  console.log('=== Adding to main locations list ===');
			  console.log('Location to add:', result.approvedLocation);
			  
			  addToMainLocationsList(result.approvedLocation);
			} else {
			  console.error('=== NO APPROVED LOCATION IN RESULT ===');
			  alert(`✅ ${submission.name} has been approved, but location data is missing.`);
			}
		  } else {
			alert(`${submission.name} has been rejected.`);
		  }
		} else {
		  console.error('=== UPDATE FAILED ===');
		  console.error('Error:', result.error);
		  alert(`Error: ${result.error || 'Unknown error occurred'}`);
		  loadPendingSubmissions();
		}
	  } catch (error) {
		console.error('=== EXCEPTION IN APPROVAL ===');
		console.error('Error:', error);
		alert('Error processing request. Please try refreshing the page.');
		loadPendingSubmissions();
	  }
	};

	const addToMainLocationsList = (newLocation) => {
	  console.log('=== Dispatching newLocationApproved event ===');
	  console.log('Event data:', newLocation);
	  
	  const event = new CustomEvent('newLocationApproved', {
		detail: newLocation
	  });
	  
	  console.log('Event created:', event);
	  window.dispatchEvent(event);
	  console.log('Event dispatched successfully');
	};

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Admin Panel - Location Moderation</h3>
        <button
          onClick={loadPendingSubmissions}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending submissions to review
            </div>
          ) : (
            pendingSubmissions.map(submission => (
              <div key={submission.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{submission.name}</h4>
                    <p className="text-sm text-gray-600">{submission.address}</p>
                    <p className="text-sm text-gray-500 mt-1">{submission.recommendation}</p>
                    
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {submission.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        {submission.priceRange}
                      </span>
                      {submission.dietary && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {submission.dietary}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                        {submission.mealTimes}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <p><strong>Recommended:</strong> {submission.recommendedDish}</p>
                      <p><strong>Student Discount:</strong> {submission.studentDiscount}</p>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted by: {submission.submittedBy} • {new Date(submission.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproval(submission, 'approved')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(submission, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
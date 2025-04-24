import  { useState, useEffect } from 'react';
import React  from 'react';
import axios from 'axios';
import { User } from 'lucide-react'; // Assuming you're using lucide-react for icons

const Network = () => {
  const [networkData, setNetworkData] = useState(null);
  const [filter, setFilter] = useState(""); // Filter state to switch between Alumni and Students
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch network data from the backend when the component mounts
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        console.log("Fetching network data...");
        const response = await axios.get('http://localhost:8080/api/network');
        if (response.status === 200) {
          console.log("Network data fetched successfully:", response.data);
          setNetworkData(response.data); // Save the response data
        } else {
          throw new Error('Unexpected response status: ' + response.status);
        }
      } catch (err) {
        console.error("Error fetching network data:", err);
        setError('Error fetching network data');
      } finally {
        setLoading(false); // Stop loading state after the fetch is complete
      }
    };
    

    fetchNetworkData();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Check if alumni or students data exists and is an array
  const alumniData = Array.isArray(networkData?.alumni) ? networkData.alumni : [];
  const studentsData = Array.isArray(networkData?.students) ? networkData.students : [];

  const filteredData = filter
    ? filter === "alumni" ? alumniData : studentsData
    : [...alumniData, ...studentsData]; // Show both Alumni and Students when no filter is selected

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold text-primary">Network</h1>
        <div className="space-x-4">
          <button
            className={`py-2 px-4 rounded-lg ${!filter ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setFilter("")}
          >
            All
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${filter === "alumni" ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setFilter("alumni")}
          >
            Alumni
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${filter === "students" ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setFilter("students")}
          >
            Students
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((person, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 border border-gray-200 hover:shadow-lg">
            <div className="flex-shrink-0">
              {/* User icon for each person */}
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{person.name}</h2>
              <p className="text-gray-600">{person.field}</p>
              <p className="text-sm text-gray-500">{person.graduationYear}</p>
              {person.position && (
                <p className="text-sm text-gray-500 font-medium">{person.position}</p>
              )}
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm mt-2 inline-block"
              >
                View LinkedIn
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Network;

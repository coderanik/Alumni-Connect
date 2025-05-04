import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { User } from "lucide-react";

const USERS_PER_PAGE = 6;

const Network = () => {
  const [networkData, setNetworkData] = useState(null);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState({});
  const authUserId = localStorage.getItem("userId");

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/network");
      
      if (response.status === 200) {
        console.log("Network data received:", response.data);
        setNetworkData(response.data);
        
        // Set the initial follow state based on the followers array
        if (authUserId) {
          const allUsers = [
            ...(response.data.alumni || []),
            ...(response.data.students || []),
          ];
          
          console.log("All users data:", allUsers);
          
          const initialFollowState = {};
          allUsers.forEach((person) => {
            initialFollowState[person._id] = Array.isArray(person.followers) && 
                                           person.followers.includes(authUserId);
          });
          
          setFollowing(initialFollowState);
        }
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Error fetching network data:", err);
      setError(err.response?.data?.error || "Error fetching network data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const alumniData = Array.isArray(networkData?.alumni)
    ? networkData.alumni.map((a) => {
        console.log("Alumni data:", a);
        return { ...a, type: "alumni" };
      })
    : [];
  const studentsData = Array.isArray(networkData?.students)
    ? networkData.students.map((s) => {
        console.log("Student data:", s);
        return { ...s, type: "student" };
      })
    : [];

  const allData = [...alumniData, ...studentsData];
  const filteredData = filter
    ? filter === "alumni"
      ? alumniData
      : studentsData
    : allData;

  const searchedData = filteredData.filter((person) =>
    `${person.name} ${person.field || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const paginatedData = searchedData.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(searchedData.length / USERS_PER_PAGE);

  const toggleFollow = async (id, personType) => {
    if (!authUserId) {
      setError("You must be logged in to follow users");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Prevent users from following themselves
    if (id === authUserId) {
      setError("You cannot follow yourself");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      console.log("Toggle follow params:", { id, personType, authUserId });
      console.log("Auth token:", localStorage.getItem('token'));
      
      // Set loading state for this specific button
      setFollowLoading(prev => ({ ...prev, [id]: true }));
      
      const isFollowing = following[id];
      const isAlumni = personType === "alumni";
      
      // Using the correct endpoint based on user type
      let url;
      if (isFollowing) {
        url = isAlumni 
          ? `/api/follow/${authUserId}/unfollow/alumni/${id}`
          : `/api/follow/${authUserId}/unfollow/user/${id}`;
      } else {
        url = isAlumni 
          ? `/api/follow/${authUserId}/follow/alumni/${id}`
          : `/api/follow/${authUserId}/follow/user/${id}`;
      }

      console.log("Making request to URL:", url);
      console.log("Request headers:", {
        ...axios.defaults.headers,
        Authorization: `Bearer ${localStorage.getItem('token')}`
      });

      const response = await axios.post(url);
      
      if (response.status === 200) {
        // Update local state
        setFollowing(prev => ({ ...prev, [id]: !isFollowing }));
        
        // Show success message
        const actionText = isFollowing ? "unfollowed" : "followed";
        setError(`Successfully ${actionText} this person`);
        setTimeout(() => setError(null), 2000);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      console.error("Error response:", error.response);
      console.error("Error config:", error.config);
      setError(error.response?.data?.message || "Error updating follow status");
      setTimeout(() => setError(null), 3000);
    } finally {
      // Clear loading state for this button
      setFollowLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const displaySuccessMessage = (message) => {
    return (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
        {message}
      </div>
    );
  };

  const displayErrorMessage = (message) => {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
        {message}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-primary">Network</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or field..."
              className="border px-4 py-2 rounded-lg shadow-sm w-full md:w-64"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="flex space-x-2 w-full md:w-auto justify-center">
              {["", "alumni", "students"].map((type) => (
                <button
                  key={type || "all"}
                  className={`py-2 px-4 rounded-lg transition-colors ${
                    filter === type || (!filter && type === "")
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    setFilter(type);
                    setCurrentPage(1);
                  }}
                >
                  {type ? type[0].toUpperCase() + type.slice(1) : "All"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          error.includes("Success") 
            ? displaySuccessMessage(error)
            : displayErrorMessage(error)
        )}

        {paginatedData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No results found. Try adjusting your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((person) => (
              <div
                key={person._id}
                className="bg-white shadow-md rounded-lg p-6 flex flex-col border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                      {person.name}
                    </h2>
                    <div className="flex items-center text-sm">
                      <span className={`px-2 py-1 rounded ${
                        person.type === "alumni" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {person.type === "alumni" ? "Alumni" : "Student"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 text-gray-600">
                  {person.field && (
                    <p>
                      <span className="font-medium">Field:</span> {person.field}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Graduation:</span>{" "}
                    {person.graduationYear || "N/A"}
                  </p>
                  {person.position && (
                    <p>
                      <span className="font-medium">Position:</span> {person.position}
                    </p>
                  )}
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                  {person.linkedin ? (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      LinkedIn Profile
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">No LinkedIn</span>
                  )}
                  
                  <button
                    onClick={() => toggleFollow(person._id, person.type)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      following[person._id]
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                    disabled={followLoading[person._id]}
                  >
                    {followLoading[person._id] ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </span>
                    ) : (
                      following[person._id] ? "Unfollow" : "Follow"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Improved Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === i + 1
                      ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  } text-sm font-medium`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;
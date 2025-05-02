import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import EventsList from "../components/EventsList";
import Card from "../components/Card";
import ScheduleEventForm from "../components/ScheduleEvent";
import HostMentorshipForm from "../components/HostMentorship";
import JobOpeningsForm from "../components/JobOpenings";
import { Search } from "lucide-react";
import { assets } from "../assets/assets";
import Network from "../components/Network";
import OpenSource from "../components/OpenSource";
import Messages from "../components/Message";
import EditProfilePopup from "../components/EditProfilePopup";
import Forum from "../components/Forum/Forum";

function Dashboard() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeCard, setActiveCard] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    const photo = localStorage.getItem("profilePhoto");
    if (user) {
      setLoggedInUser(user);
    }
    if (photo) {
      setProfilePhoto(photo);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("profilePhoto");
    alert("Logged out successfully");
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const currentDate = new Date().toLocaleDateString();

  const handleCardClick = (title) => {
    setActiveCard(title);
    if (title === "Events") {
      setActiveSection("events");
    }
    if (title === "Network") {
      setActiveSection("network");
    }
    if (title === "Open Source") {
      setActiveSection("open-source");
    }
    if (title === "Forum") {
      setActiveSection("forum");
    }
  };

  const handleCancelForm = () => {
    setActiveCard("");
  };

  // Render content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <Card
              title="Schedule an Event"
              description="Organize and promote alumni events."
              icon={assets.Calender}
              onClick={() => handleCardClick("Schedule an Event")}
            />
            <Card
              title="Host a Mentorship"
              description="Offer your expertise to students and fellow alumni."
              icon={assets.ShakeHand}
              onClick={() => handleCardClick("Host a Mentorship")}
            />
            <Card
              title="Job Openings"
              description="Share opportunities with alumni."
              icon={assets.Money}
              onClick={() => handleCardClick("Job Openings")}
            />
           
          </div>
        );
      case "events":
        return <EventsList />;
      case "network":
        return <Network />;
      case "open-source":
        return <OpenSource />;
      case "messages":
        return <Messages loggedInUser={loggedInUser} />;
      case "forum":
        return <Forum />;
      default:
        return <div>Default content</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#EDF0F7]">
      {/* Sidebar */}
      <Sidebar setActiveSection={setActiveSection} activeSection={activeSection} />

      {/* Main content area with proper spacing for the sidebar */}
      <div className="flex-1 ml-56 p-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-outfit font-bold text-secondary typewriter">
              Welcome, {loggedInUser}
            </h1>
            <p className="text-[#023074cd]">{currentDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 w-full border border-gray-300 rounded-lg pl-10 focus:outline-none focus:border-[#023074a0]"
              />
              <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            </div>
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setIsEditProfileOpen(true)}
              />
            ) : (
              <img
                src={assets.Profile}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setIsEditProfileOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Render the main content based on active section */}
        {renderContent()}

        {/* Conditionally render the selected form below the cards */}
        <div className="mt-8">
          {activeCard === "Schedule an Event" && (
            <ScheduleEventForm onCancel={handleCancelForm} />
          )}
          {activeCard === "Host a Mentorship" && (
            <HostMentorshipForm onCancel={handleCancelForm} />
          )}
          {activeCard === "Job Openings" && (
            <JobOpeningsForm onCancel={handleCancelForm} />
          )}
        </div>
      </div>

      {/* Render the EditProfilePopup if open */}
      {isEditProfileOpen && <EditProfilePopup onClose={() => setIsEditProfileOpen(false)} />}
    </div>
  );
}

export default Dashboard;
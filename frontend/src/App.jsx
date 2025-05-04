import { Route, Routes } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import RoleSelection from './pages/RoleSelection';
import StudentReg from './pages/StudentReg';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard';
import SupportUs from './components/SupportUs';
import AlumniReg from './pages/AlumniReg';
import Features from './components/Features';
import AdminPanel from './components/AdminPanel/AdminPanel';
import { SocketProvider } from './context/SocketContext';
import Network from './components/Network';
import Messages from './components/Message';
import { AuthProvider } from './context/AuthContext';
import Forum from './components/Forum/Forum';

function App() {
  return (
    <div className="font-outfit overflow-hidden">
      <ToastContainer />
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/features" element={<Features />} />
              <Route path="/roleselection" element={<RoleSelection />} />
              <Route path="/student-register" element={<StudentReg />} />
              <Route path="/alumni-register" element={<AlumniReg />} />
            </Route>
            <Route path="/dashboard" element={<Dashboard />}/>
            <Route path="/messages" element={<Messages />} />
            <Route path="/supportus" element={<SupportUs />} />
            <Route path="/network" element={<Network />} />
            <Route path="/forum" element={<Forum />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;

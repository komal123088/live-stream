import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext";

import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Home from "./pages/Home";
import ProfileDetail from "./pages/ProfileDetail";
import Matches from "./pages/Matches";
import ChatList from "./pages/ChatList";
import LiveList from "./pages/LiveList";
import LiveRoom from "./pages/LiveRoom";
import VIP from "./pages/VIP";
import ChatRoom from "./pages/ChatRoom";
import TopNav from "./components/TopNav";
import BottomNav from "./components/BottomNav";
import OtherProfile from "./pages/OtherProfile";

// NEW IMPORTS for notifications
import { useEffect } from "react";
import { setupNewMessageNotifications } from "./services/notificationService";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner"></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner"></div>;

  const allowedPaths = ["/register", "/profile-setup", "/login"];

  if (user && !allowedPaths.includes(window.location.pathname)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function AppContent() {
  const { user: currentUser, loading } = useAuth();

  // Request notification permission & setup real-time notifications
  useEffect(() => {
    if (loading || !currentUser?.uid) return;

    // 1. Request browser notification permission
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted");
          } else {
            console.log("Notification permission denied");
          }
        });
      }
    }

    // 2. Setup real-time new message notifications
    const unsubscribe = setupNewMessageNotifications(currentUser.uid);

    // Cleanup on unmount or logout
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid, loading]);

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Splash />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* Protected */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <TopNav />
              <Home />
              <BottomNav active="home" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <TopNav />
              <ProfileDetail />
              <BottomNav active="profile" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/other-profile/:id"
          element={
            <ProtectedRoute>
              <TopNav />
              <OtherProfile />
              <BottomNav active="profile" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <TopNav />
              <Matches />
              <BottomNav active="matches" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <TopNav />
              <ChatList />
              <BottomNav active="messages" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <TopNav />
              <ChatRoom />
              <BottomNav active="chat" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <TopNav />
              <LiveList />
              <BottomNav active="live" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live/:uid"
          element={
            <ProtectedRoute>
              <TopNav />
              <LiveRoom />
              <BottomNav active="live" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vip"
          element={
            <ProtectedRoute>
              <TopNav />
              <VIP />
              <BottomNav active="vip" userUid={currentUser?.uid} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

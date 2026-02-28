import Home from "./components/Home";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login";
import Main from "./components/pages/Main";
import ProtectedRoute from "./components/ProtectedRoute";
import Registration from "./components/pages/Registration";
import Profile from "./components/pages/Profile";
import ShareCard from "./components/pages/ShareCard";
import DashboardPage from "./components/pages/Dashboard";
import "./index.scss";
import { Toaster } from "./components/ui/toaster";
import { useSelector } from "react-redux";

function App() {
  const user = useSelector((state) => state.user.user);
  const documents = useSelector((state) => state.documents?.items || []);

  return (
    <div className="App">
      <Toaster />
      <Header />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        <Route path="/share/doc/:id" element={<ShareCard />} />

        {/* 2. Добавляем маршрут для Дашборда */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage user={user} documents={documents} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

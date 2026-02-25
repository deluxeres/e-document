import Home from "./components/Home";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login";
import Main from "./components/pages/Main";
import ProtectedRoute from "./components/ProtectedRoute";
import Registration from "./components/pages/Registration";
import Profile from "./components/pages/Profile"; // 1. Импортируем профиль
import "./index.scss";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <Toaster />
      <Header />

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

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

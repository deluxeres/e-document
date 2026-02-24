import Home from './components/Home'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Login from './components/pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Registration from './components/pages/Registration';
import './index.scss'
import {Toaster} from "./components/ui/toaster";

function App() {
    return (
        <div className="App">
            <Toaster />
            <Header />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }/>
                <Route path="/register" element={<Registration />} />
            </Routes>
        </div>
    );
}

export default App;
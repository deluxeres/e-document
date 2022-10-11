import Home from './components/Home'
import Header from './components/Header'
import {Routes, Route, Link} from 'react-router-dom'
import Login from './components/pages/Login'
import Admin from "./components/pages/Admin/Admin"
import Video from './components/Video'
import './index.scss'
import Welcome from './components/pages/Welcome/Welcome'

function App() {
  return (
    <div className="App">
        <Header />
        <Routes>
          <Route path="/home" element={<Home />} />
        </Routes>
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
        <Routes>
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Routes>
          <Route path="/video" element={<Video />} />
        </Routes>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
    </div>
  );
}

export default App

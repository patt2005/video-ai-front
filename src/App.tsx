import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';

import Image from './Pages/Image/Image';
import Explore from './Pages/Explore/Explore';
import Video from './Pages/Video/Video';
import Edit from './Pages/Edit/Edit';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import Admin from './Pages/Admin/Admin';
import Profile from './Pages/Profile/Profile';
import Pricing from './Pages/Pricing/Pricing';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app-shell">
                <Header />
                <main className="page-content">
                    <Routes>
                        <Route path="/" element={<Explore />} />
                        <Route path="/image" element={<Image />} />
                        <Route path="/video" element={<Video />} />
                        <Route path="/edit" element={<Edit />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/pricing" element={<Pricing />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
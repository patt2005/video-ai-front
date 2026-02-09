import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './layouts/Header.tsx';

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
import { paths } from './routes/paths.ts';

function AppLayout() {
    const location = useLocation();
    const isVideoPage = location.pathname === paths.video;

    return (
        <>
            <Toaster position="top-center" richColors closeButton />
            <div className="app-shell">
                <Header />
                <main className={`page-content ${isVideoPage ? 'page-content--video' : ''}`}>
                    <Routes>
                        <Route path={paths.root} element={<Explore />} />
                        <Route path={paths.image} element={<Image />} />
                        <Route path={paths.video} element={<Video />} />
                        <Route path={paths.edit} element={<Edit />} />
                        <Route path={paths.login} element={<Login />} />
                        <Route path={paths.signup} element={<Signup />} />
                        <Route path={paths.admin} element={<Admin />} />
                        <Route path={paths.profile} element={<Profile />} />
                        <Route path={paths.pricing} element={<Pricing />} />
                    </Routes>
                </main>
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;

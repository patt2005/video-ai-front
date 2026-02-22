import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './layouts/header';
import Footer from './layouts/footer';
import Image from './pages/image/image';
import Explore from './pages/explore/explore';
import Video from './pages/video/video';
import Edit from './pages/edit/edit';
import Login from './pages/login/login';
import Admin from './pages/admin/admin';
import Profile from './pages/profile/profile';
import Pricing from './pages/pricing/pricing';
import './app.css';
import './styles/header.css';
import { paths } from './routes/paths';

function AppLayout() {
    const location = useLocation();
    const isVideoPage = location.pathname === paths.video || location.pathname === paths.root;

    return (
        <>
            <Toaster position="top-center" richColors closeButton />
            <div className="app-shell">
                <Header />
                <main className={`page-content ${isVideoPage ? 'page-content--video' : ''}`}>
                    <Routes>
                        <Route path={paths.root} element={<Explore />} />
                        <Route path={paths.login} element={<Login />} />
                        <Route path={paths.signup} element={<Login />} />
                        <Route path={paths.pricing} element={<Pricing />} />
                        <Route path={paths.image} element={<Image />} />
                        <Route path={paths.video} element={<Video />} />
                        <Route path={paths.edit} element={<Edit />} />
                        <Route path={paths.profile} element={<Profile />} />
                        <Route path={paths.admin} element={<Admin />} />
                    </Routes>
                </main>
                <Footer />
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

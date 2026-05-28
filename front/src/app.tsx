import {BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation} from 'react-router-dom';
import {Toaster} from 'sonner';
import Header from './layouts/header.tsx';
import Footer from './layouts/footer.tsx';
import {useAuth} from './contexts/authContext.tsx';
import Image from './pages/image/image';
import Explore from './pages/explore/explore';
import Video from './pages/video/video';
import Edit from './pages/edit/edit';
import Login from './pages/login/login';
import SignUp from './pages/login/signup';
import VerifyEmail from './pages/verify/verifyEmail';
import ForgotPassword from './pages/forgot-password/forgotPassword';
import ResetPassword from './pages/forgot-password/resetPassword';
import Admin from './pages/admin/admin';
import SupportInbox from './pages/admin/supportInbox';
import SupportFab from './components/SupportFab';
import Profile from './pages/profile/profile';
import PublicProfile from './pages/profile/publicProfile';
import Pricing from './pages/pricing/pricing';
import './App.css';
import {paths} from './routes/paths.ts';
import {UserRole} from "./types/user/user.ts";

function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
    const { isLoggedIn, user } = useAuth();

    if (!isLoggedIn) return <Navigate to={paths.login} replace />;

    if (roles && (!user || !roles.includes(user.role))) {
        return <Navigate to={paths.root} replace />;
    }

    return <Outlet />;
}

function RootRoute() {
    const { user } = useAuth();
    return user?.role === UserRole.Admin ? <Admin /> : <Explore />;
}

function AppLayout() {
    const location = useLocation();
    const isVideoPage = location.pathname === paths.video || location.pathname === paths.root;
    const isPricingPage = location.pathname === paths.pricing;

    return (
        <>
            <Toaster position="top-center" richColors closeButton />
            <div className="app-shell">
                <Header />
                <div className="main-area">
                <main className={`page-content ${isVideoPage ? 'page-content--video' : ''} ${isPricingPage ? 'page-content--pricing' : ''}`}>
                    {/*<HealthCheck />*/}
                    <Routes>
                        <Route path={paths.login} element={<Login />} />
                        <Route path={paths.signup} element={<SignUp />} />
                        <Route path={paths.verifyEmail} element={<VerifyEmail />} />
                        <Route path={paths.forgotPassword} element={<ForgotPassword />} />
                        <Route path={paths.resetPassword} element={<ResetPassword />} />
                        <Route path={paths.pricing} element={<Pricing />} />

                        <Route path={paths.root} element={<RootRoute />} />
                        <Route path={paths.image} element={<Image />} />
                        <Route path={paths.video} element={<Video />} />
                        <Route path={paths.edit} element={<Edit />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path={paths.profile} element={<Profile />} />
                            <Route path={paths.publicProfile} element={<PublicProfile />} />
                        </Route>

                        <Route element={<ProtectedRoute roles={[UserRole.Admin]} />}>
                            <Route path={paths.admin} element={<Admin />} />
                            <Route path={paths.adminSupport} element={<SupportInbox />} />
                        </Route>
                    </Routes>
                </main>
                </div>
                <Footer />
            </div>
            <SupportFab />
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

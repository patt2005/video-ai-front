import {BrowserRouter as Router, Navigate, Route, Routes, useLocation} from 'react-router-dom';
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
import Admin from './pages/admin/admin';
import Profile from './pages/profile/profile';
import Pricing from './pages/pricing/pricing';
import './App.css';
import {paths} from './routes/paths.ts';
import {UserRole} from "./types/user/user.ts";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) return <Navigate to={paths.login} replace />;
    return <>{children}</>;
}

function RootRoute() {
    const { user } = useAuth();
    return user?.role === UserRole.Admin ? <Admin /> : <Explore />;
}

function AppLayout() {
    const location = useLocation();
    const isVideoPage = location.pathname === paths.video || location.pathname === paths.root;

    return (
        <>
            <Toaster position="top-center" richColors closeButton />
            <div className="app-shell">
                <Header />
                <div className="main-area">
                <main className={`page-content ${isVideoPage ? 'page-content--video' : ''}`}>
                    <Routes>
                        <Route
                            path={paths.root}
                            element={
                                <ProtectedRoute>
                                    <RootRoute />
                                </ProtectedRoute>
                            }
                        />
                        <Route path={paths.login} element={<Login />} />
                        <Route path={paths.signup} element={<SignUp />} />
                        <Route path={paths.pricing} element={<Pricing />} />
                        <Route
                            path={paths.image}
                            element={
                                <ProtectedRoute>
                                    <Image />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={paths.video}
                            element={
                                <ProtectedRoute>
                                    <Video />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={paths.edit}
                            element={
                                <ProtectedRoute>
                                    <Edit />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={paths.profile}
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={paths.admin}
                            element={
                                <ProtectedRoute>
                                    <Admin />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                </div>
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

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './layouts/header.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import Image from './Pages/Image/Image';
import Explore from './Pages/Explore/Explore';
import Video from './Pages/Video/Video';
import Edit from './Pages/Edit/Edit';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/Admin';
import Profile from './Pages/Profile/Profile';
import Pricing from './Pages/Pricing/Pricing';
import './App.css';
import { paths } from './routes/paths.ts';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) return <Navigate to={paths.login} replace />;
    return <>{children}</>;
}

function RootRoute() {
    const { user } = useAuth();
    return user?.role === 'admin' ? <Admin /> : <Explore />;
}

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
                        <Route
                            path={paths.root}
                            element={
                                <ProtectedRoute>
                                    <RootRoute />
                                </ProtectedRoute>
                            }
                        />
                        <Route path={paths.login} element={<Login />} />
                        <Route path={paths.signup} element={<Login />} />
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

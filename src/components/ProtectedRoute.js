import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { user, token } = useSelector((state) => state.user);

    if (!user || !token) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

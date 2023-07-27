import './style.css';
import { Navigate } from "react-router-dom"

function Logout() {
    if (window.sessionStorage.getItem("access-token")){
        window.sessionStorage.removeItem("access-token");
        // clear cookies
        document.cookie = "refresh=";
        document.cookie = "access=";
    }

    return (
        <Navigate to='/' />
    );
  }
  
export default Logout;
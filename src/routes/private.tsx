import { ReactNode, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Navigate } from "react-router";

interface PrivateProps {
  children: ReactNode
}

export function Private( {children}: PrivateProps ) {
  const { signed, loadingAuth } = useContext(AuthContext);

  if(loadingAuth) {
    return <div></div>
  }

  if(!signed) {
    return <Navigate to="/login"/>
  }
  return children
}
import { ReactNode, createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase/firebaseConnection";
interface AuthContextData {
  signed: boolean;
  loadingAuth: boolean;
  handleInfoUser: ({name, email, uid}: UserProps) => void;
  user: UserProps | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}
export const AuthContext = createContext({} as AuthContextData)


function AuthProvider({ children}: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  useEffect(() => {

    const unSub = onAuthStateChanged(auth, (user) => {
      if(user) {
        setUser({
          uid: user.uid,
          name: user?.displayName,
          email: user?.email,
        })

        setLoadingAuth(false)
      }else {
        setUser(null)
        setLoadingAuth(false)
      }
    })

    return () => {
      unSub();
    }

  }, [])


  function handleInfoUser({ uid, name, email }: UserProps) {
    setUser({
      uid,
      name,
      email
    })
  }

  return (
    <AuthContext.Provider 
      value={{ 
        signed: !!user,
        loadingAuth,
        handleInfoUser,
        user
      }}
      >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
import { FiUser, FiLogIn} from 'react-icons/fi'
import { Link } from 'react-router'
import logoImg from '../../assets/logo.svg';
import { AuthContext } from "../../context/authContext"
import { useContext } from 'react';
export function Header() {

  const {signed, loadingAuth} = useContext(AuthContext)

  return (
    <div className="w-full items-center bg-white h-14 mb-4">
      <header className="flex items-center justify-around">
        <Link to="/">
          <img src={logoImg} alt="logo" />
        </Link>

        <div>
            {!loadingAuth && signed && (
            <Link to="login">
              <div className="border-1 rounded-full p-1">
                <FiUser size={24} color="#000000"/>
              </div>
            </Link>
            )
          }

          {!loadingAuth && !signed && (
            <Link to="login">
              <FiLogIn size={24} color="#000000"/>
            </Link>
            )
          }
        </div>
      </header>
    </div>
  )
}
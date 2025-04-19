import { signOut } from "firebase/auth";
import { Link } from "react-router";
import { auth } from "../../services/firebase/firebaseConnection";
import { Container } from "../container";

export function DashboardHeader() {
  async function handleLogout() {
    await signOut(auth)
  }
  return (
    <Container>
      <div className="flex text-sm md:text-base items-center gap-4 w-full bg-red-600 py-1 px-2 text-white font-medium mb-4 rounded-md h-8">
        <Link to="/dashboard">
          dashboard
        </Link>

        <Link to="/dashboard/new">
          adicioanar carro
        </Link> 

        <button className="ml-auto cursor-pointer" onClick={handleLogout}>
          sair da conta
        </button>
      </div>
    </Container>

  )
}
import { Outlet } from "react-router";
import { Header } from "../header";


export function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
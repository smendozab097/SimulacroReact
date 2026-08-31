import { Outlet } from "react-router"
import Navbar from "../components/Navbar"
import ErrorBoundary from "../components/ErrorBoundary"

const MainLayout = () => {
  return (
    <div className="w-full h-full bg-slate-50">
      <Navbar/>
      <ErrorBoundary>
        <Outlet/>
      </ErrorBoundary>
    </div>
  )
}

export default MainLayout
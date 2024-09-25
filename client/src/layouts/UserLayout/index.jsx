import Header from "./Header";
import { Outlet } from "react-router-dom";
function UserLayout() {
  return (
    <div className="flex flex-col min-h-[100vh]">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default UserLayout;

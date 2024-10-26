import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/route";

function Header() {

  return (
    <header className=" p-8 bg-[#f8f8f8] flex justify-between shadow ">
      <span className="font-bold">
        ASSIGN<span className="text-[#7367f0]">MENT</span>
      </span>
      <div className="flex gap-4">
        <Link to={ROUTES.ADMIN.STATEMENT}>Sao kê</Link>
        <Link to={ROUTES.ADMIN.STATISTICAL}>Thống kê</Link>
      </div>
    </header>
  );
}

export default Header;

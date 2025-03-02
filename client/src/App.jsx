import { Route, Routes } from "react-router-dom";

import Statement from "./pages/Statement";
import Statistical from "./pages/Statistical";
import UserLayout from "./layouts/UserLayout";
import { ROUTES } from "./constants/route";

function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path={ROUTES.ADMIN.STATEMENT} element={<Statement />} />
        <Route path={ROUTES.ADMIN.STATISTICAL} element={<Statistical />} />
      </Route>
    </Routes>
  );
}

export default App;

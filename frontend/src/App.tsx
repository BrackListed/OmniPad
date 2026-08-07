import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Intermission } from "./pages/Intermission";

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element={<Dashboard/>}></Route>
        <Route path = "/intermission" element={<Intermission/>}/>
      </Routes>
    </BrowserRouter>
  )
}
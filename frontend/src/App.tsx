import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Intermission } from "./pages/Intermission";
import { Calendar } from "./pages/Calendar";
import { StudyHub } from "./pages/StudyHub";
import { ReviewIntermission } from "./components/ui/studyhub/Reviewer/ReviewIntermission";
import { History } from "./pages/History";

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path = "/" element={<Dashboard/>}></Route>
        <Route path = "/intermission" element={<Intermission/>}/>
        <Route path = "/calendar" element={<Calendar/>}/>
        <Route path = "/study-hub" element={<StudyHub/>}/>
        <Route path = "/study-hub/:type/:fileId" element={<ReviewIntermission/>}/>
        <Route path = "/history" element={<History/>}/>
      </Routes>
    </BrowserRouter>
  )
}
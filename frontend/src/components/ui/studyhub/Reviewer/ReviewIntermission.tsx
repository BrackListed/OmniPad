import { useParams } from "react-router-dom";
import { SocraticComponent } from "./SocraticComponent";
import { FeynmanComponent } from "./FeynmanCompontent";
import { FlashcardsComponent } from "./FlashcardsComponent";
import { QuizComponent } from "./QuizComponent";

export function ReviewIntermission(){
    const { type, fileId } = useParams();
    return(
    <div>
        {type === 'Quiz' && <QuizComponent type={type} fileId={fileId} />}
        {type === 'Flashcards' && <FlashcardsComponent type={type} fileId={fileId} />}
        {type === 'Feynman' && <FeynmanComponent type={type} fileId={fileId} />}
        {type === 'Socratic' && <SocraticComponent type={type} fileId={fileId} />}
    </div>
    )
}
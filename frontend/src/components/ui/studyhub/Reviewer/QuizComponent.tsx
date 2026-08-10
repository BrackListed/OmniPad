interface QuizProps{
    type: string | undefined
    fileId: string | undefined
}

export function QuizComponent({type, fileId}: QuizProps){
    return(
        <div>{type} - {fileId}</div>
    )
}
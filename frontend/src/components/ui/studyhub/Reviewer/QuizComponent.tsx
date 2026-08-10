interface QuizProps{
    fileId: string | undefined
}

export function QuizComponent({fileId}: QuizProps){
    return(
        <div>Hello, Quiz! - {fileId }</div>
    )
}
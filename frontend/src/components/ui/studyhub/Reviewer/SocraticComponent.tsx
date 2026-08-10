interface socraticProps{
    fileId: string | undefined
}

export function SocraticComponent({fileId}: socraticProps){
    return(
        <div>Socratic - {fileId}</div>
    )
}
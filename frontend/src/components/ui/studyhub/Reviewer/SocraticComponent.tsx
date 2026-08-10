interface socraticProps{
    type: string | undefined
    fileId: string | undefined
}

export function SocraticComponent({type, fileId}: socraticProps){
    return(
        <div>{type} - {fileId}</div>
    )
}
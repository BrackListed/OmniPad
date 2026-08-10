interface FlashcardsProps{
    type: string | undefined
    fileId: string | undefined
}

export function FlashcardsComponent({type, fileId}: FlashcardsProps){
    return(
        <div>{type} - {fileId}</div>
    )
}
interface FeynmanProps{
    fileId: string | undefined
}

export function FeynmanComponent({fileId}: FeynmanProps){
    return(
        <div>Hello, Feynman! - {fileId}</div>
    )
}
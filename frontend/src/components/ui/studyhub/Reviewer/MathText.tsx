import { Fragment } from "react"
import { InlineMath } from "react-katex"
import "katex/dist/katex.min.css"

interface MathTextProps {
    text: string
    forceMath?: boolean
}

function normalizeMathExpression(input: string){
    return input
        .replace(/∑/g, "\\sum")
        .replace(/∞/g, "\\infty")
        .replace(/√/g, "\\sqrt")
        .replace(/π/g, "\\pi")
}

function looksLikeMath(input: string){
    return /\\[a-zA-Z]+|[_^{}]|∑|∞|√|π/.test(input)
}

export function MathText({ text, forceMath = false }: MathTextProps){
    if(forceMath || looksLikeMath(text)){
        return (
            <InlineMath
                math={normalizeMathExpression(text)}
                renderError={() => <span className="whitespace-pre-wrap">{text}</span>}
            />
        )
    }

    const parts: Array<{ type: "text" | "math"; value: string }> = []
    const mathPattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while((match = mathPattern.exec(text)) !== null){
        if(match.index > lastIndex){
            parts.push({ type: "text", value: text.slice(lastIndex, match.index) })
        }

        const token = match[0]
        if(token.startsWith("$$") && token.endsWith("$$")){
            parts.push({ type: "math", value: normalizeMathExpression(token.slice(2, -2).trim()) })
        }
        else{
            parts.push({ type: "math", value: normalizeMathExpression(token.slice(1, -1).trim()) })
        }

        lastIndex = match.index + token.length
    }

    if(lastIndex < text.length){
        parts.push({ type: "text", value: text.slice(lastIndex) })
    }

    return(
        <>
            {parts.map((part, index) => (
                <Fragment key={`${part.type}-${index}`}>
                    {part.type === "math"
                        ? <InlineMath math={part.value} renderError={() => <span className="whitespace-pre-wrap">{part.value}</span>} />
                        : <span className="whitespace-pre-wrap">{part.value}</span>}
                </Fragment>
            ))}
        </>
    )
}

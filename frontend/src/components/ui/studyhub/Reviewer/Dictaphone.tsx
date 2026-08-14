import { useEffect, useRef } from "react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import { Mic, MicOff } from "lucide-react"

interface DictaphoneProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function Dictaphone({ value, onChange, placeholder }: DictaphoneProps) {
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
    const baseTextRef = useRef("")

    useEffect(() => {
        if (!listening) return
        const separator = baseTextRef.current && transcript ? " " : ""
        onChange(baseTextRef.current + separator + transcript)
    }, [transcript, listening, onChange])

    function startListening() {
        baseTextRef.current = value
        resetTranscript()
        SpeechRecognition.startListening({ continuous: true })
    }

    return (
        <div>
            <textarea
                value={value}
                onChange={(event) => { if (!listening) onChange(event.target.value) }}
                readOnly={listening}
                placeholder={placeholder}
                className="min-h-72 w-full rounded-2xl border border-white/10 bg-[#0f0f17] px-4 py-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-400"
            />

            <div className="mt-3 flex items-center gap-3">
                {browserSupportsSpeechRecognition ? (
                    <button
                        type="button"
                        onClick={listening ? SpeechRecognition.stopListening : startListening}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                            listening
                                ? "border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25"
                                : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        }`}
                    >
                        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {listening ? "Stop" : "Speak Answer"}
                    </button>
                ) : (
                    <p className="text-xs text-zinc-500">Speech recognition isn't supported in this browser.</p>
                )}

                {listening && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-red-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                        Listening...
                    </span>
                )}
            </div>
        </div>
    )
}

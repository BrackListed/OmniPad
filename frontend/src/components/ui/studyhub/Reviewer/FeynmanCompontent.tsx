import { useAuth } from "@clerk/react"
import axios from "axios"
import { useEffect, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { LeftSidebar } from "../../dashboard/LeftSidebar"
import { MathText } from "./MathText"
import { Dictaphone } from "./Dictaphone"

interface FeynmanProps{
    type: string | undefined
    fileId: string | undefined
}

interface questionsType{
    id: number
    concept: string
    question?: string
    prompt?: string
}

interface payloadType{
    title: string
    type: string
    questions: questionsType[]
}
export function FeynmanComponent({type, fileId}: FeynmanProps){
    const {getToken, userId}  = useAuth()
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<payloadType | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answer, setAnswer] = useState("")
    useEffect(() => {
        if(!userId || !type || !fileId) return

        const fetchSessionData = async() => {
            try{
                const token = await getToken()
                const result = await axios.get(`http://localhost:5000/session/${userId}/${type}/${fileId}`, {headers: {Authorization: `Bearer ${token}`}})
                const payload = result?.data?.[0]?.payload ?? result?.data?.payload ?? result?.data
                setSession(payload)
                console.log(payload)
            }
            catch(error){
                console.error("Failed to fetch Feynman session", error)
            }
            finally{
                setLoading(false)
            }
        }

        fetchSessionData()
    }, [userId, type, fileId, getToken])

    if(loading){
        return(
            <div className="flex min-h-screen bg-[#0b0b12]">
                <LeftSidebar />
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-400" strokeWidth={2} />
                    <p className="text-sm text-zinc-400">Loading...</p>
                </div>
            </div>
        )
    }

    const questions = session?.questions ?? []
    const currentQuestion = questions[currentQuestionIndex]
    const totalQuestions = questions.length
    const hasAnswer = answer.trim().length > 0

    return(
        <div className="relative flex min-h-screen overflow-hidden bg-[#0b0b12]">
            <LeftSidebar />

            <main className="relative z-10 flex flex-1 flex-col p-8">
                <section className="rounded-3xl border border-violet-500/20 bg-[#11111a]/90 p-6 shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)] backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white">Feynman Reviewer</h1>
                            <p className="mt-1 text-sm text-zinc-400">Module: {session?.title ?? "Untitled"}</p>
                        </div>

                        <div className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                            {type}
                        </div>
                    </div>

                    <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-violet-400 transition-all"
                            style={{ width: `${totalQuestions ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0}%` }}
                        />
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                        Question {totalQuestions ? currentQuestionIndex + 1 : 0} of {totalQuestions}
                    </p>
                </section>

                <section className="mt-6 rounded-3xl border border-violet-500/20 bg-[#141420]/95 p-6 shadow-[0_28px_60px_-40px_rgba(46,16,101,0.8)]">
                    {currentQuestion ? (
                        <>
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{currentQuestion.concept}</p>
                            <h2 className="mt-3 text-3xl font-medium leading-tight text-white">
                                <MathText text={currentQuestion.question ?? currentQuestion.prompt ?? "No question text"} />
                            </h2>

                            <div className="mt-6">
                                <Dictaphone
                                    value={answer}
                                    onChange={setAnswer}
                                    placeholder="Teach it in your own words..."
                                />
                            </div>

                            <div className="mt-6 flex items-center justify-end">
                                <button
                                    onClick={() => {
                                        if(hasAnswer){
                                            if(currentQuestionIndex < totalQuestions - 1){
                                                setCurrentQuestionIndex((previous) => previous + 1)
                                            }
                                            setAnswer("")
                                            return
                                        }

                                        if(currentQuestionIndex < totalQuestions - 1){
                                            setCurrentQuestionIndex((previous) => previous + 1)
                                            setAnswer("")
                                        }
                                    }}
                                    disabled={currentQuestionIndex >= totalQuestions - 1 && !hasAnswer}
                                    className="inline-flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {hasAnswer ? "Submit" : "Next"}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-400">No questions found for this session yet.</p>
                    )}
                </section>
            </main>
        </div>
    )
}

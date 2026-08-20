import { useAuth } from "@clerk/react"
import axios from "axios"
import { useEffect, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { LeftSidebar } from "../../dashboard/LeftSidebar"
import { MathText } from "./MathText"
import { useNavigate } from "react-router-dom"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import "@/tour/tour.css"
import { TOUR_STEPS, tourPageMatches, tourStartIndex, markTourStepReached, markModeVisited, isTourActive, deactivateTour, completeTour } from "@/tour/tourSteps"
import type { CustomTourStep } from "@/tour/tourSteps"

interface QuizProps{
    type: string | undefined
    fileId: string | undefined
}

interface questionsType{
    id: number
    concept?: string
    question?: string
    prompt?: string
    options?: string[]
    explanation?: string
    correctAnswer?: string
}

interface payloadType{
    title: string
    type: string
    questions: questionsType[]
}


export function QuizComponent({type, fileId}: QuizProps){
    const {userId, getToken} = useAuth()
    const navigate = useNavigate()
    const [session, setSession] = useState<payloadType | null>(null)
    const [loading, setLoading] = useState(true)
    const [showIntro, setShowIntro] = useState(true)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState("")
    const [correctCount, setCorrectCount] = useState(0)
    const [wrongIndices, setWrongIndices] = useState<number[]>([])
    const [showPreview, setShowPreview] = useState(false)
    const [sessionId, setSessionId] = useState("")
    const [passed, setPassed] = useState(false)
    const [savedScore, setSavedScore] = useState(0)
    useEffect(() => {
        if(!userId || !type || !fileId) return

        const fetchSessionData = async() => {
            try{
                const token = await getToken()
                const result = await axios.get(`http://localhost:5000/session/${userId}/${type}/${fileId}`, {headers: {Authorization: `Bearer ${token}`}})
                const payload = result?.data?.[0]?.payload ?? result?.data?.payload ?? result?.data
                setSession(payload)
                setSessionId(result.data[0].id)
                setPassed(result.data[0].passed)
                setSavedScore(result.data[0].score)
            }
            catch(error){
                console.error("Failed to fetch Quiz session", error)
            }
            finally{
                setLoading(false)
            }
        }

        fetchSessionData()
    }, [userId, type, fileId, getToken])

    useEffect(() => {
        if(!isTourActive()) return
        const driverObj = driver({
            showProgress: true,
            animate: true,
            popoverClass: "omnipad-tour",
            overlayColor: "#0b0b12",
            overlayOpacity: 0.75,
            steps: TOUR_STEPS as NonNullable<Parameters<typeof driver>[0]>["steps"],
            waitForElement: 3000,
            onHighlightStarted: (_element, step) => {
                const tourStep = step as CustomTourStep
                if(!tourStep.page.endsWith("/*") && !tourPageMatches(tourStep.page, location.pathname)){
                    navigate(tourStep.page)
                }
            },
            onNextClick: (_element, _step, opts) => {
                markTourStepReached(opts.index)
                const nextStep = opts.index !== undefined ? TOUR_STEPS[opts.index + 1] as CustomTourStep | undefined : undefined
                if(nextStep && !tourPageMatches(nextStep.page, location.pathname)){
                    return
                }
                driverObj.moveNext()
            },
            onCloseClick: () => {
                driverObj.destroy()
                deactivateTour()
                if(userId) getToken().then((token) => completeTour(userId, token))
            },
            onDoneClick: () => {
                driverObj.destroy()
                deactivateTour()
                if(userId) getToken().then((token) => completeTour(userId, token))
            }
        })
        markModeVisited("Quiz")
        const startIndex = tourStartIndex(location.pathname)
        driverObj.drive(startIndex === -1 ? 0 : startIndex)

        return () => driverObj.destroy()
    }, [])

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
    const hasSelection = selectedOption.trim().length > 0
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1

    if(passed){
        return(
            <div className="flex min-h-screen bg-[#0b0b12]">
                <LeftSidebar />
                <main className="flex flex-1 items-center justify-center p-8">
                    <section className="w-full max-w-2xl rounded-3xl border border-emerald-500/20 bg-[#11111a]/90 p-8 text-center shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Already Passed</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">You've already passed this session</h1>
                        <p className="mt-3 text-sm text-zinc-400">Your Score: {savedScore} / {totalQuestions}</p>

                        <button
                            onClick={() => setPassed(false)}
                            className="mt-8 rounded-xl border border-violet-400/35 bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                        >
                            Retry?
                        </button>
                    </section>
                </main>
            </div>
        )
    }

    if(showIntro){
        return(
            <div className="flex min-h-screen bg-[#0b0b12]">
                <LeftSidebar />
                <main className="flex flex-1 items-center justify-center p-8">
                    <section className="w-full max-w-2xl rounded-3xl border border-violet-500/20 bg-[#11111a]/90 p-8 text-center shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-violet-300">{session?.type ?? type}</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">Topic: {session?.title ?? "Untitled"}</h1>
                        <p className="mt-3 text-sm text-zinc-400">Multiple choice questions with 4 options each.</p>

                        <button
                            id="quiz-start"
                            onClick={() => setShowIntro(false)}
                            className="mt-8 rounded-xl border border-violet-400/35 bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                        >
                            Start Quiz
                        </button>
                    </section>
                </main>
            </div>
        )
    }

    if(showPreview){
        const wrongQuestions = wrongIndices.map((index) => questions[index]).filter(Boolean)

        return(
            <div className="flex min-h-screen bg-[#0b0b12]">
                <LeftSidebar />
                <main className="flex flex-1 items-center justify-center p-8">
                    <section className="w-full max-w-2xl rounded-3xl border border-violet-500/20 bg-[#11111a]/90 p-8 shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Results</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">You scored {correctCount} / {totalQuestions}</h1>

                        {wrongQuestions.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-medium text-zinc-300">Questions you got wrong:</p>
                                <ul className="mt-3 flex flex-col gap-2">
                                    {wrongQuestions.map((question) => (
                                        <li key={question.id} className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-zinc-200">
                                            <MathText text={question.question ?? question.prompt ?? ""} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-8 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setCurrentQuestionIndex(0)
                                    setSelectedOption("")
                                    setCorrectCount(0)
                                    setWrongIndices([])
                                    setShowPreview(false)
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => {saveScore(correctCount, wrongIndices, sessionId, userId)}}
                                className="rounded-xl border border-violet-400/35 bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                            >
                                Save to Database
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        )
    }

    return(
        <div className="relative flex min-h-screen overflow-hidden bg-[#0b0b12]">
            <LeftSidebar />

            <main className="relative z-10 flex flex-1 flex-col p-8">
                <section className="rounded-3xl border border-violet-500/20 bg-[#11111a]/90 p-6 shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)] backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white">Quiz Reviewer</h1>
                            <p className="mt-1 text-sm text-zinc-400">Topic: {session?.title ?? "Untitled"}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                Score: {correctCount}
                            </div>
                            <div className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                                {type}
                            </div>
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

                <section id="quiz-question" className="mt-6 rounded-3xl border border-violet-500/20 bg-[#141420]/95 p-6 shadow-[0_28px_60px_-40px_rgba(46,16,101,0.8)]">
                    {currentQuestion ? (
                        <>
                            {currentQuestion.concept && <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{currentQuestion.concept}</p>}
                            <h2 className="mt-3 text-3xl font-medium leading-tight text-white">
                                <MathText text={currentQuestion.question ?? currentQuestion.prompt ?? "No question text"} />
                            </h2>

                            <div className="mt-6 grid gap-3">
                                {(currentQuestion.options ?? []).map((option, index) => (
                                    <button
                                        key={`${currentQuestion.id}-option-${index}`}
                                        onClick={() => {setSelectedOption(option); console.log(currentQuestion)}}
                                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${selectedOption === option ? "border-violet-400 bg-violet-500/20 text-violet-100" : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"}`}
                                    >
                                        <MathText text={option} />
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 flex items-center justify-end">
                                <button
                                    onClick={() => {
                                        if(!hasSelection) return
                                        if(selectedOption === currentQuestion.correctAnswer){
                                            setCorrectCount((previous) => previous + 1)
                                        } else {
                                            setWrongIndices((prev) => [...prev, (Number(currentQuestion.id) - 1)])
                                        }
                                        if(currentQuestionIndex < totalQuestions - 1){
                                            setCurrentQuestionIndex((previous) => previous + 1)
                                            setSelectedOption("")
                                        }
                                        if(isLastQuestion){
                                            setShowPreview(true)
                                        }
                                    }}
                                    disabled={!hasSelection}
                                    className="inline-flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {isLastQuestion ? "Preview" : "Submit"}
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

    async function saveScore(score: number, wrong: number[], id: string, userId: string | null | undefined){
        const hasPassed = Math.round((score / totalQuestions) * 100) >= 80
        const token = await getToken()
        const result = await axios.patch(`http://localhost:5000/study-session/save/${userId}/${id}`, {score: score, wrong: wrong, passed: hasPassed}, {headers: {Authorization: `Bearer ${token}`}})
        console.log(result.status)
    }
}
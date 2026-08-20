import { useAuth } from "@clerk/react"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { LeftSidebar } from "../../dashboard/LeftSidebar"
import { MathText } from "./MathText"
import { Dictaphone } from "./Dictaphone"
import { useNavigate } from "react-router-dom"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import "@/tour/tour.css"
import { TOUR_STEPS, tourPageMatches, tourStartIndex, markTourStepReached, markModeVisited } from "@/tour/tourSteps"
import type { CustomTourStep } from "@/tour/tourSteps"

interface FeynmanProps{
    type: string | undefined
    fileId: string | undefined
}

interface questionsType{
    id: number
    concept: string
    question?: string
    prompt?: string
    referenceAnswer: string
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
    const [score, setScore] = useState(0)
    const [wrongExplanation, setWrongExplanation] = useState<string | null>(null)
    const [wrongIndices, setWrongIndices] = useState<number[] | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [sessionId, setSessionId] = useState("")
    const [passed, setPassed] = useState(false)
    const [alreadyAttempted, setAlreadyAttempted] = useState(false)
    const [retrying, setRetrying] = useState(false)
    const [attemptedTab, setAttemptedTab] = useState<"summary" | "wrong">("summary")
    const navigate = useNavigate()
    const hasFetchedRef = useRef(false)
    const driverRef = useRef<ReturnType<typeof driver> | null>(null)
    useEffect(() => {
        if(!userId || !type || !fileId) return
        if(hasFetchedRef.current) return
        hasFetchedRef.current = true

        const fetchSessionData = async() => {
            try{
                const token = await getToken()
                const result = await axios.get(`http://localhost:5000/session/${userId}/${type}/${fileId}`, {headers: {Authorization: `Bearer ${token}`}})
                const payload = result?.data?.[0]?.payload ?? result?.data?.payload ?? result?.data
                setSession(payload)
                setSessionId(result.data[0].id)
                setPassed(result.data[0].passed)
                setScore(result.data[0].score)
                setWrongIndices(result.data[0]?.wrong_index)
                setAlreadyAttempted(result.data[0].already_attempted)
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

    useEffect(() => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            popoverClass: "omnipad-tour",
            overlayColor: "#0b0b12",
            overlayOpacity: 0.75,
            steps: TOUR_STEPS as NonNullable<Parameters<typeof driver>[0]>["steps"],
            waitForElement: 3000,
            onHighlightStarted: (element, step) => {
                const tourStep = step as CustomTourStep
                if(!tourStep.page.endsWith("/*") && !tourPageMatches(tourStep.page, location.pathname)){
                    navigate(tourStep.page)
                }
            },
            onNextClick: (element, step, opts) => {
                markTourStepReached(opts.index)
                const nextStep = opts.index !== undefined ? TOUR_STEPS[opts.index + 1] as CustomTourStep | undefined : undefined
                if(nextStep && !tourPageMatches(nextStep.page, location.pathname)){
                    return
                }
                driverObj.moveNext()
            }
        })
        driverRef.current = driverObj
        markModeVisited("Feynman")
        const startIndex = tourStartIndex(location.pathname)
        driverObj.drive(startIndex === -1 ? 0 : startIndex)

        return () => { driverObj.destroy(); driverRef.current = null }
    }, [])

    useEffect(() => {
        if(answer.trim().length === 0) return
        const timer = setTimeout(() => {
            const activeStep = driverRef.current?.getActiveStep() as CustomTourStep | undefined
            if(activeStep?.element === "#feynman-question"){
                driverRef.current?.moveNext()
            }
        }, 1800)
        return () => clearTimeout(timer)
    }, [answer])

    useEffect(() => {
        if(currentQuestionIndex === 0) return
        const activeStep = driverRef.current?.getActiveStep() as CustomTourStep | undefined
        if(activeStep?.element === "#feynman-submit" || activeStep?.element === "#critique-modal"){
            const navIndex = TOUR_STEPS.findIndex((s) => s.page === "/study-hub/Feynman/*" && s.element === "#nav-study-hub")
            if(navIndex !== -1) driverRef.current?.moveTo(navIndex)
        }
    }, [currentQuestionIndex])

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
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1
    const hasAttempted = alreadyAttempted

    if(hasAttempted && !retrying){
        const wrongQuestions = (wrongIndices ?? []).map((index) => questions[index]).filter(Boolean)

        return(
            <div className="flex min-h-screen bg-[#0b0b12]">
                <LeftSidebar />
                <main className="flex flex-1 items-center justify-center p-8">
                    <section className="w-full max-w-2xl rounded-3xl border border-violet-500/20 bg-[#11111a]/90 p-8 shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Already Attempted</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">You've already attempted this study session</h1>

                        <div className="mt-5 flex items-center gap-2">
                            <button
                                onClick={() => setAttemptedTab("summary")}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                    attemptedTab === "summary"
                                        ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                                        : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                                }`}
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => setAttemptedTab("wrong")}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                    attemptedTab === "wrong"
                                        ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                                        : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                                }`}
                            >
                                Wrong Questions
                            </button>
                        </div>

                        {attemptedTab === "summary" ? (
                            <div className="mt-6">
                                <p className={`text-sm font-medium ${passed ? "text-emerald-300" : "text-red-300"}`}>
                                    {passed ? "Passed" : "Not Passed"}
                                </p>
                                <p className="mt-1 text-sm text-zinc-400">Your Score: {score} / {totalQuestions}</p>
                            </div>
                        ) : (
                            <div className="mt-6">
                                {wrongQuestions.length > 0 ? (
                                    <ul className="flex flex-col gap-2">
                                        {wrongQuestions.map((question) => (
                                            <li key={question.id} className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-zinc-200">
                                                <MathText text={question.question ?? question.prompt ?? ""} />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-emerald-300">You didn't get anything wrong! Great job</p>
                                )}
                            </div>
                        )}

                        <div className="mt-8 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setRetrying(true)
                                    setCurrentQuestionIndex(0)
                                    setAnswer("")
                                    setScore(0)
                                    setWrongIndices([])
                                }}
                                className="rounded-xl border border-violet-400/35 bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate("/study-hub")}
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                            >
                                Back to Study Hub
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        )
    }

    if(showPreview){
        const wrongQuestions = (wrongIndices ?? []).map((index) => questions[index]).filter(Boolean)

        return(
            <div className="flex min-h-screen bg-[#0b0b12]">
                <LeftSidebar />
                <main className="flex flex-1 items-center justify-center p-8">
                    <section className="w-full max-w-2xl rounded-3xl border border-violet-500/20 bg-[#11111a]/90 p-8 shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Results</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">You scored {score} / {totalQuestions}</h1>

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
                                    setAnswer("")
                                    setScore(0)
                                    setWrongIndices([])
                                    setShowPreview(false)
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                            >
                                Retry
                            </button>
                            <button
                                onClick={async() => {navigate("/study-hub") ; await saveScore(score, wrongIndices ?? [], sessionId, userId)}}
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
                            <h1 className="text-3xl font-semibold tracking-tight text-white">Feynman Reviewer</h1>
                            <p className="mt-1 text-sm text-zinc-400">Module: {session?.title ?? "Untitled"}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                Score: {score}
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

                <section id="feynman-question" className="mt-6 rounded-3xl border border-violet-500/20 bg-[#141420]/95 p-6 shadow-[0_28px_60px_-40px_rgba(46,16,101,0.8)]">
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

                            {hasAnswer && (
                                <div className="mt-6 flex items-center justify-end">
                                    <button
                                        id="feynman-submit"
                                        onClick={async() => {
                                            const result = await processAnswer(answer, currentQuestion.question, currentQuestion.referenceAnswer)
                                            if(result.correct){
                                                setScore((previous) => previous + 1)
                                                if(currentQuestionIndex < totalQuestions - 1){
                                                    setCurrentQuestionIndex((previous) => previous + 1)
                                                }
                                                setAnswer("")
                                                if(isLastQuestion){
                                                    setShowPreview(true)
                                                }
                                            } else {
                                                setWrongExplanation(result.explanation)
                                            }
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                                    >
                                        {isLastQuestion ? "Preview" : "Submit"}
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-zinc-400">No questions found for this session yet.</p>
                    )}
                </section>
            </main>

            {wrongExplanation !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div id="critique-modal" className="w-full max-w-md rounded-3xl border border-red-400/30 bg-[#141420] p-6 shadow-[0_28px_60px_-40px_rgba(239,68,68,0.5)]">
                        <p className="text-xs uppercase tracking-[0.18em] text-red-300">Not quite</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Here's why</h3>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{wrongExplanation}</p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setAnswer("")
                                    setWrongExplanation(null)
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => {
                                    setWrongIndices((prev) => [...(prev ?? []), (Number(currentQuestion.id) - 1)])
                                    setWrongExplanation(null)
                                    setAnswer("")
                                    if(currentQuestionIndex < totalQuestions - 1){
                                        setCurrentQuestionIndex((previous) => previous + 1)
                                    }
                                    if(isLastQuestion){
                                        setShowPreview(true)
                                    }
                                }}
                                className="rounded-xl border border-violet-400/35 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    async function processAnswer(answer: string, question: string | undefined, reference: string){
        const result = await axios.post(`http://localhost:5000/process-answer`, {answer: answer, question: question, reference: reference})
        return result.data
    }

    async function saveScore(score: number, wrong: number[], id: string, userId: string | null | undefined){
        const hasPassed = Math.round((score / totalQuestions) * 100) >= 80
        const token = await getToken()
        await axios.patch(`http://localhost:5000/study-session/save/${userId}/${id}`, {score: score, wrong: wrong, passed: hasPassed}, {headers: {Authorization: `Bearer ${token}`}})
    }
}

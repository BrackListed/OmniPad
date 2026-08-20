import { useAuth } from "@clerk/react"
import axios from "axios"
import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from "lucide-react"
import { LeftSidebar } from "../../dashboard/LeftSidebar"
import { MathText } from "./MathText"
import { useNavigate } from "react-router-dom"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import "@/tour/tour.css"
import { TOUR_STEPS, tourPageMatches, tourStartIndex } from "@/tour/tourSteps"
import type { CustomTourStep } from "@/tour/tourSteps"

interface FlashcardsProps{
    type: string | undefined
    fileId: string | undefined
}

interface questionsType{
    id: number
    concept?: string
    question?: string
    prompt?: string
    front?: string
    back?: string
}

interface payloadType{
    title: string
    type: string
    questions: questionsType[]
}

export function FlashcardsComponent({type, fileId}: FlashcardsProps){
    const {userId, getToken} = useAuth()
    const navigate = useNavigate()
    const [session, setSession] = useState<payloadType | null>(null)
    const [loading, setLoading] = useState(true)
    const [showIntro, setShowIntro] = useState(true)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [showBack, setShowBack] = useState(false)
    const [sessionId, setSessionId] = useState("")
    const [reshuffling, setReshuffling] = useState(false)

    useEffect(() => {
        if(!userId || !type || !fileId) return

        const fetchSessionData = async() => {
            try{
                const token = await getToken()
                const result = await axios.get(`http://localhost:5000/session/${userId}/${type}/${fileId}`, {headers: {Authorization: `Bearer ${token}`}})
                const payload = result?.data?.[0]?.payload ?? result?.data?.payload ?? result?.data
                setSession(payload)
                setSessionId(result.data[0].id)
            }
            catch(error){
                console.error("Failed to fetch Flashcards session", error)
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
                if(!tourPageMatches(tourStep.page, location.pathname)){
                    navigate(tourStep.page)
                }
            }
        })
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

    const cards = session?.questions ?? []
    const currentCard = cards[currentCardIndex]
    const totalCards = cards.length

    if(showIntro){
        return(
            <div className="flex min-h-screen bg-[#0b0b12]">
                <LeftSidebar />
                <main className="flex flex-1 items-center justify-center p-8">
                    <section className="w-full max-w-2xl rounded-3xl border border-violet-500/20 bg-[#11111a]/90 p-8 text-center shadow-[0_24px_50px_-35px_rgba(46,16,101,0.75)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-violet-300">{session?.type ?? type}</p>
                        <h1 className="mt-3 text-3xl font-semibold text-white">Topic: {session?.title ?? "Untitled"}</h1>
                        <p className="mt-3 text-sm text-zinc-400">Review one flashcard at a time. Flip for the back side.</p>

                        <button
                            id="flashcards-start"
                            onClick={() => setShowIntro(false)}
                            className="mt-8 rounded-xl border border-violet-400/35 bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                        >
                            Start Flashcards
                        </button>
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
                            <h1 className="text-3xl font-semibold tracking-tight text-white">Flashcards Reviewer</h1>
                            <p className="mt-1 text-sm text-zinc-400">Topic: {session?.title ?? "Untitled"}</p>
                        </div>

                        <div className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                            {type}
                        </div>
                    </div>

                    <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-violet-400 transition-all"
                            style={{ width: `${totalCards ? ((currentCardIndex + 1) / totalCards) * 100 : 0}%` }}
                        />
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                        Card {totalCards ? currentCardIndex + 1 : 0} of {totalCards}
                    </p>
                </section>

                <section className="mt-6 rounded-3xl border border-violet-500/20 bg-[#141420]/95 p-6 shadow-[0_28px_60px_-40px_rgba(46,16,101,0.8)]">
                    {currentCard ? (
                        <>
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500"><MathText text={currentCard.concept ?? "Flashcard"} /></p>

                            <button
                                id="flashcard-card"
                                type="button"
                                onClick={() => setShowBack((previous) => !previous)}
                                className="mt-4 mx-auto flex w-full max-w-md aspect-3/4 flex-col rounded-3xl border border-violet-400/30 bg-[#0f0f17] p-7 text-left transition hover:border-violet-300/45 hover:bg-[#121220]"
                            >
                                <p className="text-xs uppercase tracking-[0.2em] text-violet-300">{showBack ? "Back" : "Front"}</p>
                                <div className="mt-4 flex flex-1 items-center">
                                    <h2 className="text-3xl font-medium leading-tight text-white">
                                        <MathText
                                            text={showBack
                                                ? (currentCard.back ?? "No back text")
                                                : (currentCard.front ?? currentCard.question ?? currentCard.prompt ?? "No front text")}
                                        />
                                    </h2>
                                </div>
                                <p className="mt-5 text-xs text-zinc-500">Click card to flip</p>
                            </button>

                            <div className="mt-4 flex items-center justify-center">
                                <button
                                    onClick={() => setShowBack((previous) => !previous)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    {showBack ? "Show Front" : "Show Back"}
                                </button>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        if(currentCardIndex > 0){
                                            setCurrentCardIndex((previous) => previous - 1)
                                            setShowBack(false)
                                        }
                                    }}
                                    disabled={currentCardIndex === 0}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Previous
                                </button>

                                {currentCardIndex >= totalCards - 1 ? (
                                    <button
                                        onClick={handleReshuffle}
                                        disabled={reshuffling}
                                        className="inline-flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {reshuffling && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {reshuffling ? "Reshuffling..." : "Reshuffle?"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setCurrentCardIndex((previous) => previous + 1)
                                            setShowBack(false)
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30"
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {currentCardIndex >= totalCards - 1 && (
                                <p className="mt-3 text-center text-xs text-zinc-500">
                                    Note: Reshuffle generates a new set of cards entirely.
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-zinc-400">No flashcards found for this session yet.</p>
                    )}
                </section>
            </main>
        </div>
    )

    async function handleReshuffle(){
        setReshuffling(true)
        try{
            const token = await getToken()
            await axios.post(`http://localhost:5000/study-session/reshuffle/${userId}/${sessionId}`, {}, {headers: {Authorization: `Bearer ${token}`}})
            window.location.reload()
        } catch(error){
            console.error("Failed to reshuffle study session", error)
            alert("Failed to reshuffle study session, please try again.")
            setReshuffling(false)
        }
    }
}
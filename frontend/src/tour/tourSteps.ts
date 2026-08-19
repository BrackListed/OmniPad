export const TOUR_STEPS = [
    {
        page: "/dashboard",
        element: '#profile',
        popover: {title: "1. Welcome to OmniPad", description: "This is OmniPad, an all in one study app. Whereas most study apps would stop in flashcards, OmniPad gives you a to-do list to orgnaize assignments, and many various study methods in order to enhance your knowledge", side: "right", align: "start"}
    },
    {
        page: "/dashboard",
        element: '#left-sidebar',
        popover: {title: "2. Toolkit", description: "This is your toolkit. Every single page redirect is in this left sidebar."}
    },
    {
        page: "/dashboard",
        element: '#priority-queue',
        popover: {title: "3. Universal Priority Queue", description: "This priority queue displays all your listed tasks according to which tasks' due date is closest to today.", side: "left", align: "start"}
    },
    {
        page: "/dashboard",
        element: '#study-velocity',
        popover: {title: "4. Study Velocity", description: "This shows your consistency in using the study hub, turned into a bar graph.", side: "top", align: "start"}
    },
] as const
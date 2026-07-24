// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Production Developer Terminal — Interactive UNIX-style emulator
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import useSEO from "../../hooks/useSEO"
import { projectsData } from "../../data/projectsData"
import { servicesData } from "../../data/servicesData"

const COMMANDS = [
    "help", "whoami", "about", "skills", "projects", "services", "contact",
    "resume", "socials", "social", "experience", "education", "achievements",
    "clear", "ls", "cat", "history", "date", "time", "pwd", "sudo", "hack",
    "coffee", "matrix", "uname", "version", "theme", "github", "linkedin",
    "blog", "lab", "journey", "email", "echo", "open", "search", "download"
]

const ROUTES = {
    "/": "/", "/home": "/", "/about": "/about", "/journey": "/journey",
    "/skills": "/skills", "/projects": "/projects", "/services": "/services",
    "/blog": "/blog", "/contact": "/contact", "/lab": "/lab",
    "/lab/terminal": "/lab/terminal", "/lab/algorithms": "/lab/algorithms",
    "/lab/gaurav-chatbot": "/lab/gaurav-chatbot",
    "/lab/consistency-dashboard": "/lab/consistency-dashboard",
    "/book-now": "/book-now", "/support": "/support",
}

const PAGE_NAMES = Object.keys(ROUTES)

const MOCK_FILES = {
    "about.md": "Gaurav Kumar Yadav is an AI/ML and Full-Stack Web Developer.\nCurrently pursuing BCA at BBDU, Lucknow, India.\nPassionate about high-performance browser ML, React ecosystems, and scalable Node.js APIs.",
    "skills.md": "Languages : Python, JavaScript, Java, C, SQL\nFrontend  : React.js, Next.js, Tailwind CSS, HTML5/CSS3\nBackend   : Node.js, Express.js, Flask, REST APIs, JWT Auth\nDatabase  : MongoDB, MySQL, Prisma ORM\nAI/ML     : Scikit-learn, Pandas, NumPy, TensorFlow.js\nDev Tools : Git, GitHub, Docker, Linux, Postman",
    "contact.txt": "Email    : kumar.gaurav.yadav2007@gmail.com\nGitHub   : https://github.com/ggauravky\nLinkedIn : https://linkedin.com/in/ggauravky\nLocation : Lucknow, Uttar Pradesh, India",
    "resume.pdf": "Download: /resume.pdf\nRun `download resume` to open the PDF directly.",
    "readme.md": "# Gaurav Kumar Yadav Portfolio\nWelcome to the interactive developer terminal.\nType `help` for the full command list.\nBuild: 2026 | Stack: React + Vite + Node.js"
}

const T = {
    sys: (t) => ({ type: "system", text: t }),
    info: (t) => ({ type: "info", text: t }),
    ok: (t) => ({ type: "success", text: t }),
    err: (t) => ({ type: "error", text: t }),
    link: (t, u) => ({ type: "link", text: t, url: u }),
    raw: (t) => ({ type: "raw", text: t }),
    blank: () => ({ type: "blank", text: "" }),
    hr: () => ({ type: "divider", text: "-".repeat(52) }),
}

function processCommand(raw, cmdHistory, navigate) {
    const clean = raw.trim()
    if (!clean) return []
    const args = clean.split(/\s+/)
    const cmd = args[0].toLowerCase()
    const rest = args.slice(1).join(" ")
    const echo = { type: "input", text: `gaurav@portfolio:~$ ${raw}` }
    let O = []
    switch (cmd) {
        case "help":
            O = [
                T.sys("=".repeat(52)), T.ok("  DEVELOPER TERMINAL v2.0 — Commands"), T.sys("=".repeat(52)), T.blank(),
                T.info("  IDENTITY"), T.raw("    whoami · about · version · theme"), T.blank(),
                T.info("  SKILLS & EXPERIENCE"), T.raw("    skills · experience · education · achievements"), T.blank(),
                T.info("  PORTFOLIO"), T.raw("    projects · services · search <keyword>"), T.blank(),
                T.info("  CONTACT & SOCIAL"), T.raw("    contact · social · email · github · linkedin"), T.blank(),
                T.info("  NAVIGATION"), T.raw("    open <path> · blog · lab · journey · resume"), T.raw("    download resume"), T.blank(),
                T.info("  SYSTEM"), T.raw("    ls · ls -la · cat <file> · echo <text>"), T.raw("    pwd · uname · date · time · history · clear"), T.blank(),
                T.info("  EASTER EGGS"), T.raw("    matrix · coffee · hack nasa"), T.sys("=".repeat(52)),
                T.info("  Tab autocomplete · ↑↓ history navigation"), T.sys("=".repeat(52)),
            ]
            break
        case "whoami":
            O = [T.ok("Gaurav Kumar Yadav"), T.info("Role     : AI/ML & Full-Stack Developer"), T.info("Location : Lucknow, UP, India"), T.info("Univ     : BBDU — BCA 2024–2027"), T.info("Status   : Open to internships & collaborations")]
            break
        case "about":
            O = [T.ok("About:"), T.info("I build browser-native ML models, full-stack React/Node.js apps,"), T.info("and scalable backend APIs. Focused on AI integration,"), T.info("clean architecture, and performance-first engineering.")]
            break
        case "version":
            O = [T.ok("DEV.TERMINAL"), T.info("Version : 2.0.0"), T.info("Build   : Portfolio v2026"), T.info("Stack   : React 18 + Vite + Node.js"), T.info("Author  : Gaurav Kumar Yadav")]
            break
        case "theme":
            O = [T.ok("Current Theme: Obsidian Dark"), T.info("Background : #080a0e (Obsidian)"), T.info("Accent     : #c5f82a (Toxic Lime)"), T.info("Text       : #e4e4e7 (Zinc 200)"), T.info("Font       : JetBrains Mono + Inter")]
            break
        case "skills":
            O = [T.ok("Tech Stack:"), T.sys("-".repeat(50)), T.raw("  Languages  Python · JS · Java · C · SQL"), T.raw("  Frontend   React · Next.js · Tailwind · HTML5"), T.raw("  Backend    Node.js · Express · Flask · REST · JWT"), T.raw("  Database   MongoDB · MySQL · Prisma"), T.raw("  AI/ML      Scikit-learn · Pandas · NumPy · TF.js"), T.raw("  DevOps     Git · GitHub · Docker · Linux"), T.sys("-".repeat(50)), T.info("  Visit /skills for the full interactive matrix")]
            break
        case "projects":
            O = [T.ok("Key Projects:"), T.sys("-".repeat(50))]
            projectsData.slice(0, 5).forEach((p, i) => {
                O.push(T.raw(`  [${i + 1}] ${p.title}`))
                O.push(T.info(`      ${(p.description || "").slice(0, 80)}…`))
                O.push(T.raw(`      Tech: ${(p.techStack || []).slice(0, 5).join(" · ")}`))
                if (p.github) O.push(T.link(`      GitHub ↗`, p.github))
                O.push(T.blank())
            })
            if (projectsData.length > 5) O.push(T.info(`  +${projectsData.length - 5} more — visit /projects`))
            break
        case "services":
            O = [T.ok("Services:"), T.sys("-".repeat(50))]
            servicesData.slice(0, 5).forEach((s) => {
                O.push(T.raw(`  ▸ ${s.title}`))
                O.push(T.info(`    ${(s.description || "").slice(0, 80)}…`))
                if (s.deliveryTime) O.push(T.raw(`    Timeline: ${s.deliveryTime}${s.price ? " | Price: " + s.price : ""}`))
                O.push(T.blank())
            })
            O.push(T.info("  Visit /services for full packages & pricing"))
            break
        case "contact":
            O = [T.ok("Get in touch:"), T.sys("-".repeat(50)), T.link("  Email    : kumar.gaurav.yadav2007@gmail.com", "mailto:kumar.gaurav.yadav2007@gmail.com"), T.link("  GitHub   : github.com/ggauravky", "https://github.com/ggauravky"), T.link("  LinkedIn : linkedin.com/in/ggauravky", "https://linkedin.com/in/ggauravky"), T.info("  Location : Lucknow, Uttar Pradesh, India"), T.info("  Phone    : +91 82357 73177")]
            break
        case "email":
            O = [T.ok("Opening email client…"), T.link("  kumar.gaurav.yadav2007@gmail.com", "mailto:kumar.gaurav.yadav2007@gmail.com")]
            setTimeout(() => {
                window.location.href = "mailto:kumar.gaurav.yadav2007@gmail.com"
            }, 400)
            break
        case "resume":
            O = [T.ok("Resume / CV"), T.link("  View/Download PDF ↗", "/resume.pdf"), T.info("  Run `download resume` to open in a new tab.")]
            break
        case "download":
            if (rest.toLowerCase() === "resume") {
                O = [T.ok("Opening resume PDF…"), T.link("  /resume.pdf ↗", "/resume.pdf")]
                setTimeout(() => window.open("/resume.pdf", "_blank"), 300)
            } else { O = [T.err(`download: unknown "${rest}". Try: download resume`)] }
            break
        case "github":
            O = [T.ok("GitHub Profile"), T.link("  github.com/ggauravky ↗", "https://github.com/ggauravky"), T.info("  Opening in new tab…")]
            setTimeout(() => window.open("https://github.com/ggauravky", "_blank", "noopener,noreferrer"), 300)
            break
        case "linkedin":
            O = [T.ok("LinkedIn Profile"), T.link("  linkedin.com/in/ggauravky ↗", "https://linkedin.com/in/ggauravky"), T.info("  Opening in new tab…")]
            setTimeout(() => window.open("https://linkedin.com/in/ggauravky", "_blank", "noopener,noreferrer"), 300)
            break
        case "social": case "socials":
            O = [T.ok("Social Profiles:"), T.sys("-".repeat(50)), T.link("  GitHub     github.com/ggauravky", "https://github.com/ggauravky"), T.link("  LinkedIn   linkedin.com/in/ggauravky", "https://linkedin.com/in/ggauravky"), T.link("  Instagram  instagram.com/ggauravky", "https://instagram.com/ggauravky"), T.link("  X/Twitter  x.com/ggauravky", "https://x.com/ggauravky"), T.link("  LeetCode   leetcode.com/gauravky", "https://leetcode.com/gauravky"), T.link("  GFG        geeksforgeeks.org/user/gauravky", "https://geeksforgeeks.org/user/gauravky")]
            break
        case "blog":
            O = [T.ok("Navigating to Blog…")]; setTimeout(() => navigate("/blog"), 200); break
        case "lab":
            O = [T.ok("Navigating to Lab…")]; setTimeout(() => navigate("/lab"), 200); break
        case "journey":
            O = [T.ok("Navigating to Career Timeline…")]; setTimeout(() => navigate("/journey"), 200); break
        case "open":
            if (!rest) {
                O = [T.err("Usage: open <path>"), T.info("Pages: / /about /skills /projects /services /blog /contact /lab /journey")]
            } else {
                const t = rest.startsWith("/") ? rest : "/" + rest
                const r = ROUTES[t]
                if (r) { O = [T.ok(`Navigating to ${r}…`)]; setTimeout(() => navigate(r), 200) }
                else O = [T.err(`open: no route for "${t}"`), T.info("Try: open /about | /skills | /projects | /contact | /lab")]
            }
            break
        case "search":
            if (!rest) { O = [T.err("Usage: search <keyword>  e.g. search react")] }
            else {
                const kw = rest.toLowerCase()
                const m = projectsData.filter(p => [p.title, p.description, ...(p.techStack || []), ...(p.categories || [])].join(" ").toLowerCase().includes(kw))
                if (!m.length) { O = [T.info(`No projects matched "${rest}". Try: react, python, ai, node`)] }
                else {
                    O = [T.ok(`${m.length} project(s) matching "${rest}":`), T.sys("-".repeat(50))]
                    m.slice(0, 6).forEach(p => { O.push(T.raw(`  ▸ ${p.title}`)); O.push(T.raw(`    ${(p.techStack || []).slice(0, 5).join(" · ")}`)) })
                    if (m.length > 6) O.push(T.info(`  +${m.length - 6} more — visit /projects`))
                }
            }
            break
        case "experience":
            O = [T.ok("Experience:"), T.sys("-".repeat(50)), T.raw("  Freelance Developer  [2023–Present]"), T.info("  React + Node.js apps, AI-integrated tools."), T.info("  Built SmartMess, BuildMyTeam & 10+ production projects."), T.blank(), T.raw("  Open Source Contributor [2024–Present]"), T.info("  100+ commits — github.com/ggauravky")]
            break
        case "education":
            O = [T.ok("Education:"), T.sys("-".repeat(50)), T.raw("  BCA — Babu Banarasi Das University (BBDU), Lucknow"), T.info("  2024–2027 | In Progress"), T.blank(), T.raw("  Self-Taught: AI/ML & Full-Stack Web Dev"), T.info("  IIT Mandi Certification · FreeCodeCamp · Scrimba")]
            break
        case "achievements":
            O = [T.ok("Achievements:"), T.sys("-".repeat(50)), T.raw("  ★ 100+ LeetCode problems solved"), T.raw("  ★ SmartMess used by 200+ peers"), T.raw("  ★ 10+ projects shipped to production"), T.raw("  ★ IIT Mandi AI/ML certification"), T.raw("  ★ Active OSS contributor")]
            break
        case "echo":
            O = rest ? [{ type: "info", text: rest }] : [T.blank()]
            break
        case "uname":
            O = [T.sys(args[1] === "-a" ? "Browser-OS 1.0 Portfolio #2026 SMP x86_64 WebAssembly" : "Browser-OS")]
            break
        case "time":
            O = [T.sys(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }))]
            break
        case "date":
            O = [T.sys(new Date().toDateString() + " " + new Date().toLocaleTimeString())]
            break
        case "pwd":
            O = [T.sys("/home/gaurav/portfolio/lab/terminal")]
            break
        case "history":
            O = cmdHistory.length === 0 ? [T.info("No commands in history yet.")] : cmdHistory.map((c, i) => T.raw(`  ${String(i + 1).padStart(3)}  ${c}`))
            break
        case "ls":
            if (args[1] === "-la" || args[1] === "-l") {
                O = [T.sys("total 5"), T.raw("  -rw-r--r--  gaurav  1.2K  about.md"), T.raw("  -rw-r--r--  gaurav  0.9K  skills.md"), T.raw("  -rw-r--r--  gaurav  8.4K  projects.json"), T.raw("  -rw-r--r--  gaurav  0.3K  contact.txt"), T.raw("  -rw-r--r--  gaurav  0.1K  resume.pdf"), T.raw("  -rw-r--r--  gaurav  0.2K  readme.md")]
            } else { O = [T.ok(Object.keys(MOCK_FILES).join("    "))] }
            break
        case "cat":
            if (!args[1]) { O = [T.err("Usage: cat <file>  — available: " + Object.keys(MOCK_FILES).join(", "))] }
            else if (MOCK_FILES[args[1]]) { O = MOCK_FILES[args[1]].split("\n").map(l => T.raw("  " + l)) }
            else { O = [T.err(`cat: ${args[1]}: No such file or directory`)] }
            break
        case "clear":
            return { action: "clear" }
        case "sudo":
            O = (args[1] === "rm" && args[2] === "-rf") ? [T.err("Permission denied. Nice try 😄")] : [T.err("sudo: 1 incorrect password. Permission denied.")]
            break
        case "hack":
            O = args[1] === "nasa" ? [T.err("Connecting to NASA…"), T.err("Firewall bypassing…"), T.err("ACCESS DENIED. (just kidding 😄)"), T.ok("Focus on building real things! 🚀")] : [T.err(`hack: target "${rest}" unrecognized. Try: hack nasa`)]
            break
        case "matrix":
            O = [T.blank(), T.sys(" ███╗   ███╗ █████╗ ████████╗██████╗ ██╗██╗  ██╗"), T.sys(" ████╗ ████║██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝"), T.sys(" ██╔████╔██║███████║   ██║   ██████╔╝██║ ╚███╔╝ "), T.sys(" ██║╚██╔╝██║██╔══██║   ██║   ██╔══██╗██║ ██╔██╗ "), T.sys(" ██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║██║██╔╝ ██╗"), T.sys(' ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝'), T.blank(), T.ok(' "There is no spoon." — The Matrix, 1999'), T.info("  You chose the green pill. Welcome.")]
            break
        case "coffee":
            O = [T.ok("☕ Brewing developer fuel…"), T.info("  Beans  : Dark Roast × Debug Blend"), T.info("  Shots  : Double espresso"), T.info("  Status : Productivity +42%")]
            break
        default:
            O = [T.err(`bash: ${cmd}: command not found`), T.info('Type "help" for available commands.')]
    }
    return [echo, ...O]
}

function OutputLine({ line }) {
    const base = "whitespace-pre-wrap leading-relaxed font-mono text-sm break-words"
    if (line.type === "input") return <div className={`${base} text-white font-bold`}>{line.text}</div>
    if (line.type === "system") return <div className={`${base} text-toxic`}>{line.text}</div>
    if (line.type === "success") return <div className={`${base} text-cyber font-bold`}>{line.text}</div>
    if (line.type === "error") return <div className={`${base} text-red-400 font-bold`}>{line.text}</div>
    if (line.type === "blank") return <div className="h-1.5" aria-hidden="true" />
    if (line.type === "divider") return <div className={`${base} text-zinc-700`}>{line.text}</div>
    if (line.type === "raw") return <div className={`${base} text-zinc-300`}>{line.text}</div>
    if (line.type === "link") return (
        <div className={`${base}`}>
            <a href={line.url} target="_blank" rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 decoration-sky-400/40 transition-colors">
                {line.text}
            </a>
        </div>
    )
    return <div className={`${base} text-zinc-300`}>{line.text}</div>
}

export default function TerminalEmulator() {
    useSEO({
        title: "Developer Terminal — Gaurav Lab | Interactive CLI",
        description: "Interactive developer terminal in Gaurav Kumar Yadav portfolio. Explore projects, skills, and social links via CLI.",
        keywords: "Developer Terminal, CLI, bash, portfolio, Gaurav lab",
        ogImage: "https://ggauravky.vercel.app/images/profile.jpg",
    })

    const navigate = useNavigate()
    const [input, setInput] = useState("")
    const [selectionStart, setSelectionStart] = useState(0)
    const [history, setHistory] = useState([])
    const [cmdHistory, setCmdHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [suggestion, setSuggestion] = useState("")
    const [sessionStart] = useState(() => Date.now())
    const [sessionTime, setSessionTime] = useState("0s")
    const outputContainerRef = useRef(null)
    const inputRef = useRef(null)

    // Ensure the page always starts strictly at top on load
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }, [])

    useEffect(() => {
        const id = setInterval(() => {
            const s = Math.floor((Date.now() - sessionStart) / 1000)
            if (s < 60) setSessionTime(`${s}s`)
            else if (s < 3600) setSessionTime(`${Math.floor(s / 60)}m ${s % 60}s`)
            else setSessionTime(`${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`)
        }, 1000)
        return () => clearInterval(id)
    }, [sessionStart])

    useEffect(() => {
        setHistory([
            T.sys("=".repeat(52)),
            T.ok("  GAURAV DEVELOPER TERMINAL  [v2.0.0]"),
            T.info('  Type "help" for available commands.'),
            T.info("  Tip: Tab to autocomplete · ↑↓ for history"),
            T.sys("=".repeat(52))
        ])
    }, [])

    // ONLY scroll internal terminal container — NEVER touch window viewport scroll!
    useEffect(() => {
        if (outputContainerRef.current) {
            outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight
        }
    }, [history])

    const focusInput = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.focus({ preventScroll: true })
        }
    }, [])

    useEffect(() => {
        if (!input.trim()) { setSuggestion(""); return }
        const t = input.trim().toLowerCase()
        if (t.startsWith("cat ")) { const fp = t.slice(4); const m = Object.keys(MOCK_FILES).find(f => f.startsWith(fp)); setSuggestion(m && m !== fp ? `cat ${m}` : ""); return }
        if (t.startsWith("open ")) { const pp = t.slice(5); const m = PAGE_NAMES.find(p => p.startsWith(pp)); setSuggestion(m && m !== pp ? `open ${m}` : ""); return }
        if (t.startsWith("search ") || t.startsWith("download ") || t.startsWith("echo ")) { setSuggestion(""); return }
        const m = COMMANDS.find(c => c.startsWith(t)); setSuggestion(m && m !== t ? m : "")
    }, [input])

    const handleCommand = useCallback((rawCmd) => {
        const clean = rawCmd.trim()
        if (!clean) return
        const result = processCommand(clean, cmdHistory, navigate)
        if (result && result.action === "clear") { setHistory([]); setInput(""); setSelectionStart(0); return }
        setCmdHistory(prev => [...prev, clean])
        setHistoryIndex(-1)
        setHistory(prev => [...prev, ...(result || [])])
        setInput("")
        setSelectionStart(0)
    }, [cmdHistory, navigate])

    const handleKeyDown = (e) => {
        if (e.key === "Enter") { handleCommand(input) }
        else if (e.key === "Tab") { e.preventDefault(); if (suggestion) { setInput(suggestion); setSelectionStart(suggestion.length) } }
        else if (e.key === "ArrowUp") { e.preventDefault(); if (!cmdHistory.length) return; const ni = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1); setHistoryIndex(ni); const v = cmdHistory[ni]; setInput(v); setSelectionStart(v.length) }
        else if (e.key === "ArrowDown") { e.preventDefault(); if (!cmdHistory.length || historyIndex === -1) return; const ni = historyIndex + 1; if (ni >= cmdHistory.length) { setHistoryIndex(-1); setInput(""); setSelectionStart(0) } else { setHistoryIndex(ni); const v = cmdHistory[ni]; setInput(v); setSelectionStart(v.length) } }
    }

    const mobileBtn = (label, disabled, onClick) => (
        <button key={label} type="button" onClick={(e) => { e.stopPropagation(); onClick() }} disabled={disabled}
            className="bg-obsidian border border-obsidian-border text-zinc-400 hover:text-toxic disabled:opacity-25 disabled:hover:text-zinc-400 px-2 py-2.5 rounded text-[10px] font-mono uppercase font-bold transition-all min-h-[40px] touch-manipulation select-none"
            aria-label={label}>{label}</button>
    )

    return (
        <div className="bg-obsidian min-h-screen select-none" onClick={focusInput}>

            {/* ── Page Hero / Breadcrumb ───────────────────────────── */}
            <section className="pt-8 pb-6 px-4 sm:px-6 border-b border-obsidian-border">
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumb — Perfect single baseline alignment */}
                    <nav className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6" aria-label="Breadcrumb">
                        <Link to="/" className="hover:text-toxic transition-colors inline-flex items-center">Home</Link>
                        <span className="text-zinc-600 font-normal select-none" aria-hidden="true">/</span>
                        <Link to="/lab" className="hover:text-toxic transition-colors inline-flex items-center">Lab</Link>
                        <span className="text-zinc-600 font-normal select-none" aria-hidden="true">/</span>
                        <span className="text-toxic font-semibold inline-flex items-center">Developer Terminal</span>
                    </nav>

                    {/* Title row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                <span className="text-toxic font-mono">$</span>
                                Developer Terminal
                            </h1>
                            <p className="mt-1 text-sm text-zinc-400 font-mono">
                                Interactive CLI · type <span className="text-toxic">help</span> to explore
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-toxic animate-pulse shrink-0" aria-hidden="true" />
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                v2.0.0 · session {sessionTime} · {cmdHistory.length} cmd{cmdHistory.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Terminal Window ──────────────────────────────────── */}
            <section className="py-8 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Window chrome bar */}
                    <div className="bg-[#0c0d12] border border-obsidian-border rounded-t-2xl px-4 py-3 flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-red-500/80" aria-hidden="true" />
                        <span className="w-3 h-3 rounded-full bg-amber-400/80" aria-hidden="true" />
                        <span className="w-3 h-3 rounded-full bg-toxic/80" aria-hidden="true" />
                        <span className="flex-1 text-center text-[11px] font-mono text-zinc-500 tracking-widest uppercase select-none">
                            gaurav@portfolio — /lab/terminal
                        </span>
                    </div>

                    {/* Terminal body */}
                    <div
                        className="bg-[#07080c] border-x border-b border-obsidian-border rounded-b-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/80"
                        style={{ height: 'clamp(400px, 60vh, 680px)' }}
                    >
                        {/* Output scroll area */}
                        <div
                            ref={outputContainerRef}
                            className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-0.5 select-text min-h-0 custom-terminal-scroll"
                            aria-live="polite"
                            aria-label="Terminal output"
                        >
                            {history.map((line, i) => <OutputLine key={i} line={line} />)}

                            {/* Live input line */}
                            <div className="flex items-center text-white font-bold pt-1 font-mono text-sm leading-relaxed w-full">
                                <span className="text-toxic shrink-0 mr-2 select-none" aria-hidden="true">gaurav@portfolio:~$</span>
                                <div className="relative flex-1 min-w-0 min-h-[20px]">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => { setInput(e.target.value); setSelectionStart(e.target.selectionStart) }}
                                        onKeyDown={handleKeyDown}
                                        onSelect={(e) => setSelectionStart(e.target.selectionStart)}
                                        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent border-none outline-none font-mono font-bold p-0 m-0 z-20"
                                        style={{ fontSize: '16px' }}
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        spellCheck="false"
                                        aria-label="Terminal input"
                                    />
                                    <div className="relative z-10 w-full pointer-events-none select-none whitespace-pre font-mono text-sm font-bold text-white flex items-center leading-relaxed overflow-hidden">
                                        <span>{input.slice(0, selectionStart)}</span>
                                        <span className="w-[8px] h-[15px] bg-toxic animate-terminal-blink inline-block align-middle mx-px" aria-hidden="true" />
                                        <span>{input.slice(selectionStart)}</span>
                                        {suggestion && suggestion.toLowerCase().startsWith(input.toLowerCase()) && (
                                            <span className="text-zinc-600">{suggestion.slice(input.length)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <style>{`
                                @keyframes terminal-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
                                .animate-terminal-blink{animation:terminal-blink 1s infinite steps(1)}
                                .custom-terminal-scroll::-webkit-scrollbar { width: 6px; }
                                .custom-terminal-scroll::-webkit-scrollbar-track { background: transparent; }
                                .custom-terminal-scroll::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
                                .custom-terminal-scroll::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
                            `}</style>
                        </div>

                        {/* Mobile quick-action buttons */}
                        <div className="shrink-0 border-t border-obsidian-border bg-[#0c0d12] px-2 pt-2 pb-2">
                            <div className="grid grid-cols-6 gap-1.5">
                                {mobileBtn('Tab', !suggestion, () => { if (suggestion) { setInput(suggestion); setSelectionStart(suggestion.length) } })}
                                {mobileBtn('▲', cmdHistory.length === 0, () => { if (!cmdHistory.length) return; const ni = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1); setHistoryIndex(ni); const v = cmdHistory[ni]; setInput(v); setSelectionStart(v.length) })}
                                {mobileBtn('▼', cmdHistory.length === 0 || historyIndex === -1, () => { if (!cmdHistory.length || historyIndex === -1) return; const ni = historyIndex + 1; if (ni >= cmdHistory.length) { setHistoryIndex(-1); setInput(''); setSelectionStart(0) } else { setHistoryIndex(ni); const v = cmdHistory[ni]; setInput(v); setSelectionStart(v.length) } })}
                                {mobileBtn('Clr', !input, () => { setInput(''); setSelectionStart(0) })}
                                {mobileBtn('Clear', false, () => { setHistory([]); setInput(''); setSelectionStart(0) })}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleCommand('help') }}
                                    className="bg-toxic text-obsidian px-2 py-2.5 rounded text-[10px] font-mono uppercase font-bold transition-all hover:bg-white min-h-[40px] touch-manipulation select-none"
                                    aria-label="Show help"
                                >
                                    Help
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Hint strip below terminal ─────────────────────────── */}
            <section className="pb-16 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { cmd: 'help', hint: 'All commands' },
                            { cmd: 'projects', hint: 'Browse projects' },
                            { cmd: 'social', hint: 'Social links' },
                            { cmd: 'matrix', hint: 'Easter egg 🎉' },
                        ].map(({ cmd, hint }) => (
                            <button
                                key={cmd}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleCommand(cmd) }}
                                className="flex flex-col items-start gap-1 p-3 rounded-xl border border-obsidian-border bg-obsidian hover:border-toxic/40 hover:bg-toxic/5 transition-all group text-left touch-manipulation"
                            >
                                <span className="font-mono text-toxic text-xs font-bold group-hover:text-toxic">{cmd}</span>
                                <span className="text-zinc-500 text-[11px]">{hint}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}

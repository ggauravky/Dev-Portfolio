// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'
import { projectsData } from '../../data/projectsData'
import { servicesData } from '../../data/servicesData'

const COMMANDS = [
    'help',
    'whoami',
    'about',
    'skills',
    'projects',
    'services',
    'contact',
    'resume',
    'socials',
    'experience',
    'education',
    'achievements',
    'clear',
    'ls',
    'cat',
    'history',
    'date',
    'pwd',
    'sudo',
    'hack',
    'coffee'
]

const MOCK_FILES = {
    'about.md': `Gaurav Kumar Yadav is an AI/ML and Web Developer currently pursuing a BCA at BBD University (BBDU) in Lucknow, India. Passionate about engineering high-performance software, client-side browser ML models, and fully responsive layouts.`,
    'skills.md': `Programming: Python, JavaScript, Java, C, SQL\nFrontend: React.js, Tailwind CSS, HTML5/CSS3\nBackend: Node.js, Express.js, Flask, REST APIs, JWT\nDatabase/Tools: MongoDB, MySQL, Prisma, Git & GitHub`,
    'projects.json': JSON.stringify(
        projectsData.map(p => ({ title: p.title, tech: p.techStack, categories: p.categories })),
        null,
        2
    ),
    'contact.txt': `Email: ggauravky@gmail.com\nGitHub: https://github.com/ggauravky\nLinkedIn: https://linkedin.com/in/gaurav-kumar-yadav\nPhone: Available on request`,
    'resume.pdf': `Link: https://ggauravky.vercel.app/resume.pdf\n[Run 'resume' to download directly]`
}

export default function TerminalEmulator() {
    useSEO({
        title: 'Developer Terminal - Gaurav Lab | Interactive Command Line Interface',
        description: 'Explore Gaurav Kumar Yadav\'s portfolio, projects, and skills through an interactive, retro hacker-style Unix terminal emulator in your browser.',
        keywords: 'Developer Terminal, bash portfolio, command line portfolio, Gaurav lab, interactive terminal, retro portfolio',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [input, setInput] = useState('')
    const [selectionStart, setSelectionStart] = useState(0)
    const [history, setHistory] = useState([])
    const [cmdHistory, setCmdHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [suggestion, setSuggestion] = useState('')

    const terminalEndRef = useRef(null)
    const inputRef = useRef(null)

    const handleInputChange = (e) => {
        setInput(e.target.value)
        setSelectionStart(e.target.selectionStart)
    }

    const handleSelect = (e) => {
        setSelectionStart(e.target.selectionStart)
    }

    // Initial message
    useEffect(() => {
        setHistory([
            { text: '==================================================', type: 'system' },
            { text: 'GAURAV DEVELOPER TERMINAL [Version 1.0.0]', type: 'system' },
            { text: 'Type "help" to see available commands.', type: 'system' },
            { text: '==================================================', type: 'system' },
        ])
    }, [])

    // Scroll to bottom
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [history])

    // Focus input on terminal container click
    const focusInput = () => {
        inputRef.current?.focus()
    }

    // Auto-suggest next command prefix matches
    useEffect(() => {
        if (!input.trim()) {
            setSuggestion('')
            return
        }

        const trimmed = input.trim().toLowerCase()
        // If it starts with "cat ", suggest file names
        if (trimmed.startsWith('cat ')) {
            const filePart = trimmed.slice(4)
            const matchedFile = Object.keys(MOCK_FILES).find(f => f.startsWith(filePart))
            if (matchedFile && matchedFile !== filePart) {
                setSuggestion(`cat ${matchedFile}`)
            } else {
                setSuggestion('')
            }
            return
        }

        const matchedCmd = COMMANDS.find(c => c.startsWith(trimmed))
        if (matchedCmd && matchedCmd !== trimmed) {
            setSuggestion(matchedCmd)
        } else {
            setSuggestion('')
        }
    }, [input])

    // Handle command submission
    const handleCommand = (rawCmd) => {
        const clean = rawCmd.trim()
        if (!clean) return

        const args = clean.split(/\s+/)
        const cmd = args[0].toLowerCase()

        // Append to cmd history
        setCmdHistory(prev => [...prev, clean])
        setHistoryIndex(-1)

        let outputs = []

        switch (cmd) {
            case 'help':
                outputs = [
                    { text: 'Available commands:', type: 'system' },
                    { text: '  whoami       - Display info about the developer', type: 'info' },
                    { text: '  about        - Short bio and background description', type: 'info' },
                    { text: '  skills       - View technical skills and stack', type: 'info' },
                    { text: '  projects     - List key completed projects', type: 'info' },
                    { text: '  services     - List services offered by Gaurav', type: 'info' },
                    { text: '  contact      - Get contact details (Email, GitHub, LinkedIn)', type: 'info' },
                    { text: '  resume       - View and download Resume links', type: 'info' },
                    { text: '  socials      - Print social profile URLs', type: 'info' },
                    { text: '  experience   - List development/internship experience', type: 'info' },
                    { text: '  education    - Display educational timeline', type: 'info' },
                    { text: '  achievements - View key accolades and metrics', type: 'info' },
                    { text: '  ls           - List mock directory contents', type: 'info' },
                    { text: '  cat [file]   - Output contents of a mock file', type: 'info' },
                    { text: '  pwd          - Print current working directory', type: 'info' },
                    { text: '  date         - Print current system date', type: 'info' },
                    { text: '  history      - Show past terminal commands', type: 'info' },
                    { text: '  clear        - Clear the terminal screen', type: 'info' },
                ]
                break

            case 'whoami':
                outputs = [
                    { text: 'Gaurav Kumar Yadav', type: 'success' },
                    { text: 'AI/ML & Full-Stack Web Developer', type: 'info' },
                    { text: 'BCA Student @ BBD University (BBDU), Lucknow, India', type: 'info' },
                ]
                break

            case 'about':
                outputs = [
                    { text: 'About Gaurav:', type: 'success' },
                    { text: 'I build client-side browser ML models and full-stack React / Node.js web applications.', type: 'info' },
                    { text: 'Currently exploring deep learning, predictive model training, and database ORM layers like Prisma.', type: 'info' },
                ]
                break

            case 'skills':
                outputs = [
                    { text: 'Technical Skills Matrix:', type: 'success' },
                    { text: '  Programming: Python, JavaScript, Java, C, SQL', type: 'info' },
                    { text: '  Frontend   : React.js, Tailwind CSS, HTML5, CSS3, Bootstrap', type: 'info' },
                    { text: '  Backend    : Node.js, Express.js, Flask, REST APIs, JWT Auth', type: 'info' },
                    { text: '  Database   : MongoDB, MySQL, Prisma ORM', type: 'info' },
                    { text: '  Dev Tools  : Git & GitHub, VS Code, Postman, Linux', type: 'info' },
                    { text: '  AI/ML      : Scikit-learn, Pandas, NumPy, TensorFlow.js', type: 'info' },
                ]
                break

            case 'projects':
                outputs = [{ text: 'Key Projects:', type: 'success' }]
                projectsData.forEach(p => {
                    outputs.push({ text: `⚡ ${p.title} (${p.categories.join(', ')})`, type: 'success' })
                    outputs.push({ text: `   Description: ${p.description}`, type: 'info' })
                    outputs.push({ text: `   Tech Stack : ${p.techStack.join(', ')}`, type: 'system' })
                    outputs.push({ text: `   Repository : ${p.github}`, type: 'info' })
                })
                break

            case 'services':
                outputs = [{ text: 'Available Services:', type: 'success' }]
                servicesData.forEach(s => {
                    outputs.push({ text: `🛠️ ${s.title}`, type: 'success' })
                    outputs.push({ text: `   Description: ${s.description}`, type: 'info' })
                    outputs.push({ text: `   Timeline   : ${s.deliveryTime} | Price: ${s.price}`, type: 'system' })
                })
                break

            case 'contact':
                outputs = [
                    { text: 'Get in touch:', type: 'success' },
                    { text: '  Email    : ggauravky@gmail.com', type: 'info' },
                    { text: '  GitHub   : https://github.com/ggauravky', type: 'info' },
                    { text: '  LinkedIn : https://linkedin.com/in/gaurav-kumar-yadav', type: 'info' },
                    { text: '  Location : Lucknow, Uttar Pradesh, India', type: 'info' },
                ]
                break

            case 'resume':
                outputs = [
                    { text: 'Resume Options:', type: 'success' },
                    { text: 'Opening resume in a new tab...', type: 'system' },
                ]
                window.open('https://ggauravky.vercel.app/resume.pdf', '_blank')
                break

            case 'socials':
                outputs = [
                    { text: 'Social Links:', type: 'success' },
                    { text: '  GitHub   : https://github.com/ggauravky', type: 'info' },
                    { text: '  LinkedIn : https://linkedin.com/in/gaurav-kumar-yadav', type: 'info' },
                ]
                break

            case 'experience':
                outputs = [
                    { text: 'Experience Timeline:', type: 'success' },
                    { text: '  Full-Stack & ML Projects Delivery (Freelance / Personal Labs)', type: 'info' },
                    { text: '  Focused on building high-performance, responsive student tools (e.g. SmartMess, BuildMyTeam)', type: 'system' },
                ]
                break

            case 'education':
                outputs = [
                    { text: 'Education:', type: 'success' },
                    { text: '  Bachelor of Computer Applications (BCA)', type: 'info' },
                    { text: '  Babu Banarasi Das University (BBDU), Lucknow (2024 - 2027)', type: 'system' },
                ]
                break

            case 'achievements':
                outputs = [
                    { text: 'Achievements & Badges:', type: 'success' },
                    { text: '  Solved 100+ LeetCode problems (Coding consistency showcase active)', type: 'info' },
                    { text: '  Built and deployed open source hostel mess automation used by peers', type: 'info' },
                ]
                break

            case 'pwd':
                outputs = [{ text: '/home/gaurav', type: 'system' }]
                break

            case 'date':
                outputs = [{ text: new Date().toString(), type: 'system' }]
                break

            case 'history':
                outputs = cmdHistory.map((cmdText, idx) => ({
                    text: ` ${idx + 1}  ${cmdText}`,
                    type: 'system'
                }))
                break

            case 'ls':
                outputs = [{ text: Object.keys(MOCK_FILES).join('    '), type: 'success' }]
                break

            case 'cat':
                const file = args[1]
                if (!file) {
                    outputs = [{ text: 'Usage: cat [filename]', type: 'error' }]
                } else if (MOCK_FILES[file]) {
                    outputs = MOCK_FILES[file].split('\n').map(line => ({ text: line, type: 'info' }))
                } else {
                    outputs = [{ text: `cat: ${file}: No such file or directory`, type: 'error' }]
                }
                break

            case 'clear':
                setHistory([])
                setInput('')
                setSelectionStart(0)
                return

            // Easter eggs
            case 'sudo':
                if (args[1] === 'rm' && args[2] === '-rf' && args[3]?.startsWith('/')) {
                    outputs = [{ text: 'Permission denied. Nice try 😄', type: 'error' }]
                } else {
                    outputs = [{ text: 'sudo: 1 incorrect password attempt. Permission denied.', type: 'error' }]
                }
                break

            case 'hack':
                if (args[1] === 'nasa') {
                    outputs = [
                        { text: 'Access denied.', type: 'error' },
                        { text: 'Focus on building instead 🚀', type: 'success' }
                    ]
                } else {
                    outputs = [{ text: 'hack: Target unrecognized. Try "hack nasa".', type: 'error' }]
                }
                break

            case 'coffee':
                outputs = [{ text: 'Brewing developer fuel ☕', type: 'success' }]
                break

            default:
                outputs = [{ text: `bash: ${cmd}: command not found. Type "help" for a list of commands.`, type: 'error' }]
                break
        }

        setHistory(prev => [
            ...prev,
            { text: `gaurav@portfolio:~$ ${rawCmd}`, type: 'input' },
            ...outputs
        ])
        setInput('')
        setSelectionStart(0)
    }

    // Key handlers for inputs
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(input)
        } else if (e.key === 'Tab') {
            e.preventDefault()
            if (suggestion) {
                setInput(suggestion)
                setSelectionStart(suggestion.length)
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (cmdHistory.length === 0) return
            const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1)
            setHistoryIndex(newIndex)
            const val = cmdHistory[newIndex]
            setInput(val)
            setSelectionStart(val.length)
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (cmdHistory.length === 0 || historyIndex === -1) return
            const newIndex = historyIndex + 1
            if (newIndex >= cmdHistory.length) {
                setHistoryIndex(-1)
                setInput('')
                setSelectionStart(0)
            } else {
                setHistoryIndex(newIndex)
                const val = cmdHistory[newIndex]
                setInput(val)
                setSelectionStart(val.length)
            }
        }
    }

    return (
        <main 
            className="min-h-screen bg-obsidian text-zinc-300 font-mono text-sm p-4 relative overflow-hidden flex flex-col justify-between"
            onClick={focusInput}
        >
            {/* Top header navigation */}
            <div className="flex items-center justify-between border-b border-obsidian-border pb-3 mb-4 z-10">
                <Link
                    to="/lab"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-toxic text-xs uppercase tracking-wider transition-colors group font-bold"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:-translate-x-1 transition-transform duration-200"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Lab
                </Link>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-toxic inline-block animate-pulse"></span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">// dev-terminal v1.0</span>
                </div>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 overflow-y-auto mb-4 select-text space-y-1.5 custom-scrollbar pr-2 max-h-[calc(100vh-160px)]">
                {history.map((h, i) => {
                    if (h.type === 'input') {
                        return (
                            <div key={i} className="text-white font-bold">
                                {h.text}
                            </div>
                        )
                    }
                    let color = 'text-zinc-400'
                    if (h.type === 'system') color = 'text-toxic'
                    if (h.type === 'info') color = 'text-zinc-300'
                    if (h.type === 'success') color = 'text-cyber font-bold'
                    if (h.type === 'error') color = 'text-red-500 font-bold'

                    return (
                        <div key={i} className={`${color} whitespace-pre-wrap leading-relaxed`}>
                            {h.text}
                        </div>
                    )
                })}
                  {/* Command Line */}
                <div className="flex items-center text-white font-bold pt-1 font-mono text-sm leading-relaxed w-full">
                    <span className="text-toxic shrink-0 mr-2 select-none">gaurav@portfolio:~$</span>
                    
                    <div className="relative flex-1 min-w-[200px] min-h-[20px] font-mono text-sm font-bold">
                        {/* 1. Underlying interactive transparent input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onSelect={handleSelect}
                            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent border-none outline-none font-mono text-sm font-bold p-0 m-0 z-20 block"
                            autoFocus
                            autoCapitalize="off"
                            autoComplete="off"
                            spellCheck="false"
                        />

                        {/* 2. Visual rendering spans (sitting underneath/behind the input for perfect alignment) */}
                        <div className="relative z-10 w-full h-full pointer-events-none select-none whitespace-pre font-mono text-sm font-bold text-white flex items-center leading-relaxed">
                            {/* Pre-cursor text */}
                            <span className="text-white font-mono text-sm font-bold">{input.slice(0, selectionStart)}</span>

                            {/* Blinking block cursor */}
                            <span className="w-[8px] h-[15px] bg-toxic animate-terminal-blink inline-block align-middle mx-[0.5px]"></span>

                            {/* Post-cursor text */}
                            <span className="text-white font-mono text-sm font-bold">{input.slice(selectionStart)}</span>

                            {/* Ghost suggestion text */}
                            {suggestion && suggestion.toLowerCase().startsWith(input.toLowerCase()) && (
                                <span className="text-zinc-600 font-mono text-sm font-bold">
                                    {suggestion.slice(input.length)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes terminal-blink {
                        0%, 49% { opacity: 1; }
                        50%, 100% { opacity: 0; }
                    }
                    .animate-terminal-blink {
                        animation: terminal-blink 1s infinite steps(1);
                    }
                `}</style>
                <div ref={terminalEndRef} />
            </div>

            {/* Virtual assistance keys for Mobile */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-obsidian-border z-10 bg-obsidian-card p-2 rounded-lg">
                <button
                    onClick={() => {
                        if (suggestion) {
                            setInput(suggestion)
                            setSelectionStart(suggestion.length)
                        }
                    }}
                    disabled={!suggestion}
                    className="flex-1 min-w-[60px] bg-obsidian border border-obsidian-border text-zinc-400 hover:text-toxic disabled:opacity-30 disabled:hover:text-zinc-400 px-3 py-1.5 rounded text-xs font-mono uppercase font-bold transition-all"
                >
                    Tab
                </button>
                <button
                    onClick={() => {
                        if (cmdHistory.length === 0) return
                        const newIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1)
                        setHistoryIndex(newIdx)
                        const val = cmdHistory[newIdx]
                        setInput(val)
                        setSelectionStart(val.length)
                    }}
                    disabled={cmdHistory.length === 0}
                    className="flex-1 min-w-[60px] bg-obsidian border border-obsidian-border text-zinc-400 hover:text-toxic disabled:opacity-30 disabled:hover:text-zinc-400 px-3 py-1.5 rounded text-xs font-mono uppercase font-bold transition-all"
                >
                    ▲ Prev
                </button>
                <button
                    onClick={() => {
                        if (cmdHistory.length === 0 || historyIndex === -1) return
                        const newIdx = historyIndex + 1
                        if (newIdx >= cmdHistory.length) {
                            setHistoryIndex(-1)
                            setInput('')
                            setSelectionStart(0)
                        } else {
                            setHistoryIndex(newIdx)
                            const val = cmdHistory[newIdx]
                            setInput(val)
                            setSelectionStart(val.length)
                        }
                    }}
                    disabled={cmdHistory.length === 0 || historyIndex === -1}
                    className="flex-1 min-w-[60px] bg-obsidian border border-obsidian-border text-zinc-400 hover:text-toxic disabled:opacity-30 disabled:hover:text-zinc-400 px-3 py-1.5 rounded text-xs font-mono uppercase font-bold transition-all"
                >
                    ▼ Next
                </button>
                <button
                    onClick={() => {
                        setInput('')
                        setSelectionStart(0)
                    }}
                    disabled={!input}
                    className="flex-1 min-w-[60px] bg-obsidian border border-obsidian-border text-zinc-400 hover:text-toxic disabled:opacity-30 disabled:hover:text-zinc-400 px-3 py-1.5 rounded text-xs font-mono uppercase font-bold transition-all"
                >
                    Reset
                </button>
                <button
                    onClick={() => handleCommand('clear')}
                    className="flex-1 min-w-[60px] bg-obsidian border border-obsidian-border text-zinc-400 hover:text-toxic px-3 py-1.5 rounded text-xs font-mono uppercase font-bold transition-all"
                >
                    Clear
                </button>
                <button
                    onClick={() => handleCommand('help')}
                    className="flex-1 min-w-[60px] bg-toxic text-obsidian px-3 py-1.5 rounded text-xs font-mono uppercase font-bold transition-all hover:bg-white"
                >
                    Help
                </button>
            </div>
        </main>
    )
}

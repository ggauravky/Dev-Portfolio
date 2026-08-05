// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Centralized Command Registry for Universal Command Center (Cmd + K)
// Source: https://github.com/ggauravky/Dev-Portfolio

import { projectsData } from './projectsData'

export const STATIC_COMMANDS = [
    // ── PAGES ────────────────────────────────────────────────────────
    {
        id: 'page-home',
        title: 'Home Overview',
        category: 'PAGES',
        desc: 'Main portfolio landing view, highlights & interactive hero',
        type: 'internal',
        url: '/',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['home', 'main', 'landing', 'gaurav', 'portfolio', 'overview', 'index', 'start', 'hero', 'top', 'welcome', 'root']
    },
    {
        id: 'page-about',
        title: 'About Gaurav',
        category: 'PAGES',
        desc: 'Bio, background, engineering philosophy & IIT Mandi certification',
        type: 'internal',
        url: '/about',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['about', 'about me', 'bio', 'background', 'iit mandi', 'profile', 'education', 'who is gaurav', 'who', 'me', 'developer', 'person', 'student', 'bbdu']
    },
    {
        id: 'page-journey',
        title: 'Career & Academic Journey',
        category: 'PAGES',
        desc: 'Interactive career timeline, achievements & academic milestones',
        type: 'internal',
        url: '/journey',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['journey', 'timeline', 'career', 'education', 'roadmap', 'experience', 'milestones', 'history', 'growth', 'path', 'story', 'background', 'life', 'academic']
    },
    {
        id: 'page-lab',
        title: 'Technical AI & Developer Lab',
        category: 'PAGES',
        desc: 'Interactive AI/ML tools, developer suite, algorithms & simulators',
        type: 'internal',
        url: '/lab',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['lab', 'ai lab', 'technical lab', 'developer lab', 'demos', 'tools', 'ai tools', 'interactive lab', 'ai', 'ml', 'machine learning', 'experiments', 'playground', 'workshop', 'dev tools']
    },
    {
        id: 'page-skills',
        title: 'Skills & Tech Stack Matrix',
        category: 'PAGES',
        desc: 'Full-stack development, AI/ML, DevOps & system design breakdown',
        type: 'internal',
        url: '/skills',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['skills', 'tech stack', 'technologies', 'programming', 'frameworks', 'languages', 'react', 'node', 'python', 'ai', 'ml', 'database', 'tech', 'stack', 'expertise', 'tools', 'devops', 'nextjs', 'typescript', 'javascript', 'html', 'css']
    },
    {
        id: 'page-projects',
        title: 'Projects & Case Studies Gallery',
        category: 'PAGES',
        desc: 'Software engineering portfolio, system architecture & live demos',
        type: 'internal',
        url: '/projects',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['projects', 'portfolio', 'case studies', 'work', 'code', 'software', 'apps', 'web apps', 'demos', 'builds', 'showcase', 'github', 'open source', 'repos', 'built']
    },
    {
        id: 'page-services',
        title: 'Services & Engineering Packages',
        category: 'PAGES',
        desc: 'Full-stack web apps, AI integrations, architecture & pricing',
        type: 'internal',
        url: '/services',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['services', 'service', 'hire', 'hire me', 'freelancing', 'consulting', 'pricing', 'packages', 'web development', 'ai project', 'work together', 'collaboration', 'contract', 'work with me', 'cost', 'quote', 'offer']
    },
    {
        id: 'page-blog',
        title: 'Technical Blog & Articles',
        category: 'PAGES',
        desc: 'In-depth engineering writeups, web dev insights & reader counters',
        type: 'internal',
        url: '/blog',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['blog', 'articles', 'posts', 'writing', 'engineering blog', 'tech blog', 'guides', 'tutorials', 'insights', 'read', 'content', 'notes', 'journal', 'thoughts', 'writeup']
    },
    {
        id: 'page-contact',
        title: 'Contact & Connect with Gaurav',
        category: 'PAGES',
        desc: 'Direct message form, email, phone, location & social channels',
        type: 'internal',
        url: '/contact',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['contact', 'contacts', 'contact me', 'reach me', 'email', 'mail', 'hire', 'phone', 'location', 'address', 'connect', 'connect with gaurav', 'hire me', 'job', 'internship', 'freelance', 'message', 'talk', 'chat', 'dm', 'write', 'reach out', 'get in touch', 'hello', 'ping', 'say hi']
    },
    {
        id: 'page-book',
        title: 'Book 1-on-1 Mentorship & Session',
        category: 'PAGES',
        desc: 'Reserve direct guidance, code review, career prep or technical advice',
        type: 'internal',
        url: '/book-now',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['book', 'booking', 'mentor', 'mentorship', 'book session', 'consultation', 'mentor me', 'guidance', 'book mentorship', 'mock interview', 'advice', 'session', '1on1', 'one on one', 'coach', 'coaching', 'call', 'meeting', 'schedule']
    },
    {
        id: 'page-support',
        title: 'Support & Buy Me a Coffee',
        category: 'PAGES',
        desc: 'Support open-source developer work, contribute & view supporter leaderboard',
        type: 'internal',
        url: '/support',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['support', 'donation', 'donate', 'buy coffee', 'help project', 'support developer', 'contribution', 'coffee', 'sponsor', 'fund', 'back', 'contribute', 'tip', 'appreciate', 'thank', 'bmc', 'buymeacoffee']
    },
    {
        id: 'page-activity',
        title: 'My Activity & Support Timeline',
        category: 'PAGES',
        desc: 'View personal contribution, transaction history & session support logs',
        type: 'internal',
        url: '/my-activity',
        badge: 'Page',
        shortcut: '↵',
        keywords: ['activity', 'my activity', 'history', 'transactions', 'contributions', 'timeline']
    },
    {
        id: 'page-terms',
        title: 'Terms of Service',
        category: 'PAGES',
        desc: 'Portfolio usage policies, service terms & legal conditions',
        type: 'internal',
        url: '/terms',
        badge: 'Legal',
        shortcut: '↵',
        keywords: ['terms', 'terms of service', 'legal', 'service terms', 'conditions']
    },
    {
        id: 'page-privacy',
        title: 'Privacy Policy',
        category: 'PAGES',
        desc: 'Data privacy standards, analytics & user security disclosures',
        type: 'internal',
        url: '/privacy',
        badge: 'Legal',
        shortcut: '↵',
        keywords: ['privacy', 'privacy policy', 'data privacy', 'security', 'gdpr']
    },
    {
        id: 'page-refund',
        title: 'Refund Policy',
        category: 'PAGES',
        desc: 'Service refund guarantees, cancellation terms & support policies',
        type: 'internal',
        url: '/refund',
        badge: 'Legal',
        shortcut: '↵',
        keywords: ['refund', 'refund policy', 'cancellation', 'money back', 'guarantee']
    },

    // ── LAB TOOLS ────────────────────────────────────────────────────
    {
        id: 'lab-chatbot',
        title: 'Gaurav AI Portfolio Assistant',
        category: 'LAB TOOLS',
        desc: 'Interactive RAG portfolio AI assistant powered by Gemini 2.0',
        type: 'internal',
        url: '/lab/gaurav-chatbot',
        badge: 'AI Tool',
        shortcut: '↵',
        keywords: ['chatbot', 'ai chatbot', 'assistant', 'llm', 'chat', 'ai assistant', 'bot', 'talk to ai', 'ai chat', 'portfolio bot', 'gemini', 'ask ai', 'ai agent', 'agent']
    },
    {
        id: 'action-recruiter-tour',
        title: 'Start 2-Min Recruiter Portfolio Tour',
        category: 'ACTIONS',
        desc: 'AI guided step-by-step tour tailored for recruiters and hiring managers',
        type: 'internal',
        url: '/lab/gaurav-chatbot?tour=tour_recruiter',
        badge: 'AI Tour 🚀',
        shortcut: '↵',
        keywords: ['recruiter tour', 'guided tour', 'tour', 'hiring manager', 'recruiter', 'overview', 'fast tour', '2 min tour', 'walkthrough']
    },
    {
        id: 'action-ai-minor-tour',
        title: 'Start AI & Machine Learning Tour',
        category: 'ACTIONS',
        desc: 'AI guided walkthrough of IIT Mandi Minor coursework and ML systems',
        type: 'internal',
        url: '/lab/gaurav-chatbot?tour=tour_ai',
        badge: 'AI Tour 🚀',
        shortcut: '↵',
        keywords: ['ai tour', 'machine learning tour', 'iit mandi tour', 'ml tour', 'ai engineering tour']
    },
    {
        id: 'lab-consistency',
        title: 'Consistency & Activity Dashboard',
        category: 'LAB TOOLS',
        desc: 'GitHub commit heatmaps & LeetCode problem solving streak metrics',
        type: 'internal',
        url: '/lab/consistency-dashboard',
        badge: 'Lab Tool',
        shortcut: '↵',
        keywords: ['consistency dashboard', 'github heatmap', 'leetcode activity', 'heatmap', 'streak', 'contributions', 'commits', 'problem solving', 'tracking', 'activity', 'coding streak', 'progress', 'daily', 'dashboard']
    },
    {
        id: 'lab-terminal',
        title: 'Developer UNIX Terminal Emulator',
        category: 'LAB TOOLS',
        desc: 'Interactive UNIX command line emulator with custom commands',
        type: 'internal',
        url: '/lab/terminal',
        badge: 'Lab Tool',
        shortcut: '↵',
        keywords: ['terminal', 'developer terminal', 'cli', 'bash', 'unix', 'shell', 'command line', 'emulator', 'console', 'cmd', 'prompt', 'tty', 'zsh', 'interactive', 'dev terminal']
    },
    {
        id: 'lab-algorithms',
        title: 'Algorithm & DSA Visualizer',
        category: 'LAB TOOLS',
        desc: 'Interactive step-by-step sorting & graph algorithm visualizer',
        type: 'internal',
        url: '/lab/algorithms',
        badge: 'Lab Tool',
        shortcut: '↵',
        keywords: ['algorithm visualizer', 'algorithm lab', 'sorting visualizer', 'dsa', 'graphs', 'dijkstra', 'bfs', 'dfs', 'data structures', 'sorting', 'step visualizer', 'algo', 'visualization', 'binary search', 'bubble sort', 'merge sort']
    },
    {
        id: 'lab-image-analyzer',
        title: 'TensorFlow MobileNet Image Analyzer',
        category: 'LAB TOOLS',
        desc: 'Client-side MobileNet computer vision image classifier demo',
        type: 'internal',
        url: '/lab',
        badge: 'Lab Tool',
        shortcut: '↵',
        keywords: ['image analyzer', 'image classifier', 'computer vision', 'mobilenet', 'tensorflow', 'ai tools', 'ml demo', 'vision', 'object detection', 'prompt improver']
    },
    {
        id: 'lab-neural-network',
        title: 'Neural Network Canvas & Weights',
        category: 'LAB TOOLS',
        desc: 'Interactive neural network layer visualization & activation canvas',
        type: 'internal',
        url: '/lab',
        badge: 'Lab Tool',
        shortcut: '↵',
        keywords: ['neural network', 'deep learning', 'canvas', 'weights', 'perceptron', 'activations', 'machine learning', 'ai visualizer']
    },

    // ── SERVICES ─────────────────────────────────────────────────────
    {
        id: 'service-webdev',
        title: 'Full-Stack Web Application Development',
        category: 'SERVICES',
        desc: 'Production-ready React, Next.js, Node.js & cloud applications',
        type: 'internal',
        url: '/services',
        badge: 'Service',
        shortcut: '↵',
        keywords: ['web development', 'react', 'nextjs', 'fullstack', 'frontend', 'backend', 'saas', 'web app', 'mern', 'node', 'express']
    },
    {
        id: 'service-ai',
        title: 'AI & Machine Learning System Integration',
        category: 'SERVICES',
        desc: 'Custom LLM agent pipelines, RAG systems, OpenAI & Gemini APIs',
        type: 'internal',
        url: '/services',
        badge: 'Service',
        shortcut: '↵',
        keywords: ['ai project', 'machine learning', 'llm integration', 'rag', 'python', 'ai tools', 'openai', 'gemini', 'transformers', 'agents']
    },
    {
        id: 'service-architecture',
        title: 'System Design & Backend Architecture',
        category: 'SERVICES',
        desc: 'Scalable REST/GraphQL APIs, microservices, AWS & database schema',
        type: 'internal',
        url: '/services',
        badge: 'Service',
        shortcut: '↵',
        keywords: ['architecture', 'system design', 'cloud', 'aws', 'docker', 'database', 'mongodb', 'postgres', 'microservices', 'api design']
    },
    {
        id: 'service-audit',
        title: 'Code Audit, Security & Performance Tuning',
        category: 'SERVICES',
        desc: 'Lighthouse 100 optimization, security hardening & refactoring',
        type: 'internal',
        url: '/services',
        badge: 'Service',
        shortcut: '↵',
        keywords: ['code review', 'optimization', 'refactoring', 'speed', 'seo', 'performance', 'audit', 'security', 'lighthouse']
    },

    // ── SOCIAL PROFILES & EXTERNAL ───────────────────────────────────
    {
        id: 'social-github',
        title: 'GitHub Profile & Open Source Repos',
        category: 'SOCIAL',
        desc: 'Explore open-source projects, commits & repositories (@ggauravky)',
        type: 'external',
        url: 'https://github.com/ggauravky',
        badge: 'External ↗',
        shortcut: '↵',
        keywords: ['github', 'github profile', 'repo', 'repositories', 'code', 'git', 'open source', 'ggauravky', 'gh', 'source code', 'commits', 'projects', 'version control', 'fork', 'star']
    },
    {
        id: 'social-linkedin',
        title: 'LinkedIn Professional Profile',
        category: 'SOCIAL',
        desc: 'Connect professionally, view experience & endorsements',
        type: 'external',
        url: 'https://linkedin.com/in/ggauravky',
        badge: 'External ↗',
        shortcut: '↵',
        keywords: ['linkedin', 'linkedin profile', 'professional network', 'connect', 'career', 'jobs', 'network', 'link', 'lnkd', 'in', 'professional', 'social', 'job', 'hire', 'recruiter', 'connection']
    },
    {
        id: 'social-instagram',
        title: 'Instagram Social Media',
        category: 'SOCIAL',
        desc: 'Follow personal updates, tech highlights & behind-the-scenes',
        type: 'external',
        url: 'https://instagram.com/ggauravky',
        badge: 'External ↗',
        shortcut: '↵',
        keywords: ['instagram', 'insta', 'social', 'photos', 'stories', 'media', 'ig', 'follow', 'photo', 'reel']
    },
    {
        id: 'social-x',
        title: 'X / Twitter Handle',
        category: 'SOCIAL',
        desc: 'Tech commentary, web dev updates & software build in public',
        type: 'external',
        url: 'https://x.com/ggauravky',
        badge: 'External ↗',
        shortcut: '↵',
        keywords: ['x', 'twitter', 'tweets', 'social', 'tech tweets', 'build in public', 'tweet', 'follow', 'twitter profile', 'thread']
    },
    {
        id: 'social-leetcode',
        title: 'LeetCode Problem Solving Profile',
        category: 'SOCIAL',
        desc: 'Competitive programming solutions & Data Structures achievements',
        type: 'external',
        url: 'https://leetcode.com/gauravky',
        badge: 'External ↗',
        shortcut: '↵',
        keywords: ['leetcode', 'coding profile', 'dsa', 'problem solving', 'algorithms', 'contest', 'solutions', 'lc', 'competitive', 'coding', 'challenge', 'problems']
    },
    {
        id: 'social-gfg',
        title: 'GeeksforGeeks Coding Profile',
        category: 'SOCIAL',
        desc: 'CS fundamental articles, problem practice & competitive stats',
        type: 'external',
        url: 'https://geeksforgeeks.org/user/gauravky',
        badge: 'External ↗',
        shortcut: '↵',
        keywords: ['gfg', 'geeksforgeeks', 'articles', 'dsa', 'cs fundamentals', 'practice', 'geeks', 'computer science', 'coding articles']
    },
    {
        id: 'contact-email-link',
        title: 'Send Direct Email (kumar.gaurav.yadav2007@gmail.com) ',
category: 'SOCIAL',
    desc: 'Launch email client directly to write to Gaurav',
        type: 'external',
            url: 'mailto:kumar.gaurav.yadav2007@gmail.com',
badge: 'Mailto ↗',
    shortcut: '↵',
        keywords: ['email', 'gmail', 'mail', 'write mail', 'message', 'send email', 'kumar.gaurav.yadav2007@gmail.com', 'contact email', 'send mail', 'write', 'reach', 'mailto', 'inbox', 'compose']
    },
            {
                id: 'contact-phone-link',
                title: 'Call / WhatsApp (+91 82357 73177)',
                category: 'SOCIAL',
                desc: 'Direct phone dial or message channel',
                type: 'external',
                url: 'tel:+918235773177',
                badge: 'Phone ↗',
                shortcut: '↵',
                keywords: ['call', 'phone', 'mobile', 'dial', 'whatsapp', 'contact number', '8235773177', 'number', 'wa', 'wp', 'chat', 'ring']
            },

            // ── ACTIONS ──────────────────────────────────────────────────────
            {
                id: 'action-resume',
                title: 'Download Official Resume PDF',
                category: 'ACTIONS',
                desc: 'Open & download official curriculum vitae / engineering resume',
                type: 'external',
                url: '/resume.pdf',
                badge: 'PDF 📄',
                shortcut: '↵',
                keywords: ['resume', 'cv', 'download resume', 'pdf', 'curriculum vitae', 'bio pdf', 'experience document', 'download', 'hire', 'qualification', 'document', 'portfolio pdf', 'vita']
            },
            {
                id: 'action-copy-email',
                title: 'Copy Email Address to Clipboard',
                category: 'ACTIONS',
                desc: 'Quickly copy kumar.gaurav.yadav2007@gmail.com for messaging',
        type: 'action',
                actionId: 'copy-email',
                badge: 'Action ⚡',
                shortcut: '↵',
                keywords: ['copy email', 'email address', 'get email', 'copy mail', 'clipboard email', 'email copy', 'clipboard', 'copy address', 'share email']
            },
            {
                id: 'action-copy-url',
                title: 'Copy Portfolio Share URL',
                category: 'ACTIONS',
                desc: 'Copy current web portfolio link to share with colleagues',
                type: 'action',
                actionId: 'copy-url',
                badge: 'Action ⚡',
                shortcut: '↵',
                keywords: ['copy url', 'share portfolio', 'copy link', 'share site', 'portfolio link', 'url', 'link', 'share', 'clipboard url', 'share link']
            }
        ]

// Dynamically generate command items for every project in projectsData
export const getProjectCommands = () => {
    return projectsData.map((project) => {
        const techList = project.techStack ? project.techStack.join(', ') : ''
        const categories = project.categories ? project.categories.join(', ') : ''
        return {
            id: `project-${project.slug}`,
            title: project.title,
            category: 'PROJECTS',
            desc: project.description || `Engineering case study for ${project.title}`,
            type: 'internal',
            url: `/projects/${project.slug}`,
            badge: 'Case Study',
            shortcut: '↵',
            keywords: [
                project.title.toLowerCase(),
                project.slug.toLowerCase(),
                'project',
                'case study',
                'demo',
                ...techList.toLowerCase().split(/[\s,]+/),
                ...categories.toLowerCase().split(/[\s,]+/)
            ]
        }
    })
}

// Full registry getter combining pages, lab tools, projects, services, social & actions
export const getAllCommands = () => {
    return [...STATIC_COMMANDS, ...getProjectCommands()]
}

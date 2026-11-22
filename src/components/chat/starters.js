// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Hand-written starter questions. Each names something real in the site data
// or the owner's knowledge base (source in the comment). Questions that are
// also FAQ questions (q…) get the owner's own answer with no model call
// (D-109). Logged in docs/COPY_REVIEW.md for the owner to confirm.

export const STARTERS = [
    'What is TaskNexus?', // knowledge base: faq q023
    "What are Gaurav's most important projects?", // knowledge base: faq q022
    'How does Kanoon-Mate work under the hood?', // projectsData: kanoon-mate
    'Where has Gaurav worked?', // knowledge base: faq q006
    'What happened at the TechX26 Hackathon?', // journeyData: techx26-hackathon-2026
    "What's in the Full Stack Development service, and what does it cost?", // servicesData: fullstack-development
    'Why should I hire Gaurav?', // the hiring summaries built from the knowledge base (D-112)
    'Is he available for internships or work?', // knowledge base: faq q015
]

// The chat start screen lists four of these as a ruled list (unslop audit X-1,
// D-115): the projects overview, one case study, work history and
// availability. Kept here so a reorder above is seen next to it; the full list
// still feeds the follow-up offers in lib/chat/intents.js.
export const HOME_STARTERS = [1, 2, 3, 7].map((i) => STARTERS[i]).filter(Boolean)

import { KnowledgeDocument } from '../types';
import portfolioDataRaw from '../../../data/portfolioData.json';

/**
 * Parses portfolio JSON data into structured KnowledgeDocument objects for RAG indexing.
 */
export function parsePortfolioData(rawJson: unknown = portfolioDataRaw): KnowledgeDocument[] {
  const documents: KnowledgeDocument[] = [];
  const data = (rawJson || {}) as Record<string, unknown>;

  // 1. Personal & Bio Document
  if (data.personal && typeof data.personal === 'object') {
    const p = data.personal as Record<string, unknown>;
    documents.push({
      id: 'doc_personal_bio',
      section: 'bio',
      title: `Gaurav Kumar Yadav — Profile & Bio`,
      content: [
        `Name: ${p.name || 'Gaurav Kumar Yadav'}`,
        `Title: ${p.title || ''}`,
        `Location: ${p.location || ''}`,
        `Email: ${p.email || ''}`,
        `Bio: ${p.bio || ''}`,
        `Open To: ${Array.isArray(p.openTo) ? p.openTo.join(', ') : ''}`,
      ].join('\n'),
      tags: ['bio', 'profile', 'contact', 'personal'],
      metadata: { section: 'bio' },
    });
  }

  // 2. Education Documents
  if (Array.isArray(data.education)) {
    const eduList = data.education as Array<Record<string, unknown>>;
    const eduContent = eduList
      .map(
        (e) =>
          `- ${e.degree || ''} at ${e.institution || ''} (${e.year || e.status || ''}). Location: ${e.location || ''}. Focus: ${e.focus || ''}`
      )
      .join('\n');

    documents.push({
      id: 'doc_education',
      section: 'education',
      title: 'Education & Qualifications',
      content: `Gaurav's Educational Qualifications:\n${eduContent}`,
      tags: ['education', 'degree', 'bbdu', 'iit mandi', 'bca'],
      metadata: { section: 'education' },
    });
  }

  // 3. Technical Skills Document
  if (data.skills && typeof data.skills === 'object') {
    const s = data.skills as Record<string, Array<string>>;
    const skillContent = Object.entries(s)
      .map(([cat, list]) => `${cat.toUpperCase()}: ${Array.isArray(list) ? list.join(', ') : String(list)}`)
      .join('\n');

    documents.push({
      id: 'doc_skills',
      section: 'skills',
      title: 'Technical Skills & Tech Stack',
      content: `Gaurav's Technical Skills:\n${skillContent}`,
      tags: ['skills', 'python', 'react', 'javascript', 'node', 'mongodb', 'ai', 'ml', 'tailwind'],
      metadata: { section: 'skills' },
    });
  }

  // 4. Projects Documents
  if (Array.isArray(data.projects)) {
    const projList = data.projects as Array<Record<string, unknown>>;
    for (let i = 0; i < projList.length; i++) {
      const proj = projList[i];
      const title = String(proj.title || `Project ${i + 1}`);
      const id = `doc_project_${title.toLowerCase().replace(/[^\w]/g, '_')}`;

      documents.push({
        id,
        section: 'projects',
        title: `Project: ${title}`,
        content: [
          `Title: ${title}`,
          `Status: ${proj.status || ''}`,
          `Description: ${proj.description || ''}`,
          `Tech Stack: ${Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.tech || ''}`,
          `Key Features / Impact: ${proj.solution || proj.impact || ''}`,
        ].join('\n'),
        tags: ['project', title.toLowerCase(), ...((proj.techStack as string[]) || [])],
        metadata: { ...proj, section: 'projects' },
      });
    }
  }

  // 5. Services Documents
  if (Array.isArray(data.services)) {
    const servList = data.services as Array<Record<string, unknown>>;
    const content = servList
      .map(
        (srv) =>
          `- ${srv.title || ''}: ${srv.description || ''}. Deliverables: ${Array.isArray(srv.deliverables) ? srv.deliverables.join(', ') : ''}`
      )
      .join('\n');

    documents.push({
      id: 'doc_services',
      section: 'services',
      title: 'Services & Work Offerings',
      content: `Services Offered by Gaurav:\n${content}`,
      tags: ['services', 'freelance', 'development', 'hire', 'mentorship'],
      metadata: { section: 'services' },
    });
  }

  // 6. FAQ Documents
  if (Array.isArray(data.faq)) {
    const faqList = data.faq as Array<{ question?: string; answer?: string }>;
    for (let i = 0; i < faqList.length; i++) {
      const item = faqList[i];
      documents.push({
        id: `doc_faq_${i + 1}`,
        section: 'faq',
        title: `FAQ: ${item.question || `Question ${i + 1}`}`,
        content: `Q: ${item.question}\nA: ${item.answer}`,
        tags: ['faq', 'questions', 'answers'],
        metadata: { section: 'faq' },
      });
    }
  }

  // 7. Voice & Work Style
  if (data.voice && typeof data.voice === 'object') {
    const v = data.voice as Record<string, unknown>;
    const content = Object.entries(v)
      .map(([k, val]) => `${k}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`)
      .join('\n');

    documents.push({
      id: 'doc_voice_workstyle',
      section: 'bio',
      title: 'Work Style, Mindset & Goals',
      content: `Gaurav's Work Style & Values:\n${content}`,
      tags: ['workstyle', 'mindset', 'goals', 'consistency'],
      metadata: { section: 'bio' },
    });
  }

  return documents;
}

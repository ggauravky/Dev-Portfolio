// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Skills (P5). One page, three groups, no tabs: every skill is visible and
// findable with the browser's own search. Hairline rows; the category sits in
// the label column, the skills read as a plain list.
// Motion moments: (1) line-masked section headings.

import useSEO from '../hooks/useSEO'
import PageHead from '../components/page/PageHead'
import { skillsHead } from '../lib/pageHeads'
import PageSection from '../components/page/PageSection'
import { Button, TextLink } from '../components/ui'
import { skillGroups } from '../data/skillsData'
import './Skills.css'

const HEAD = skillsHead(skillGroups)

function Skills() {
    useSEO({
        title: 'Skills | Gaurav Kumar Yadav | Python, AI/ML, React & Full Stack Technologies',
        description: 'Technical skills of Gaurav Kumar Yadav, a BCA student at BBDU Lucknow — Python, AI/ML, Data Science, React, Node.js, MongoDB, JavaScript, Pandas, NumPy, and modern full stack web technologies. Open to internships and entry-level AI and Full Stack Development positions.',
        keywords: 'Gaurav Kumar Yadav skills, Gaurav Kumar Yadav BBDU, Python developer Lucknow, AI ML skills student India, React developer skills, Full Stack skills MERN, machine learning developer portfolio, ggauravky technical skills',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <main className="pg skills">
            <PageHead head={HEAD} />

            {skillGroups.map((group, i) => (
                <PageSection key={group.id} id={group.id} index={i + 1} title={group.title}>
                    <ul className="pg-rows">
                        {group.categories.map((cat) => (
                            <li key={cat.title} className="pg-row">
                                <h3 className="pg-row__label">{cat.title}</h3>
                                <ul className="skills-list">
                                    {cat.skills.map((skill) => <li key={skill}>{skill}</li>)}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </PageSection>
            ))}

            <PageSection id="in-use" index={skillGroups.length + 1} title="In use">
                <p className="skills-close">Every project lists the stack it was built with.</p>
                <div className="pg-actions">
                    <Button to="/projects" arrow>Projects</Button>
                    <TextLink to="/services">Services</TextLink>
                    <TextLink to="/contact">Contact</TextLink>
                </div>
            </PageSection>
        </main>
    )
}

export default Skills

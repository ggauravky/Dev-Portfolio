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
import { staticSeo } from '../lib/seo'
import PageHead from '../components/page/PageHead'
import { skillsHead } from '../lib/pageHeads'
import PageSection from '../components/page/PageSection'
import { Button, TextLink } from '../components/ui'
import { skillGroups } from '../data/skillsData'
import './Skills.css'

const SEO = staticSeo('/skills')

const HEAD = skillsHead(skillGroups)

function Skills() {
    useSEO({
        ...SEO,
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

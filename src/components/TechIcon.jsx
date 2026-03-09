// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Official brand logos from Devicons (MIT licensed) — https://devicons.github.io/devicon/
const D = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

const iconMap = {
    // ── Languages ──────────────────────────────────────────────────────────
    'Python':                   `${D}/python/python-original.svg`,
    'JavaScript':               `${D}/javascript/javascript-original.svg`,
    'Java':                     `${D}/java/java-original.svg`,
    'C':                        `${D}/c/c-original.svg`,
    'SQL':                      `${D}/mysql/mysql-original.svg`,
    'TypeScript':               `${D}/typescript/typescript-original.svg`,

    // ── Frontend ────────────────────────────────────────────────────────────
    'React.js':                 `${D}/react/react-original.svg`,
    'React':                    `${D}/react/react-original.svg`,
    'HTML5 & CSS3':             `${D}/html5/html5-original.svg`,
    'HTML':                     `${D}/html5/html5-original.svg`,
    'CSS':                      `${D}/css3/css3-original.svg`,
    'Tailwind CSS':             `${D}/tailwindcss/tailwindcss-original.svg`,
    'Bootstrap':                `${D}/bootstrap/bootstrap-original.svg`,

    // ── Backend ─────────────────────────────────────────────────────────────
    'Node.js':                  `${D}/nodejs/nodejs-original.svg`,
    'Express.js':               `${D}/express/express-original.svg`,
    'Express':                  `${D}/express/express-original.svg`,
    'Flask':                    `${D}/flask/flask-original.svg`,
    'Django':                   `${D}/django/django-plain.svg`,
    'FastAPI':                  `${D}/fastapi/fastapi-original.svg`,

    // ── Database ────────────────────────────────────────────────────────────
    'MongoDB':                  `${D}/mongodb/mongodb-original.svg`,
    'MySQL':                    `${D}/mysql/mysql-original.svg`,
    'PostgreSQL':               `${D}/postgresql/postgresql-original.svg`,
    'SQLite':                   `${D}/sqlite/sqlite-original.svg`,
    'Redis':                    `${D}/redis/redis-original.svg`,

    // ── Dev Tools ───────────────────────────────────────────────────────────
    'Git & GitHub':             `${D}/git/git-original.svg`,
    'Git':                      `${D}/git/git-original.svg`,
    'GitHub':                   `${D}/github/github-original.svg`,
    'VS Code':                  `${D}/vscode/vscode-original.svg`,
    'Postman':                  `${D}/postman/postman-original.svg`,
    'Docker':                   `${D}/docker/docker-original.svg`,
    'Linux':                    `${D}/linux/linux-original.svg`,

    // ── Data Science ────────────────────────────────────────────────────────
    'Pandas':                   `${D}/pandas/pandas-original.svg`,
    'NumPy':                    `${D}/numpy/numpy-original.svg`,
    'Matplotlib':               `${D}/matplotlib/matplotlib-original.svg`,
    'Jupyter Notebooks':        `${D}/jupyter/jupyter-original.svg`,
    'Jupyter':                  `${D}/jupyter/jupyter-original.svg`,

    // ── ML Frameworks ───────────────────────────────────────────────────────
    'Scikit-learn':             `${D}/scikitlearn/scikitlearn-original.svg`,
    'TensorFlow':               `${D}/tensorflow/tensorflow-original.svg`,
    'PyTorch':                  `${D}/pytorch/pytorch-original.svg`,

    // ── Cloud & Platforms ───────────────────────────────────────────────────
    'Google Cloud Platform':    `${D}/googlecloud/googlecloud-original.svg`,
    'AWS Basics':               `${D}/amazonwebservices/amazonwebservices-plain-wordmark.svg`,
    'AWS':                      `${D}/amazonwebservices/amazonwebservices-plain-wordmark.svg`,
    'Kaggle':                   `${D}/kaggle/kaggle-original.svg`,
    'Firebase':                 `${D}/firebase/firebase-original.svg`,
    'Vercel':                   `${D}/vercel/vercel-original.svg`,

    // ── Other ────────────────────────────────────────────────────────────────
    'JWT':                      `${D}/nodejs/nodejs-original.svg`,
}

// These icons have dark/black paths and must be inverted to show on dark backgrounds
const needsInvert = new Set(['Express.js', 'Express', 'Flask', 'GitHub', 'Vercel'])

/**
 * Renders an official brand logo for a given technology name.
 * Falls back to nothing if no icon is registered for that name.
 *
 * @param {string} name       - Technology display name (must match a key in iconMap)
 * @param {string} className  - Tailwind size classes, e.g. "w-4 h-4 shrink-0"
 */
export default function TechIcon({ name, className = 'w-4 h-4 shrink-0' }) {
    const src = iconMap[name]
    if (!src) return null

    return (
        <img
            src={src}
            alt={name}
            aria-hidden="true"
            className={`${className} object-contain`}
            style={needsInvert.has(name) ? { filter: 'brightness(0) invert(0.85)' } : undefined}
            loading="lazy"
            width="16"
            height="16"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
    )
}

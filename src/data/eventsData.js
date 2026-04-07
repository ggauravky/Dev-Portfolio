// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Keep records sorted by date descending when adding entries.
// Required fields per record:
// - id
// - title
// - date (YYYY-MM-DD or label like Day 273)
// - organizer
// - participation
// - note
// Optional fields:
// - dateLabel
// - eventType
// - location
// - workshop
// - speakers (string[])
// - highlights (string[])
// - companions (string[])
// - hashtags (string[])
// - images (string[])
// - source
export const eventsData = [
	{
		id: 'product-builders-day-day-273',
		title: 'Learning Beyond Code at Product Builder\'s Day',
		date: '2026-03-28',
		dateLabel: 'March 28, 2026',
		eventType: 'Product Builder Event',
		organizer: 'Google Developer Groups Lucknow',
		participation: 'Attended',
		location: 'Integral University, Lucknow, Uttar Pradesh',
		source: 'LinkedIn Post',
		note: 'A refreshing break from regular coding, focused on builder mindset, entrepreneurship, networking, and AI-powered systems.',
		workshop: 'Hands-on workshop on building an AI-powered app with Gemini Code Assist.',
		speakers: [
			'Mr. Alok Pandey',
			'Ashutosh S. Bhakare',
			'Mr. Ashish Mishra',
			'Ms. Namrata More',
		],
		highlights: [
			'Developer-to-builder and founder mindset insights',
			'Practical networking strategies for student developers',
			'Future direction of AI-powered applications',
			'Real-world implementation workshop with Gemini Code Assist',
		],
		companions: [
			'Nikhil Agrahari',
			'Junaid Khan',
		],
		hashtags: [
			'LearningJourney',
			'BuildInPublic',
			'StudentDeveloper',
			'TechEvents',
			'Entrepreneurship',
			'AI',
			'Networking',
			'Consistency',
			'Day273',
			'ggauravky',
		],
		images: [
			'/images/blogs/build1.jpg',
			'/images/blogs/build2.jpg',
			'/images/blogs/build3.jpg',
			'/images/blogs/build4.jpg',
			'/images/blogs/build5.jpg',
			'/images/blogs/build6.jpg',
		],
	},
	{
		id: 'hackwithsmile-2026-cybersecurity-learning-day',
		title: 'Cybersecurity Learning Day at HackWithSmile.In | AiCyber.Guru 2026',
		date: '2026-03-14',
		dateLabel: '14 March 2026',
		eventType: 'Cybersecurity Conference + Workshop',
		organizer: 'HackWithSmile.In | by AiCyber.Guru 2026',
		participation: 'Attended',
		location: 'Lucknow, Uttar Pradesh',
		source: 'LinkedIn Post',
		note: 'A full-day cybersecurity conference and workshop focused on real-world security practices beyond coding routines.',
		workshop: 'Sessions covered Responsible Bug Bounty, Drone Forensics, and Offensive Security in OT Environments.',
		speakers: [
			'Dr. Rahul Kumar Verma (IIIT Lucknow)',
			'Kishore Chintalapati (Microsoft)',
			'Other cybersecurity professionals',
		],
		highlights: [
			'Responsible Bug Bounty workflows and ethical vulnerability reporting',
			'Drone Forensics fundamentals for digital investigations',
			'Offensive Security in OT environments and critical systems testing',
			'Industry-led perspective on practical cybersecurity careers',
			'Hands-on understanding of security beyond textbooks and coding practice',
		],
		hashtags: [
			'CyberSecurity',
			'HackWithSmile',
			'LearningJourney',
			'StudentDeveloper',
			'BuildInPublic',
			'TechEvents',
			'CyberSecurityLearning',
			'Consistency',
			'Day259',
			'ggauravky',
		],
		images: [
			'/images/blogs/cy1.jpg',
			'/images/blogs/cy2.jpg',
			'/images/blogs/cy3.jpg',
			'/images/blogs/cy4.jpg',
		],
	},
]

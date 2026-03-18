// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const pad2 = (value) => String(value).padStart(2, '0')

export const formatDateLabel = (dateString) => {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return dateString

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

export const formatTimeLabel = (timeString) => {
    if (!timeString?.includes(':')) return timeString
    const [hoursRaw, minutesRaw] = timeString.split(':')
    const hours = Number(hoursRaw)
    const minutes = Number(minutesRaw)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeString

    const period = hours >= 12 ? 'PM' : 'AM'
    const normalizedHour = hours % 12 || 12
    return `${normalizedHour}:${pad2(minutes)} ${period}`
}

const wrapCanvasText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = String(text || '').split(' ')
    let line = ''
    let lineY = y

    for (let i = 0; i < words.length; i += 1) {
        const testLine = `${line}${words[i]} `
        const testWidth = ctx.measureText(testLine).width
        if (testWidth > maxWidth && i > 0) {
            ctx.fillText(line.trim(), x, lineY)
            line = `${words[i]} `
            lineY += lineHeight
        } else {
            line = testLine
        }
    }

    if (line.trim()) {
        ctx.fillText(line.trim(), x, lineY)
    }

    return lineY + lineHeight
}

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + width - r, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + r)
    ctx.lineTo(x + width, y + height - r)
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
    ctx.lineTo(x + r, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
}

export const downloadGreetingCard = ({
    name,
    serviceTitle,
    bookingId,
    preferredDate,
    preferredTime,
}) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1600
    canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0f172a')
    gradient.addColorStop(0.45, '#1e3a8a')
    gradient.addColorStop(1, '#312e81')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#22d3ee'
    ctx.beginPath()
    ctx.arc(1320, 140, 210, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#60a5fa'
    ctx.beginPath()
    ctx.arc(210, 740, 250, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)'
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, 90, 80, 1420, 740, 28)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#67e8f9'
    ctx.font = 'bold 26px Poppins, Segoe UI, sans-serif'
    ctx.fillText('BOOKING CONFIRMED', 140, 155)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 66px Poppins, Segoe UI, sans-serif'
    ctx.fillText('Welcome Onboard', 140, 245)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = '500 36px Poppins, Segoe UI, sans-serif'
    const customerName = name ? `Hi ${name},` : 'Hi there,'
    ctx.fillText(customerName, 140, 312)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = '500 30px Poppins, Segoe UI, sans-serif'
    wrapCanvasText(
        ctx,
        `You are successfully enrolled for ${serviceTitle}. Thank you for your trust.`,
        140,
        368,
        980,
        44
    )

    ctx.fillStyle = '#93c5fd'
    ctx.font = '600 24px Poppins, Segoe UI, sans-serif'
    ctx.fillText(`Preferred Date: ${formatDateLabel(preferredDate)}`, 140, 500)
    ctx.fillText(`Preferred Time: ${formatTimeLabel(preferredTime)}`, 140, 542)

    ctx.fillStyle = '#a5b4fc'
    ctx.fillText(`Booking ID: ${bookingId}`, 140, 584)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = '500 22px Poppins, Segoe UI, sans-serif'
    wrapCanvasText(
        ctx,
        'Please keep this card for your record. You can reach out on Contact page for reschedule or support.',
        140,
        650,
        1170,
        34
    )

    ctx.fillStyle = '#7dd3fc'
    ctx.font = '600 22px Poppins, Segoe UI, sans-serif'
    ctx.fillText('Gaurav Kumar Yadav', 140, 760)

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `greeting-card-${bookingId || Date.now()}.png`
    link.click()
}

export const downloadBookingPdf = async ({
    bookingId,
    name,
    email,
    serviceTitle,
    amount,
    preferredDate,
    preferredTime,
    paymentId,
    orderId,
}) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })

    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 595, 120, 'F')

    doc.setTextColor(103, 232, 249)
    doc.setFontSize(12)
    doc.text('BOOKING RECEIPT', 46, 38)

    doc.setTextColor(241, 245, 249)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Service Enrollment Confirmation', 46, 72)

    doc.setTextColor(51, 65, 85)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Issued On: ${new Date().toLocaleString('en-IN')}`, 46, 144)

    const rows = [
        ['Booking ID', bookingId],
        ['Customer Name', name],
        ['Email', email],
        ['Service', serviceTitle],
        ['Amount Paid', `INR ${amount}`],
        ['Preferred Date', formatDateLabel(preferredDate)],
        ['Preferred Time', formatTimeLabel(preferredTime)],
        ['Payment ID', paymentId],
        ['Order ID', orderId],
    ]

    let y = 190
    rows.forEach(([label, value], index) => {
        const rowBg = index % 2 === 0 ? [248, 250, 252] : [241, 245, 249]
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2])
        doc.rect(40, y - 18, 515, 34, 'F')

        doc.setTextColor(30, 41, 59)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(`${label}:`, 54, y + 3)

        doc.setTextColor(15, 23, 42)
        doc.setFont('helvetica', 'normal')
        const safeValue = String(value || '-')
        doc.text(safeValue, 220, y + 3)

        y += 34
    })

    doc.setTextColor(71, 85, 105)
    doc.setFontSize(10)
    doc.text('Payment processed securely via Razorpay. No card data is stored on this website.', 40, 545)
    doc.text('For support or rescheduling, use the contact options on the website.', 40, 563)

    doc.setDrawColor(226, 232, 240)
    doc.line(40, 585, 555, 585)

    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Thank you for booking with Gaurav Kumar Yadav.', 40, 610)

    doc.save(`booking-confirmation-${bookingId || Date.now()}.pdf`)
}

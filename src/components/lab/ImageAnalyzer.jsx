// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { logMlUsage, uploadAndLogImage } from '../../utils/mlLogger'

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024 // 8MB
const INFERENCE_SIZE = 224
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

let cachedModelBundle = null
let cachedModelPromise = null

const formatConfidence = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`

const buildInferenceCanvas = (imageElement) => {
    const width = imageElement?.naturalWidth || 0
    const height = imageElement?.naturalHeight || 0

    if (!width || !height) {
        throw new Error('Image is not ready yet. Please wait a moment and try again.')
    }

    const canvas = document.createElement('canvas')
    canvas.width = INFERENCE_SIZE
    canvas.height = INFERENCE_SIZE

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare image for model input.')

    const cropSize = Math.min(width, height)
    const offsetX = Math.max(0, (width - cropSize) / 2)
    const offsetY = Math.max(0, (height - cropSize) / 2)

    context.drawImage(
        imageElement,
        offsetX,
        offsetY,
        cropSize,
        cropSize,
        0,
        0,
        INFERENCE_SIZE,
        INFERENCE_SIZE
    )

    return canvas
}

// Load a <script> tag from CDN once; resolve immediately if already present.
const loadScript = (src) =>
    new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
        const s = document.createElement('script')
        s.src = src
        s.crossOrigin = 'anonymous'
        s.onload = resolve
        s.onerror = () => reject(new Error(`Failed to load: ${src}`))
        document.head.appendChild(s)
    })

// Pinned CDN versions — no Vite bundling, no module/require in browser scope.
const TF_CDN = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js'
const MOBILENET_CDN = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js'

const loadModelBundle = async () => {
    if (cachedModelBundle) return cachedModelBundle
    if (cachedModelPromise) return cachedModelPromise

    cachedModelPromise = (async () => {
        // TF.js must load before MobileNet (peer dependency).
        await loadScript(TF_CDN)
        await loadScript(MOBILENET_CDN)

        const tf = window.tf
        const mobilenet = window.mobilenet

        if (!tf || !mobilenet) {
            throw new Error('TensorFlow.js failed to initialize. Please refresh and try again.')
        }

        await tf.ready()

        // Try WebGL first for speed, then silently continue with available backend.
        try {
            if (tf.getBackend() !== 'webgl') {
                await tf.setBackend('webgl')
                await tf.ready()
            }
        } catch {
            // no-op: fallback backend still works
        }

        const model = await mobilenet.load({ version: 2, alpha: 1 })
        cachedModelBundle = { model }
        return cachedModelBundle
    })()

    try {
        return await cachedModelPromise
    } catch (error) {
        cachedModelPromise = null
        throw error
    }
}

function ImageAnalyzer() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [predictions, setPredictions] = useState([])
    const [error, setError] = useState('')
    const [statusText, setStatusText] = useState('Upload an image and run real MobileNet inference.')
    const [modelState, setModelState] = useState(cachedModelBundle ? 'ready' : 'idle')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [imageReady, setImageReady] = useState(false)

    const inputRef = useRef(null)
    const imageRef = useRef(null)
    const lockRef = useRef(false)

    useEffect(() => {
        if (!previewUrl) return undefined
        return () => {
            URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const resetSelection = useCallback(() => {
        setSelectedFile(null)
        setPreviewUrl('')
        setImageReady(false)
        setPredictions([])
        setError('')
        setStatusText('Upload an image and run real MobileNet inference.')
        if (inputRef.current) inputRef.current.value = ''
    }, [])

    const openFilePicker = useCallback(() => {
        inputRef.current?.click()
    }, [])

    const handleFileChange = useCallback((event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setError('')
        setPredictions([])
        setImageReady(false)

        if (!file.type.startsWith('image/')) {
            setStatusText('Please upload a valid image file.')
            setError('Only image files are supported for this demo.')
            event.target.value = ''
            return
        }

        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            setStatusText('Use JPG, PNG, or WEBP images for best compatibility.')
            setError('Unsupported format. Please upload JPG, PNG, or WEBP.')
            event.target.value = ''
            return
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setStatusText('Please use a smaller image.')
            setError('File is too large. Max supported size is 8MB.')
            event.target.value = ''
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setSelectedFile(file)
        setPreviewUrl(objectUrl)
        setStatusText('Image ready. Click Analyze to run model inference.')
    }, [])

    const analyzeImage = useCallback(async () => {
        if (!imageRef.current || !previewUrl || isAnalyzing || lockRef.current || !imageReady) return

        lockRef.current = true
        setIsAnalyzing(true)
        setError('')

        try {
            if (!cachedModelBundle) {
                setModelState('loading')
                setStatusText('Loading MobileNet model...')
            }

            const bundle = await loadModelBundle()
            setModelState('ready')
            setStatusText('Running inference...')

            const canvas = buildInferenceCanvas(imageRef.current)
            const results = await bundle.model.classify(canvas, 3)

            // Capture the 224×224 canvas as JPEG before zeroing it.
            // This small snapshot (~25–50 KB) is what gets sent to Cloudinary.
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.75)

            // Free GPU memory immediately after capturing
            canvas.width = 0
            canvas.height = 0

            if (!Array.isArray(results) || results.length === 0) {
                throw new Error('Model returned no prediction. Please try another image.')
            }

            setPredictions(results)
            setStatusText(`Top match: ${results[0].className} (${formatConfidence(results[0].probability)})`)

            // Fire-and-forget: upload snapshot + predictions to Cloudinary via backend.
            // Errors are swallowed — never blocks the UI or affects the user.
            void uploadAndLogImage({
                imageBase64,
                predictionLabel: results[0].className,
                topPredictions: results.slice(0, 3).map((r) => ({
                    className: r.className,
                    probability: r.probability,
                })),
            })
        } catch (analysisError) {
            setStatusText('Could not complete inference.')
            setError(analysisError?.message || 'Failed to analyze image. Please retry.')
            if (!cachedModelBundle) setModelState('error')
        } finally {
            setIsAnalyzing(false)
            lockRef.current = false
        }
    }, [imageReady, isAnalyzing, previewUrl])

    const modelBadge = useMemo(() => {
        if (modelState === 'ready') return { label: 'Model Ready', cls: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' }
        if (modelState === 'loading') return { label: 'Loading Model', cls: 'text-amber-300 border-amber-500/40 bg-amber-500/10' }
        if (modelState === 'error') return { label: 'Model Error', cls: 'text-rose-300 border-rose-500/40 bg-rose-500/10' }
        return { label: 'Model Idle', cls: 'text-slate-300 border-slate-500/30 bg-slate-700/30' }
    }, [modelState])

    return (
        <div className="group relative p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <svg className="w-8 h-8 text-cyan-400 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                        <h3 className="text-white font-semibold text-lg">AI Image Analyzer</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Real MobileNet classification in-browser with TensorFlow.js.
                        </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${modelBadge.cls}`}>
                        {modelBadge.label}
                    </span>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
                    {previewUrl ? (
                        <div className="space-y-3">
                            <img
                                ref={imageRef}
                                src={previewUrl}
                                alt="Preview for AI analysis"
                                onLoad={() => setImageReady(true)}
                                onError={() => {
                                    setImageReady(false)
                                    setError('Failed to load image preview.')
                                }}
                                className="w-full h-44 object-cover rounded-lg border border-slate-700/70"
                            />
                            <div className="text-xs text-slate-400 truncate">
                                {selectedFile?.name} · {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB` : ''}
                            </div>
                        </div>
                    ) : (
                        <div className="h-44 rounded-lg border border-dashed border-slate-700/70 flex items-center justify-center text-center px-4">
                            <p className="text-slate-500 text-sm">
                                Upload a JPG/PNG/WEBP image (max 8MB), then run analysis.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={openFilePicker}
                        className="px-3 py-2 text-sm rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-100 border border-slate-600/70 transition-colors"
                    >
                        {previewUrl ? 'Replace Image' : 'Upload Image'}
                    </button>

                    <button
                        type="button"
                        onClick={analyzeImage}
                        disabled={!previewUrl || !imageReady || isAnalyzing || modelState === 'loading'}
                        className="px-3 py-2 text-sm rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white border border-cyan-500/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>

                    <button
                        type="button"
                        onClick={resetSelection}
                        disabled={isAnalyzing}
                        className="px-3 py-2 text-sm rounded-lg bg-transparent text-slate-300 hover:text-white border border-slate-600/70 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset
                    </button>
                </div>

                <div className="text-xs text-slate-400">
                    {statusText}
                </div>

                {error && (
                    <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                {predictions.length > 0 && (
                    <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3 space-y-2">
                        <p className="text-sm text-cyan-300 font-medium">
                            Top Prediction: {predictions[0].className}
                            <span className="text-slate-300 font-normal"> ({formatConfidence(predictions[0].probability)})</span>
                        </p>
                        <ul className="space-y-1.5 text-sm">
                            {predictions.slice(0, 3).map((prediction) => (
                                <li key={prediction.className} className="flex items-center justify-between text-slate-300">
                                    <span className="pr-3">{prediction.className}</span>
                                    <span className="text-cyan-300 font-medium">{formatConfidence(prediction.probability)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ImageAnalyzer

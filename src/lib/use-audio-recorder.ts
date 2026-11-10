// ============================================================================
// WhiteboardOS — In-Browser Audio Recorder Hook
// Captures raw microphone audio via MediaRecorder for Gnani AI STT v3
// ============================================================================

"use client"

import { useState, useRef, useCallback } from "react"

export interface AudioRecorderState {
  isRecording: boolean
  recordingTime: number
  error: string | null
  startRecording: () => Promise<boolean>
  stopRecording: () => Promise<Blob | null>
  cancelRecording: () => void
}

export function useAudioRecorder(): AudioRecorderState {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null)
    audioChunksRef.current = []

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not supported in this browser.")
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      })
      streamRef.current = stream

      // Check supported MIME types
      let mimeType = "audio/webm;codecs=opus"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm"
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4"
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg"
        } else {
          mimeType = ""
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.start(100) // 100ms timeslice
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      return true
    } catch (err: any) {
      console.error("[useAudioRecorder] Mic access error:", err)
      const msg = err?.name === "NotAllowedError"
        ? "Microphone permission was denied. Please allow microphone access in your browser."
        : err?.message || "Failed to access microphone."
      setError(msg)
      setIsRecording(false)
      return false
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false)
      return null
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm"
        const audioBlob = new Blob(audioChunksRef.current, { type })
        audioChunksRef.current = []

        // Stop all tracks to release hardware mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        setIsRecording(false)
        resolve(audioBlob)
      }

      try {
        recorder.stop()
      } catch (e) {
        setIsRecording(false)
        resolve(null)
      }
    })
  }, [])

  const cancelRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        // ignore
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    audioChunksRef.current = []
    setIsRecording(false)
    setRecordingTime(0)
  }, [])

  return {
    isRecording,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}


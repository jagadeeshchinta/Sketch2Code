"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileImage, X, AlertCircle } from "lucide-react"
import { useThemeColor } from "@/context/theme-context"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFileAccepted: (file: File, dataUrl: string) => void
  currentPreview?: string | null
  onClear?: () => void
  className?: string
}

export function UploadZone({ onFileAccepted, currentPreview, onClear, className }: UploadZoneProps) {
  const { themeColor } = useThemeColor()
  const [error, setError] = React.useState<string | null>(null)

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null)
      if (rejectedFiles && (rejectedFiles as Array<unknown>).length > 0) {
        setError("Invalid file type. Please upload PNG, JPEG, or WEBP images.")
        return
      }
      const file = acceptedFiles[0]
      if (!file) return

      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        onFileAccepted(file, dataUrl)
      }
      reader.readAsDataURL(file)
    },
    [onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {currentPreview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-3xl overflow-hidden border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur-2xl"
          >
            <div className="relative">
              <img
                src={currentPreview}
                alt="Uploaded sketch"
                className="w-full max-h-[400px] object-contain rounded-3xl p-4"
              />
              {onClear && (
                <button
                  onClick={onClear}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="px-6 pb-5 pt-2 flex items-center gap-3">
              <FileImage className="w-4 h-4" style={{ color: themeColor }} />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-sans">
                Sketch uploaded — ready for analysis
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "relative cursor-pointer rounded-3xl border-2 border-dashed p-12 transition-all duration-300 text-center",
                "bg-white/60 dark:bg-black/30 backdrop-blur-2xl",
                "hover:bg-white/80 dark:hover:bg-black/50",
                isDragActive
                  ? "border-solid scale-[1.02] shadow-2xl"
                  : "border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/40"
              )}
              style={{
                borderColor: isDragActive ? themeColor : undefined,
                boxShadow: isDragActive ? `0 0 40px ${themeColor}20` : undefined,
              }}
            >
              <input {...getInputProps()} />

              <motion.div
                animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                className="flex flex-col items-center gap-5"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border border-black/10 dark:border-white/15"
                  style={{ backgroundColor: `${themeColor}15` }}
                >
                  <Upload className="w-7 h-7" style={{ color: themeColor }} />
                </div>

                <div className="space-y-2">
                  <p className="text-base font-bold text-zinc-900 dark:text-white font-sans">
                    {isDragActive ? "Drop your sketch here" : "Drag & drop your sketch"}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">
                    or click to browse • PNG, JPEG, WEBP • Max 10MB
                  </p>
                </div>

                {/* Format badges */}
                <div className="flex items-center gap-2">
                  {["PNG", "JPEG", "WEBP"].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-sans"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

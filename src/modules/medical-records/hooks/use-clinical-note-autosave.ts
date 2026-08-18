"use client"

import type { JSONContent } from "@tiptap/react"
import { useEffect, useEffectEvent, useRef, useState } from "react"

import { CLINICAL_NOTE_AUTOSAVE_DEBOUNCE_MS } from "@/modules/medical-records/constants/clinical-notes"
import { useUpsertClinicalNoteMutation } from "@/modules/medical-records/hooks/use-clinical-note-mutations"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"
import {
  canPersistClinicalNote,
  fingerprintClinicalNote,
  type ClinicalNoteSaveStatus,
} from "@/modules/medical-records/utils/clinical-note-autosave"
import type { AppError } from "@/shared/errors"

type UseClinicalNoteAutosaveArgs = {
  appointmentId: string
  content: JSONContent
  plainText: string
  enabled: boolean
  initialContent: JSONContent
  initialPlainText: string
  initialSavedAt: Date | string | null
  onManualSaveSuccess?: (note: ClinicalNote) => void
  onError?: (error: AppError) => void
}

export function useClinicalNoteAutosave({
  appointmentId,
  content,
  plainText,
  enabled,
  initialContent,
  initialPlainText,
  initialSavedAt,
  onManualSaveSuccess,
  onError,
}: UseClinicalNoteAutosaveArgs) {
  const [savedFingerprint, setSavedFingerprint] = useState(() =>
    fingerprintClinicalNote(initialContent, initialPlainText),
  )
  const savedFingerprintRef = useRef(savedFingerprint)
  const [lastSavedAt, setLastSavedAt] = useState<Date | string | null>(
    initialSavedAt,
  )
  const [status, setStatus] = useState<ClinicalNoteSaveStatus>(
    initialSavedAt ? "saved" : "idle",
  )

  const inFlightRef = useRef(false)
  const queuedRef = useRef(false)
  const saveSourceRef = useRef<"auto" | "manual">("auto")
  const pendingFingerprintRef = useRef<string | null>(null)
  const [isManualSaving, setIsManualSaving] = useState(false)

  const fingerprint = fingerprintClinicalNote(content, plainText)
  const canSave = enabled
    ? canPersistClinicalNote(plainText, fingerprint, savedFingerprint)
    : false

  const notifyManualSaveSuccess = useEffectEvent((note: ClinicalNote) => {
    onManualSaveSuccess?.(note)
  })
  const notifyError = useEffectEvent((error: AppError) => {
    onError?.(error)
  })

  const upsert = useUpsertClinicalNoteMutation({
    onSuccess: (note) => {
      const nextFingerprint =
        pendingFingerprintRef.current ??
        fingerprintClinicalNote(note.content, note.plainText)
      savedFingerprintRef.current = nextFingerprint
      pendingFingerprintRef.current = null
      inFlightRef.current = false
      setSavedFingerprint(nextFingerprint)
      setLastSavedAt(note.updatedAt)
      setStatus("saved")
      setIsManualSaving(false)
      if (saveSourceRef.current === "manual") {
        notifyManualSaveSuccess(note)
      }
    },
    onError: (error) => {
      pendingFingerprintRef.current = null
      inFlightRef.current = false
      setStatus("error")
      setIsManualSaving(false)
      notifyError(error)
    },
  })

  const persist = useEffectEvent((source: "auto" | "manual") => {
    if (!enabled) return

    const nextFingerprint = fingerprintClinicalNote(content, plainText)
    if (
      !canPersistClinicalNote(
        plainText,
        nextFingerprint,
        savedFingerprintRef.current,
      )
    ) {
      queuedRef.current = false
      return
    }

    if (inFlightRef.current) {
      queuedRef.current = true
      return
    }

    saveSourceRef.current = source
    inFlightRef.current = true
    queuedRef.current = false
    pendingFingerprintRef.current = nextFingerprint
    setIsManualSaving(source === "manual")
    setStatus("saving")
    upsert.mutate({
      appointmentId,
      content: { ...content, type: "doc" },
      plainText: plainText.trim(),
    })
  })

  useEffect(() => {
    if (!enabled || !canSave) return

    setStatus("dirty")
    const timeout = window.setTimeout(() => {
      persist("auto")
    }, CLINICAL_NOTE_AUTOSAVE_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [canSave, enabled, fingerprint])

  useEffect(() => {
    if (upsert.isPending || !queuedRef.current) return
    persist("auto")
  }, [upsert.isPending])

  useEffect(() => {
    return () => {
      persist("auto")
    }
  }, [])

  useEffect(() => {
    if (!enabled || !canSave) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      persist("auto")
      event.preventDefault()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [canSave, enabled])

  return {
    status,
    lastSavedAt,
    canSave,
    isPending: upsert.isPending,
    isManualSaving,
    saveNow: () => persist("manual"),
  }
}

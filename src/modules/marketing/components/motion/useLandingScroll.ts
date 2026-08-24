"use client"

import { useEffect, useState } from "react"

export function useNavScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return scrolled
}

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    function onScroll() {
      const marker = window.innerHeight * 0.32
      let current: string | null = null
      let best = Number.POSITIVE_INFINITY

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        const offset = marker - el.getBoundingClientRect().top
        if (offset >= 0 && offset < best) {
          best = offset
          current = id
        }
      }

      setActiveId(current)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [sectionIds])

  return activeId
}

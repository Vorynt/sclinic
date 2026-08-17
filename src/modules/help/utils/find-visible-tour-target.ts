function isElementVisible(el: HTMLElement): boolean {
  let node: HTMLElement | null = el
  while (node) {
    if (node.hidden) return false
    const style = getComputedStyle(node)
    if (style.display === "none" || style.visibility === "hidden") {
      return false
    }
    node = node.parentElement
  }
  return true
}

/** First visible `[data-tour]` match — desktop and mobile share the same id. */
export function findVisibleTourTarget(
  target: string,
  root: ParentNode = document,
): HTMLElement | null {
  const nodes = root.querySelectorAll(`[data-tour="${target}"]`)
  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) continue
    if (isElementVisible(node)) return node
  }
  return null
}

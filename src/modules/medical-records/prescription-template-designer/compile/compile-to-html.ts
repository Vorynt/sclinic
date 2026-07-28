import type {
  BlockAlign,
  PrescriptionBlock,
  PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer/types/document-model"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function alignCss(align: BlockAlign): string {
  return align
}

function compileBlock(block: PrescriptionBlock): string {
  switch (block.type) {
    case "letterhead": {
      const { props } = block
      const metaParts: string[] = []
      if (props.showDocument) {
        metaParts.push('<p class="meta">{{clinic.document}}</p>')
      }
      if (props.showAddress) {
        metaParts.push('<p class="meta">{{clinic.addressLine}}</p>')
      }
      if (props.showPhone || props.showEmail) {
        const bits: string[] = []
        if (props.showPhone) bits.push("{{clinic.phone}}")
        if (props.showEmail) bits.push("{{clinic.email}}")
        metaParts.push(`<p class="meta">${bits.join(" · ")}</p>`)
      }
      return `
    <header class="letterhead" style="text-align:${alignCss(props.align)}">
      <p class="clinic-name">{{clinic.name}}</p>
      ${metaParts.join("\n      ")}
    </header>`
    }
    case "title":
      return `
    <h1 class="doc-title" style="text-align:${alignCss(block.props.align)}">${escapeHtml(block.props.text)}</h1>`
    case "patient": {
      const lines = [
        `<div><strong>Paciente:</strong> {{patient.name}}</div>`,
      ]
      if (block.props.showDocument) {
        lines.push(
          `<div><strong>Documento:</strong> {{patient.document}}</div>`,
        )
      }
      return `
    <section class="patient" style="text-align:${alignCss(block.props.align)}">
      ${lines.join("\n      ")}
    </section>`
    }
    case "body":
      return `
    <section class="body" style="text-align:${alignCss(block.props.align)};min-height:${block.props.minHeightMm}mm">{{body}}</section>`
    case "professional": {
      const { props } = block
      const parts: string[] = []
      if (props.showSignLine) {
        parts.push('<div class="sign-line"></div>')
      }
      parts.push('<div class="sign-name">{{professional.name}}</div>')
      if (props.showCouncil) {
        parts.push('<div class="sign-meta">{{professional.council}}</div>')
      }
      if (props.showSpecialty) {
        parts.push('<div class="sign-meta">{{professional.specialty}}</div>')
      }
      if (props.showIssuedAt) {
        parts.push('<p class="issued">Emitida em {{issuedAt}}</p>')
      }
      return `
    <footer class="footer" style="text-align:${alignCss(props.align)}">
      ${parts.join("\n      ")}
    </footer>`
    }
    case "text":
      return `
    <p class="static-text" style="text-align:${alignCss(block.props.align)}">${escapeHtml(block.props.text).replace(/\n/g, "<br />")}</p>`
    case "divider":
      return `
    <hr class="divider" style="border:0;border-top:${block.props.thicknessPx}px solid #1e4d6b;margin:16px 0" />`
    case "spacer":
      return `
    <div class="spacer" style="height:${block.props.heightMm}mm" aria-hidden="true"></div>`
  }
}

const SHEET_STYLES = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #fff;
    }
    body {
      font-family: Georgia, "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111;
    }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 18mm 20mm 20mm;
    }
    .letterhead {
      padding-bottom: 14px;
      border-bottom: 2px solid #1e4d6b;
      margin-bottom: 22px;
    }
    .clinic-name {
      margin: 0 0 6px;
      font-size: 18pt;
      font-weight: bold;
      color: #1e4d6b;
      letter-spacing: 0.02em;
    }
    .meta {
      margin: 2px 0;
      font-size: 9.5pt;
      color: #333;
    }
    .doc-title {
      margin: 18px 0 20px;
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #1e4d6b;
    }
    .patient {
      margin: 0 0 22px;
      font-size: 11pt;
    }
    .patient div { margin: 3px 0; }
    .body {
      font-size: 12pt;
    }
    .body p { margin: 0 0 0.75em; }
    .body ul, .body ol { margin: 0 0 0.75em; padding-left: 1.4em; }
    .footer {
      margin-top: 36px;
    }
    .sign-line {
      width: 240px;
      margin: 48px auto 10px;
      border-top: 1px solid #111;
    }
    .sign-name {
      font-size: 11pt;
      font-weight: bold;
    }
    .sign-meta {
      margin-top: 2px;
      font-size: 10pt;
      color: #333;
    }
    .issued {
      margin-top: 18px;
      font-size: 9.5pt;
      color: #444;
    }
    .static-text {
      margin: 8px 0;
      font-size: 11pt;
      color: #222;
    }
`

/**
 * Compiles a stacked-block DocumentModel into printable letterhead HTML
 * with `{{...}}` placeholders (same contract as ADR-005 render).
 */
export function compilePrescriptionTemplate(
  model: PrescriptionDocumentModel,
): string {
  const body = model.blocks.map(compileBlock).join("\n")
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Receita</title>
  <style>${SHEET_STYLES}
  </style>
</head>
<body>
  <div class="sheet">
${body}
  </div>
</body>
</html>
`
}

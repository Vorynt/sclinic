/**
 * Default sclinic prescription letterhead — classic, centered clinical look.
 * Clinics without a custom `prescription_layouts` row use this at preview/issue.
 *
 * Placeholders:
 * {{clinic.name}} {{clinic.document}} {{clinic.addressLine}} {{clinic.phone}} {{clinic.email}}
 * {{patient.name}} {{patient.document}}
 * {{professional.name}} {{professional.council}} {{professional.specialty}}
 * {{body}} {{issuedAt}}
 */
export const DEFAULT_PRESCRIPTION_LAYOUT_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Receita</title>
  <style>
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
      text-align: center;
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
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #1e4d6b;
    }
    .patient {
      margin: 0 0 22px;
      text-align: left;
      font-size: 11pt;
    }
    .patient div { margin: 3px 0; }
    .body {
      min-height: 140mm;
      text-align: left;
      font-size: 12pt;
    }
    .body p { margin: 0 0 0.75em; }
    .body ul, .body ol { margin: 0 0 0.75em; padding-left: 1.4em; }
    .footer {
      margin-top: 36px;
      text-align: center;
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
  </style>
</head>
<body>
  <div class="sheet">
    <header class="letterhead">
      <p class="clinic-name">{{clinic.name}}</p>
      <p class="meta">{{clinic.document}}</p>
      <p class="meta">{{clinic.addressLine}}</p>
      <p class="meta">{{clinic.phone}} · {{clinic.email}}</p>
    </header>

    <h1 class="doc-title">Receita médica</h1>

    <section class="patient">
      <div><strong>Paciente:</strong> {{patient.name}}</div>
      <div><strong>Documento:</strong> {{patient.document}}</div>
    </section>

    <section class="body">{{body}}</section>

    <footer class="footer">
      <div class="sign-line"></div>
      <div class="sign-name">{{professional.name}}</div>
      <div class="sign-meta">{{professional.council}}</div>
      <div class="sign-meta">{{professional.specialty}}</div>
      <p class="issued">Emitida em {{issuedAt}}</p>
    </footer>
  </div>
</body>
</html>
`;

export const PRESCRIPTION_LAYOUT_PLACEHOLDERS = [
  "{{clinic.name}}",
  "{{clinic.document}}",
  "{{clinic.addressLine}}",
  "{{clinic.phone}}",
  "{{clinic.email}}",
  "{{patient.name}}",
  "{{patient.document}}",
  "{{professional.name}}",
  "{{professional.council}}",
  "{{professional.specialty}}",
  "{{body}}",
  "{{issuedAt}}",
] as const;

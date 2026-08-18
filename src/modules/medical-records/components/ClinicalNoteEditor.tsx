"use client"

import {
  ListBulletsIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  TextBIcon,
  TextHTwoIcon,
  TextHThreeIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react"
import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  CLINICAL_NOTE_SNIPPETS,
  type ClinicalNoteSnippet,
} from "@/modules/medical-records/utils/clinical-note-snippets"

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

type ClinicalNoteEditorProps = {
  initialContent?: JSONContent | Record<string, unknown> | null
  editable: boolean
  onChange?: (content: JSONContent, plainText: string) => void
  className?: string
}

export function ClinicalNoteEditor({
  initialContent,
  editable,
  onChange,
  className,
}: ClinicalNoteEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Escreva a anotação clínica desta consulta…",
      }),
    ],
    content: (initialContent as JSONContent | null) ?? EMPTY_DOC,
    editorProps: {
      attributes: {
        class: cn(
          "clinical-note-tiptap px-3 py-3 focus:outline-none",
          editable ? "min-h-80" : "min-h-0",
          "text-sm leading-relaxed text-foreground",
          "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold",
          "[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold",
          "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_hr]:my-4 [&_hr]:border-border",
        ),
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange?.(current.getJSON(), current.getText().trim())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editor, editable])

  useEffect(() => {
    if (!editor || !initialContent) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(initialContent)
    if (current !== next) {
      editor.commands.setContent(initialContent as JSONContent, {
        emitUpdate: false,
      })
    }
  }, [editor, initialContent])

  function insertSnippet(snippet: ClinicalNoteSnippet) {
    if (!editor) return
    editor
      .chain()
      .focus()
      .insertContent([
        ...snippet.content,
        { type: "paragraph" },
      ])
      .run()
  }

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-background",
          editable ? "min-h-88" : "min-h-12",
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "clinical-note-editor flex flex-col overflow-hidden rounded-md border border-border bg-background",
        className,
      )}
    >
      <style>{`
        .clinical-note-editor .clinical-note-tiptap p.is-editor-empty:first-child::before {
          color: var(--muted-foreground);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {editable ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
          <ToolbarButton
            label="Negrito"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <TextBIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Itálico"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <TextItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Sublinhado"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <TextUnderlineIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Tachado"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <TextStrikethroughIcon />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label="Título"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <TextHTwoIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Subtítulo"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <TextHThreeIcon />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label="Lista"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListBulletsIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Lista numerada"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListNumbersIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Citação"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <QuotesIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Separador"
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <MinusIcon />
          </ToolbarButton>

          <ToolbarDivider />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2">
                Inserir modelo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Modelos clínicos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CLINICAL_NOTE_SNIPPETS.map((snippet) => (
                <DropdownMenuItem
                  key={snippet.id}
                  className="flex flex-col items-start gap-0.5"
                  onSelect={() => insertSnippet(snippet)}
                >
                  <span className="text-sm font-medium">{snippet.label}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {snippet.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border" aria-hidden />
}

export { EMPTY_DOC }

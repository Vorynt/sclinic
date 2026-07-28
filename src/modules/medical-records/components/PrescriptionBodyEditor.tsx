"use client"

import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  ListBulletsIcon,
  ListNumbersIcon,
  TextBIcon,
  TextItalicIcon,
} from "@phosphor-icons/react"
import { useEffect, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PrescriptionBodyEditorProps = {
  initialHtml?: string
  editable: boolean
  onChange?: (bodyHtml: string, plainText: string) => void
  className?: string
  placeholder?: string
}

export function PrescriptionBodyEditor({
  initialHtml = "",
  editable,
  onChange,
  className,
  placeholder = "Escreva a receita (medicamentos, posologia, orientações)…",
}: PrescriptionBodyEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialHtml || "<p></p>",
    editorProps: {
      attributes: {
        class: cn(
          "prescription-body-tiptap px-3 py-3 focus:outline-none",
          editable ? "min-h-56" : "min-h-0",
          "text-sm leading-relaxed text-foreground",
          "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:list-decimal [&_ol]:pl-5",
        ),
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange?.(current.getHTML(), current.getText().trim())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editor, editable])

  useEffect(() => {
    if (!editor) return
    const next = initialHtml || "<p></p>"
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [editor, initialHtml])

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-background",
          editable ? "min-h-64" : "min-h-12",
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "prescription-body-editor flex flex-col overflow-hidden rounded-md border border-border bg-background",
        className,
      )}
    >
      <style>{`
        .prescription-body-editor .prescription-body-tiptap p.is-editor-empty:first-child::before {
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

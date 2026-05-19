"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Film,
  Undo2,
  Redo2,
  Minus,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  admin?: boolean;
  /** Hide footer hint about supported embeds. */
  compact?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Viết mô tả sản phẩm...",
  admin = false,
  compact = false,
}: Readonly<RichTextEditorProps>) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Disable bundled Link to avoid duplicate registration — we configure
        // it explicitly below for openOnClick + target=_blank.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      ImageExt.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn("tiptap rich-text", admin && "rich-text--dark"),
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // TipTap returns "<p></p>" for empty doc — normalize to "" so empty
      // descriptions don't fail the form's "min length" zod check.
      onChange(html === "<p></p>" ? "" : html);
    },
    immediatelyRender: false,
  });

  // Sync external value resets (e.g. form.reset).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current === next || (current === "<p></p>" && next === "")) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border",
        admin
          ? "border-admin-border bg-admin-surface"
          : "border-stone-200 bg-white",
      )}
    >
      <Toolbar editor={editor} admin={admin} />
      <div
        className={cn(
          "max-h-[480px] overflow-y-auto px-4 py-3",
          admin ? "text-admin-text" : "text-stone-800",
        )}
      >
        <EditorContent editor={editor} />
      </div>
      {!compact && (
        <div
          className={cn(
            "border-t px-4 py-2 text-[11px]",
            admin
              ? "border-admin-border bg-admin-surface-2 text-admin-text-muted"
              : "border-stone-100 bg-stone-50 text-stone-500",
          )}
        >
          Hỗ trợ ảnh (URL Cloudinary) và video YouTube/Vimeo. Paste link là tự
          chuyển thành liên kết.
        </div>
      )}
    </div>
  );
}

interface ToolbarProps {
  editor: Editor;
  admin: boolean;
}

function Toolbar({ editor, admin }: Readonly<ToolbarProps>) {
  const groupClass = cn(
    "flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5",
    admin
      ? "border-admin-border bg-admin-surface-2"
      : "border-stone-100 bg-stone-50",
  );

  return (
    <div className={groupClass}>
      <Btn
        admin={admin}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold (Ctrl+B)"
      >
        <Bold size={15} />
      </Btn>
      <Btn
        admin={admin}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic (Ctrl+I)"
      >
        <Italic size={15} />
      </Btn>
      <Btn
        admin={admin}
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="Strikethrough"
      >
        <Strikethrough size={15} />
      </Btn>

      <Sep admin={admin} />

      <Btn
        admin={admin}
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        label="Heading 2"
      >
        <Heading2 size={15} />
      </Btn>
      <Btn
        admin={admin}
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        label="Heading 3"
      >
        <Heading3 size={15} />
      </Btn>

      <Sep admin={admin} />

      <Btn
        admin={admin}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        <List size={15} />
      </Btn>
      <Btn
        admin={admin}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Ordered list"
      >
        <ListOrdered size={15} />
      </Btn>
      <Btn
        admin={admin}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="Quote"
      >
        <Quote size={15} />
      </Btn>
      <Btn
        admin={admin}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="Horizontal line"
      >
        <Minus size={15} />
      </Btn>

      <Sep admin={admin} />

      <Btn
        admin={admin}
        active={editor.isActive("link")}
        onClick={() => insertLink(editor)}
        label="Link"
      >
        <LinkIcon size={15} />
      </Btn>
      <Btn admin={admin} onClick={() => insertImage(editor)} label="Image URL">
        <ImageIcon size={15} />
      </Btn>
      <Btn
        admin={admin}
        onClick={() => insertVideo(editor)}
        label="YouTube/Vimeo"
      >
        <Film size={15} />
      </Btn>

      <Sep admin={admin} />

      <Btn
        admin={admin}
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        label="Clear formatting"
      >
        <RemoveFormatting size={15} />
      </Btn>

      <div className="ml-auto flex items-center gap-0.5">
        <Btn
          admin={admin}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </Btn>
        <Btn
          admin={admin}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={15} />
        </Btn>
      </div>
    </div>
  );
}

interface BtnProps {
  admin: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function Btn({
  admin,
  active,
  disabled,
  onClick,
  label,
  children,
}: Readonly<BtnProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        disabled && "cursor-not-allowed opacity-40",
        !disabled && (admin ? "hover:bg-white/10" : "hover:bg-stone-200"),
        active &&
          (admin
            ? "bg-primary-500/20 text-primary-300"
            : "bg-primary-100 text-primary-700"),
      )}
    >
      {children}
    </button>
  );
}

function Sep({ admin }: Readonly<{ admin: boolean }>) {
  return (
    <span
      aria-hidden
      className={cn(
        "mx-1 h-5 w-px",
        admin ? "bg-admin-border" : "bg-stone-200",
      )}
    />
  );
}

function insertLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = globalThis.prompt("Dán URL liên kết:", previous ?? "https://");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function insertImage(editor: Editor) {
  const url = globalThis.prompt(
    "Dán URL ảnh (VD: https://res.cloudinary.com/...):",
    "https://",
  );
  if (!url) return;
  editor.chain().focus().setImage({ src: url }).run();
}

const YT_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

function insertVideo(editor: Editor) {
  const raw = globalThis.prompt("Dán URL video YouTube hoặc Vimeo:", "");
  if (!raw) return;
  const url = raw.trim();

  let embed: string | null = null;
  const yt = YT_RE.exec(url);
  if (yt) {
    embed = `https://www.youtube.com/embed/${yt[1]}`;
  } else {
    const vm = VIMEO_RE.exec(url);
    if (vm) embed = `https://player.vimeo.com/video/${vm[1]}`;
  }
  if (!embed) {
    globalThis.alert("URL không nhận diện được. Hỗ trợ YouTube và Vimeo.");
    return;
  }

  editor
    .chain()
    .focus()
    .insertContent(
      `<iframe src="${embed}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><p></p>`,
    )
    .run();
}

import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import type { JSONContent } from "@tiptap/react";

const EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Underline,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({ HTMLAttributes: { class: "underline" } }),
  Typography,
];

function isEmpty(content: JSONContent): boolean {
  const nodes = content.content ?? [];
  if (nodes.length === 0) return true;
  if (nodes.length === 1) {
    const first = nodes[0];
    if (first.type === "paragraph" && !first.content?.length) return true;
  }
  return false;
}

interface Props {
  content: JSONContent | unknown;
  className?: string;
}

export function RichTextRenderer({ content, className }: Props) {
  let json: JSONContent | null = null;

  if (typeof content === "string") {
    // pgbouncer/driver bazen jsonb'yi string olarak döner — önce parse dene
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        json = parsed as JSONContent;
      }
    } catch {
      return (
        <div className={className}>
          <p>{content}</p>
        </div>
      );
    }
  } else if (content && typeof content === "object") {
    json = content as JSONContent;
  }

  if (!json || isEmpty(json)) return null;

  let html = "";
  try {
    html = generateHTML(json, EXTENSIONS);
  } catch {
    return null;
  }

  return (
    <div
      className={`rich-content ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

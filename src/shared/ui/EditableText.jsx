import { useEffect, useRef, useState } from "react";

export function EditableText({
  value,
  className = "",
  onSave,
  label,
  children,
  editSignal = 0,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(value || "");
  }, [editing, value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (editSignal) setEditing(true);
  }, [editSignal]);

  const save = () => {
    const clean = draft.replace(/\s+/g, " ").trim();
    if (clean && clean !== value) onSave(clean);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`editable-input ${className}`}
        aria-label={label || "Editar"}
        value={draft}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            save();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
      />
    );
  }

  return (
    <span
      className={`editable-label ${className}`}
      tabIndex="0"
      role="button"
      aria-label={label || "Editar"}
      onDoubleClick={() => setEditing(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          setEditing(true);
        }
      }}
    >
      {children || value}
    </span>
  );
}

export function ComposerPromptLengthValidation({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="ps-(--composer-editor-leading-compact) pe-3 pb-2 text-xs text-destructive sm:ps-(--composer-editor-leading) sm:pe-4"
      data-chat-composer-validation="prompt-length"
    >
      {message}
    </p>
  );
}

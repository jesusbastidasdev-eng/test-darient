export function LoadingState({ text = "Loading..." }: { text?: string }): JSX.Element {
  return <p className="status loading">{text}</p>;
}

export function ErrorState({ message }: { message: string }): JSX.Element {
  return <p className="status error">{message}</p>;
}

export function EmptyState({ text }: { text: string }): JSX.Element {
  return <p className="status empty">{text}</p>;
}

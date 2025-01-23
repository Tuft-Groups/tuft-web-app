interface FormattedMessageProps {
  text: string | null;
}

export function FormattedMessage({ text }: FormattedMessageProps) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <span>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {line.split(" ").map((word, index) => {
            const isUrl = word.match(/^(https?:\/\/[^\s]+)/);
            return (
              <span key={index}>
                {isUrl ? (
                  <a href={word} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {word}
                  </a>
                ) : (
                  word
                )}{" "}
              </span>
            );
          })}
          <br />
        </span>
      ))}
    </span>
  );
}

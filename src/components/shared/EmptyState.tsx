interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <p className="text-center text-sm text-gray-500">{message}</p>
    </div>
  );
}

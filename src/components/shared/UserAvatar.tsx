interface UserAvatarProps {
  photoUrl: string | null;
  name: string;
  timestamp?: Date;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ photoUrl, name, timestamp, size = "sm" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center gap-2">
      <img src={photoUrl || "/default-avatar.png"} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />
      <div>
        <p className="text-sm font-medium">{name}</p>
        {timestamp && <p className="text-xs text-gray-500">{new Date(timestamp).toLocaleString()}</p>}
      </div>
    </div>
  );
}

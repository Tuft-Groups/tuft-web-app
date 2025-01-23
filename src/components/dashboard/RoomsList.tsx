import { useAppStore } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { useEffect } from "react";

export default function RoomsList() {
  const { user_rooms, setSelectedRoomId } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();

  const roomId = Number(pathname.split("/")[2]);

  useEffect(() => {
    setSelectedRoomId(roomId);
  }, [roomId]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto">
      {user_rooms.map((room, i) => (
        <Card
          key={room.id}
          className={`cursor-pointer p-2 flex items-center gap-3 hover:border-gray-400 dark:hover:border-gray-600 hover:border-1 ${roomId === room.id ? "bg-gray-200 dark:bg-gray-800" : ""}`}
          onClick={() => {
            // setSelectedRoomId(room.id);
            router.push(`/room/${room.id}/feed`);
          }}
        >
          <img src={room.avatar ?? "https://pub-3a63e4a193254663a7631829c69adb4a.r2.dev/no_icon.png"} alt={room.name} className="w-8 h-8 object-cover rounded-full" />
          <span>{room.name}</span>
        </Card>
      ))}
    </div>
  );
}

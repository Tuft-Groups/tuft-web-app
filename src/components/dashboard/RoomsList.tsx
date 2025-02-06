import { useAppStore } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import FirebaseAuth from "@/lib/firebaseAuthClass";
import { ThemeToggle } from "../theme-toggle";
import { Separator } from "../ui/separator";

export default function RoomsList() {
  const { user, setUserData, user_rooms, setSelectedRoomId } = useAppStore();

  const router = useRouter();
  const pathname = usePathname();

  const roomId = Number(pathname.split("/")[2]);

  useEffect(() => {
    setSelectedRoomId(roomId);
  }, [roomId]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto">
      <img src="/logo_with_border.png" alt="Tuft" className="w-20" />
      <div className="flex flex-col gap-2 h-full overflow-y-auto">
        {user_rooms.map((room, i) => (
          <Card
            key={room.id}
            className={`cursor-pointer p-2 flex items-center gap-3 hover:border-gray-400 dark:hover:border-gray-600 hover:border-1 ${
              roomId === room.id ? "bg-gray-200 dark:bg-gray-800" : ""
            }`}
            onClick={() => {
              // setSelectedRoomId(room.id);
              router.push(`/room/${room.id}/feed`);
            }}
          >
            <img
              src={room.avatar ?? "https://pub-3a63e4a193254663a7631829c69adb4a.r2.dev/no_icon.png"}
              alt={room.name}
              className="w-8 h-8 object-cover rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{room.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{room.short_description}</span>
            </div>
          </Card>
        ))}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Card className="flex items-center px-2 py-2 pr-4 gap-2 cursor-pointer bg-gray-100 dark:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium">{user.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{user.email ?? user.phone}</span>
            </div>
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <ThemeToggle />
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem
            onClick={() => {
              new FirebaseAuth().signOut();
              setUserData(null);
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

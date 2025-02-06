"use client";

import RoomData from "@/components/dashboard/RoomData";
import { RoomPreview } from "@/components/dashboard/RoomPreview";
import RoomsList from "@/components/dashboard/RoomsList";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store";

export default function Home() {
  const { setUserData, user, user_rooms, selectedRoom, show_room_preview } = useAppStore();

  return (
    <div className="flex h-full overflow-x-scroll">
      {show_room_preview ? (
        <div className="flex flex-col h-full grow p-4 min-w-[400px] max-w-[400px] m-auto">{<RoomPreview />}</div>
      ) : (
        <>
          <div className="w-[300px] h-full p-4 shrink-0">
            <RoomsList />
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col grow p-4 min-w-[400px]">{selectedRoom && <RoomData />}</div>
        </>
      )}
    </div>
  );
}

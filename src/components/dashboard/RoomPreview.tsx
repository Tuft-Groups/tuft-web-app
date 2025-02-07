import { useAppStore } from "@/store";
import { Button } from "../ui/button";
import { API_URLS } from "@/constants/api_urls";
import makeApiCall from "@/lib/api_wrapper";
import { useEffect } from "react";
import { useState } from "react";
import { payments, rooms } from "@prisma/client";
import ReactMarkdown from "react-markdown";

export function RoomPreview() {
  const { show_room_preview, setUserData, selectedRoom } = useAppStore();

  const [room, setRoom] = useState<(rooms & { payments: payments[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  async function getRoom() {
    const room = await makeApiCall({
      url: API_URLS.ROOM_PREVIEW(show_room_preview!),
      method: "GET",
    });

    setRoom(room);
  }

  useEffect(() => {
    getRoom();
  }, [selectedRoom]);

  if (!room) return null;
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="h-full overflow-y-scroll">
        <div className="relative mb-10">
          <img
            src={room.cover_image_url ?? "https://media.tuft.in/no_cover_image.png"}
            alt="Room cover"
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute -bottom-6 left-0">
            <img
              src={room.avatar || ""}
              alt="Room logo"
              className="w-16 h-16 rounded-full border-4 border-background"
            />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <ReactMarkdown>{room.description}</ReactMarkdown>
        </div>
      </div>
      <Button
        disabled={loading}
        className="w-full"
        onClick={async () => {
          if (room.payments.length > 0) return;
          setLoading(true);
          await makeApiCall({
            url: API_URLS.JOIN_ROOM(show_room_preview!),
            method: "POST",
            body: { room_id: show_room_preview },
          });
          setLoading(false);
          window.location.reload();
        }}
      >
        {loading ? "Joining..." : "Join Room"}
      </Button>
    </div>
  );
}

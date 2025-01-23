import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { EmptyState } from "../shared/EmptyState";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import { DateTimePicker } from "../ui/time-picker";

export default function MeetingsTab() {
  const { meetings, getRoomMeetingsData, tab_loading, reached_end, selectedRoom, user, createMeeting } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [meetingName, setMeetingName] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    getRoomMeetingsData({ reset: true });
  }, []);

  const handleCreateMeeting = () => {
    console.log({ scheduledDate, meetingName, meetingDescription });
    if (!scheduledDate || !meetingName || !meetingDescription) return;
    createMeeting({
      name: meetingName,
      description: meetingDescription,
      scheduled_at: scheduledDate,
      room_id: selectedRoom!.id,
    });
    setIsDialogOpen(false);
    setMeetingName("");
    setMeetingDescription("");
    setScheduledDate(undefined);
  };

  console.log({ selectedRoom, user });

  return (
    <div className="flex flex-col max-w-[600px] mx-auto w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Meetings</h2>
        {selectedRoom!.is_admin && (
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            Create Meeting
          </Button>
        )}
      </div>
      {meetings.length === 0 && !tab_loading ? (
        <EmptyState message="No meetings scheduled" />
      ) : (
        <InfiniteScroll loading={tab_loading} hasMore={!reached_end} onLoadMore={() => getRoomMeetingsData({ reset: false })}>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card className="p-4" key={meeting.id}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <VideoCameraIcon className="w-5 h-5 text-blue-500" />
                      <h3 className="font-medium">{meeting.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{meeting.description}</p>
                    <p className="text-sm text-gray-400">{format(new Date(meeting.scheduled_at), "PPp")}</p>
                  </div>
                  <Button variant="secondary" onClick={() => window.open(`/meeting/${meeting.id}`, "_blank")}>
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </InfiniteScroll>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Meeting Name" value={meetingName} onChange={(e) => setMeetingName(e.target.value)} />
            <Input placeholder="Description" value={meetingDescription} onChange={(e) => setMeetingDescription(e.target.value)} />
            <DateTimePicker fullWidth placeholder="Pick a date" date={scheduledDate} setDate={setScheduledDate} />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMeeting} className="ml-2">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

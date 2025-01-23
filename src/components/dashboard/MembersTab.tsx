import { useAppStore } from "@/store";
import { format } from "date-fns";
import { useEffect } from "react";
import { EmptyState } from "../shared/EmptyState";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { Card } from "../ui/card";

export default function MembersTab() {
  const { members, getRoomMembersData, tab_loading, reached_end, selectedRoom, user } = useAppStore();

  useEffect(() => {
    getRoomMembersData({ reset: true });
  }, []);

  return (
    <div className="flex flex-col max-w-[400px] mx-auto w-full h-full">
      <h2 className="text-xl font-medium mb-2">Members</h2>

      {members.length === 0 && !tab_loading ? (
        <EmptyState message="No members joined yet" />
      ) : (
        <InfiniteScroll
          loading={tab_loading}
          hasMore={!reached_end}
          onLoadMore={() => getRoomMembersData({ reset: false })}
        >
          <Card className="space-y-4 p-2">
            {members.map((member) => (
              <div className="p-1 flex" key={member.id}>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mr-4">
                  <img
                    src={member.user.photo_url || `/images/default-avatar.png`}
                    alt={member.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{member.user.name}</h3>
                    <p className="text-sm text-gray-500">
                      {member.user.bio ?? `Joined on ${format(new Date(member.created_at), "PPp")}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </InfiniteScroll>
      )}
    </div>
  );
}

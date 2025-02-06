import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatTab from "./ChatTab";
import FeedTab from "./FeedTab";
import FilesTab from "./FilesTab";
import MeetingsTab from "./MeetingsTab";
import MembersTab from "./MembersTab";
import PaymentsTab from "./PaymentsTab";
import AnalyticsTab from "./AnalyticsTab";
import { useAppStore } from "@/store";
export default function RoomData() {
  const router = useRouter();
  // get pathname params
  const pathname = usePathname();
  const [tab, setTab] = useState("");
  const { selectedRoom } = useAppStore();

  useEffect(() => {
    const urlTab = window.location.pathname.split("/")[3] || "feed";
    // if (urlTab !== tab) {
    //   router.push(window.location.pathname.replace(tab, urlTab));
    // }
    setTab(urlTab);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    // setTab(value);
    router.push(window.location.pathname.replace(tab, value));
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* <h1 className="mb-4 text-2xl font-bold">{selectedRoom?.name}</h1> */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {(selectedRoom?.is_admin || selectedRoom?.is_analytics_public) && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>
      </Tabs>
      <div className="h-full overflow-y-scroll mt-4">
        {tab === "feed" && <FeedTab />}
        {tab === "chat" && <ChatTab />}
        {tab === "files" && <FilesTab />}
        {tab === "meetings" && <MeetingsTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "members" && <MembersTab />}
        {(selectedRoom?.is_admin || selectedRoom?.is_analytics_public) && <AnalyticsTab />}
      </div>
    </div>
  );
}

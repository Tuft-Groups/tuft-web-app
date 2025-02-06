import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import FeedTab from "./FeedTab";
import MeetingsTab from "./MeetingsTab";
import PaymentsTab from "./PaymentsTab";
import { useEffect, useState } from "react";
import ChatTab from "./ChatTab";
import { useAppStore } from "@/store";
import FilesTab from "./FilesTab";
import MembersTab from "./MembersTab";

export default function RoomData() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlTab = window.location.pathname.split("/")[4] || "feed";
    const searchParamsTab = searchParams.get("tab") || "feed";
    const tab = urlTab || searchParamsTab;
    console.log({ urlTab, searchParamsTab, tab });
    window.history.replaceState({}, "", window.location.pathname.replace(tab, "feed"));
    setTab(tab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setTab(value);
    router.push(window.location.pathname.replace(tab, value));
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="h-full overflow-y-scroll mt-4">
        {tab === "feed" && <FeedTab />}
        {tab === "chat" && <ChatTab />}
        {tab === "files" && <FilesTab />}
        {tab === "meetings" && <MeetingsTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "members" && <MembersTab />}
      </div>
    </div>
  );
}

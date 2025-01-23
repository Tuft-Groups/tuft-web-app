"use client";
import { API_URLS } from "@/constants/api_urls";
import makeApiCall from "@/lib/api_wrapper";

import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { HMSPrebuilt } from "@100mslive/roomkit-react";

export default function MeetingPage({ params }: { params: { meeting_id: string } }) {
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAppStore((state) => ({ user: state.user, loading: state.tab_loading }));

  useEffect(() => {
    if (loading || !user) return;

    const meetingID: any = params.meeting_id;

    makeApiCall({ url: API_URLS.GET_MEETING(meetingID), method: "GET" })
      .then((res) => setMeetingCode(res.room_code))
      .catch((err) => {
        let errorMessage;
        if (err.error?.code === "missing-params") errorMessage = "Invalid Url";
        else if (err.error?.code === "record-not-found") errorMessage = "Invalid Meeting Code";
        else if (err.error?.code === "access-denied") errorMessage = "You are not allowed to access this meeting";
        else errorMessage = "Something went wrong";
        setError(errorMessage);
      });
  }, [user, loading]);

  return <>{meetingCode && <HMSPrebuilt roomCode={meetingCode} options={{ userName: user?.name, userId: user?.id.toString() }} />}</>;
}

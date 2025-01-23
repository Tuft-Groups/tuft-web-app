import { useAppStore } from "@/store";
import { PaperclipIcon, ReplyAllIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { FormattedMessage } from "../shared/FormatedMessage";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function ChatTab() {
  const { messages, getRoomChatData, tab_loading, reached_end, sendRoomMessage, getNewerMessages } = useAppStore();
  const [newMessage, setNewMessage] = useState("");
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const loadingRef = useRef(false);
  const pollingInterval = useRef<NodeJS.Timeout>();

  // Assuming you have a way to get the current user's ID
  const currentUserId = useAppStore().user?.id; // Adjust based on your store structure

  // Utility functions
  const isNearBottom = () => {
    const container = messageContainerRef.current;
    if (!container) return false;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMessageAlert(false);
  };

  // Message polling
  useEffect(() => {
    pollingInterval.current = setInterval(async () => {
      const wasNearBottom = isNearBottom();
      const hasNewMessages = await getNewerMessages();

      if (hasNewMessages) {
        wasNearBottom ? scrollToBottom() : setShowNewMessageAlert(true);
      }
    }, 10000);

    return () => clearInterval(pollingInterval.current);
  }, []);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      getRoomChatData({ reset: true }).then(() => {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
          isInitialLoad.current = false;
        });
      });
    }
  }, []);

  // Auto-scroll for new messages
  useEffect(() => {
    if (!isInitialLoad.current && messages.length > 0 && isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  // Scroll handler for loading older messages
  const handleScroll = async () => {
    const container = messageContainerRef.current;
    if (!container || loadingRef.current || reached_end || tab_loading) return;
    const isNearTop = container.scrollTop < 20;
    if (!isNearTop) return;

    try {
      loadingRef.current = true;
      const firstMessage = container.querySelector(".message-card");
      if (!firstMessage) return;

      const initialTop = firstMessage.getBoundingClientRect().top;
      await getRoomChatData({ reset: false });
      const newTop = firstMessage.getBoundingClientRect().top;
      container.scrollTop += newTop - initialTop;

      requestAnimationFrame(() => {
        container.style.scrollBehavior = "smooth";
        container.scrollTop -= 60;
      });
    } finally {
      loadingRef.current = false;
      setTimeout(() => (container.style.scrollBehavior = ""), 300);
    }
  };

  // Form handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendRoomMessage(newMessage);
      setNewMessage("");
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[800px] mx-auto w-full relative">
      {tab_loading && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 p-2">
          <p className="text-center text-sm text-gray-500">Loading messages...</p>
        </div>
      )}

      {showNewMessageAlert && (
        <div
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-primary text-primary-foreground 
            px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-all"
        >
          New messages available ↓
        </div>
      )}

      <div ref={messageContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto pb-20" style={{ scrollBehavior: "auto" }}>
        {messages.length === 0 && !tab_loading ? (
          <EmptyState message="No messages yet" />
        ) : (
          <>
            {reached_end && <p className="text-center text-sm text-gray-500 my-4">No more messages to load</p>}
            {messages.map((item) => (
              <div className={`p-2 m-2 border-none message-card`} key={item.id}>
                <div className="flex items-start gap-3">
                  {/* Profile Image */}
                  <img src={item.user.photo_url!} alt={`${item.user.name}'s profile`} className="w-6 h-6 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.user.name}</span>
                      <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1">
                      <FormattedMessage text={item.message} />
                    </p>
                    {item.replies_count > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-blue-500 cursor-pointer">
                        <ReplyAllIcon className="h-4 w-4" />
                        <p className="text-xs">Replies: {item.replies_count}</p>
                      </div>
                    )}
                    {item.files.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-blue-500 cursor-pointer">
                        <PaperclipIcon className="h-4 w-4" />
                        <p className="text-xs">Files: {item.files.length}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="flex gap-2 items-center">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-1" />
          <Button type="submit" size="icon">
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

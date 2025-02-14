import { useAppStore } from "@/store";
import { PaperclipIcon, ReplyAllIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { FormattedMessage } from "../shared/FormatedMessage";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { files } from "@prisma/client";
import { Card } from "../ui/card";
import Image from "next/image";
import { ImageViewer } from "../shared/ImageViewer";

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
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<(typeof messages)[0] | null>(null);

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

  console.log({ img: currentImageIndex, imageViewerOpen });

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

      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-20"
        style={{ scrollBehavior: "auto" }}
      >
        {messages.length === 0 && !tab_loading ? (
          <EmptyState message="No messages yet" />
        ) : (
          <>
            {reached_end && <p className="text-center text-sm text-gray-500 my-4">No more messages to load</p>}
            {messages.map((item) => (
              <div className={`p-0 m-2 border-none message-card`} key={item.id}>
                <div className="flex items-start gap-3">
                  {/* Profile Image */}
                  <img
                    src={item.user.photo_url ?? "https://pub-3a63e4a193254663a7631829c69adb4a.r2.dev/no_icon.png"}
                    alt={`${item.user.name}'s profile`}
                    className="size-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "https://pub-3a63e4a193254663a7631829c69adb4a.r2.dev/no_icon.png";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.user.name}</span>
                      <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">
                      <FormattedMessage text={item.message} />
                    </p>
                    <FileCards
                      files={item.files}
                      onFileClick={(index) => {
                        setCurrentMessage(item);
                        setCurrentImageIndex(index);
                        setImageViewerOpen(true);
                      }}
                    />
                    {item.replies_count > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-blue-500 cursor-pointer">
                        <ReplyAllIcon className="h-4 w-4" />
                        <p className="text-xs">Replies: {item.replies_count}</p>
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

      <ImageViewer
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
        images={currentMessage?.files.filter((file) => file.file_type === "IMAGE") ?? []}
        initialImageIndex={currentImageIndex}
      />

      <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="flex gap-2 items-center">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

const FileCards = ({ files, onFileClick }: { files: files[]; onFileClick: (index: number) => void }) => {
  const imageFiles = files.filter((file) => file.file_type === "IMAGE");
  const documentFiles = files.filter((file) => file.file_type === "DOCUMENT");

  if (imageFiles.length === 0 && documentFiles.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {imageFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imageFiles.map((file, index) => (
            <img
              key={index}
              src={file.compressed_file_url!}
              alt={file.file_name}
              className="size-36 rounded-md cursor-pointer"
              onClick={() => onFileClick(index)}
            />
          ))}
        </div>
      )}
      {documentFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {documentFiles.map((file) => (
            <Card
              key={file.id}
              className="rounded-md p-2 flex gap-2 items-center max-w-96 cursor-pointer"
              onClick={() => {
                window.open(file.file_url!, "_blank");
              }}
            >
              <img src={"/pdf_icon.png"} alt={file.file_name} className="shrink-0 h-10" />
              <div className="flex flex-col">
                <p className="text-sm line-clamp-1">{file.file_name}</p>
                <p className="text-xs text-gray-500">{file.file_size?.toFixed(2)} MB</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

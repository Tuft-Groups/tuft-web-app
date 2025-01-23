import { useAppStore } from "@/store";
import { ChatBubbleBottomCenterTextIcon, EyeIcon, HandThumbUpIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as SolidHandThumbUpIcon } from "@heroicons/react/24/solid";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { FormattedMessage } from "../shared/FormatedMessage";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { UserAvatar } from "../shared/UserAvatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog, DialogContent } from "../ui/dialog";
import NewFeedDialog from "./NewFeedDialog";

export default function FeedTab() {
  const { feed, getRoomFeedData, tab_loading, reached_end, selectedRoom } = useAppStore((state) => ({
    feed: state.feed,
    getRoomFeedData: state.getRoomFeedData,
    tab_loading: state.tab_loading,
    reached_end: state.reached_end,
    selectedRoom: state.selectedRoom,
  }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPost, setCurrentPost] = useState<(typeof feed)[0] | null>(null);

  useEffect(() => {
    getRoomFeedData({ reset: true });
  }, [selectedRoom?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageViewerOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          navigateImage("prev");
          break;
        case "ArrowRight":
          navigateImage("next");
          break;
        case "Escape":
          setImageViewerOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageViewerOpen, currentImageIndex, currentPost]);

  const navigateImage = (direction: "prev" | "next") => {
    if (!currentPost) return;
    const images = currentPost.files.filter((file) => file.file_type === "IMAGE");

    if (direction === "prev") {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  const openImageViewer = (post: (typeof feed)[0], initialImageIndex: number) => {
    setCurrentPost(post);
    setCurrentImageIndex(initialImageIndex);
    setImageViewerOpen(true);
  };

  return (
    <div className="flex flex-col max-w-[600px] mx-auto w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Feed</h2>
        {selectedRoom!.is_admin && (
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            Post
          </Button>
        )}
      </div>
      {feed.length === 0 && !tab_loading ? (
        <EmptyState message="No posts yet" />
      ) : (
        <InfiniteScroll loading={tab_loading} hasMore={!reached_end} onLoadMore={() => getRoomFeedData({ reset: false })}>
          <div className="space-y-4">
            {feed.map((item) => (
              <Card className="p-4" key={item.id}>
                <UserAvatar photoUrl={item.author.photo_url} name={item.author.name} timestamp={item.created_at} />
                <p className="text-sm mt-2">
                  <FormattedMessage text={item.message} />
                </p>
                {item.files &&
                  item.files.map(
                    (file, index) =>
                      file.file_type === "IMAGE" && (
                        <div key={file.id} className="mt-2 w-full">
                          <img
                            src={file.compressed_file_url || file.file_url || ""}
                            alt={file.file_name}
                            className="rounded-lg max-h-[300px] object-contain w-full cursor-pointer"
                            onClick={() => openImageViewer(item, index)}
                          />
                        </div>
                      )
                  )}
                <div className="flex items-center gap-8 mt-4">
                  <button onClick={() => useAppStore.getState().addLikeToFeed(item.id)} className={`flex items-center gap-1 text-sm ${item.user_liked ? "text-blue-500" : "text-gray-500"}`}>
                    {item.user_liked ? <SolidHandThumbUpIcon className="w-4 h-4" /> : <HandThumbUpIcon className="w-4 h-4" />}
                    {item.likes}
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-500">
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                    {item.comments}
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-500">
                    <EyeIcon className="w-4 h-4" />
                    {item.views}
                  </button>
                </div>
              </Card>
            ))}

            {reached_end && feed.length > 0 && <p className="text-center text-sm text-gray-500 my-4">No more posts to load</p>}
          </div>
        </InfiniteScroll>
      )}

      <NewFeedDialog open={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />

      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0">
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/95">
            {currentPost && (
              <>
                <div className="relative w-full flex-1 flex items-center justify-center">
                  <Button variant="ghost" size="icon" className="absolute left-2 text-white hover:bg-white/20" onClick={() => navigateImage("prev")}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <img
                    src={currentPost.files.filter((f) => f.file_type === "IMAGE")[currentImageIndex]?.file_url || ""}
                    alt="Full size"
                    className="max-h-[calc(95vh-100px)] max-w-[95vw] object-contain"
                  />

                  <Button variant="ghost" size="icon" className="absolute right-2 text-white hover:bg-white/20" onClick={() => navigateImage("next")}>
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                <div className="h-[80px] w-full overflow-x-auto flex justify-center items-center gap-2 p-2 bg-black/50">
                  {currentPost.files
                    .filter((file) => file.file_type === "IMAGE")
                    .map((file, index) => (
                      <div
                        key={file.id}
                        className={`h-[60px] min-w-[60px] cursor-pointer transition-all duration-200 rounded-md ${
                          currentImageIndex === index ? "border-2 border-white scale-110" : "border border-gray-600 opacity-70 hover:opacity-100 "
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={file.compressed_file_url || file.file_url || ""} alt={file.file_name} className="h-full w-full object-cover" />
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

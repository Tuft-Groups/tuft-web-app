import { useAppStore } from "@/store";
import { ChatBubbleBottomCenterTextIcon, EyeIcon, HandThumbUpIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as SolidHandThumbUpIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { FormattedMessage } from "../shared/FormatedMessage";
import { ImageViewer } from "../shared/ImageViewer";
import { InfiniteScroll } from "../shared/InfiniteScroll";
import { UserAvatar } from "../shared/UserAvatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
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

  const openImageViewer = (post: (typeof feed)[0], initialImageIndex: number) => {
    setCurrentPost(post);
    setCurrentImageIndex(initialImageIndex);
    setImageViewerOpen(true);
  };

  return (
    <div className="flex flex-col max-w-[600px] mx-auto w-full h-full">
      <div className="flex gap-4 justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Feed</h1>
        {selectedRoom!.is_admin && (
          <Button size={"sm"} onClick={() => setIsDialogOpen(true)}>
            Post
          </Button>
        )}
      </div>
      {feed.length === 0 && !tab_loading ? (
        <EmptyState message="No posts yet" />
      ) : (
        <InfiniteScroll
          loading={tab_loading}
          hasMore={!reached_end}
          onLoadMore={() => getRoomFeedData({ reset: false })}
        >
          <div className="space-y-4">
            {feed.map((item) => (
              <Card className="p-4" key={item.id}>
                <UserAvatar photoUrl={item.author.photo_url} name={item.author.name} timestamp={item.created_at} />
                <p className="text-sm mt-2 font-bold">
                  <FormattedMessage text={item.title} />
                </p>
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
                  <button
                    onClick={() => useAppStore.getState().addLikeToFeed(item.id)}
                    className={`flex items-center gap-1 text-sm ${item.user_liked ? "text-blue-500" : "text-gray-500"}`}
                  >
                    {item.user_liked ? (
                      <SolidHandThumbUpIcon className="w-4 h-4" />
                    ) : (
                      <HandThumbUpIcon className="w-4 h-4" />
                    )}
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

            {reached_end && feed.length > 0 && (
              <p className="text-center text-sm text-gray-500 my-4">No more posts to load</p>
            )}
          </div>
        </InfiniteScroll>
      )}

      <NewFeedDialog open={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />

      {currentPost && (
        <ImageViewer
          open={imageViewerOpen}
          onOpenChange={setImageViewerOpen}
          images={currentPost.files.filter((file) => file.file_type === "IMAGE")}
          initialImageIndex={currentImageIndex}
        />
      )}
    </div>
  );
}

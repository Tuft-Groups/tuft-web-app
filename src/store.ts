import { API_URLS } from "@/constants/api_urls";
import makeApiCall from "@/lib/api_wrapper";
import {
  feed,
  FileExtension,
  files,
  FileType,
  meetings,
  messages,
  payment_splits,
  payments,
  Prisma,
  rooms,
  users,
} from "@prisma/client";
import axios from "axios";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { getFileData } from "./lib/utils";
type AppState = {
  tab_loading: boolean;
  page_loading: boolean;
  feed: (feed & {
    author: users;
    files: files[];
    user_liked: boolean;
    payment_splits: payment_splits & { payment: payments };
  })[];
  user_rooms: (rooms & { is_admin: boolean })[];
  files: files[];
  payments: (payment_splits & { payment: payments })[];
  reached_end: boolean;
  meetings: meetings[];
  members: (users & { user: users })[];
  selectedRoom?: rooms & { is_admin: boolean };
  user: users;
  show_room_preview: number | null;
  messages: (messages & { user: users; files: files[]; replies_count: number })[];
};

type AppActions = {
  setPageLoading: (loading: boolean) => void;
  resetState: () => void;
  setSelectedRoomId: (roomId: number) => void;
  setFeed: (feed: AppState["feed"]) => void;
  setPayments: (payments: AppState["payments"]) => void;
  setMessages: (messages: AppState["messages"]) => void;
  setUserRooms: (rooms: (rooms & { is_admin: boolean })[]) => void;
  setFiles: (files: files[]) => void;
  setMembers: (members: AppState["members"]) => void;
  setMeetings: (meetings: meetings[]) => void;
  setUserData: (user: users | null) => void;
  setReachedEnd: (reachedEnd: boolean) => void;
  setIncFeedLikes: (feedId: number) => void;
  setShowRoomPreview: (roomId: number | null) => void;
  loadRoomData: (roomId: number) => Promise<void>;
  getUserData: () => Promise<void>;
  getRoomFeedData: (options: { reset?: boolean }) => Promise<void>;
  createRoomFeedData: (options: {
    message: string;
    files: {
      file: File;
      id: string;
      name: string;
      extension: string;
    }[];
  }) => Promise<void>;
  getRoomPaymentsData: (options: { reset?: boolean }) => Promise<void>;
  getRoomChatData: (options: { feed_id?: number; reset?: boolean }) => Promise<void>;
  sendRoomMessage: (message: string, feed_id?: number) => Promise<void>;
  getRoomFilesData: (options: {
    parent_folder_id: string | null;
    reset?: boolean;
    search_text?: string;
  }) => Promise<void>;
  getRoomMembersData: (options: { reset?: boolean }) => Promise<void>;
  getRoomMeetingsData: (options: { reset?: boolean }) => Promise<void>;
  createMeeting: (meeting: Partial<meetings>) => Promise<void>;
  createPayment: (payment: Partial<payments>) => Promise<void>;
  createFolder: (parent_folder_id: string | null, folder_name: string) => Promise<void>;
  createFiles: (
    parent_folder_id: string | null,
    files: Partial<{
      id: string;
      file_name: string;
      file_extension: FileExtension;
      file_type: FileType;
    }>[]
  ) => Promise<void>;
  getUserRoomsData: () => Promise<void>;
  addLikeToFeed: (feed_id: number) => Promise<void>;
  getNewerMessages: () => Promise<boolean>;
};

const PAGE_SIZE = 10;

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  tab_loading: false,
  page_loading: true,
  feed: [],
  payments: [],
  selectedRoom: undefined,
  user_rooms: [],
  files: [],
  members: [],
  meetings: [],
  user: null as any as users,
  messages: [],
  reached_end: false,
  show_room_preview: null,
  setPageLoading: (loading) => set({ page_loading: loading }),
  resetState: () => set((state) => ({ ...state })),
  setSelectedRoomId: (roomId) => {
    const state = get();

    const room = state.user_rooms.find((room) => room.id === roomId);
    set((state) => ({
      selectedRoom: room,
      feed: [],
      payments: [],
      files: [],
      members: [],
      meetings: [],
      messages: [],
      reached_end: false,
    }));

    console.log({ room, roomId });

    if (!room) set((state) => ({ show_room_preview: roomId }));
  },

  setFeed: (feed) => set({ feed }),
  setPayments: (payments) => set({ payments }),
  setMessages: (messages) => set({ messages }),
  setUserRooms: (user_rooms) => set({ user_rooms }),
  setFiles: (files) => set({ files }),
  setMembers: (members) => set({ members }),
  setMeetings: (meetings) => set({ meetings }),
  setUserData: (user) => set({ user: user as any }),
  setReachedEnd: (reached_end) => set({ reached_end }),
  setIncFeedLikes: (feedId) =>
    set((state) => {
      const index = state.feed.findIndex((feed) => feed.id === feedId);
      if (index === -1) return state;
      const newFeed = [...state.feed];
      newFeed[index] = {
        ...newFeed[index],
        user_liked: !newFeed[index].user_liked,
        likes: newFeed[index].likes + (newFeed[index].user_liked ? -1 : 1),
      };
      return { feed: newFeed };
    }),
  setShowRoomPreview: (roomId) => set({ show_room_preview: roomId }),
  getUserData: async () => {
    set({ page_loading: true });
    const [data, roomData] = await Promise.all([
      makeApiCall({ url: API_URLS.USER_DATA, method: "GET" }),
      makeApiCall({ url: API_URLS.USER_ROOMS, method: "GET" }),
    ]);

    set({ page_loading: false, user_rooms: roomData, user: data });
  },
  loadRoomData: async (roomId) => {
    const { setSelectedRoomId, setShowRoomPreview, user_rooms, page_loading } = get();
    setSelectedRoomId(roomId);
    const isRoomThere = user_rooms.find((room) => room.id === roomId);
    if (!isRoomThere && !page_loading) setShowRoomPreview(roomId);
  },
  createRoomFeedData: async ({ message, files }) => {
    const { selectedRoom, user } = get();

    const fileData = [];

    for (const file of files) {
      const id = nanoid();
      const fileMetadata = getFileData(file.file);
      const { put_url, get_url } = await makeApiCall({
        url: API_URLS.GET_SIGNED_URL,
        method: "GET",
        params: { file_path: `files/${id}.${file.extension}` },
      });

      // upload the file to s3
      await axios.put(put_url, file.file);

      fileData.push({
        id: id,
        file_name: file.name,
        file_url: get_url,
        file_type: fileMetadata.fileType,
        file_extension: fileMetadata.fileExtension,
        file_size: fileMetadata.fileSize,
        user_id: user.id,
        room_id: selectedRoom?.id,
        parent_id: `feed_${selectedRoom?.id}`,
      });
    }

    const data = await makeApiCall({
      url: API_URLS.ROOM_FEED,
      method: "POST",
      body: {
        room_id: selectedRoom?.id,
        message,
        files: fileData,
      },
    });

    get().getRoomFeedData({ reset: true });
  },

  getRoomFeedData: async ({ reset }) => {
    const { setFeed, setReachedEnd, selectedRoom, feed, tab_loading, reached_end } = get();
    if (tab_loading || (!reset && reached_end)) return;

    if (reset) setFeed([]);
    set({ tab_loading: true });

    const data = await makeApiCall({
      url: API_URLS.ROOM_FEED,
      method: "GET",
      params: {
        room_id: selectedRoom?.id,
        cursor: reset ? undefined : feed.at(-1)?.id,
        take: PAGE_SIZE,
      },
    });

    if (reset) {
      setFeed(data);
    } else {
      setFeed([...feed, ...data]);
    }

    set({ tab_loading: false });
    setReachedEnd(data.length === 0);
  },

  getRoomPaymentsData: async ({ reset }) => {
    const { setPayments, setReachedEnd, selectedRoom, payments, tab_loading, reached_end } = get();
    if (tab_loading || (!reset && reached_end)) return;

    if (reset) setPayments([]);
    set({ tab_loading: true });

    const data = await makeApiCall({
      url: API_URLS.ROOM_PAYMENTS,
      method: "GET",
      params: {
        room_id: selectedRoom!.id,
        cursor: reset ? undefined : payments.at(-1)?.id,
        take: PAGE_SIZE,
      },
    });

    if (reset) {
      setPayments(data);
    } else {
      setPayments([...payments, ...data]);
    }

    set({ tab_loading: false });
    setReachedEnd(data.length < PAGE_SIZE);
  },

  getRoomChatData: async ({ feed_id, reset }) => {
    const { setMessages, setReachedEnd, selectedRoom, messages, tab_loading } = get();
    if (tab_loading) return;
    if (reset) {
      setMessages([]);
      setReachedEnd(false);
    }
    set({ tab_loading: true });
    const data = await makeApiCall({
      url: API_URLS.ROOM_CHAT,
      method: "GET",
      params: { room_id: selectedRoom?.id, feed_id, cursor: messages.at(0)?.id, take: PAGE_SIZE },
    });
    setMessages([...data.reverse(), ...messages]);
    set({ tab_loading: false });
    setReachedEnd(data.length < PAGE_SIZE);
  },

  sendRoomMessage: async (message, feed_id) => {
    const { setMessages, selectedRoom, messages } = get();
    const messageResponse = await makeApiCall({
      url: API_URLS.ROOM_CHAT,
      method: "POST",
      body: { message },
      params: { room_id: selectedRoom?.id, feed_id },
    });
    setMessages([...messages, messageResponse]);
  },

  getRoomFilesData: async ({ parent_folder_id, reset, search_text }) => {
    const { setFiles, selectedRoom, files, tab_loading, reached_end, setReachedEnd } = get();
    if ((tab_loading || reached_end) && !reset) return;
    if (reset) setFiles([]);
    set({ tab_loading: true });
    const data = await makeApiCall({
      url: API_URLS.ROOM_FILES,
      method: "GET",
      params: {
        room_id: selectedRoom!.id,
        parent_id: parent_folder_id,
        skip: reset ? 0 : files.length,
        take: 50,
        search_file_name: search_text,
      },
    });
    if (reset) setFiles(data);
    else setFiles([...files, ...data]);

    set({ tab_loading: false });
    setReachedEnd(data.length < 50);
  },

  getRoomMembersData: async ({ reset }) => {
    const { setMembers, setReachedEnd, selectedRoom, members, tab_loading, reached_end } = get();
    if (tab_loading || reached_end) return;
    if (reset) setMembers([]);
    set({ tab_loading: true });
    const data = await makeApiCall({
      url: API_URLS.ROOM_MEMBERS,
      method: "GET",
      params: { room_id: selectedRoom!.id, cursor: members.at(-1)?.id, take: 30 },
    });
    setMembers([...members, ...data]);
    set({ tab_loading: false });
    setReachedEnd(data.length < PAGE_SIZE);
  },

  getRoomMeetingsData: async ({ reset }) => {
    const { setMeetings, setReachedEnd, selectedRoom, meetings, tab_loading, reached_end } = get();
    if (tab_loading || (!reset && reached_end)) return;

    if (reset) setMeetings([]);
    set({ tab_loading: true });

    const data = await makeApiCall({
      url: API_URLS.ROOM_MEETINGS,
      method: "GET",
      params: {
        room_id: selectedRoom!.id,
        cursor: reset ? undefined : meetings.at(-1)?.id,
        take: PAGE_SIZE,
      },
    });

    if (reset) setMeetings(data);
    else setMeetings([...meetings, ...data]);

    set({ tab_loading: false });
    setReachedEnd(data.length < PAGE_SIZE);
  },
  createMeeting: async (meeting) => {
    const { setMeetings, selectedRoom, meetings } = get();
    set({ tab_loading: true });
    const data = await makeApiCall({ url: API_URLS.ROOM_MEETINGS, method: "POST", body: meeting });
    setMeetings([...meetings, data]);
    set({ tab_loading: false });
  },
  createPayment: async (payment) => {
    const { setPayments, selectedRoom, payments } = get();
    set({ tab_loading: true });
    const data = await makeApiCall({ url: API_URLS.ROOM_PAYMENTS, method: "POST", body: payment });
    setPayments([...payments, data]);
    set({ tab_loading: false });
  },

  createFolder: async (parent_folder_id, folder_name) => {
    const { getRoomFilesData, selectedRoom } = get();
    set({ tab_loading: true });
    await makeApiCall({
      url: API_URLS.ROOM_FILES,
      method: "POST",
      body: {
        files: [
          {
            file_name: folder_name,
            file_extension: FileExtension.folder,
            file_type: "FOLDER",
            room_id: selectedRoom!.id,
            parent_id: parent_folder_id,
          },
        ],
      },
    });
    await getRoomFilesData({ parent_folder_id });
    set({ tab_loading: false });
  },
  createFiles: async (parent_folder_id, files) => {
    const { selectedRoom } = get();
    set({ tab_loading: true });
    await makeApiCall({
      url: API_URLS.ROOM_FILES,
      method: "POST",
      body: {
        files: files.map((file) => {
          return {
            ...file,
            room_id: selectedRoom!.id,
            parent_id: parent_folder_id,
          } as Prisma.filesUncheckedCreateInput;
        }),
      },
    });
    set({ tab_loading: false });
  },

  getUserRoomsData: async () => {
    set({ page_loading: true });
    const data = await makeApiCall({ url: API_URLS.USER_ROOMS, method: "GET" });
    console.log({ data });
    set({ page_loading: false, user_rooms: data });
  },

  addLikeToFeed: async (feed_id) => {
    const { setIncFeedLikes } = get();
    await makeApiCall({
      url: API_URLS.LIKE_FEED,
      method: "PUT",
      params: { feed_id: feed_id },
    });
    setIncFeedLikes(feed_id);
  },

  // Add this new function to check for newer messages
  getNewerMessages: async () => {
    const { setMessages, selectedRoom, messages } = get();
    try {
      const data = await makeApiCall({
        url: API_URLS.ROOM_CHAT,
        method: "GET",
        params: {
          room_id: selectedRoom?.id,
          listener: true,
          cursor: messages.at(-1)?.id, // Get messages after the last message
          take: PAGE_SIZE,
        },
      });

      if (data.length > 0) {
        setMessages([...messages, ...data.reverse()]);
        return true; // Return true if new messages were added
      }
      return false; // Return false if no new messages
    } catch (error) {
      console.error("Error fetching new messages:", error);
      return false;
    }
  },
}));

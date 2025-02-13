export const API_URLS = {
  LOGIN: "/auth/login",
  GOOGLE_AUTH: "/auth/google",
  PHONE_AUTH: "/auth/phone",
  SIGNUP: "/auth/signup",
  LOGOUT: "/auth/logout",
  USER_ROOMS: "/rooms",
  USER_DATA: "/user",
  ROOM_CATEGORIES: "/room_categories",
  GET_ROOM: (room_id: number) => `/room/${room_id}`,
  ROOM_PREVIEW: (room_id: number) => `/rooms/${room_id}/preview`,
  ROOM_FEED: "/feed",
  ROOM_PAYMENTS: "/payments",
  RZP_CREATE_ORDER: "/payments/rzp_create_order",
  RZP_CALLBACK: "/payments/rzp_payment_callback",
  ROOM_CHAT: "/messages",
  ROOM_ROOMS: "/room/room",
  CREATE_ROOM: "/room/room",
  JOIN_ROOM: (room_id: number) => `/rooms/${room_id}/join`,
  LEAVE_ROOM: "/room/leave",
  ROOM_MEMBERS: "/members",
  ROOM_FILES: "/files",
  ROOM_MEETINGS: "/meetings",
  LIKE_FEED: "/feed/like",
  VIEW_FEED_ANALYTICS: "/feed/view",
  GET_FEED: (feedID: number) => `/room/feed/${feedID}`,
  DELETE_FEED: (feedID: number) => `/room/feed/${feedID}`,
  GET_MEETING: (meetingID: number) => `/meetings/${meetingID}`,
  ROOM_ANALYTICS: "/rooms/analytics",
  FEED_ANALYTICS: (feedID: number) => `/room/feed/${feedID}`,
  MEMBERS: "/members",
  MEMBER_REQUESTS: "/member_requests",
  DELETE_MEMBERS: (memberID: number) => `/members/${memberID}`,
  MESSAGES: "/messages",
  PAYMENT_REQUESTS: "/payment_requests",
  CASHFREE: "/cashfree",
  RAZORPAY: "/razorpay",
  ROOMS: "/rooms",
  PROFILE: "/auth/profile",
  GET_SIGNED_URL: "/get_signed_url",
};

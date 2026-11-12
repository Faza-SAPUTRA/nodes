/** Bentuk data yang dipakai bersama oleh halaman-halaman NODES. */

export type User = {
  id: number;
  email: string;
  name: string;
  bio: string;
  avatar: string | null;
  prefs: Prefs;
  created_at: string;
};

export type Prefs = {
  theme?: 'light' | 'dark';
  language?: 'id' | 'en';
  reduce_motion?: boolean;
  email_digest?: boolean;
};

export type ModuleSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  track: string;
  level: string;
  est_minutes: number;
  order_index: number;
  summary: string;
  accent: string;
  lesson_count: number;
  done_count: number;
  progress: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  order_index: number;
  minutes: number;
  body: string;
  takeaways: string[];
  status: 'done' | 'todo';
  note: string;
};

export type ModuleDetail = Omit<ModuleSummary, 'lesson_count' | 'done_count' | 'progress'> & {
  lessons: Lesson[];
  lesson_count: number;
  done_count: number;
  progress: number;
};

export type Activity = {
  id: number;
  kind: string;
  message: string;
  created_at: string;
};

export type Totals = {
  modules?: number;
  lessons: number;
  done: number;
  minutes?: number;
  progress: number;
};

export type ProjectMeta = {
  id: string;
  name: string;
  kind: string;
  created_at: string;
  updated_at: string;
};

export type Layer = {
  id: string;
  type: 'rect' | 'text' | 'button' | 'image';
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  radius?: number;
  text?: string;
  size?: number;
  weight?: number;
  color?: string;
};

export type CanvasDoc = {
  version: number;
  frame: { width: number; height: number; label: string };
  layers: Layer[];
  palette?: Record<string, string>;
};

export type Project = ProjectMeta & { data: CanvasDoc };

export type Room = {
  id: string;
  owner_id: number;
  title: string;
  share_code: string;
  status: string;
  created_at: string;
  role?: string;
  members?: number;
  open_comments?: number;
  messages?: number;
};

export type Comment = {
  id: number;
  room_id: string;
  user_id: number;
  body: string;
  x: number;
  y: number;
  resolved: number;
  created_at: string;
  author: string;
  author_avatar: string | null;
};

export type ChatMessage = {
  id: number;
  room_id: string;
  user_id: number;
  body: string;
  created_at: string;
  author: string;
  author_avatar: string | null;
};

export type RoomMember = { id: number; name: string; avatar: string | null; role: string };

export type RoomDetail = {
  room: Room;
  comments: Comment[];
  votes: Record<string, number>;
  my_vote: string | null;
  messages: ChatMessage[];
  members: RoomMember[];
};

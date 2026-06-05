export interface VoiceSampleItem {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  fileName: string;
  filePath: string;
  duration: number | null;
  active: boolean;
}

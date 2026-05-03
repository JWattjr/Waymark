export type Visibility = 'public' | 'private' | 'link-only' | 'wallet-gated';

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

export interface JournalEntry {
  id: string;
  tripId: string;
  title: string;
  content: string;
  date: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  media: Media[];
  contentHash?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  description: string;
  visibility: Visibility;
  isSealed: boolean;
  archiveHash?: string;
  ownerAddress: string;
  timestamp: number;
  entries: JournalEntry[];
}

export interface StorageProof {
  tripId: string;
  archiveHash: string;
  timestamp: number;
  owner: string;
  protocol: 'Shelby';
}

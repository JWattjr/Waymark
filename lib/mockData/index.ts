import { Trip } from '@/types';

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'zanzibar-2026',
    title: '3 Days in Zanzibar',
    destination: 'Zanzibar, Tanzania',
    startDate: '2026-05-10',
    endDate: '2026-05-13',
    coverImage: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&q=80&w=2000',
    description: 'An unforgettable journey through Stone Town and the pristine beaches of Nungwi.',
    visibility: 'public',
    isSealed: true,
    archiveHash: '0x7f88...e3a1',
    ownerAddress: '0x1234...abcd',
    timestamp: 1714582400000,
    entries: [
      {
        id: 'e1',
        tripId: 'zanzibar-2026',
        title: 'Arrival in Stone Town',
        content: 'The air in Stone Town is thick with the scent of cloves and history. Lost ourselves in the narrow alleys today.',
        date: '2026-05-10',
        location: { name: 'Stone Town', lat: -6.1659, lng: 39.2026 },
        media: [
          { id: 'm1', url: 'https://images.unsplash.com/photo-1547141530-580004543d83?auto=format&fit=crop&q=80&w=1200', type: 'image', caption: 'Historic doors of Stone Town' }
        ]
      },
      {
        id: 'e2',
        tripId: 'zanzibar-2026',
        title: 'Spice Market Walk',
        content: 'Explored the vibrant Darajani Market. The colors of the spices are just as intense as their aromas.',
        date: '2026-05-11',
        location: { name: 'Darajani Market', lat: -6.1616, lng: 39.1925 },
        media: [
          { id: 'm2', url: 'https://images.unsplash.com/photo-1533619239203-d484ecdfe60e?auto=format&fit=crop&q=80&w=1200', type: 'image', caption: 'Saffron and turmeric' }
        ]
      },
      {
        id: 'e3',
        tripId: 'zanzibar-2026',
        title: 'Sunset at Nungwi',
        content: 'Moved north to Nungwi. The white sand and turquoise water are surreal. Watching the dhows at sunset is magical.',
        date: '2026-05-12',
        location: { name: 'Nungwi Beach', lat: -5.7329, lng: 39.2974 },
        media: [
          { id: 'm3', url: 'https://images.unsplash.com/photo-1589307737444-2454a859e984?auto=format&fit=crop&q=80&w=1200', type: 'image', caption: 'Nungwi sunset' }
        ]
      },
      {
        id: 'e4',
        tripId: 'zanzibar-2026',
        title: 'Boat Ride',
        content: 'Took a traditional dhow out to Mnemba Atoll. The snorkeling was incredible—crystal clear visibility.',
        date: '2026-05-13',
        location: { name: 'Mnemba Atoll', lat: -5.8208, lng: 39.3813 },
        media: [
          { id: 'm4', url: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=1200', type: 'image', caption: 'Dhow on the water' }
        ]
      },
      {
        id: 'e5',
        tripId: 'zanzibar-2026',
        title: 'Final Postcard',
        content: 'Zanzibar, you have been a dream. Packing our bags but leaving a piece of our hearts here.',
        date: '2026-05-13',
        location: { name: 'Abeid Amani Karume International Airport', lat: -6.2223, lng: 39.2248 },
        media: [
          { id: 'm5', url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=1200', type: 'image', caption: 'Zanzibar coastline' }
        ]
      }
    ]
  }
];

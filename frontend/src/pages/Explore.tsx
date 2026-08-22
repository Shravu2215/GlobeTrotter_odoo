import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { useTrip } from '@/hooks/useTrip';
import {
  Search, Filter, ArrowDownWideNarrow, Layers, MapPin,
  Clock, Star, Plus, CheckCircle2, AlertCircle,
  X, Compass, Sparkles, Building2
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  type: 'activity';
  name: string;
  city: string;
  country: string;
  category: 'Adventure' | 'Sightseeing' | 'Historical' | 'Food' | 'Nature' | 'Museum' | 'Shopping' | 'Transport';
  cost: number;
  duration: string;
  durationHours: number;
  rating: number;
  popularity: number;
  image: string;
  description: string;
  highlights: string[];
  tips: string;
}

export interface CityItem {
  id: string;
  type: 'city';
  name: string;
  country: string;
  flag: string;
  costIndex: 'Budget' | 'Moderate' | 'High';
  rating: number;
  popularity: number;
  image: string;
  description: string;
  suggestedActivities: string[];
  bestSeason: string;
}

export type SearchResultItem = ActivityItem | CityItem;

type GroupByOption = 'none' | 'city' | 'country' | 'category' | 'type';
type SortOption = 'relevance' | 'popularity-desc' | 'cost-asc' | 'cost-desc' | 'duration-asc' | 'duration-desc' | 'rating-desc';

// ── Master Mock Data ────────────────────────────────────────────────────────
const MASTER_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'activity',
    name: 'Tandem Paragliding Experience',
    city: 'Bir Billing',
    country: 'India',
    category: 'Adventure',
    cost: 2500,
    duration: '2–3 hours',
    durationHours: 2.5,
    rating: 4.8,
    popularity: 98,
    image: '🪂',
    description: 'Fly high above the Kangra Valley tea gardens and snow-capped peaks from the world-renowned paragliding capital of India.',
    highlights: ['20-minute flight with certified pilot', 'GoPro HD video recording included', 'Landing at scenic Sunset Point'],
    tips: 'Morning slots provide the smoothest thermals and clearest mountain views.'
  },
  {
    id: 'act-2',
    type: 'activity',
    name: 'Alpine Paragliding over Interlaken',
    city: 'Interlaken',
    country: 'Switzerland',
    category: 'Adventure',
    cost: 16500,
    duration: '2 hours',
    durationHours: 2.0,
    rating: 4.9,
    popularity: 99,
    image: '🏔️',
    description: 'Glide gracefully between Lake Thun and Lake Brienz with awe-inspiring panoramas of the Eiger, Mönch, and Jungfrau peaks.',
    highlights: ['Breathtaking Alpine lake views', 'Professional tandem pilot', 'Hotel pick-up in central Interlaken'],
    tips: 'Wear warm layers and sturdy shoes even during summer months.'
  },
  {
    id: 'act-3',
    type: 'activity',
    name: 'Triund Ridge Himalayan Trek',
    city: 'Dharamshala',
    country: 'India',
    category: 'Adventure',
    cost: 1500,
    duration: '5–6 hours',
    durationHours: 5.5,
    rating: 4.7,
    popularity: 92,
    image: '🥾',
    description: 'A captivating trek through oak and rhododendron forests ending with panoramic vistas of the towering Dhauladhar mountain range.',
    highlights: ['Guided mountain trek', 'Spectacular sunset over the Kangra Valley', 'Fresh chai and local snacks at peak'],
    tips: 'Carry water and a windproof jacket for the chilly ridge summit.'
  },
  {
    id: 'act-4',
    type: 'activity',
    name: 'Eiffel Tower Sunset Summit Tour',
    city: 'Paris',
    country: 'France',
    category: 'Sightseeing',
    cost: 3200,
    duration: '2–3 hours',
    durationHours: 2.5,
    rating: 4.8,
    popularity: 99,
    image: '🗼',
    description: 'Ascend to the very top deck of Paris’ iconic monument for magical 360-degree views as the city lights illuminate at dusk.',
    highlights: ['Direct elevator access to 3rd floor summit', 'Audio-guided historic commentary', 'Champagne bar option at peak'],
    tips: 'Book sunset time slots at least 2 weeks in advance.'
  },
  {
    id: 'act-5',
    type: 'activity',
    name: 'Louvre Museum Masterpieces Guided Walk',
    city: 'Paris',
    country: 'France',
    category: 'Museum',
    cost: 2800,
    duration: '3 hours',
    durationHours: 3.0,
    rating: 4.9,
    popularity: 97,
    image: '🎨',
    description: 'Skip the winding queues to witness the Mona Lisa, Venus de Milo, and Winged Victory with an expert art historian.',
    highlights: ['Skip-the-line priority entrance', 'Expert art historian guide', 'Headsets for clear narration'],
    tips: 'Comfortable walking shoes are essential for exploring the vast wings.'
  },
  {
    id: 'act-6',
    type: 'activity',
    name: 'Shinjuku Izakaya & Street Food Crawl',
    city: 'Tokyo',
    country: 'Japan',
    category: 'Food',
    cost: 4200,
    duration: '3 hours',
    durationHours: 3.0,
    rating: 4.9,
    popularity: 96,
    image: '🍜',
    description: 'Weave through atmospheric alleys of Omoide Yokocho and Golden Gai tasting sizzling yakitori, gyoza, ramen, and artisan sake.',
    highlights: ['4 authentic local eateries visited', '8+ delicious food tastings & drinks', 'English-speaking foodie guide'],
    tips: 'Come hungry! Portions are generous across all stops.'
  },
  {
    id: 'act-7',
    type: 'activity',
    name: 'Senso-ji Temple & Asakusa Heritage Walk',
    city: 'Tokyo',
    country: 'Japan',
    category: 'Historical',
    cost: 0,
    duration: '2 hours',
    durationHours: 2.0,
    rating: 4.8,
    popularity: 95,
    image: '⛩️',
    description: 'Tokyo’s oldest Buddhist temple featuring the colossal Kaminarimon gate and vibrant Nakamise traditional market street.',
    highlights: ['Iconic Red Lantern gate', 'Traditional fortune omikuji', 'Handmade ningyo-yaki sweets tasting'],
    tips: 'Early morning (before 9 AM) provides the most peaceful experience.'
  },
  {
    id: 'act-8',
    type: 'activity',
    name: 'Amber Fort Elephant & Jeep Safari',
    city: 'Jaipur',
    country: 'India',
    category: 'Historical',
    cost: 1200,
    duration: '3–4 hours',
    durationHours: 3.5,
    rating: 4.8,
    popularity: 93,
    image: '🏰',
    description: 'Marvel at Rajput architecture, marble courtyards, and the glittering Sheesh Mahal mirror palace atop Amer hill.',
    highlights: ['Sheesh Mahal mirror hall visit', 'Historic royal courtyards', 'Panoramic Maota Lake view'],
    tips: 'Combine with Nahargarh Fort for an evening sunset view.'
  },
  {
    id: 'act-9',
    type: 'activity',
    name: 'Thar Desert Camel Safari & Campfire',
    city: 'Jaisalmer',
    country: 'India',
    category: 'Adventure',
    cost: 3500,
    duration: '5–6 hours',
    durationHours: 5.5,
    rating: 4.9,
    popularity: 97,
    image: '🐪',
    description: 'Trek across rolling Sam sand dunes on camelback, enjoy Rajasthani folk music by the bonfire, and gaze at star-filled skies.',
    highlights: ['Sunset camel ride on sand dunes', 'Live Kalbelia dance and folk songs', 'Authentic buffet dinner in desert camp'],
    tips: 'Carry a light sweater for desert night chill.'
  },
  {
    id: 'act-10',
    type: 'activity',
    name: 'Colosseum & Roman Forum VIP Tour',
    city: 'Rome',
    country: 'Italy',
    category: 'Historical',
    cost: 3400,
    duration: '3 hours',
    durationHours: 3.0,
    rating: 4.9,
    popularity: 98,
    image: '🏛️',
    description: 'Step onto the legendary arena floor where gladiators fought and explore the ancient civic heart of the Roman Empire.',
    highlights: ['Gladiator arena floor access', 'Roman Forum & Palatine Hill ruins', 'Archaeologist guide'],
    tips: 'Valid ID or passport required for entry verification.'
  },
  {
    id: 'act-11',
    type: 'activity',
    name: 'Mount Batur Sunrise Volcano Hike',
    city: 'Bali',
    country: 'Indonesia',
    category: 'Adventure',
    cost: 3200,
    duration: '5–6 hours',
    durationHours: 5.5,
    rating: 4.8,
    popularity: 95,
    image: '🌋',
    description: 'Early morning hike up an active volcano to watch the dawn break over Lake Batur, followed by volcanic steam-cooked breakfast.',
    highlights: ['Magical sunrise above the clouds', 'Volcanic breakfast (steamed eggs & banana)', 'Visit to natural hot springs'],
    tips: 'Flashlights and trekking poles are provided by the guide.'
  },
  {
    id: 'act-12',
    type: 'activity',
    name: 'Burj Khalifa Observation Deck',
    city: 'Dubai',
    country: 'UAE',
    category: 'Sightseeing',
    cost: 4200,
    duration: '2 hours',
    durationHours: 2.0,
    rating: 4.7,
    popularity: 94,
    image: '🏙️',
    description: 'High-speed elevator ride to the 124th and 125th floors of the world’s tallest tower overlooking the Dubai skyline and Persian Gulf.',
    highlights: ['World’s fastest double-deck elevator', 'Outdoor terrace with telescope views', 'Interactive digital skyline exhibits'],
    tips: 'Pair with the evening Dubai Fountain show right outside.'
  }
];

const MASTER_CITIES: CityItem[] = [
  {
    id: 'city-1',
    type: 'city',
    name: 'Bir Billing',
    country: 'India',
    flag: '🇮🇳',
    costIndex: 'Budget',
    rating: 4.9,
    popularity: 97,
    image: '🪂',
    description: 'A tranquil Himalayan ecotourism hub and global paragliding hotspot nestled in the foothills of Himachal Pradesh.',
    suggestedActivities: ['Tandem Paragliding', 'Tibetan Monastery Tour', 'Tea Garden Cycle Tour'],
    bestSeason: 'Oct – May'
  },
  {
    id: 'city-2',
    type: 'city',
    name: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    costIndex: 'High',
    rating: 4.8,
    popularity: 99,
    image: '🥐',
    description: 'The global capital of art, gastronomy, fashion, and romantic landmarks along the picturesque Seine river.',
    suggestedActivities: ['Eiffel Tower Summit', 'Louvre Museum Tour', 'Montmartre Walk', 'Seine Dinner Cruise'],
    bestSeason: 'Apr – Oct'
  },
  {
    id: 'city-3',
    type: 'city',
    name: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    costIndex: 'High',
    rating: 4.9,
    popularity: 98,
    image: '🗼',
    description: 'An electrifying metropolis harmonizing centuries-old shrines with neon-lit high-tech districts and Michelin-starred dining.',
    suggestedActivities: ['Shinjuku Food Crawl', 'Senso-ji Temple', 'Shibuya Crossing', 'Akihabara Tech'],
    bestSeason: 'Mar – May & Sep – Nov'
  },
  {
    id: 'city-4',
    type: 'city',
    name: 'Jaipur',
    country: 'India',
    flag: '🇮🇳',
    costIndex: 'Budget',
    rating: 4.8,
    popularity: 94,
    image: '🏰',
    description: 'Rajasthan’s legendary Pink City, famed for its palatial architecture, grand hill forts, and colourful bazaar heritage.',
    suggestedActivities: ['Amber Fort Safari', 'Hawa Mahal Palace', 'Johari Bazaar Shopping', 'City Palace'],
    bestSeason: 'Oct – Mar'
  },
  {
    id: 'city-5',
    type: 'city',
    name: 'Rome',
    country: 'Italy',
    flag: '🇮🇹',
    costIndex: 'Moderate',
    rating: 4.8,
    popularity: 97,
    image: '🏛️',
    description: 'The Eternal City with nearly 3,000 years of globally influential art, architecture, ancient ruins, and culinary wonders.',
    suggestedActivities: ['Colosseum & Forum', 'Vatican Museums', 'Trastevere Food Tour', 'Trevi Fountain'],
    bestSeason: 'Apr – Jun & Sep – Oct'
  },
  {
    id: 'city-6',
    type: 'city',
    name: 'Bali',
    country: 'Indonesia',
    flag: '🇮🇩',
    costIndex: 'Budget',
    rating: 4.7,
    popularity: 96,
    image: '🌴',
    description: 'The Island of the Gods, featuring emerald rice terraces, cliffside ocean temples, volcanic summits, and vibrant beach culture.',
    suggestedActivities: ['Mount Batur Sunrise Hike', 'Uluwatu Temple Sunset', 'Tegalalang Rice Terraces', 'Seminyak Surf'],
    bestSeason: 'May – Sep'
  },
  {
    id: 'city-7',
    type: 'city',
    name: 'Interlaken',
    country: 'Switzerland',
    flag: '🇨🇭',
    costIndex: 'High',
    rating: 4.9,
    popularity: 95,
    image: '🏔️',
    description: 'Europe’s adventure capital set between crystalline lakes and the snow-dusted Jungfrau Alps.',
    suggestedActivities: ['Alpine Paragliding', 'Jungfraujoch Top of Europe', 'Lake Brienz Cruise', 'Harder Kulm View'],
    bestSeason: 'Jun – Sep & Dec – Mar'
  },
  {
    id: 'city-8',
    type: 'city',
    name: 'Dubai',
    country: 'UAE',
    flag: '🇦🇪',
    costIndex: 'Moderate',
    rating: 4.7,
    popularity: 93,
    image: '🏙️',
    description: 'A futuristic oasis of record-breaking skyscrapers, expansive desert safaris, mega malls, and luxury marina yachts.',
    suggestedActivities: ['Burj Khalifa Deck', 'Desert Safari BBQ', 'Dubai Mall Fountain', 'Marina Yacht Cruise'],
    bestSeason: 'Nov – Mar'
  }
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Adventure:   { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
  Sightseeing: { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200' },
  Historical:  { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
  Food:        { bg: 'bg-rose-50',    text: 'text-rose-700',   border: 'border-rose-200' },
  Nature:      { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200' },
  Museum:      { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
  Shopping:    { bg: 'bg-pink-50',    text: 'text-pink-700',   border: 'border-pink-200' },
  Transport:   { bg: 'bg-gray-50',    text: 'text-gray-700',   border: 'border-gray-200' },
};

export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTrip, addActivity, addSection, saveItinerary } = useTrip();

  // Search & Controls State (initialized with location.state?.initialSearch if passed)
  const [searchQuery, setSearchQuery] = useState<string>(
    (location.state as { initialSearch?: string })?.initialSearch || ''
  );
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Filter States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'activities' | 'cities'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCost, setFilterCost] = useState<'all' | 'free' | 'budget' | 'moderate' | 'high'>('all');
  const [filterDuration, setFilterDuration] = useState<'all' | 'under2' | '2to5' | 'over5'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterMinRating, setFilterMinRating] = useState<number>(0);

  // Detail Modal & Add-to-Trip State
  const [selectedDetailItem, setSelectedDetailItem] = useState<SearchResultItem | null>(null);
  const [addToTripItem, setAddToTripItem] = useState<SearchResultItem | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>('');
  const [activityTime, setActivityTime] = useState<string>('10:00 AM');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [noTripModalOpen, setNoTripModalOpen] = useState(false);

  // Available unique countries for filter
  const allCountries = useMemo(() => {
    const set = new Set<string>();
    MASTER_ACTIVITIES.forEach(a => set.add(a.country));
    MASTER_CITIES.forEach(c => set.add(c.country));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterType !== 'all') count++;
    if (filterCategory !== 'all') count++;
    if (filterCost !== 'all') count++;
    if (filterDuration !== 'all') count++;
    if (filterCountry !== 'all') count++;
    if (filterMinRating > 0) count++;
    return count;
  }, [filterType, filterCategory, filterCost, filterDuration, filterCountry, filterMinRating]);

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterCost('all');
    setFilterDuration('all');
    setFilterCountry('all');
    setFilterMinRating(0);
  };

  // State for Dynamic Data
  const [allMasterItems, setAllMasterItems] = useState<SearchResultItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch dynamic data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        // Fetch all cities (which now returns Destination + relations)
        const res = await fetch('/api/cities');
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        const fetchedItems: SearchResultItem[] = [];
        
        // Map database destinations to CityItem
        data.data.cities.forEach((dest: any) => {
          fetchedItems.push({
            id: dest.id,
            type: 'city',
            name: dest.cityName,
            country: dest.country || 'Unknown',
            flag: '🌍',
            costIndex: (dest.foodCost?.averageMealCost || 0) > 2000 ? 'High' : 'Moderate',
            rating: dest.averageRating || 4.5,
            popularity: dest.popularityScore || 50,
            image: dest.imageUrl || `https://source.unsplash.com/400x300/?${encodeURIComponent(dest.cityName)}`,
            description: dest.description || `Explore the beautiful city of ${dest.cityName}`,
            suggestedActivities: [],
            bestSeason: dest.seasonalInfo?.[0]?.season || 'Year-round'
          });
        });

        setAllMasterItems(fetchedItems);
      } catch (err) {
        console.error("Error fetching explore data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Filtered & Sorted Results
  const processedResults = useMemo(() => {
    let list = allMasterItems.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCountry = item.country.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        let matchesExtra = false;

        if (item.type === 'activity') {
          matchesExtra =
            item.city.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.highlights.some(h => h.toLowerCase().includes(q));
        } else {
          matchesExtra =
            item.suggestedActivities.some(a => a.toLowerCase().includes(q)) ||
            item.costIndex.toLowerCase().includes(q);
        }

        if (!matchesName && !matchesCountry && !matchesDesc && !matchesExtra) {
          return false;
        }
      }

      // 2. Type Filter
      if (filterType === 'activities' && item.type !== 'activity') return false;
      if (filterType === 'cities' && item.type !== 'city') return false;

      // 3. Category Filter
      if (filterCategory !== 'all') {
        if (item.type === 'activity' && item.category !== filterCategory) return false;
        if (item.type === 'city') {
          const hasCategory = item.suggestedActivities.some(a =>
            a.toLowerCase().includes(filterCategory.toLowerCase())
          );
          if (!hasCategory) return false;
        }
      }

      // 4. Cost Filter
      if (filterCost !== 'all') {
        if (item.type === 'activity') {
          if (filterCost === 'free' && item.cost !== 0) return false;
          if (filterCost === 'budget' && (item.cost === 0 || item.cost > 2500)) return false;
          if (filterCost === 'moderate' && (item.cost <= 2500 || item.cost > 6000)) return false;
          if (filterCost === 'high' && item.cost <= 6000) return false;
        } else {
          if (filterCost === 'budget' && item.costIndex !== 'Budget') return false;
          if (filterCost === 'moderate' && item.costIndex !== 'Moderate') return false;
          if (filterCost === 'high' && item.costIndex !== 'High') return false;
        }
      }

      // 5. Duration Filter (activities only)
      if (filterDuration !== 'all') {
        if (item.type === 'activity') {
          if (filterDuration === 'under2' && item.durationHours > 2) return false;
          if (filterDuration === '2to5' && (item.durationHours < 2 || item.durationHours > 5)) return false;
          if (filterDuration === 'over5' && item.durationHours <= 5) return false;
        }
      }

      // 6. Country Filter
      if (filterCountry !== 'all' && item.country !== filterCountry) return false;

      // 7. Rating Filter
      if (filterMinRating > 0 && item.rating < filterMinRating) return false;

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'popularity-desc') return b.popularity - a.popularity;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'cost-asc') {
        const costA = a.type === 'activity' ? a.cost : (a.costIndex === 'Budget' ? 2000 : a.costIndex === 'Moderate' ? 5000 : 10000);
        const costB = b.type === 'activity' ? b.cost : (b.costIndex === 'Budget' ? 2000 : b.costIndex === 'Moderate' ? 5000 : 10000);
        return costA - costB;
      }
      if (sortBy === 'cost-desc') {
        const costA = a.type === 'activity' ? a.cost : (a.costIndex === 'Budget' ? 2000 : a.costIndex === 'Moderate' ? 5000 : 10000);
        const costB = b.type === 'activity' ? b.cost : (b.costIndex === 'Budget' ? 2000 : b.costIndex === 'Moderate' ? 5000 : 10000);
        return costB - costA;
      }
      if (sortBy === 'duration-asc') {
        const durA = a.type === 'activity' ? a.durationHours : 4;
        const durB = b.type === 'activity' ? b.durationHours : 4;
        return durA - durB;
      }
      if (sortBy === 'duration-desc') {
        const durA = a.type === 'activity' ? a.durationHours : 4;
        const durB = b.type === 'activity' ? b.durationHours : 4;
        return durB - durA;
      }
      // Relevance (Default): rating * popularity score
      return (b.rating * b.popularity) - (a.rating * a.popularity);
    });

    return list;
  }, [allMasterItems, searchQuery, filterType, filterCategory, filterCost, filterDuration, filterCountry, filterMinRating, sortBy]);

  // Grouping logic
  const groupedResults = useMemo(() => {
    if (groupBy === 'none') {
      return [{ groupTitle: '', items: processedResults }];
    }

    const groups: Record<string, SearchResultItem[]> = {};

    processedResults.forEach((item) => {
      let key = 'Other';
      if (groupBy === 'city') {
        key = item.type === 'activity' ? item.city : item.name;
      } else if (groupBy === 'country') {
        key = item.country;
      } else if (groupBy === 'category') {
        key = item.type === 'activity' ? item.category : 'Destinations';
      } else if (groupBy === 'type') {
        key = item.type === 'activity' ? 'Activities' : 'Cities & Destinations';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups).map(([groupTitle, items]) => ({
      groupTitle,
      items
    }));
  }, [processedResults, groupBy]);

  // ── Add To Trip Handlers ──────────────────────────────────────────────────
  const handleInitiateAddToTrip = (item: SearchResultItem) => {
    if (!currentTrip) {
      setNoTripModalOpen(true);
      return;
    }

    if (item.type === 'city') {
      // Add city directly as a section to currentTrip
      addSection({
        city: item.name,
        country: item.country,
        startDate: currentTrip.startDate || new Date().toISOString().split('T')[0],
        endDate: currentTrip.endDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        budget: item.costIndex === 'Budget' ? 20000 : item.costIndex === 'Moderate' ? 40000 : 80000
      });
      saveItinerary();
      showToast(`✓ ${item.name} added as a new destination in ${currentTrip.name}!`);
      return;
    }

    // For activity: open section selection modal if sections exist
    setAddToTripItem(item);
    if (currentTrip.sections.length > 0) {
      // Pick matching city section if exists, else first section
      const match = currentTrip.sections.find(s => s.city.toLowerCase() === item.city.toLowerCase());
      setSelectedSectionId(match ? match.id : currentTrip.sections[0].id);
      setActivityDate(match ? match.startDate : currentTrip.startDate || new Date().toISOString().split('T')[0]);
    } else {
      setSelectedSectionId('');
      setActivityDate(currentTrip.startDate || new Date().toISOString().split('T')[0]);
    }
  };

  const handleConfirmAddActivity = () => {
    if (!currentTrip || !addToTripItem || addToTripItem.type !== 'activity') return;

    let targetSectionId = selectedSectionId;

    // If no section exists in trip, create one automatically for this city!
    if (!targetSectionId || currentTrip.sections.length === 0) {
      addSection({
        city: addToTripItem.city,
        country: addToTripItem.country,
        startDate: currentTrip.startDate || new Date().toISOString().split('T')[0],
        endDate: currentTrip.endDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        budget: 30000
      });
      targetSectionId = currentTrip.sections[0]?.id || 'default-section';
    }

    addActivity(targetSectionId, {
      name: addToTripItem.name,
      category: addToTripItem.category,
      date: activityDate || currentTrip.startDate || new Date().toISOString().split('T')[0],
      time: activityTime || '10:00 AM',
      cost: addToTripItem.cost
    });

    saveItinerary();
    setAddToTripItem(null);
    showToast(`✓ ${addToTripItem.name} added to ${currentTrip.name}!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-emerald-600">
          <CheckCircle2 size={20} className="text-emerald-200 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => navigate('/view-itinerary')}
            className="ml-2 bg-white text-roamora-green text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors shrink-0"
          >
            View Itinerary →
          </button>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 pb-28">

        {/* ── Page Header / Title ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Compass size={20} className="text-roamora-green" />
            <span className="text-xs font-bold uppercase tracking-widest text-roamora-green">Screen 8</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            City / Activity Search
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Search cities or activities, filter by preference, group results, and add items directly to your trip itinerary.
          </p>
        </div>

        {/* ── Prominent Search Bar & Controls ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-8 space-y-4">
          
          {/* Main Search Input */}
          <div className="relative w-full">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities or activities (e.g. Paragliding, Paris, Tokyo, Trekking, Museum)..."
              className="w-full pl-14 pr-12 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-roamora-green focus:bg-white outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
              <Sparkles size={12} className="text-roamora-gold" /> Popular:
            </span>
            {['Paragliding', 'Paris', 'Tokyo', 'Trekking', 'Museum', 'Bir Billing', 'Colosseum', 'Bali'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-roamora-green text-white border-roamora-green'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-roamora-green hover:text-roamora-green'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Controls Bar: Group By | Filter | Sort By */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Group By Dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                <Layers size={15} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Group by:</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                  className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="none">None</option>
                  <option value="city">City</option>
                  <option value="country">Country</option>
                  <option value="category">Category / Type</option>
                  <option value="type">Item Type</option>
                </select>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  activeFilterCount > 0
                    ? 'bg-roamora-green text-white border-roamora-green shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-roamora-green'
                }`}
              >
                <Filter size={14} />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-white text-roamora-green rounded-full text-[10px] font-extrabold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-red-600 hover:underline px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <ArrowDownWideNarrow size={15} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="popularity-desc">Popularity: High → Low</option>
                <option value="rating-desc">Rating: High → Low</option>
                <option value="cost-asc">Cost: Low → High</option>
                <option value="cost-desc">Cost: High → Low</option>
                <option value="duration-asc">Duration: Short → Long</option>
                <option value="duration-desc">Duration: Long → Short</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Active Trip Banner if available ── */}
        {currentTrip ? (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-roamora-green text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Active Planning Session</p>
                <p className="text-sm font-bold text-gray-900">{currentTrip.name} ({currentTrip.destination})</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/itinerary')}
              className="text-xs font-bold text-roamora-green bg-white px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors shrink-0"
            >
              Open Builder →
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>No trip selected yet. Click "Add to Trip" on any card to create or attach to a trip!</span>
            </div>
            <button
              onClick={() => navigate('/create-trip')}
              className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors shrink-0"
            >
              Create Trip
            </button>
          </div>
        )}

        {/* ── Results Header ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Results
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            {processedResults.length} {processedResults.length === 1 ? 'option' : 'options'} found
          </span>
        </div>

        {/* ── Results List / Cards ── */}
        {processedResults.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
            <Compass size={48} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-display text-xl font-bold text-gray-800 mb-1">No results found</h3>
            <p className="text-sm text-gray-500 mb-6">Try searching for other terms like "Paragliding", "Paris", "Tokyo", or clear your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); clearFilters(); }}
              className="bg-roamora-green text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedResults.map(({ groupTitle, items }) => (
              <div key={groupTitle || 'all'} className="space-y-4">
                {groupTitle && (
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <h3 className="font-display text-xl font-bold text-gray-800">{groupTitle}</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700">
                      {items.length}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-roamora-green/60 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      {/* Left Side Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Icon / Image Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl shrink-0">
                          {item.image}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-display text-lg font-bold text-gray-900 truncate">
                              {item.name}
                            </h4>
                            {item.type === 'activity' ? (
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category]?.bg} ${CATEGORY_COLORS[item.category]?.text} ${CATEGORY_COLORS[item.category]?.border}`}>
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                                <Building2 size={11} /> Destination
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              {item.rating}
                            </div>
                          </div>

                          {/* Location & Metadata Row */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mb-2">
                            <span className="flex items-center gap-1 text-gray-700">
                              <MapPin size={13} className="text-roamora-green" />
                              {item.type === 'activity' ? `${item.city}, ${item.country}` : item.country}
                            </span>
                            <span>•</span>
                            {item.type === 'activity' ? (
                              <>
                                <span className="flex items-center gap-1">
                                  <Clock size={13} className="text-gray-400" />
                                  {item.duration}
                                </span>
                                <span>•</span>
                                <span className="font-bold text-gray-900">
                                  {item.cost === 0 ? 'Free' : `₹${item.cost.toLocaleString('en-IN')}`}
                                </span>
                              </>
                            ) : (
                              <>
                                <span>Cost Index: <strong className="text-gray-800">{item.costIndex}</strong></span>
                                <span>•</span>
                                <span>Best: {item.bestSeason}</span>
                              </>
                            )}
                          </div>

                          {/* Description snippet */}
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Side Action Buttons */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setSelectedDetailItem(item)}
                          className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleInitiateAddToTrip(item)}
                          className="flex items-center gap-1.5 bg-roamora-green text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm hover:shadow"
                        >
                          <Plus size={15} />
                          <span>Add to Trip</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Filter Modal ── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilterModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-roamora-green" />
                <h3 className="font-display text-xl font-bold text-gray-900">Filter Results</h3>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Type Filter */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Item Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'activities', 'cities'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`py-2 text-xs font-bold rounded-xl border capitalize ${
                        filterType === t
                          ? 'bg-roamora-green text-white border-roamora-green'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-roamora-green'
                      }`}
                    >
                      {t === 'all' ? 'All' : t === 'activities' ? 'Activities' : 'Cities'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Activity Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Historical">Historical</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Nature">Nature & Outdoors</option>
                  <option value="Museum">Museum & Art</option>
                </select>
              </div>

              {/* Cost Filter */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Cost Range</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All Costs' },
                    { id: 'free', label: 'Free' },
                    { id: 'budget', label: '< ₹2,500' },
                    { id: 'moderate', label: '₹2.5K–₹6K' },
                    { id: 'high', label: '> ₹6,000' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFilterCost(c.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        filterCost === c.id
                          ? 'bg-roamora-green text-white border-roamora-green'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-roamora-green'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Duration (Activities)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'under2', label: '< 2 hrs' },
                    { id: '2to5', label: '2–5 hrs' },
                    { id: 'over5', label: '5+ hrs' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setFilterDuration(d.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        filterDuration === d.id
                          ? 'bg-roamora-green text-white border-roamora-green'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-roamora-green'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Filter */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Country</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none"
                >
                  <option value="all">All Countries</option>
                  {allCountries.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Minimum Rating</label>
                <div className="flex gap-2">
                  {[0, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilterMinRating(r)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                        filterMinRating === r
                          ? 'bg-roamora-green text-white border-roamora-green'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-roamora-green'
                      }`}
                    >
                      {r === 0 ? 'Any Rating' : `★ ${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 bg-roamora-green text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDetailItem(null)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-3xl flex items-center justify-center shrink-0">
                  {selectedDetailItem.image}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900">{selectedDetailItem.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedDetailItem.type === 'activity' ? `${selectedDetailItem.city}, ${selectedDetailItem.country}` : selectedDetailItem.country}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDetailItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <p className="text-sm leading-relaxed text-gray-600">{selectedDetailItem.description}</p>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-2xl text-center">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Rating</span>
                  <span className="font-bold text-gray-900 text-sm flex items-center justify-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    {selectedDetailItem.rating}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    {selectedDetailItem.type === 'activity' ? 'Cost' : 'Cost Index'}
                  </span>
                  <span className="font-bold text-roamora-green text-sm">
                    {selectedDetailItem.type === 'activity'
                      ? (selectedDetailItem.cost === 0 ? 'Free' : `₹${selectedDetailItem.cost.toLocaleString('en-IN')}`)
                      : selectedDetailItem.costIndex}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    {selectedDetailItem.type === 'activity' ? 'Duration' : 'Best Season'}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">
                    {selectedDetailItem.type === 'activity' ? selectedDetailItem.duration : selectedDetailItem.bestSeason}
                  </span>
                </div>
              </div>

              {/* Highlights */}
              {selectedDetailItem.type === 'activity' && selectedDetailItem.highlights && (
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-gray-900 uppercase tracking-wide text-[11px]">Experience Highlights</p>
                  {selectedDetailItem.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 size={13} className="text-roamora-green shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Activities for cities */}
              {selectedDetailItem.type === 'city' && (
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-gray-900 uppercase tracking-wide text-[11px]">Top Things To Do</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetailItem.suggestedActivities.map((act, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                        • {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Useful Tips */}
              {selectedDetailItem.type === 'activity' && selectedDetailItem.tips && (
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-amber-900">
                  <p className="font-bold text-[11px] mb-0.5">💡 Useful Travel Tip:</p>
                  <p>{selectedDetailItem.tips}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const item = selectedDetailItem;
                  setSelectedDetailItem(null);
                  handleInitiateAddToTrip(item);
                }}
                className="flex-1 py-3 bg-roamora-green text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                <span>Add to Trip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add to Trip Section Chooser Modal ── */}
      {addToTripItem && addToTripItem.type === 'activity' && currentTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddToTripItem(null)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">Add to Itinerary</h3>
                <p className="text-xs text-gray-500 font-medium">{addToTripItem.name}</p>
              </div>
              <button onClick={() => setAddToTripItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Trip Section selection */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Destination / Section</label>
                {currentTrip.sections.length > 0 ? (
                  <select
                    value={selectedSectionId}
                    onChange={(e) => {
                      setSelectedSectionId(e.target.value);
                      const sec = currentTrip.sections.find(s => s.id === e.target.value);
                      if (sec) setActivityDate(sec.startDate);
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none"
                  >
                    {currentTrip.sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.city} ({sec.startDate} – {sec.endDate})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-100">
                    A new destination section for <strong>{addToTripItem.city}</strong> will be added to your trip automatically.
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Scheduled Date</label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Scheduled Time</label>
                <input
                  type="text"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none"
                />
              </div>

              {/* Estimated cost preview */}
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Activity Cost:</span>
                <span className="font-bold text-roamora-green">
                  {addToTripItem.cost === 0 ? 'Free' : `₹${addToTripItem.cost.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setAddToTripItem(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddActivity}
                className="flex-1 py-3 bg-roamora-green text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── No Active Trip Modal ── */}
      {noTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNoTripModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full z-10 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={26} />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No Active Trip Selected</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Please create a new trip or choose an existing trip from your saved list to start adding activities.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { setNoTripModalOpen(false); navigate('/create-trip'); }}
                className="w-full py-3 bg-roamora-green text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                Plan a New Trip
              </button>
              <button
                onClick={() => { setNoTripModalOpen(false); navigate('/my-trips'); }}
                className="w-full py-3 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
              >
                Go to My Trips
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

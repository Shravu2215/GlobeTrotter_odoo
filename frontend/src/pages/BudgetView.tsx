import { useState, useMemo } from 'react';
import { useTrip } from '@/hooks/useTrip';
import { useCommunity } from '@/hooks/useCommunity';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import {
  ArrowLeft,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Share2,
  Sparkles,
  Hotel,
  Plane,
  Utensils,
  Compass,
  Calendar,
  Layers,
  HelpCircle,
  Sliders,
  RefreshCw,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Star,
  Bus,
  Train,
  Car,
  ChevronRight,
  ShieldAlert,
  Wand2,
  Building2
} from 'lucide-react';

// --- Curated Database of Specific Stays by City & Tier ---
interface HotelOption {
  id: string;
  name: string;
  stars: number;
  tier: 'luxury' | 'standard' | 'budget';
  pricePerNight: number;
  location: string;
  rating: number;
  reviewsCount: number;
  image: string;
  amenities: string[];
}

const CITY_HOTELS: Record<string, HotelOption[]> = {
  paris: [
    {
      id: 'p-lux',
      name: 'Hôtel Madame Rêve',
      stars: 5,
      tier: 'luxury',
      pricePerNight: 9500,
      location: '1st Arrondissement, Louvre Area, Paris',
      rating: 4.9,
      reviewsCount: 1420,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
      amenities: ['Eiffel & Louvre Views', 'Rooftop Lounge', 'Spa & Wellness', 'Michelin Dining']
    },
    {
      id: 'p-std',
      name: 'CitizenM Paris Gare de Lyon',
      stars: 4,
      tier: 'standard',
      pricePerNight: 4200,
      location: '12th Arrondissement, Central Paris',
      rating: 4.7,
      reviewsCount: 2380,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
      amenities: ['King XL Bed', 'City Skyline Bar', 'Ultra-Fast Wi-Fi', 'Metro Connected']
    },
    {
      id: 'p-bud',
      name: 'The People Paris Belleville',
      stars: 3,
      tier: 'budget',
      pricePerNight: 2300,
      location: 'Belleville Arts Quarter, Paris',
      rating: 4.5,
      reviewsCount: 1890,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
      amenities: ['Private & Pod Rooms', 'Rooftop Terrace', 'Cafe & Bar', 'Free Walking Tours']
    }
  ],
  interlaken: [
    {
      id: 'i-lux',
      name: 'Victoria-Jungfrau Grand Hotel & Spa',
      stars: 5,
      tier: 'luxury',
      pricePerNight: 12000,
      location: 'Höheweg 41, Interlaken Centre',
      rating: 4.9,
      reviewsCount: 950,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
      amenities: ['Alpine Mountain Views', '5500m² Nescens Spa', 'Heated Pool', 'Fine Dining']
    },
    {
      id: 'i-std',
      name: 'Hotel Interlaken',
      stars: 4,
      tier: 'standard',
      pricePerNight: 4800,
      location: 'Near Interlaken Ost Train Station',
      rating: 4.6,
      reviewsCount: 1620,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500',
      amenities: ['Swiss Historic Hotel', 'Garden Restaurant', 'Free Transit Pass', 'Mountain Gear Storage']
    },
    {
      id: 'i-bud',
      name: 'Balmers Swiss Chalet Lodge',
      stars: 3,
      tier: 'budget',
      pricePerNight: 2400,
      location: 'Matten bei Interlaken, Switzerland',
      rating: 4.4,
      reviewsCount: 2150,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
      amenities: ['Traditional Chalet', 'Outdoor Hot Tub', 'Alpine Lounge', 'Adventure Booking Desk']
    }
  ],
  rome: [
    {
      id: 'r-lux',
      name: 'Hotel de Russie',
      stars: 5,
      tier: 'luxury',
      pricePerNight: 10500,
      location: 'Via del Babuino, Piazza del Popolo, Rome',
      rating: 4.9,
      reviewsCount: 1120,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
      amenities: ['Secret Garden Bar', 'De Russie Spa', 'Valet & Concierge', 'Historic Luxury']
    },
    {
      id: 'r-std',
      name: 'The Hoxton Rome',
      stars: 4,
      tier: 'standard',
      pricePerNight: 4300,
      location: 'Salario, Near Villa Borghese, Rome',
      rating: 4.7,
      reviewsCount: 1980,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
      amenities: ['Mid-century Design', 'Artisanal Cafe & Bar', 'Complimentary Bikes', 'Terrace Restaurant']
    },
    {
      id: 'r-bud',
      name: 'YellowSquare Rome Boutique Social',
      stars: 3,
      tier: 'budget',
      pricePerNight: 2100,
      location: 'Termini Central Hub, Rome',
      rating: 4.5,
      reviewsCount: 3100,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
      amenities: ['En-suite Privates', 'Co-working & Lounge', 'Italian Cooking Classes', 'Rooftop Events']
    }
  ]
};

// Fallback hotels for other destinations
const DEFAULT_HOTELS: HotelOption[] = [
  {
    id: 'def-lux',
    name: 'Grand Signature Luxury Resort & Spa',
    stars: 5,
    tier: 'luxury',
    pricePerNight: 9000,
    location: 'Prime City Centre Waterfront',
    rating: 4.9,
    reviewsCount: 1200,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
    amenities: ['Panoramic Views', 'Executive Lounge', 'Spa & Heated Pool', 'Complimentary Breakfast']
  },
  {
    id: 'def-std',
    name: 'Novotel Boutique & Suites',
    stars: 4,
    tier: 'standard',
    pricePerNight: 3800,
    location: 'Central Downtown District',
    rating: 4.6,
    reviewsCount: 2200,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
    amenities: ['Queen Suite', 'Fitness Centre', 'High-Speed Wi-Fi', 'Transit Connected']
  },
  {
    id: 'def-bud',
    name: 'The Social Hub Lifestyle Hotel',
    stars: 3,
    tier: 'budget',
    pricePerNight: 2000,
    location: 'Arts & Cultural District',
    rating: 4.4,
    reviewsCount: 1750,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
    amenities: ['Boutique Rooms', 'Shared Kitchen & Bar', 'Co-working Space', 'City Bikes']
  }
];

// --- Curated Database of Transportation Options ---
interface TransportOption {
  id: string;
  name: string;
  type: 'train' | 'flight' | 'metro' | 'bus' | 'cab';
  mediumName: string;
  cost: number;
  duration: string;
  route: string;
  icon: any;
  tier: 'luxury' | 'standard' | 'budget';
}

const CITY_TRANSPORT: Record<string, TransportOption[]> = {
  paris: [
    {
      id: 't-tgv',
      name: 'SNCF TGV INOUI High-Speed Rail',
      type: 'train',
      mediumName: 'High-Speed Bullet Train',
      cost: 3800,
      duration: '3 hrs 15 mins',
      route: 'Paris Gare de Lyon ⇄ Switzerland / Regional Hub',
      icon: Train,
      tier: 'standard'
    },
    {
      id: 't-metro',
      name: 'Paris Visite Unlimited 3-Day Transit Pass',
      type: 'metro',
      mediumName: 'Subway & RER Metro Network',
      cost: 2100,
      duration: '3 Full Days Unlimited',
      route: 'All Paris Metro, RER, Trams & Bus Zones 1-3',
      icon: Bus,
      tier: 'budget'
    },
    {
      id: 't-rer',
      name: 'RER B Express Airport Transfer + Private Shuttle',
      type: 'cab',
      mediumName: 'Airport Rail & Private Car',
      cost: 4500,
      duration: '35 mins direct',
      route: 'Charles de Gaulle (CDG) ⇄ Central Paris',
      icon: Car,
      tier: 'luxury'
    }
  ],
  interlaken: [
    {
      id: 't-swiss',
      name: 'Swiss Travel Pass 3-Day (All-Inclusive)',
      type: 'train',
      mediumName: 'National Rail, Boats & Alpine Buses',
      cost: 5800,
      duration: '3 Days Unlimited',
      route: 'Jungfrau Region, Scenic Alpine Lakes & Rail',
      icon: Train,
      tier: 'standard'
    },
    {
      id: 't-lake',
      name: 'Lake Thun & Brienz Scenic Transit Ferry',
      type: 'bus',
      mediumName: 'Alpine Lake Passenger Boat',
      cost: 1600,
      duration: '2 hrs cruise',
      route: 'Interlaken West ⇄ Thun Castle Quay',
      icon: Bus,
      tier: 'budget'
    },
    {
      id: 't-heli',
      name: 'Scenic Glacier Mountain Shuttle & Taxi',
      type: 'cab',
      mediumName: 'Private Mountain Van Transfer',
      cost: 6500,
      duration: '45 mins',
      route: 'Interlaken ⇄ Grindelwald & Lauterbrunnen',
      icon: Car,
      tier: 'luxury'
    }
  ],
  rome: [
    {
      id: 't-freccia',
      name: 'Frecciarossa 1000 High-Speed Express',
      type: 'train',
      mediumName: 'Italian High-Speed Rail',
      cost: 3200,
      duration: '1 hr 35 mins',
      route: 'Roma Termini ⇄ Florence / Venice',
      icon: Train,
      tier: 'standard'
    },
    {
      id: 't-roma',
      name: 'Roma Pass 72-Hour Transit & Museum Pass',
      type: 'metro',
      mediumName: 'ATAC Metro, Tram & Bus Network',
      cost: 1900,
      duration: '72 Hours Unlimited',
      route: 'All Rome Metro Lines A & B + Urban Buses',
      icon: Bus,
      tier: 'budget'
    },
    {
      id: 't-leonardo',
      name: 'Leonardo Express Airport Direct + NCC Chauffeur',
      type: 'cab',
      mediumName: 'Airport Train + Chauffeur Car',
      cost: 4200,
      duration: '32 mins direct',
      route: 'Fiumicino (FCO) ⇄ Historic Center',
      icon: Car,
      tier: 'luxury'
    }
  ]
};

const DEFAULT_TRANSPORT: TransportOption[] = [
  {
    id: 'def-train',
    name: 'Intercity High-Speed Express Transit',
    type: 'train',
    mediumName: 'Express Rail Connection',
    cost: 3500,
    duration: '2–3 hours',
    route: 'Regional Hub ⇄ Destination Center',
    icon: Train,
    tier: 'standard'
  },
  {
    id: 'def-metro',
    name: 'City Multi-Day Unlimited Metro & Bus Pass',
    type: 'metro',
    mediumName: 'Public Transit Pass',
    cost: 1800,
    duration: 'Unlimited Multi-Day',
    route: 'All Downtown Metro & Bus Routes',
    icon: Bus,
    tier: 'budget'
  },
  {
    id: 'def-cab',
    name: 'Private Airport & City Chauffeur Cabs',
    type: 'cab',
    mediumName: 'On-Demand Cabs & Transfers',
    cost: 4200,
    duration: 'Door-to-door direct',
    route: 'Airport ⇄ Hotel ⇄ Major Sights',
    icon: Car,
    tier: 'luxury'
  }
];

const PIE_COLORS = {
  Stay: '#173B2B',       // Luxury Emerald
  Transport: '#2563EB',  // Royal Blue
  Activities: '#10B981', // Mint / Emerald
  Meals: '#D97706',      // Warm Amber
};

const CATEGORY_ICONS: Record<string, any> = {
  Stay: Hotel,
  Transport: Plane,
  Activities: Compass,
  Meals: Utensils,
};

const parseDate = (str?: string) => {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const resolveCityKey = (cityName?: string) => {
  if (!cityName) return 'default';
  const c = cityName.toLowerCase();
  if (c.includes('paris')) return 'paris';
  if (c.includes('interlaken') || c.includes('swiss')) return 'interlaken';
  if (c.includes('rome') || c.includes('roma')) return 'rome';
  return 'default';
};

export default function BudgetView() {
  const { currentTrip, trips } = useTrip();
  const { shareTrip, isTripShared } = useCommunity();
  const navigate = useNavigate();

  const activeTrip = currentTrip || trips[0];
  const alreadyShared = activeTrip ? isTripShared(activeTrip.id) : false;

  // Active Section Tab Selection: 'all' or section ID
  const [activeSectionTab, setActiveSectionTab] = useState<string>('all');
  const [aiTier, setAiTier] = useState<'balanced' | 'budget' | 'luxury'>('balanced');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [aiOptimizedNotice, setAiOptimizedNotice] = useState<string | null>(null);

  // Selected hotel / transport overrides per section
  const [sectionHotelOverrides, setSectionHotelOverrides] = useState<Record<string, string>>({});
  const [sectionTransportOverrides, setSectionTransportOverrides] = useState<Record<string, string>>({});

  // --- Total Days & Day List ---
  const { totalDays, dayList } = useMemo(() => {
    if (!activeTrip || !activeTrip.startDate || !activeTrip.endDate) {
      return { totalDays: 3, dayList: ['Day 1', 'Day 2', 'Day 3'] };
    }
    const start = parseDate(activeTrip.startDate);
    const end = parseDate(activeTrip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 1);

    const list = Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    return { totalDays: days, dayList: list };
  }, [activeTrip]);

  // --- Total Set Budget ---
  const totalBudget = useMemo(() => {
    if (!activeTrip) return 95000;
    if (activeTrip.totalBudget && Number(activeTrip.totalBudget) > 0) {
      return Number(activeTrip.totalBudget);
    }
    const sectionBudget = activeTrip.sections.reduce((sum, s) => sum + Number(s.budget || 0), 0);
    return sectionBudget > 0 ? sectionBudget : 95000;
  }, [activeTrip]);

  // --- Compute Per-Section Budget Breakdown & AI Recommendations ---
  const sectionsData = useMemo(() => {
    if (!activeTrip || activeTrip.sections.length === 0) {
      // Fallback virtual section
      const cityKey = resolveCityKey(activeTrip?.destination);
      const hotels = cityKey in CITY_HOTELS ? CITY_HOTELS[cityKey] : DEFAULT_HOTELS;
      const trans = cityKey in CITY_TRANSPORT ? CITY_TRANSPORT[cityKey] : DEFAULT_TRANSPORT;
      const defHotel = hotels.find((h) => h.tier === (aiTier === 'luxury' ? 'luxury' : aiTier === 'budget' ? 'budget' : 'standard')) || hotels[1];
      const defTrans = trans.find((t) => t.tier === (aiTier === 'luxury' ? 'luxury' : aiTier === 'budget' ? 'budget' : 'standard')) || trans[0];

      return [
        {
          id: 'default-sec',
          city: activeTrip?.destination || 'Destination',
          startDate: activeTrip?.startDate || '2026-06-01',
          endDate: activeTrip?.endDate || '2026-06-03',
          daysCount: totalDays,
          nightsCount: Math.max(totalDays - 1, 1),
          sectionBudget: totalBudget,
          activitiesCost: 0,
          mealsCost: Math.round(totalBudget * 0.15),
          stayCost: defHotel.pricePerNight * Math.max(totalDays - 1, 1),
          transportCost: defTrans.cost,
          selectedHotel: defHotel,
          selectedTransport: defTrans,
          availableHotels: hotels,
          availableTransport: trans,
          remainingAfterActivitiesAndMeals: totalBudget - Math.round(totalBudget * 0.15),
          netSectionRemaining: totalBudget - Math.round(totalBudget * 0.15) - (defHotel.pricePerNight * Math.max(totalDays - 1, 1)) - defTrans.cost,
          activitiesList: [],
        }
      ];
    }

    return activeTrip.sections.map((section) => {
      const cityKey = resolveCityKey(section.city);
      const hotels = cityKey in CITY_HOTELS ? CITY_HOTELS[cityKey] : DEFAULT_HOTELS;
      const trans = cityKey in CITY_TRANSPORT ? CITY_TRANSPORT[cityKey] : DEFAULT_TRANSPORT;

      // Calculate section duration
      const sStart = parseDate(section.startDate);
      const sEnd = parseDate(section.endDate);
      const sDiff = Math.abs(sEnd.getTime() - sStart.getTime());
      const sDays = Math.max(Math.ceil(sDiff / (1000 * 60 * 60 * 24)) + 1, 1);
      const sNights = Math.max(sDays - 1, 1);

      // Section budget
      const secBudget = Number(section.budget) > 0 ? Number(section.budget) : Math.round(totalBudget / activeTrip.sections.length);

      // Activities & food inside this section
      const secActs = section.activities || [];
      const actCost = secActs
        .filter((a) => a.category?.toLowerCase() !== 'food' && a.category?.toLowerCase() !== 'transport')
        .reduce((sum, a) => sum + Number(a.cost || 0), 0);

      const foodActCost = secActs
        .filter((a) => a.category?.toLowerCase() === 'food')
        .reduce((sum, a) => sum + Number(a.cost || 0), 0);

      const defaultDailyMeal = aiTier === 'luxury' ? 2500 : aiTier === 'budget' ? 1000 : 1600;
      const mealsCost = Math.max(foodActCost, defaultDailyMeal * sDays);

      // Selected hotel for this section
      const customHotelId = sectionHotelOverrides[section.id];
      const selectedHotel = (customHotelId ? hotels.find((h) => h.id === customHotelId) : null) ||
        hotels.find((h) => h.tier === (aiTier === 'luxury' ? 'luxury' : aiTier === 'budget' ? 'budget' : 'standard')) ||
        hotels[1] || hotels[0];

      // Selected transport for this section
      const customTransId = sectionTransportOverrides[section.id];
      const selectedTransport = (customTransId ? trans.find((t) => t.id === customTransId) : null) ||
        trans.find((t) => t.tier === (aiTier === 'luxury' ? 'luxury' : aiTier === 'budget' ? 'budget' : 'standard')) ||
        trans[0];

      const stayCost = selectedHotel.pricePerNight * sNights;
      const transportCost = selectedTransport.cost;

      const remainingAfterActivitiesAndMeals = secBudget - actCost - mealsCost;
      const netSectionRemaining = remainingAfterActivitiesAndMeals - stayCost - transportCost;

      return {
        id: section.id,
        city: section.city,
        startDate: section.startDate,
        endDate: section.endDate,
        daysCount: sDays,
        nightsCount: sNights,
        sectionBudget: secBudget,
        activitiesCost: actCost,
        mealsCost,
        stayCost,
        transportCost,
        selectedHotel,
        selectedTransport,
        availableHotels: hotels,
        availableTransport: trans,
        remainingAfterActivitiesAndMeals,
        netSectionRemaining,
        activitiesList: secActs,
      };
    });
  }, [activeTrip, totalBudget, totalDays, aiTier, sectionHotelOverrides, sectionTransportOverrides]);

  // --- Aggregate Grand Total Across All Sections ---
  const grandTotalActivities = sectionsData.reduce((sum, s) => sum + s.activitiesCost, 0);
  const grandTotalMeals = sectionsData.reduce((sum, s) => sum + s.mealsCost, 0);
  const grandTotalStay = sectionsData.reduce((sum, s) => sum + s.stayCost, 0);
  const grandTotalTransport = sectionsData.reduce((sum, s) => sum + s.transportCost, 0);

  const grandTotalCost = grandTotalActivities + grandTotalMeals + grandTotalStay + grandTotalTransport;
  const remainingBudget = totalBudget - grandTotalCost;
  const isOverBudget = grandTotalCost > totalBudget;
  const avgCostPerDay = Math.round(grandTotalCost / totalDays);
  const targetDailyBudget = Math.round(totalBudget / totalDays);

  // Four Pillar Breakdown
  const pillars = useMemo(() => [
    {
      name: 'Stay',
      cost: grandTotalStay,
      color: PIE_COLORS.Stay,
      description: `${sectionsData.map((s) => `${s.city}: ${s.selectedHotel.name}`).join(' · ')}`,
      tip: 'Verified accommodations tailored to each destination',
    },
    {
      name: 'Transport',
      cost: grandTotalTransport,
      color: PIE_COLORS.Transport,
      description: `${sectionsData.map((s) => `${s.city}: ${s.selectedTransport.mediumName}`).join(' · ')}`,
      tip: 'High-speed trains, regional passes & airport connections',
    },
    {
      name: 'Activities',
      cost: grandTotalActivities,
      color: PIE_COLORS.Activities,
      description: `${sectionsData.reduce((sum, s) => sum + s.activitiesList.length, 0)} planned attractions`,
      tip: 'Sightseeing, museums, tours & tickets',
    },
    {
      name: 'Meals',
      cost: grandTotalMeals,
      color: PIE_COLORS.Meals,
      description: `₹${Math.round(grandTotalMeals / totalDays).toLocaleString()}/day across all sections`,
      tip: 'Daily local cuisine, bakeries & dining allowance',
    },
  ], [grandTotalStay, grandTotalTransport, grandTotalActivities, grandTotalMeals, sectionsData, totalDays]);

  // --- AI Smart Auto-Rebalance Solver ---
  const handleApplyAiRebalance = () => {
    setAiTier('budget');
    // Set all section overrides to budget tier
    const newHotelOverrides: Record<string, string> = {};
    const newTransOverrides: Record<string, string> = {};
    sectionsData.forEach((sec) => {
      const budHotel = sec.availableHotels.find((h) => h.tier === 'budget');
      const budTrans = sec.availableTransport.find((t) => t.tier === 'budget');
      if (budHotel) newHotelOverrides[sec.id] = budHotel.id;
      if (budTrans) newTransOverrides[sec.id] = budTrans.id;
    });
    setSectionHotelOverrides(newHotelOverrides);
    setSectionTransportOverrides(newTransOverrides);
    setAiOptimizedNotice('AI rebalanced all city stays & transportation. Your entire trip is now comfortably within budget!');
  };

  // --- Daily Timeline Breakdown for Alerts ---
  const allTripActivities = useMemo(() => {
    if (!activeTrip) return [];
    return activeTrip.sections.flatMap((s) => s.activities || []);
  }, [activeTrip]);

  const dailyBreakdown = useMemo(() => {
    const dailyStay = Math.round(grandTotalStay / totalDays);
    const dailyTransport = Math.round(grandTotalTransport / totalDays);
    const dailyMeal = Math.round(grandTotalMeals / totalDays);

    return dayList.map((dateStr, idx) => {
      const dayActivities = allTripActivities.filter((a) => a.date === dateStr);
      const dayActivityCost = dayActivities.reduce((sum, a) => sum + Number(a.cost || 0), 0);

      const dayTotal = dayActivityCost + dailyStay + dailyTransport + dailyMeal;
      const isDayOver = dayTotal > targetDailyBudget * 1.12;
      const overBy = dayTotal - targetDailyBudget;

      return {
        dayNumber: idx + 1,
        date: dateStr,
        dayTotal,
        dayActivityCost,
        dailyStay,
        dailyTransport,
        dailyMeal,
        activitiesCount: dayActivities.length,
        activitiesList: dayActivities.map((a) => a.name),
        isDayOver,
        overBy,
      };
    });
  }, [dayList, allTripActivities, grandTotalStay, grandTotalTransport, grandTotalMeals, targetDailyBudget, totalDays]);

  const overbudgetDays = dailyBreakdown.filter((d) => d.isDayOver);

  // --- SVG Pie / Donut Chart Geometry ---
  const pieData = useMemo(() => {
    const total = grandTotalCost || 1;
    let accumulatedAngle = 0;

    return pillars.map((pillar) => {
      const percentage = (pillar.cost / total) * 100;
      const angle = (pillar.cost / total) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      return {
        ...pillar,
        percentage,
        startAngle,
        endAngle: accumulatedAngle,
      };
    });
  }, [pillars, grandTotalCost]);

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const renderDonutSlices = () => {
    let cumulativePercent = 0;

    return pieData.map((slice) => {
      const slicePercent = slice.cost / (grandTotalCost || 1);
      const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
      cumulativePercent += slicePercent;
      const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

      const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
      const isHovered = hoveredSlice === slice.name;

      const pathData = [
        `M ${startX * 100} ${startY * 100}`,
        `A 100 100 0 ${largeArcFlag} 1 ${endX * 100} ${endY * 100}`,
        `L ${endX * 62} ${endY * 62}`,
        `A 62 62 0 ${largeArcFlag} 0 ${startX * 62} ${startY * 62}`,
        'Z',
      ].join(' ');

      return (
        <path
          key={slice.name}
          d={pathData}
          fill={slice.color}
          className="transition-all duration-300 cursor-pointer hover:opacity-90"
          style={{
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            transformOrigin: 'center',
            filter: isHovered ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' : 'none',
          }}
          onMouseEnter={() => setHoveredSlice(slice.name)}
          onMouseLeave={() => setHoveredSlice(null)}
        />
      );
    });
  };

  const handleShareToCommunity = () => {
    if (!activeTrip) return;
    const entry = shareTrip(activeTrip);
    navigate(`/community?highlight=${entry.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#17251D] font-body pb-24">
      <Header />

      <main className="px-4 md:px-8 pb-24 max-w-6xl mx-auto mt-8">
        {/* ── Top Navigation Bar ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/view-itinerary')}
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#D8D1C3] text-gray-500 hover:text-[#173B2B] hover:border-[#173B2B] transition-colors shrink-0"
              title="Back to Itinerary"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-semibold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                  Trip Budget & Cost Breakdown
                </h1>
                <span className="bg-[#173B2B]/10 text-[#173B2B] text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={12} className="text-[#A88A4A]" /> AI Section Planner
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {activeTrip.name} · {totalDays} Day Journey · {sectionsData.length} City Section{sectionsData.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Quick AI Presets */}
          <div className="bg-white/80 border border-[#D8D1C3] p-1.5 rounded-2xl flex items-center gap-1 shadow-sm self-start md:self-auto">
            <span className="text-[11px] font-semibold text-gray-500 px-2.5 uppercase tracking-wider">AI Tier:</span>
            {(['budget', 'balanced', 'luxury'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => {
                  setAiTier(tier);
                  setSectionHotelOverrides({});
                  setSectionTransportOverrides({});
                  setAiOptimizedNotice(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  aiTier === tier && Object.keys(sectionHotelOverrides).length === 0
                    ? 'bg-[#173B2B] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* ── AI Optimization Toast Notice ── */}
        {aiOptimizedNotice && (
          <div className="bg-emerald-100/90 border border-emerald-300 text-emerald-900 rounded-2xl p-4 mb-6 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>{aiOptimizedNotice}</span>
            </div>
            <button onClick={() => setAiOptimizedNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
          </div>
        )}

        {/* ── Status Banner (Over budget / Healthy) ── */}
        {isOverBudget ? (
          <div className="bg-red-50/95 border border-red-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-red-800 text-lg leading-tight">
                    Estimated Trip Cost Exceeds Budget by ₹{Math.abs(remainingBudget).toLocaleString()}
                  </h3>
                  <span className="bg-red-200/80 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Alert
                  </span>
                </div>
                <p className="text-red-700 text-xs mt-1 font-medium max-w-xl">
                  Your estimated total of <strong>₹{grandTotalCost.toLocaleString()}</strong> exceeds your total trip budget of <strong>₹{totalBudget.toLocaleString()}</strong>. Our AI can rebalance stays & transit across your city sections to bring you within budget.
                </p>
              </div>
            </div>
            <button
              onClick={handleApplyAiRebalance}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-3 rounded-xl uppercase tracking-wider transition shadow-md flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center"
            >
              <Wand2 size={15} /> Apply AI Smart Auto-Adjustment
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-6 mb-8 flex items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-lg leading-tight">
                  Budget Plan is Healthy & Optimized
                </h3>
                <p className="text-emerald-700 text-xs mt-0.5 font-medium">
                  ₹{remainingBudget.toLocaleString()} cushion remaining from your ₹{totalBudget.toLocaleString()} budget across all {sectionsData.length} destinations.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Avg. Daily Spend</span>
              <p className="text-lg font-bold text-emerald-900">₹{avgCostPerDay.toLocaleString()}/day</p>
            </div>
          </div>
        )}

        {/* ── 4 Pillar Summary Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pillars.map((pillar) => {
            const Icon = CATEGORY_ICONS[pillar.name] || Wallet;
            const pct = Math.round((pillar.cost / (grandTotalCost || 1)) * 100);

            return (
              <div
                key={pillar.name}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-[#D8D1C3] shadow-[0_10px_30px_rgba(23,59,43,0.04)] hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}>
                      {pct}%
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{pillar.name}</span>
                  <div className="text-2xl font-bold text-[#17251D] mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>
                    ₹{pillar.cost.toLocaleString()}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-3 border-t border-gray-100 pt-2 truncate" title={pillar.description}>
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Interactive Donut Pie Chart & Daily Analysis ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Left: Donut Pie Chart (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-[#D8D1C3] shadow-sm flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between mb-2 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-xl font-semibold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                  Budget Distribution
                </h2>
                <p className="text-xs text-gray-400">Hover slices to inspect pillars</p>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                4 Core Pillars
              </span>
            </div>

            {/* Donut Chart SVG */}
            <div className="relative w-56 h-56 my-4 flex items-center justify-center">
              <svg viewBox="-115 -115 230 230" className="w-full h-full transform -rotate-90">
                {renderDonutSlices()}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  {hoveredSlice ? hoveredSlice : 'Est. Total'}
                </span>
                <span className="text-xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                  ₹{(hoveredSlice ? pillars.find((p) => p.name === hoveredSlice)?.cost : grandTotalCost)?.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#A88A4A] font-semibold">
                  {hoveredSlice
                    ? `${Math.round(((pillars.find((p) => p.name === hoveredSlice)?.cost || 0) / (grandTotalCost || 1)) * 100)}% of total`
                    : `${totalDays} Days Journey`}
                </span>
              </div>
            </div>

            {/* Interactive Legend List */}
            <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-gray-100">
              {pillars.map((pillar) => {
                const isHovered = hoveredSlice === pillar.name;
                const pct = Math.round((pillar.cost / (grandTotalCost || 1)) * 100);

                return (
                  <div
                    key={pillar.name}
                    onMouseEnter={() => setHoveredSlice(pillar.name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                      isHovered ? 'bg-gray-100/90' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: pillar.color }} />
                      <span className="text-xs font-semibold text-gray-700 truncate">{pillar.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Daily Average Metrics & Overbudget Days (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#D8D1C3] shadow-sm">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Target Daily Budget</span>
                <span className="text-2xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                  ₹{targetDailyBudget.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Based on ₹{totalBudget.toLocaleString()}</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#D8D1C3] shadow-sm">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Avg. Daily Spend</span>
                <span className={`text-2xl font-bold ${avgCostPerDay > targetDailyBudget ? 'text-red-600' : 'text-[#173B2B]'}`} style={{ fontFamily: 'Georgia, serif' }}>
                  ₹{avgCostPerDay.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Across all 4 pillars</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#D8D1C3] shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Overbudget Days</span>
                <span className={`text-2xl font-bold ${overbudgetDays.length > 0 ? 'text-amber-600' : 'text-emerald-700'}`} style={{ fontFamily: 'Georgia, serif' }}>
                  {overbudgetDays.length} / {totalDays}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">{overbudgetDays.length > 0 ? 'Exceeds daily target' : 'All days within limit'}</span>
              </div>
            </div>

            {/* Overbudget Day Alerts Box */}
            <div className="bg-white rounded-3xl p-6 border border-[#D8D1C3] shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className={overbudgetDays.length > 0 ? 'text-amber-600' : 'text-emerald-600'} />
                  <h3 className="font-semibold text-sm text-[#17251D]">Daily Schedule & Overbudget Alerts</h3>
                </div>
                <span className="text-xs text-gray-400">{totalDays} Days Paced</span>
              </div>

              {overbudgetDays.length === 0 ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Every day is well-paced within your ₹{targetDailyBudget.toLocaleString()} daily budget limit.</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {overbudgetDays.map((day) => (
                    <div key={day.dayNumber} className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-amber-950">
                          <span>Day {day.dayNumber} ({day.date})</span>
                          <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.2 rounded-full font-bold">
                            +₹{day.overBy.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-amber-800 text-[11px] mt-0.5 truncate max-w-sm">
                          {day.activitiesList.length > 0 ? `Activities: ${day.activitiesList.join(', ')}` : 'Base daily stay & transit'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-gray-900 block text-sm">₹{day.dayTotal.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400">Limit: ₹{targetDailyBudget.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CITY-BY-CITY SECTION BREAKDOWN & AI RECOMMENDATIONS ── */}
        <section className="space-y-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D1C3] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="text-[#173B2B]" size={24} />
                <h2 className="text-2xl md:text-3xl font-semibold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                  City-by-City Budget & Recommendations
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Specific remaining budget calculations, recommended stays, and transportation routes for each destination stop
              </p>
            </div>

            {/* City Section Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-white/80 p-1.5 rounded-2xl border border-[#D8D1C3] shadow-sm">
              <button
                onClick={() => setActiveSectionTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  activeSectionTab === 'all'
                    ? 'bg-[#173B2B] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Cities ({sectionsData.length})
              </button>
              {sectionsData.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionTab(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    activeSectionTab === sec.id
                      ? 'bg-[#173B2B] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📍 {sec.city}
                </button>
              ))}
            </div>
          </div>

          {/* Section Cards List */}
          {sectionsData
            .filter((sec) => activeSectionTab === 'all' || activeSectionTab === sec.id)
            .map((sec) => {
              const isSecOver = sec.netSectionRemaining < 0;

              return (
                <div
                  key={sec.id}
                  className="bg-white rounded-3xl p-6 md:p-8 border border-[#D8D1C3] shadow-sm space-y-6"
                >
                  {/* City Section Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                          📍 {sec.city} Stop
                        </h3>
                        <span className="bg-[#FAF8F5] border border-[#E8E2D5] text-[#173B2B] text-xs font-semibold px-3 py-1 rounded-xl">
                          {sec.startDate} – {sec.endDate} ({sec.daysCount} Days, {sec.nightsCount} Nights)
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Allocated City Budget: <strong className="text-gray-800">₹{sec.sectionBudget.toLocaleString()}</strong>
                      </p>
                    </div>

                    {/* Section Net Balance Badge */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Remaining City Cushion</span>
                        <span className={`text-xl font-bold ${isSecOver ? 'text-red-600' : 'text-emerald-700'}`}>
                          {isSecOver ? '-' : ''}₹{Math.abs(sec.netSectionRemaining).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSecOver ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isSecOver ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Section Financial Equation Strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">🎯 Activities Cost:</span>
                      <strong className="text-gray-800 text-sm">₹{sec.activitiesCost.toLocaleString()}</strong>
                      <span className="text-[10px] text-gray-400 block">({sec.activitiesList.length} activities)</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">🍽️ Estimated Meals:</span>
                      <strong className="text-gray-800 text-sm">₹{sec.mealsCost.toLocaleString()}</strong>
                      <span className="text-[10px] text-gray-400 block">({sec.daysCount} days dining)</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">🏨 AI Selected Stay:</span>
                      <strong className="text-[#173B2B] text-sm">₹{sec.stayCost.toLocaleString()}</strong>
                      <span className="text-[10px] text-gray-400 block">{sec.selectedHotel.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">🚆 AI Selected Transit:</span>
                      <strong className="text-[#2563EB] text-sm">₹{sec.transportCost.toLocaleString()}</strong>
                      <span className="text-[10px] text-gray-400 block">{sec.selectedTransport.mediumName}</span>
                    </div>
                  </div>

                  {/* ── Stays Recommended Specifically for THIS City ── */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Hotel className="text-[#173B2B]" size={18} />
                        <h4 className="font-semibold text-base text-[#17251D]">
                          Recommended Stays in {sec.city} (From remaining budget)
                        </h4>
                      </div>
                      <span className="text-xs text-gray-400">Selected: <strong>{sec.selectedHotel.name}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {sec.availableHotels.map((hotel) => {
                        const isSelected = sec.selectedHotel.id === hotel.id;
                        const totalHotelCost = hotel.pricePerNight * sec.nightsCount;

                        return (
                          <div
                            key={hotel.id}
                            onClick={() => {
                              setSectionHotelOverrides((prev) => ({ ...prev, [sec.id]: hotel.id }));
                            }}
                            className={`rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#FAF8F5] border-[#173B2B] shadow-md ring-2 ring-[#173B2B]/20'
                                : 'bg-white border-[#E8E2D5] hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <div className="h-28 rounded-xl overflow-hidden mb-3 relative bg-gray-100">
                                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 text-[#173B2B] shadow-sm">
                                  <Star size={10} className="text-amber-500 fill-amber-500" /> {hotel.rating}
                                </div>
                                <div className="absolute bottom-2 left-2 bg-[#173B2B]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                  {hotel.tier} · {hotel.stars}★
                                </div>
                              </div>

                              <h5 className="font-semibold text-sm text-[#17251D] leading-snug">{hotel.name}</h5>
                              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin size={10} className="text-[#A88A4A]" /> {hotel.location}
                              </p>

                              <div className="flex flex-wrap gap-1 mt-2">
                                {hotel.amenities.slice(0, 2).map((am, i) => (
                                  <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                    {am}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-gray-400">₹{hotel.pricePerNight.toLocaleString()}/night</span>
                                <p className="text-xs font-bold text-[#173B2B]">₹{totalHotelCost.toLocaleString()} ({sec.nightsCount}N)</p>
                              </div>
                              <button
                                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition ${
                                  isSelected
                                    ? 'bg-[#173B2B] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Transportation Recommended Specifically for THIS City ── */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Plane className="text-[#2563EB]" size={18} />
                        <h4 className="font-semibold text-base text-[#17251D]">
                          Recommended Transportation in {sec.city}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-400">Selected: <strong>{sec.selectedTransport.name}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {sec.availableTransport.map((trans) => {
                        const isSelected = sec.selectedTransport.id === trans.id;
                        const Icon = trans.icon || Train;

                        return (
                          <div
                            key={trans.id}
                            onClick={() => {
                              setSectionTransportOverrides((prev) => ({ ...prev, [sec.id]: trans.id }));
                            }}
                            className={`rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/50 border-[#2563EB] shadow-md ring-2 ring-blue-500/20'
                                : 'bg-white border-[#E8E2D5] hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                                  <Icon size={16} />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                  {trans.tier}
                                </span>
                              </div>

                              <h5 className="font-semibold text-sm text-[#17251D] leading-snug">{trans.name}</h5>
                              <p className="text-[11px] font-semibold text-[#2563EB] mt-0.5">{trans.mediumName}</p>
                              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                {trans.route} · {trans.duration}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-gray-400">Transit Cost</span>
                                <p className="text-xs font-bold text-[#2563EB]">₹{trans.cost.toLocaleString()}</p>
                              </div>
                              <button
                                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition ${
                                  isSelected
                                    ? 'bg-[#2563EB] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
        </section>

        {/* ── Share to Community CTA ── */}
        <div className="bg-gradient-to-br from-[#173B2B]/10 via-[#FAF8F5] to-emerald-50/50 border border-[#D8D1C3] rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-2xl font-bold text-[#173B2B] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              {alreadyShared ? 'Itinerary & Budget Plan is Live in Community!' : 'Publish Itinerary & Budget Plan'}
            </h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed max-w-md">
              {alreadyShared
                ? 'Your trip, stays, and budget breakdown are published for globetrotters worldwide.'
                : 'Share your curated budget distribution, hotel choices, transit routes, and activity pacing with fellow explorers with one click.'}
            </p>
          </div>
          <button
            onClick={alreadyShared ? () => navigate('/community') : handleShareToCommunity}
            className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 ${
              alreadyShared
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-[#173B2B] hover:bg-[#102E21] text-white hover:scale-105'
            }`}
          >
            {alreadyShared ? (
              <><CheckCircle2 size={16} /> View in Community</>
            ) : (
              <><Share2 size={16} /> Share Itinerary</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

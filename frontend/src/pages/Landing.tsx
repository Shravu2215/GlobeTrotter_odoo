import { Search, Filter, ArrowDownWideNarrow, Plus, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Landing = () => {
  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      {/* Header */}
      <Header />

      <main className="px-8 pb-24 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative rounded-[2rem] overflow-hidden h-[400px] mb-8">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-center px-12">
            <h1 className="font-display text-5xl md:text-7xl text-white font-semibold mb-4 leading-tight drop-shadow-md">
              Explore<br />the <span className="text-roamora-gold">World</span>
            </h1>
          </div>
        </section>

        {/* Search & Filters Bar */}
        <section className="bg-white rounded-full shadow-lg p-3 flex items-center gap-4 w-full max-w-[90%] mx-auto -mt-[4.5rem] relative z-10 border border-roamora-border">
          <div className="flex-1 flex items-center pl-6">
            <Search className="text-gray-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Search destinations..." 
              className="w-full bg-transparent outline-none text-roamora-text placeholder:text-gray-400 font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3 pr-2 border-l border-gray-200 pl-4">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-gray-50 text-sm font-medium transition-colors text-roamora-text border border-transparent hover:border-gray-200">
              Group by <ArrowDownWideNarrow size={16} />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-gray-50 text-sm font-medium transition-colors text-roamora-text border border-transparent hover:border-gray-200">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-gray-50 text-sm font-medium transition-colors text-roamora-text border border-transparent hover:border-gray-200">
              Sort by <ArrowDownWideNarrow size={16} />
            </button>
          </div>
        </section>

        {/* Top Regional Selections (Square Cards) */}
        <section className="mt-20">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-2">
            <h2 className="font-display text-3xl font-semibold text-roamora-green">Top Regional Selections</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Santorini", subtitle: "White-washed beauty", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", rating: "4.8" },
              { title: "Bali", subtitle: "Tropical paradise", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", rating: "4.7" },
              { title: "Swiss Alps", subtitle: "Scenic landscapes", image: "https://images.unsplash.com/photo-1531366936310-c73c8a43f8e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", rating: "4.9" },
              { title: "Maldives", subtitle: "Crystal-clear waters", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", rating: "4.8" }
            ].map((item, idx) => (
              <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer shadow-md">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm w-max px-2.5 py-1 rounded-full text-white text-xs font-medium mb-3">
                    <MapPin size={12} /> {item.title}
                  </div>
                  <h3 className="text-white font-display text-xl font-medium drop-shadow-md">{item.title}</h3>
                  <p className="text-white/90 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md">{item.subtitle}</p>
                  <div className="flex items-center gap-1 text-white text-sm font-medium mt-2">
                    <Star size={14} className="text-roamora-gold fill-roamora-gold" /> {item.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Previous Trips (Vertical Cards) */}
        <section className="mt-20">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-2">
            <h2 className="font-display text-3xl font-semibold text-roamora-green">Previous Trips</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Paris, France", date: "Oct 2024", rating: "4.9", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
              { title: "Kyoto, Japan", date: "Apr 2024", rating: "4.8", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
              { title: "Rome, Italy", date: "Sep 2023", rating: "4.7", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-64 overflow-hidden relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-semibold shadow-sm">
                    <Star size={14} className="text-roamora-gold fill-roamora-gold" />
                    {item.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-roamora-green mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm font-medium">Travelled on {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FAB - Plan a trip */}
      <Link to="/create-trip" className="fixed bottom-8 right-8 bg-roamora-green hover:bg-roamora-greenHover text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(26,58,50,0.4)] flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(26,58,50,0.5)] font-medium z-50">
        <Plus size={20} strokeWidth={2.5} />
        Plan a trip
      </Link>
    </div>
  );
};

export default Landing;

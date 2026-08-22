import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-8 py-6">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-display text-2xl font-semibold text-roamora-green">GlobalTrotter</span>
      </Link>
      <div>
        <button className="w-10 h-10 rounded-full bg-white border border-roamora-border flex items-center justify-center text-roamora-green hover:bg-gray-50 transition-colors shadow-sm">
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;

import { useState } from 'react';
import { Search, Image, Upload, Menu, X, Shield, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    if (location.pathname === '/text-search' || location.pathname === '/') return 'text';
    if (location.pathname === '/image-search') return 'image';
    if (location.pathname === '/upload') return 'upload';
    if (location.pathname === '/admin') return 'admin';
    return 'text';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: string) => {
    setIsMenuOpen(false);
    if (tab === 'text') navigate('/text-search');
    else if (tab === 'image') navigate('/image-search');
    else if (tab === 'upload') navigate('/upload');
    else if (tab === 'admin') navigate('/admin');
  };

  const NavButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-w-[110px] ${activeTab === id
          ? 'bg-brand-red-600 text-white shadow-md shadow-brand-red-100'
          : 'text-slate-600 hover:text-brand-red-600 hover:bg-brand-red-50'
        }`}
    >
      <Icon className={`w-4 h-4 mr-2 ${activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-brand-red-600'}`} />
      {label}
    </button>
  );

  const MobileNavButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-colors ${activeTab === id
          ? 'bg-brand-red-50 text-brand-red-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${activeTab === id ? 'text-brand-red-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-brand-red-600 p-2 rounded-lg mr-3 shadow-lg shadow-brand-red-100">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-red-600 to-brand-gold-500">
                VisionText AI
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <NavButton id="text" icon={Search} label="Texto" />
              <NavButton id="image" icon={Image} label="Imagen" />
              <NavButton id="upload" icon={Upload} label="Subir" />
              <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
              <NavButton id="admin" icon={Shield} label="Admin" />
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl absolute w-full shadow-xl">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <MobileNavButton id="text" icon={Search} label="Búsqueda por Texto" />
              <MobileNavButton id="image" icon={Image} label="Búsqueda por Imagen" />
              <MobileNavButton id="upload" icon={Upload} label="Subir Imágenes" />
              <div className="h-px bg-slate-100 my-2"></div>
              <MobileNavButton id="admin" icon={Shield} label="Administración" />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Sparkles className="w-4 h-4 text-brand-gold-500 mr-2" />
              <span className="text-sm font-semibold text-slate-700">VisionText AI</span>
            </div>
            <p className="text-sm text-slate-500">
              Proyecto Final Tópicos Avanzados en Machine Learning &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
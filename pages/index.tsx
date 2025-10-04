import { useState, useMemo } from 'react'; // React hooks for state and memoization.
import { SearchBar } from '../components/SearchBar'; // Component for searching icons.
import { Stats } from '../components/Stats'; // Component to display icon statistics.
import { IconCard } from '../components/IconCard'; // Component for displaying individual icon cards.
import { PreviewModal } from '../components/PreviewModal'; // Component for displaying a larger icon preview.
import { ToastContainer } from '../components/Toast'; // Component for displaying transient messages.
import { useCryptoIcons } from '../hooks/useCryptoIcons'; // Custom hook for fetching crypto icon data.
import { useToast } from '../hooks/useToast'; // Custom hook for managing toast notifications.
import { CryptoIcon } from '../types'; // Type definition for cryptocurrency icons.
import { Loader2 } from 'lucide-react'; // Icon component for loading states.

export default function HomePage() { // Main component for the cryptocurrency icon library application.
  const { icons, loading, error } = useCryptoIcons(); // Fetches and manages the list of crypto icons.
  const { toasts, addToast, removeToast } = useToast(); // Manages toast notifications for user feedback.
  const [searchQuery, setSearchQuery] = useState(''); // State for the search input value.
  const [selectedIcon, setSelectedIcon] = useState<CryptoIcon | null>(null); // Stores the icon selected for preview.
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the visibility of the preview modal.

  const filteredIcons = useMemo(() => { // Memoized list of icons based on search query.
    if (!searchQuery.trim()) return icons;
    
    const query = searchQuery.toLowerCase(); // Converts the search query to lowercase for case-insensitive matching.
    return icons.filter(icon =>
      icon.displayName.toLowerCase().includes(query) ||
      icon.name.toLowerCase().includes(query) ||
      icon.symbol?.toLowerCase().includes(query)
    );
  }, [icons, searchQuery]);

  const handleCopy = async (content: string, name: string) => { // Handles copying icon SVG to clipboard.
      await navigator.clipboard.writeText(content);
      addToast(`${name} SVG copied to clipboard!`, 'success');
  };

  const handleDownload = (icon: CryptoIcon) => { // Handles downloading the icon SVG file.
    const link = document.createElement('a');
    link.href = icon.path;
    link.download = icon.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`${icon.displayName} downloaded!`, 'success');
  };

  const handlePreview = (icon: CryptoIcon) => { // Sets the selected icon and opens the preview modal.
    setSelectedIcon(icon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { // Closes the preview modal and clears the selected icon.
    setIsModalOpen(false);
    setSelectedIcon(null);
  };

  if (loading) { // Displays a loading spinner while fetching icons.
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" /> {/* Animated loading spinner icon. */}
          <p className="text-gray-600 text-lg">Loading crypto icons...</p> {/* Informative loading message. */}
        </div>
      </div>
    );
  }

  if (error) { // Displays an error message if icon fetching fails.
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center"> {/* Styling for the error icon container. */}
            <span className="text-red-600 text-2xl">⚠️</span> {/* Warning emoji to indicate an error. */}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Icons</h2> {/* Heading for the error message. */}
          <p className="text-gray-600">{error}</p> {/* Displays the specific error message details. */}
        </div>
      </div>
    );
  }

  return ( // Main container for the application layout.
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Main content area with responsive padding and width. */}
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8"> {/* Container for the search bar. */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search crypto icons by name or symbol..."
          />
        </div>

        {/* Stats */}
        <Stats // Displays statistics about the total and filtered icons.
          totalIcons={icons.length}
          filteredIcons={filteredIcons.length}
          isFiltered={!!searchQuery.trim()}
        />

        {/* Results Info */}
        {searchQuery.trim() && ( // Conditionally renders search results information.
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredIcons.length > 0 
                ? `Found ${filteredIcons.length} icon${filteredIcons.length === 1 ? '' : 's'} matching "${searchQuery}"`
                : `No icons found matching "${searchQuery}"`
              }
            </p>
          </div>
        )}

        {/* Icons Grid */}
        {filteredIcons.length > 0 ? ( // Renders either the grid of icons or a no-results message.
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredIcons.map((icon) => (
              <IconCard // Component to display individual cryptocurrency icons.
                key={icon.name}
                icon={icon}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onPreview={handlePreview}
              />
            ))}
          </div>
        ) : searchQuery.trim() ? ( // Displays a message when no icons match the search query.
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No icons found</h3>
            <p className="text-gray-600">Try searching with different keywords or check the spelling.</p>
          </div>
        ) : null}
      </main>

      {/* Preview Modal */}
      <PreviewModal // Modal component for displaying a larger view of the selected icon.
        icon={selectedIcon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCopy={handleCopy}
        onDownload={handleDownload}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} /> {/* Container for displaying toast notifications. */}
    </div>
  );
}

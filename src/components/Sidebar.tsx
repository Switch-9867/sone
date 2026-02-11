import {
  Home,
  Compass,
  Search,
  Plus,
  Library,
  Heart,
  X,
  Loader2,
} from "lucide-react";
import { useAudioContext } from "../contexts/AudioContext";
import { getTidalImageUrl, type SearchResults } from "../hooks/useAudio";
import TidalImage from "./TidalImage";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Sidebar() {
  const {
    userPlaylists,
    navigateToPlaylist,
    navigateToFavorites,
    navigateToAlbum,
    navigateHome,
    navigateToSearch,
    searchTidal,
    playTrack,
    setQueueTracks,
    currentView,
  } = useAudioContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickResults, setQuickResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const handlePlaylistClick = (playlist: (typeof userPlaylists)[number]) => {
    navigateToPlaylist(playlist.uuid, {
      title: playlist.title,
      image: playlist.image,
      description: playlist.description,
      creatorName: playlist.creator?.name || "You",
      numberOfTracks: playlist.numberOfTracks,
    });
  };

  // Debounced quick search
  const doQuickSearch = useCallback(
    (query: string) => {
      clearTimeout(debounceRef.current);
      if (!query.trim()) {
        setQuickResults(null);
        setSearching(false);
        return;
      }
      setSearching(true);
      debounceRef.current = setTimeout(() => {
        searchTidal(query.trim(), 5)
          .then((results) => {
            setQuickResults(results);
          })
          .catch(() => {
            setQuickResults(null);
          })
          .finally(() => {
            setSearching(false);
          });
      }, 300);
    },
    [searchTidal]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchOpen(true);
    doQuickSearch(val);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchOpen(false);
      navigateToSearch(searchQuery.trim());
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
    setQuickResults(null);
    searchInputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults =
    quickResults &&
    (quickResults.tracks.length > 0 ||
      quickResults.albums.length > 0 ||
      quickResults.artists.length > 0);

  return (
    <div
      className={`sidebar h-full bg-[#0b0b0b] flex flex-col border-r border-white/[0.06] transition-[width,min-width,max-width] duration-300 ease-in-out flex-shrink-0 ${
        isCollapsed ? "w-[60px]" : "w-[240px] min-w-[200px] max-w-[300px]"
      }`}
    >
      {/* Navigation */}
      <nav className="px-2 pt-3 pb-1 space-y-0.5">
        <button
          onClick={navigateHome}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors duration-150 group ${
            currentView.type === "home"
              ? "text-white bg-white/[0.08]"
              : "text-[#b3b3b3] hover:text-white hover:bg-white/[0.06]"
          } ${isCollapsed ? "justify-center px-0" : ""}`}
          title="Home"
        >
          <Home size={20} strokeWidth={2} />
          {!isCollapsed && <span className="font-semibold text-sm">Home</span>}
        </button>
        <a
          href="#"
          className={`flex items-center gap-3 px-2.5 py-2 text-[#b3b3b3] hover:text-white hover:bg-white/[0.06] rounded-md transition-colors duration-150 group ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Explore"
        >
          <Compass size={20} strokeWidth={2} />
          {!isCollapsed && (
            <span className="font-semibold text-sm">Explore</span>
          )}
        </a>

        {/* Search input */}
        {!isCollapsed ? (
          <div className="relative">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.06] rounded-md focus-within:bg-white/[0.1] transition-colors">
              <Search size={16} className="text-[#b3b3b3] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchQuery.trim()) setSearchOpen(true);
                }}
                placeholder="Search"
                className="bg-transparent text-sm text-white placeholder-[#808080] outline-none flex-1 min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-[#808080] hover:text-white shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Inline dropdown */}
            {searchOpen && searchQuery.trim() && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] rounded-lg shadow-2xl shadow-black/60 border border-white/[0.08] z-50 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
              >
                {searching && !hasResults && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2
                      size={18}
                      className="animate-spin text-[#00FFFF]"
                    />
                  </div>
                )}

                {!searching && !hasResults && quickResults && (
                  <div className="py-6 text-center text-[13px] text-[#666]">
                    No results found
                  </div>
                )}

                {hasResults && (
                  <div className="py-1">
                    {/* Tracks */}
                    {quickResults!.tracks.map((track) => (
                      <button
                        key={`t-${track.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQueueTracks([]);
                          playTrack(track);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded bg-[#282828] overflow-hidden shrink-0">
                          <TidalImage
                            src={getTidalImageUrl(track.album?.cover, 80)}
                            alt={track.title}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-[#808080] truncate">
                            Track &middot;{" "}
                            {track.artist?.name || "Unknown Artist"}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Albums */}
                    {quickResults!.albums.map((album) => (
                      <button
                        key={`a-${album.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          navigateToAlbum(album.id, {
                            title: album.title,
                            cover: album.cover,
                            artistName: album.artist?.name,
                          });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded bg-[#282828] overflow-hidden shrink-0">
                          <TidalImage
                            src={getTidalImageUrl(album.cover, 80)}
                            alt={album.title}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white truncate">
                            {album.title}
                          </p>
                          <p className="text-[11px] text-[#808080] truncate">
                            Album &middot; {album.artist?.name || "Unknown"}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Artists */}
                    {quickResults!.artists.map((artist) => (
                      <div
                        key={`ar-${artist.id}`}
                        className="flex items-center gap-3 px-3 py-2 text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#282828] overflow-hidden shrink-0 flex items-center justify-center">
                          <span className="text-[12px] font-bold text-[#666]">
                            {artist.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white truncate">
                            {artist.name}
                          </p>
                          <p className="text-[11px] text-[#808080]">Artist</p>
                        </div>
                      </div>
                    ))}

                    {/* View all */}
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        navigateToSearch(searchQuery.trim());
                      }}
                      className="w-full py-2.5 text-center text-[12px] font-semibold text-[#00FFFF] hover:bg-white/[0.04] border-t border-white/[0.06] transition-colors"
                    >
                      View all results
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              setIsCollapsed(false);
              setTimeout(() => searchInputRef.current?.focus(), 300);
            }}
            className="w-full flex items-center justify-center py-2 text-[#b3b3b3] hover:text-white hover:bg-white/[0.06] rounded-md transition-colors duration-150"
            title="Search"
          >
            <Search size={20} strokeWidth={2} />
          </button>
        )}
      </nav>

      {/* Library Header */}
      <div className="flex-1 flex flex-col min-h-0 mt-1">
        <div
          className={`px-2 py-1.5 flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors duration-150 group ${
              isCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <Library size={20} />
            {!isCollapsed && (
              <span className="font-semibold text-sm">Your Library</span>
            )}
          </button>

          {!isCollapsed && (
            <button className="text-[#b3b3b3] hover:text-white p-1 rounded-full hover:bg-white/[0.08] transition-colors duration-150">
              <Plus size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        {!isCollapsed && (
          <div className="px-2 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {["Playlists", "Artists", "Albums"].map((pill) => (
              <button
                key={pill}
                className="px-2.5 py-1 bg-white/[0.07] hover:bg-white/[0.12] rounded-full text-xs font-medium text-[#e0e0e0] whitespace-nowrap transition-colors duration-150"
              >
                {pill}
              </button>
            ))}
          </div>
        )}

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto px-1.5 pb-2 custom-scrollbar">
          {userPlaylists.length === 0 ? (
            <div
              className={`px-3 py-8 text-center ${isCollapsed ? "hidden" : ""}`}
            >
              <p className="text-[#a6a6a6] text-sm">
                Create your first playlist
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition-transform">
                Create playlist
              </button>
            </div>
          ) : (
            <div className="space-y-px">
              {/* Loved Tracks - pinned at top */}
              <button
                onClick={navigateToFavorites}
                className={`w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md transition-colors duration-150 group ${
                  currentView.type === "favorites"
                    ? "bg-white/[0.08]"
                    : "hover:bg-white/[0.06]"
                } ${isCollapsed ? "justify-center" : ""}`}
                title="Loved Tracks"
              >
                <div
                  className={`shrink-0 overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#450af5] via-[#8e2de2] to-[#00d2ff] ${
                    isCollapsed ? "w-9 h-9 rounded" : "w-9 h-9 rounded"
                  }`}
                >
                  <Heart size={14} className="text-white" fill="white" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[13px] font-medium text-white truncate leading-tight">
                      Loved Tracks
                    </div>
                    <div className="text-[11px] text-[#808080] truncate leading-tight mt-0.5">
                      Collection
                    </div>
                  </div>
                )}
              </button>

              {userPlaylists.map((playlist) => (
                <button
                  key={playlist.uuid}
                  onClick={() => handlePlaylistClick(playlist)}
                  className={`w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md transition-colors duration-150 group ${
                    currentView.type === "playlist" &&
                    currentView.playlistId === playlist.uuid
                      ? "bg-white/[0.08]"
                      : "hover:bg-white/[0.06]"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={playlist.title}
                >
                  <div
                    className={`bg-[#282828] shrink-0 overflow-hidden rounded ${
                      isCollapsed ? "w-9 h-9" : "w-9 h-9"
                    }`}
                  >
                    <TidalImage
                      src={getTidalImageUrl(playlist.image, 80)}
                      alt={playlist.title}
                      type="playlist"
                    />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[13px] font-medium text-white truncate leading-tight">
                        {playlist.title}
                      </div>
                      <div className="text-[11px] text-[#808080] truncate leading-tight mt-0.5">
                        <span>Playlist</span>
                        <span className="mx-0.5">&middot;</span>
                        <span>{playlist.creator?.name || "You"}</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

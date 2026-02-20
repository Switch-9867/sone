import { useCallback } from "react";
import { usePlaybackActions } from "./usePlaybackActions";
import { fetchMediaTracks } from "../api/tidal";
import type { MediaItemType } from "../types";

export function useMediaPlay() {
  const { playTrack, setQueueTracks } = usePlaybackActions();

  return useCallback(
    async (item: MediaItemType) => {
      try {
        const tracks = await fetchMediaTracks(item);
        if (tracks.length > 0) {
          const [first, ...rest] = tracks;
          setQueueTracks(rest);
          await playTrack(first);
        }
      } catch (err) {
        console.error("Failed to play media:", err);
      }
    },
    [playTrack, setQueueTracks]
  );
}

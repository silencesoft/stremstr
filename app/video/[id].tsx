import { useState, useCallback, useEffect, useRef } from "react";
import {
  useLocalSearchParams,
  useRouter,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView, VideoPlayer } from "expo-video";
import { usePostStore } from "@/stores/usePostStore";
import { useEvent } from "expo";
// eslint-disable-next-line import/no-unresolved
import Video from "@/components/Video";

export default function VideoScreen() {
  const { id } = useLocalSearchParams();
  const post = usePostStore((state) => state.getPostById(id as string));
  const videoSource = post?.video;
  const navigation = useNavigation();
  const [playing, setPlaying] = useState(true);

  const isYoutube = videoSource?.includes("youtube.com/embed");
  const router = useRouter();

  // Create a ref to track if player should be used
  const shouldUseExpoVideo = !isYoutube && videoSource;
  
  // Always create player (but don't use it for YouTube)
  // Use null source for YouTube to avoid loading
  const player = useVideoPlayer(
    shouldUseExpoVideo ? videoSource : null,
    (p) => {
      if (shouldUseExpoVideo) {
        p.loop = false;
        p.play();
      }
    }
  );

  // Always call useEvent but only use result for non-YouTube
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player?.playing || false,
  });

  // Cleanup effect - only pause for non-YouTube
  useEffect(() => {
    return () => {
      if (shouldUseExpoVideo && isPlaying && player) {
        try {
          player.pause();
        } catch (error) {
          // Ignore errors on cleanup
          console.log("Player cleanup error (expected):", error);
        }
      }
    };
  }, [player, isPlaying, shouldUseExpoVideo]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: post?.title?.slice(0, 20) || "Video",
      });
    }, [navigation, post?.title])
  );

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>✖</Text>
      </TouchableOpacity>
      {isYoutube ? (
        <Video
          videoId={
            videoSource?.replace("https://www.youtube.com/embed/", "") || ""
          }
          playing={playing}
          setPlaying={setPlaying}
        />
      ) : (
        <VideoView
          player={player}
          style={{ flex: 1 }}
          allowsFullscreen
          allowsPictureInPicture
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    fontSize: 28,
    color: "#fff",
  },
});

import { useState, useCallback, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { usePostStore } from "@/stores/usePostStore";
import { useEvent } from "expo";
import { useNavigation, useFocusEffect } from "expo-router";
import Video from "@/components/Video";

export default function VideoScreen() {
  const { id } = useLocalSearchParams();
  const post = usePostStore((state) => state.getPostById(id as string));
  const videoSource = post?.video;
  const navigation = useNavigation();
  const [playing, setPlaying] = useState(true);

  const player = useVideoPlayer(videoSource || "", (p) => {
    p.loop = false;
    p.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const isYoutube = videoSource?.includes("youtube.com/embed");

  const router = useRouter();

  useEffect(() => {
    return () => {
      if (isPlaying) {
        player?.pause();
      }
    };
  }, [player]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: post?.title?.slice(0, 20) || "Video",
      });
    }, [])
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

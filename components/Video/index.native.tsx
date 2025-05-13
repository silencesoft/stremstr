import React from "react";
import { Dimensions, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

type Props = {
  videoId: string;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
};

const Video = ({ videoId, playing, setPlaying }: Props) => {
  const screenWidth = Dimensions.get("window").width;
  const aspectRatio = 16 / 9;
  const height = screenWidth / aspectRatio;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <YoutubePlayer
        height={height}
        width={screenWidth}
        play={playing}
        videoId={videoId}
        onChangeState={(state) => {
          if (state === "ended") {
            setPlaying(false);
          }
        }}
      />
    </View>
  );
};

export default Video;

import React from "react";
import { View } from "react-native";

type Props = {
  videoId: string;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
};

const Video = ({ videoId }: Props) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <iframe
        title="YouTube video player"
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
};

export default Video;

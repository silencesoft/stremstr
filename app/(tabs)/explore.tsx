import { StyleSheet } from "react-native";

import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="bolt.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title"> 🎬 Stremstr</ThemedText>
      </ThemedView>
      <ThemedText>
        Stremstr is a decentralized streaming application powered by the Nostr
        protocol. Stream, discover, and share content without intermediaries.
      </ThemedText>
      <ThemedText type="defaultSemiBold">✨ Features</ThemedText>
      <ThemedText>
        🔁 Fully decentralized using Nostr{"\n"}⚡ Lightning-fast streaming
        {"\n"}
        🧩 Clean UI with dark/light themes{"\n"}
        🧠 Own your content{"\n"}
        💬 Interact with creators through zaps and notes
      </ThemedText>

      <ThemedText type="defaultSemiBold">
        ❤️ Support the development of Stremstr by contributing
      </ThemedText>
      <ExternalLink href="https://lncoffee.me/silencesoft">
        <ThemedText>👉 Buy us a coffee on Lightning{"\n"}</ThemedText>
        <ThemedText type="link">☕ https://lncoffee.me/silencesoft</ThemedText>
      </ExternalLink>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});

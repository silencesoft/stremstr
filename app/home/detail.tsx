import React, { useCallback, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import {
  useRouter,
  useLocalSearchParams,
  RelativePathString,
} from "expo-router";
import { useNavigation, useFocusEffect } from "expo-router";

import { formatDate } from "@/utils/formatDate";
import { usePostStore } from "@/stores/usePostStore";

const DetailScreen = () => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const post = usePostStore((state) => state.getPostById(id as string));
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions(); // Hook to track dimensions
  const navigation = useNavigation();

  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);
  const maxPreviewLength = 300;
  const description = post?.description?.replace(/#(\w+)/g, "**#$1**") ?? "";
  const isLong = description.length > maxPreviewLength;
  const previewText =
    description.slice(0, maxPreviewLength) + (isLong ? "..." : "");
  const visibleText = expanded ? description : previewText;
  const isLandscape = width > height;
  const aspectRatio = 525 / 788;
  const screenWidth = width - 40;

  const markdownStyles = {
    text: {
      fontSize: 15,
      lineHeight: 22,
      color: colorScheme === "dark" ? "#fff" : "#333",
    },
    paragraph: {
      marginBottom: 12,
    },
    strong: {
      fontFamily: "Arial",
      fontSize: 16,
      color: colorScheme === "dark" ? "#fff" : "#000",
    },
    hashtag: {
      color: "#1e90ff",
      fontWeight: "700",
    },
    link: {
      color: "#1e90ff",
      textDecorationLine: "underline",
    },
  };

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Post not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: "Home",
      });
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View
        style={[styles.contentWrapper, isLandscape && styles.landscapeLayout]}
      >
        <Image
          source={{ uri: post.image }}
          style={[
            styles.image,
            isLandscape
              ? { width: width * 0.4, height: (width * 0.4) / aspectRatio }
              : { width: screenWidth, height: screenWidth / aspectRatio },
          ]}
        />
        <View style={styles.textWrapper}>
          <View style={styles.header}>
            {post.user?.avatar && post.user?.name ? (
              <>
                <Image
                  source={{ uri: post.user.avatar }}
                  style={styles.avatar}
                  defaultSource={require("../../assets/images/avatar-placeholder.png")}
                />
                <View>
                  <Text style={styles.username}>
                    {post.user?.name ?? "Anonymous"}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.date}>{formatDate(post.created_at)}</Text>

          <Markdown style={markdownStyles}>{visibleText}</Markdown>
          {isLong && (
            <Text
              onPress={() => setExpanded(!expanded)}
              style={styles.readMore}
            >
              {expanded ? "Read less ▲" : "Read more ▼"}
            </Text>
          )}
          {!!post.video && (
            <Button
              title="Play Video"
              onPress={() =>
                router.push({
                  pathname: "/video/[id]" as RelativePathString,
                  params: { id },
                })
              }
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    image: { borderRadius: 12, resizeMode: "cover", marginBottom: 10 },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 6,
    },
    username: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "600",
      textShadowColor: "rgba(0, 0, 0, 0.7)", // dark shadow
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: isDark ? "#fff" : "#000",
    },
    date: {
      fontSize: 12,
      color: isDark ? "#aaa" : "#666",
      marginBottom: 8,
    },
    video: { width: "100%", height: 300, marginTop: 10 },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
      zIndex: 1,
    },
    closeText: {
      fontSize: 28,
      color: isDark ? "#fff" : "#000",
    },
    contentWrapper: {
      flexDirection: "column",
      gap: 16,
    },
    landscapeLayout: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 20,
    },
    textWrapper: {
      flex: 1,
      justifyContent: "flex-start",
    },
    readMore: {
      marginTop: 8,
      color: "#1e90ff",
      fontWeight: "500",
      marginBottom: 16,
    },
  });

export default DetailScreen;

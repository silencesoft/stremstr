import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "expo-router";
import { useColorScheme } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { usePostStore } from "@/stores/usePostStore";
import { useRelayStore } from "@/stores/useRelayStore";
import { connectToRelays, fetchHashtagPosts } from "@/services/nostr";
import { extractMediaUrls } from "@/utils/extractMedia";
import { createZapInvoice } from "@/services/zap";
import { ZapModal } from "@/components/ZapModal";
import { formatDate } from "@/utils/formatDate";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [hashtag, setHashtag] = useState("kinostr");
  const [isZapVisible, setIsZapVisible] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [since, setSince] = useState<number | undefined>(undefined);
  const numColumns = width > height ? 4 : 2;
  const tip = 21;

  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerHeight = 56 + insets.top;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const {
    posts,
    loadingInitial,
    loadingMore,
    error,
    resetPosts,
    addPosts,
    setLoadingInitial,
    setLoadingMore,
    setError,
  } = usePostStore();

  const loadPosts = useCallback(
    async (loadMore = false) => {
      if (loadMore && loadingMore) return;
      if (!loadMore && loadingInitial) return;

      try {
        if (loadMore) {
          setLoadingMore(true);
        } else {
          setLoadingInitial(true);
          resetPosts();
        }

        const { isConnected } = useRelayStore.getState();
        if (!isConnected()) {
          await connectToRelays();
        }

        const result = await fetchHashtagPosts({
          hashtag,
          limit: 20,
          until: since,
        });

        if (result.length > 0) {
          const validPosts = result
            .filter(({ event }) => {
              const urls = extractMediaUrls(event.content || "");
              return urls.image && urls.video;
            })
            .map(({ event, user }) => {
              const urls = extractMediaUrls(event.content || "");
              const filteredLines = event.content
                .split("\n")
                .filter(
                  (line) =>
                    !line.includes(".jpg") &&
                    !line.includes(".png") &&
                    !line.includes(".mp4") &&
                    !/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(line)
                );

              const title = filteredLines[0]?.slice(0, 100);
              const description = filteredLines.slice(1).join("\n");

              return {
                id: event.id,
                image: urls.image || "",
                video: urls.video || "",
                title: title || "Untitled",
                description: description || "",
                created_at: event.created_at,
                user: {
                  name: user?.name || "Anonymous",
                  avatar: user?.picture || "",
                  lightning_address: user?.lud16 || user?.lud06 || undefined,
                },
              };
            });

          addPosts(validPosts);

          const oldestTimestamp = validPosts.reduce((min, post) => {
            if (post?.created_at === undefined) return min;
            return post.created_at < min ? post.created_at : min;
          }, since ?? Date.now());

          setSince(oldestTimestamp);
        }
      } catch (err) {
        console.error("Failed to load posts", err);
        setError("Failed to load posts");
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [hashtag, since, loadingInitial, loadingMore]
  );

  const handleRefresh = () => {
    setSince(undefined);
    loadPosts(false);
  };

  const handleLoadMore = () => {
    loadPosts(true);
  };

  const handleZap = async (post: any) => {
    try {
      if (!post.user?.lightning_address) {
        Alert.alert("No Lightning address found for this user.");
        return;
      }
      const invoice = await createZapInvoice(post.user.lightning_address, tip);
      setInvoice(invoice);
      setIsZapVisible(true);
    } catch (error) {
      console.error("Zap error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: "Home",
      });
    }, [])
  );

  useEffect(() => {
    handleRefresh();
  }, [hashtag]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <View style={{ flex: 1 }}>
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            {
              paddingTop: insets.top,
              height: headerHeight,
              backgroundColor: isDark ? "#000" : "#fff",
              borderBottomColor: isDark ? "#333" : "#eee",
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            },
          ]}
        >
          <Text
            style={[styles.headerTitle, { color: isDark ? "#fff" : "#000" }]}
          >
            KinoStr
          </Text>
          <MaterialCommunityIcons
            name="filmstrip"
            size={28}
            color={isDark ? "#fff" : "#000"}
          />
        </Animated.View>

        {/* Content */}
        <Animated.FlatList
          key={numColumns}
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          refreshControl={
            <RefreshControl
              refreshing={loadingInitial}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={{
            paddingTop: headerHeight + 20, // +20 for some extra breathing room
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
          ListHeaderComponent={
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={hashtag}
                  onChangeText={setHashtag}
                  placeholder="Enter hashtag"
                  placeholderTextColor={isDark ? "#888" : "#aaa"}
                />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </>
          }
          ListEmptyComponent={
            !loadingInitial ? (
              <Text style={styles.emptyText}>
                No posts found for #{hashtag}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/home/detail?id=${item.id}`)}
              style={styles.card}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                {item.user?.avatar && item.user?.name && (
                  <View style={styles.userContainer}>
                    <Image
                      source={{ uri: item.user.avatar }}
                      style={styles.avatar}
                      defaultSource={require("../../assets/images/avatar-placeholder.png")}
                    />
                    <Text style={styles.username}>
                      {item.user?.name ?? "Anonymous"}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={styles.actions}>
                <MaterialCommunityIcons
                  name="cards-heart"
                  size={20}
                  color="#444"
                />
                <MaterialCommunityIcons
                  name="cards-heart-outline"
                  size={20}
                  color="#444"
                />
                <TouchableOpacity onPress={() => handleZap(item)}>
                  <MaterialCommunityIcons
                    name="lightning-bolt-outline"
                    size={20}
                    color="#444"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color="#666" /> : null
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
        <ZapModal
          visible={isZapVisible}
          onClose={() => setIsZapVisible(false)}
          invoice={invoice}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  inputWrapper: {
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    fontSize: 16,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 525 / 788,
    resizeMode: "cover",
  },
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
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 8,
    left: 8,
  },
  textWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

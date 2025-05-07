import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MediaPost } from "@/types/media";
import HomeScreen from "../home";

export type RootStackParamList = {
  Home: undefined;
  Detail: { post: MediaPost };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainScreen() {
  return <HomeScreen />;
}

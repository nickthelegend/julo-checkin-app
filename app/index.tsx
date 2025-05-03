"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { router } from "expo-router"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, StyleSheet, View } from "react-native"

const { width } = Dimensions.get("window")

export default function IndexScreen() {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start()

    // Redirect to scanner screen after a short delay
    const timer = setTimeout(() => {
      router.replace("/scanner")
    }, 2500)

    return () => clearTimeout(timer)
  }, [fadeAnim, scaleAnim, pulseAnim])

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <IconSymbol name="qrcode.viewfinder" size={80} color="#FFFFFF" />
        </Animated.View>

        <ThemedText style={styles.title}>Event Check-In</ThemedText>
        <ThemedText style={styles.subtitle}>Scan • Verify • Track</ThemedText>
      </Animated.View>

      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Initializing scanner...</ThemedText>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8F8F8",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 50,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 50,
    width: width - 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 10,
    textAlign: "center",
  },
  loadingBar: {
    height: 6,
    width: "100%",
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
    overflow: "hidden",
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
})

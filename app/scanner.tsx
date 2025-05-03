"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { BarCodeScanner } from "expo-barcode-scanner"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")
const SCANNER_BORDER_WIDTH = 3

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const scanLineAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")
    }

    getBarCodeScannerPermissions()
  }, [])

  useEffect(() => {
    // Create scanning animation
    const animateScanLine = () => {
      scanLineAnimation.setValue(0)
      Animated.timing(scanLineAnimation, {
        toValue: 300,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        if (!scanned) animateScanLine()
      })
    }

    animateScanLine()
    return () => scanLineAnimation.stopAnimation()
  }, [scanLineAnimation, scanned])

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    console.log("Scanned QR Code:", data)

    try {
      // Try to parse the QR code data as JSON
      const attendeeData = JSON.parse(data)
      router.push({
        pathname: "/verification",
        params: { data: data },
      })
    } catch (error) {
      // If not valid JSON, just pass the string
      router.push({
        pathname: "/verification",
        params: { data: data },
      })
    }
  }

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <IconSymbol name="camera.fill" size={60} color="#007AFF" />
        <ThemedText style={styles.permissionText}>Requesting camera permission...</ThemedText>
      </ThemedView>
    )
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <IconSymbol name="camera.slash.fill" size={60} color="#FF3B30" />
        <ThemedText style={styles.permissionText}>Camera access is required to scan QR codes</ThemedText>
        <TouchableOpacity style={styles.permissionButton} onPress={() => BarCodeScanner.requestPermissionsAsync()}>
          <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full screen scanner */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay with transparent scanner window */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Scan Attendee QR Code</ThemedText>
        </View>

        {/* Top overlay */}
        <View style={styles.overlaySection} />

        {/* Middle section with scanner window */}
        <View style={styles.scannerRow}>
          <View style={styles.overlaySection} />

          {/* Scanner window */}
          <View style={styles.scannerWindow}>
            {/* Corner markers */}
            <View style={[styles.cornerTL, styles.corner]} />
            <View style={[styles.cornerTR, styles.corner]} />
            <View style={[styles.cornerBL, styles.corner]} />
            <View style={[styles.cornerBR, styles.corner]} />

            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLineAnimation.interpolate({
                        inputRange: [0, 300],
                        outputRange: [0, 300],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          <View style={styles.overlaySection} />
        </View>

        {/* Bottom overlay */}
        <View style={styles.bottomSection}>
          <ThemedText style={styles.instructionText}>Position the QR code within the frame</ThemedText>

          {scanned && (
            <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
              <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
              <ThemedText style={styles.scanAgainText}>Scan Again</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  overlaySection: {
    flex: 1,
  },
  scannerRow: {
    flexDirection: "row",
    height: 300,
  },
  scannerWindow: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#00E676",
    zIndex: 10,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: SCANNER_BORDER_WIDTH,
    borderLeftWidth: SCANNER_BORDER_WIDTH,
    borderTopLeftRadius: 20,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: SCANNER_BORDER_WIDTH,
    borderRightWidth: SCANNER_BORDER_WIDTH,
    borderTopRightRadius: 20,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: SCANNER_BORDER_WIDTH,
    borderLeftWidth: SCANNER_BORDER_WIDTH,
    borderBottomLeftRadius: 20,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: SCANNER_BORDER_WIDTH,
    borderRightWidth: SCANNER_BORDER_WIDTH,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "rgba(0, 230, 118, 0.8)",
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  bottomSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
  },
  scanAgainText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8F8F8",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

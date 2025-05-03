"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")

export default function VerificationScreen() {
  const { data } = useLocalSearchParams()
  const [attendeeInfo, setAttendeeInfo] = useState(null)
  const [signature, setSignature] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isMarked, setIsMarked] = useState(false)
  const [parsedData, setParsedData] = useState(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  useEffect(() => {
    console.log("Verification Screen - QR Data:", data)

    try {
      // Try to parse the data as JSON
      const parsedQrData = JSON.parse(data)
      setParsedData(parsedQrData)

      // Check if this is the specific format with payload and signature
      if (parsedQrData.payload && parsedQrData.signature) {
        setAttendeeInfo(parsedQrData.payload)
        setSignature(parsedQrData.signature)

        // Verify based on payload data
        if (parsedQrData.payload.eventId && parsedQrData.payload.userAddress) {
          setIsVerified(true)
        }
      } else {
        // Handle regular JSON format
        setAttendeeInfo(parsedQrData)

        // Check if this is a valid attendee
        if (parsedQrData.name && parsedQrData.id) {
          setIsVerified(true)
        }
      }
    } catch (error) {
      // If not valid JSON, just use the string
      console.log("Error parsing QR data:", error)
      setAttendeeInfo({ rawData: data })
      setIsVerified(false)
    }
  }, [data])

  const handleMarkAttendance = () => {
    // Here you would implement the logic to mark attendance
    // For example, sending data to a server or storing locally
    console.log("Marking attendance for:", attendeeInfo)

    // Show success animation
    setIsMarked(true)

    // Return to scanner after delay
    setTimeout(() => {
      router.push("/scanner")
    }, 2000)
  }

  // Function to safely render any value
  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return "N/A"
    } else if (typeof value === "object") {
      return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? "..." : "")
    } else if (typeof value === "string" && value.length > 30) {
      return value.substring(0, 30) + "..."
    } else {
      return String(value)
    }
  }

  const renderAttendeeInfo = () => {
    if (!attendeeInfo) return null

    if (attendeeInfo.rawData) {
      return (
        <Animated.View
          style={[styles.infoCard, styles.invalidCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.cardHeader}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9500" />
            <ThemedText style={styles.cardHeaderText}>Invalid QR Code</ThemedText>
          </View>

          <View style={styles.divider} />

          <ThemedText style={styles.rawDataLabel}>Scanned Data:</ThemedText>
          <ScrollView style={styles.rawDataContainer}>
            <ThemedText style={styles.rawData}>{String(attendeeInfo.rawData)}</ThemedText>
          </ScrollView>

          <View style={styles.warningContainer}>
            <IconSymbol name="info.circle.fill" size={16} color="#FF3B30" />
            <ThemedText style={styles.warning}>Could not parse as valid attendee data</ThemedText>
          </View>
        </Animated.View>
      )
    }

    return (
      <Animated.View
        style={[
          styles.infoCard,
          isVerified ? styles.verifiedCard : styles.unverifiedCard,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.cardHeader}>
          <IconSymbol
            name={isVerified ? "checkmark.seal.fill" : "xmark.seal.fill"}
            size={24}
            color={isVerified ? "#34C759" : "#FF3B30"}
          />
          <ThemedText style={styles.cardHeaderText}>
            {isVerified ? "Verified Attendee" : "Unverified Attendee"}
          </ThemedText>
        </View>

        <View style={styles.divider} />

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.attendeePhotoContainer}>
            <View style={styles.attendeePhoto}>
              <IconSymbol name="person.fill" size={40} color="#FFFFFF" />
            </View>
            {attendeeInfo.eventName && <ThemedText style={styles.attendeeName}>{attendeeInfo.eventName}</ThemedText>}
          </View>

          <View style={styles.infoContainer}>
            {Object.entries(attendeeInfo).map(([key, value]) => {
              // Skip eventName as it's displayed above
              if (key === "eventName") return null

              return (
                <View key={key} style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</ThemedText>
                  <ThemedText style={styles.infoValue}>{renderValue(value)}</ThemedText>
                </View>
              )
            })}

            {signature && (
              <View style={styles.signatureContainer}>
                <ThemedText style={styles.signatureLabel}>Signature</ThemedText>
                <ThemedText style={styles.signatureValue}>{signature.substring(0, 20)}...</ThemedText>
              </View>
            )}
          </View>

          <View style={[styles.statusBadge, isVerified ? styles.verified : styles.unverified]}>
            <IconSymbol name={isVerified ? "checkmark.circle.fill" : "xmark.circle.fill"} size={16} color="#FFFFFF" />
            <ThemedText style={styles.statusText}>{isVerified ? "VERIFIED" : "NOT VERIFIED"}</ThemedText>
          </View>
        </ScrollView>
      </Animated.View>
    )
  }

  return (
    <ThemedView style={styles.container}>
      {isMarked ? (
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <IconSymbol name="checkmark" size={80} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.successText}>Attendance Marked!</ThemedText>
        </View>
      ) : (
        <>
          <ThemedText style={styles.title}>Verification Results</ThemedText>

          {renderAttendeeInfo()}

          <View style={styles.buttonContainer}>
            {isVerified && (
              <TouchableOpacity style={styles.markButton} onPress={handleMarkAttendance} activeOpacity={0.8}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Mark Attendance</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.scanButton} onPress={() => router.push("/scanner")} activeOpacity={0.8}>
              <IconSymbol name="qrcode.viewfinder" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Scan Another Code</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333333",
  },
  infoCard: {
    width: width - 40,
    borderRadius: 20,
    padding: 0,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    maxHeight: 500,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  verifiedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#34C759",
  },
  unverifiedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#FF3B30",
  },
  invalidCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#FF9500",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F8F8F8",
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333333",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    width: "100%",
  },
  attendeePhotoContainer: {
    alignItems: "center",
    padding: 20,
  },
  attendeePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  attendeeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },
  infoContainer: {
    padding: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  signatureContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  signatureValue: {
    fontSize: 14,
    color: "#666666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 20,
  },
  verified: {
    backgroundColor: "#34C759",
  },
  unverified: {
    backgroundColor: "#FF3B30",
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  rawDataLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    padding: 15,
    paddingBottom: 0,
  },
  rawDataContainer: {
    padding: 15,
    backgroundColor: "#F0F0F0",
    margin: 15,
    borderRadius: 10,
    maxHeight: 200,
  },
  rawData: {
    fontSize: 14,
    color: "#666666",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 0,
  },
  warning: {
    color: "#FF3B30",
    marginLeft: 5,
    fontSize: 14,
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  markButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingVertical: 15,
    borderRadius: 15,
    width: "100%",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 15,
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34C759",
  },
})

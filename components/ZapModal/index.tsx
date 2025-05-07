import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

type ZapModalProps = {
  visible: boolean;
  onClose: () => void;
  invoice: string;
};

export const ZapModal: React.FC<ZapModalProps> = ({
  visible,
  onClose,
  invoice,
}) => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(invoice);
    Alert.alert("Copied", "Invoice copied to clipboard");
  };

  const handleOpenWallet = () => {
    Linking.openURL(`lightning:${invoice}`);
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose}>
      <View style={styles.modal}>
        <Text style={styles.title}>Zap this post ⚡</Text>
        <QRCode value={invoice} size={220} />
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handleCopy}>
            <Text style={styles.buttonText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleOpenWallet}>
            <Text style={styles.buttonText}>Pay with Wallet</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 20,
  },
  closeText: {
    color: "#888",
  },
});

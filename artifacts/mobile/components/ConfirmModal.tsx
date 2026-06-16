import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Action {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  primary?: boolean;
}

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: Action[];
  onDismiss: () => void;
}

export function ConfirmModal({ visible, title, message, actions, onDismiss }: ConfirmModalProps) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
              {!!message && (
                <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
              )}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {actions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.actionBtn,
                    i < actions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                  onPress={() => { onDismiss(); action.onPress(); }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.actionLabel,
                      action.destructive
                        ? { color: "#EF4444", fontFamily: "Inter_600SemiBold" }
                        : action.primary
                        ? { color: colors.primary, fontFamily: "Inter_600SemiBold" }
                        : { color: colors.foreground, fontFamily: "Inter_400Regular" },
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  divider: { height: StyleSheet.hairlineWidth },
  actionBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 16,
  },
});

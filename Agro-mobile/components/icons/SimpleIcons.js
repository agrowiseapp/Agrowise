import React from "react";
import { Ionicons } from "@expo/vector-icons";

const SimpleIcons = ({ name, size = 24, color = "black", style }) => {
  // Map emoji-based icon names to proper Ionicons
  const getIoniconName = (iconName) => {
    switch (iconName) {
      // Navigation icons
      case "home":
        return "home";
      case "home-outline":
        return "home-outline";

      case "chatbubble-ellipses":
        return "chatbubble-ellipses";
      case "chatbubble-ellipses-outline":
        return "chatbubble-ellipses-outline";

      case "people":
        return "people";
      case "people-outline":
        return "people-outline";

      case "newspaper":
        return "newspaper";
      case "newspaper-outline":
        return "newspaper-outline";

      case "person":
      case "person-outline":
        return "person-outline";

      // Action icons
      case "checkcircleo":
      case "check-circle":
        return "checkmark-circle-outline";

      case "clockcircleo":
      case "clock":
        return "time-outline";

      case "staro":
      case "star":
        return "star-outline";

      case "search":
        return "search-outline";

      case "send":
        return "send";

      case "eye":
        return "eye-outline";
      case "eye-off":
        return "eye-off-outline";

      case "settings":
      case "cog":
        return "settings-outline";

      case "logout":
      case "exit":
        return "log-out-outline";

      case "heart":
        return "heart";
      case "heart-outline":
        return "heart-outline";

      case "comment":
      case "message":
        return "chatbubble-outline";

      case "share":
        return "share-outline";

      case "close":
      case "x":
        return "close-outline";

      case "arrow-back":
      case "chevron-left":
        return "chevron-back";

      case "chevron-right":
      case "arrow-right":
        return "chevron-forward";

      case "more-horizontal":
      case "ellipsis-horizontal":
        return "ellipsis-horizontal";

      case "globe":
        return "globe-outline";

      case "phone":
        return "call-outline";

      case "bell":
        return "notifications-outline";

      case "edit":
        return "create-outline";

      case "trash-2":
        return "trash-outline";

      case "cancel":
        return "close-circle-outline";

      case "flag":
        return "flag-outline";

      case "chat":
        return "chatbubble-outline";

      case "report":
        return "warning-outline";

      case "thumbs-up":
      case "like":
        return "thumbs-up-outline";

      case "calendar":
        return "calendar-outline";

      case "user":
      case "account":
        return "person-outline";

      case "plus":
      case "add":
        return "add-outline";

      case "minus":
        return "remove-outline";

      case "info":
        return "information-circle-outline";

      case "warning":
        return "warning-outline";

      case "check":
        return "checkmark-outline";

      case "refresh":
        return "refresh-outline";

      case "menu":
        return "menu-outline";

      case "image":
        return "image-outline";

      case "link":
        return "link-outline";

      case "mail":
      case "mailbox":
        return "mail-outline";

      // Google icon - use MaterialIcons for better Google logo
      case "google":
        return null; // Will be handled separately

      // Checkbox icons
      case "checkbox-blank-outline":
        return "square-outline";

      case "checkbox":
        return "checkbox"; // Filled rectangular checkbox

      case "checkbox-outline":
        return "checkbox-outline"; // Empty rectangular checkbox

      default:
        return "help-outline"; // Default fallback icon
    }
  };

  // Handle Google icon with proper fallback
  if (name === "google") {
    return (
      <Ionicons name="logo-google" size={size} color={color} style={style} />
    );
  }

  const iconName = getIoniconName(name);

  return <Ionicons name={iconName} size={size} color={color} style={style} />;
};

export default SimpleIcons;

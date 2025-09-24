import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { theme } from '../../assets/Theme';

// Container component for consistent screen layouts
export const Container = ({
  children,
  variant = 'default',
  padding = true,
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'subscription':
        return theme.layouts.subscription.container;
      case 'login':
        return theme.layouts.login.container;
      default:
        return {
          flex: 1,
          backgroundColor: theme.colors.Background.primary,
        };
    }
  };

  const containerStyle = [
    getVariantStyle(),
    padding && { padding: theme.spacing.screen.padding },
    style,
  ];

  return (
    <SafeAreaView style={containerStyle} {...props}>
      {children}
    </SafeAreaView>
  );
};

// ScrollContainer with keyboard awareness
export const ScrollContainer = ({
  children,
  variant = 'default',
  keyboardAware = true,
  style,
  contentContainerStyle,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'login':
        return theme.layouts.login.scrollContent;
      default:
        return {
          flexGrow: 1,
        };
    }
  };

  const scrollStyle = [
    { flex: 1 },
    style,
  ];

  const scrollContentStyle = [
    getVariantStyle(),
    contentContainerStyle,
  ];

  if (keyboardAware) {
    return (
      <KeyboardAvoidingView
        style={theme.layouts.login.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={scrollStyle}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...props}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      style={scrollStyle}
      contentContainerStyle={scrollContentStyle}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

// Row component for horizontal layouts
export const Row = ({
  children,
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  spacing = 0,
  style,
  ...props
}) => {
  const rowStyle = [
    theme.createStyles.layout.row,
    {
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
    },
    spacing > 0 && { gap: spacing },
    style,
  ];

  return (
    <View style={rowStyle} {...props}>
      {children}
    </View>
  );
};

// Column component for vertical layouts
export const Column = ({
  children,
  align = 'stretch',
  justify = 'flex-start',
  spacing = 0,
  style,
  ...props
}) => {
  const columnStyle = [
    theme.createStyles.layout.column,
    {
      alignItems: align,
      justifyContent: justify,
    },
    spacing > 0 && { gap: spacing },
    style,
  ];

  return (
    <View style={columnStyle} {...props}>
      {children}
    </View>
  );
};

// Center component for centering content
export const Center = ({
  children,
  style,
  ...props
}) => {
  const centerStyle = [
    theme.createStyles.layout.center,
    style,
  ];

  return (
    <View style={centerStyle} {...props}>
      {children}
    </View>
  );
};

// Spacer component for consistent spacing
export const Spacer = ({
  size = 'md',
  horizontal = false,
}) => {
  const getSpacingValue = () => {
    if (typeof size === 'number') return size;
    return theme.spacing[size] || theme.spacing.md;
  };

  const spacerStyle = horizontal
    ? { width: getSpacingValue() }
    : { height: getSpacingValue() };

  return <View style={spacerStyle} />;
};

// Divider component from Login screen pattern
export const Divider = ({
  text,
  color,
  textColor,
  style,
  textStyle,
  ...props
}) => {
  if (text) {
    return (
      <View style={[theme.components.divider.container, style]} {...props}>
        <View style={[
          theme.components.divider.line,
          color && { backgroundColor: color }
        ]} />
        <Text style={[
          theme.components.divider.text,
          textColor && { color: textColor },
          textStyle
        ]}>
          {text}
        </Text>
        <View style={[
          theme.components.divider.line,
          color && { backgroundColor: color }
        ]} />
      </View>
    );
  }

  return (
    <View style={[
      theme.components.divider.line,
      color && { backgroundColor: color },
      style
    ]} {...props} />
  );
};

// Content area with consistent padding
export const Content = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'subscription':
        return theme.layouts.subscription.content;
      case 'form':
        return theme.layouts.login.formContainer;
      default:
        return {
          flex: 1,
          paddingHorizontal: theme.spacing.screen.paddingHorizontal,
        };
    }
  };

  const contentStyle = [
    getVariantStyle(),
    style,
  ];

  return (
    <View style={contentStyle} {...props}>
      {children}
    </View>
  );
};

// Header component for screen headers
export const Header = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'subscription':
        return theme.layouts.subscription.header;
      default:
        return {
          paddingHorizontal: theme.spacing.screen.paddingHorizontal,
          paddingVertical: theme.spacing.layout.header,
        };
    }
  };

  const headerStyle = [
    getVariantStyle(),
    style,
  ];

  return (
    <View style={headerStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional custom styles if needed
});
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import SimpleIcons from '../icons/SimpleIcons';
import { theme } from '../../assets/Theme';

const Button = ({
  // Content
  title,
  icon,
  iconPosition = 'left',

  // Variants
  variant = 'primary',
  size = 'medium',

  // State
  loading = false,
  disabled = false,

  // Styling
  style,
  textStyle,
  fullWidth = false,

  // Interaction
  onPress,
  ...props
}) => {
  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return theme.components.button.primary;
      case 'google':
        return theme.components.button.google;
      case 'secondary':
        return theme.components.button.secondary;
      case 'pricing':
        return theme.components.button.pricing;
      default:
        return theme.components.button.primary;
    }
  };

  // Get size modifications
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 20,
          borderRadius: 16,
        };
      default: // medium
        return {};
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'google':
        return theme.colors.Main[600];
      case 'secondary':
        return theme.colors.Text.inverse;
      default:
        return theme.colors.Text.inverse;
    }
  };

  // Get icon color
  const getIconColor = () => {
    switch (variant) {
      case 'google':
        return theme.colors.Main[600];
      default:
        return theme.colors.Text.inverse;
    }
  };

  // Get font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const buttonStyle = [
    getVariantStyle(),
    getSizeStyle(),
    fullWidth && { width: '100%' },
    (disabled || loading) && { opacity: 0.6 },
    style,
  ];

  const buttonTextStyle = [
    {
      color: getTextColor(),
      fontSize: getFontSize(),
      fontWeight: '600',
      textAlign: 'center',
    },
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContent}>
          <ActivityIndicator
            size="small"
            color={getTextColor()}
          />
          {title && (
            <Text style={[buttonTextStyle, { marginLeft: 8 }]}>
              {title}
            </Text>
          )}
        </View>
      );
    }

    if (icon && title) {
      return (
        <View style={[
          styles.contentRow,
          iconPosition === 'right' && styles.contentRowReverse
        ]}>
          <SimpleIcons
            name={icon}
            size={getFontSize() + 2}
            color={getIconColor()}
          />
          <Text style={[
            buttonTextStyle,
            iconPosition === 'left'
              ? { marginLeft: 8 }
              : { marginRight: 8 }
          ]}>
            {title}
          </Text>
        </View>
      );
    }

    if (icon) {
      return (
        <SimpleIcons
          name={icon}
          size={getFontSize() + 2}
          color={getIconColor()}
        />
      );
    }

    return (
      <Text style={buttonTextStyle}>
        {title}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRowReverse: {
    flexDirection: 'row-reverse',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
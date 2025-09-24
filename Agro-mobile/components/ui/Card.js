import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import SimpleIcons from '../icons/SimpleIcons';
import { theme } from '../../assets/Theme';

const Card = ({
  // Content
  children,
  title,
  subtitle,
  description,

  // Variants
  variant = 'default',

  // Feature card specific props
  icon,
  iconColor,
  leftBorderColor,

  // Interaction
  onPress,
  disabled = false,

  // Styling
  style,
  contentStyle,
  ...props
}) => {
  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'feature':
        return theme.components.card.feature;
      case 'pricing':
        return theme.components.card.pricing;
      case 'loading':
        return theme.components.card.loading;
      default:
        return theme.components.card.default;
    }
  };

  // Get text colors based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'feature':
      case 'pricing':
        return theme.colors.Text.inverse;
      default:
        return theme.colors.Text.primary;
    }
  };

  const getSubtitleColor = () => {
    switch (variant) {
      case 'feature':
        return 'rgba(255,255,255,0.7)';
      case 'pricing':
        return 'rgba(255,255,255,0.9)';
      default:
        return theme.colors.Text.secondary;
    }
  };

  const cardStyle = [
    getVariantStyle(),
    leftBorderColor && { borderLeftColor: leftBorderColor },
    disabled && { opacity: 0.6 },
    style,
  ];

  const renderFeatureCard = () => (
    <>
      {icon && (
        <View style={[
          theme.components.iconBadge,
          iconColor && { backgroundColor: iconColor },
          styles.featureIcon
        ]}>
          <SimpleIcons
            name={icon}
            size={16}
            color="white"
          />
        </View>
      )}
      <View style={styles.featureContent}>
        {title && (
          <Text style={[styles.featureTitle, { color: getTextColor() }]}>
            {title}
          </Text>
        )}
        {description && (
          <Text style={[styles.featureDescription, { color: getSubtitleColor() }]}>
            {description}
          </Text>
        )}
        {children}
      </View>
    </>
  );

  const renderPricingCard = () => (
    <View style={styles.pricingContent}>
      {title && (
        <Text style={[styles.pricingTitle, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.pricingSubtitle, { color: getSubtitleColor() }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );

  const renderDefaultCard = () => (
    <View style={[styles.defaultContent, contentStyle]}>
      {title && (
        <Text style={[styles.defaultTitle, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.defaultSubtitle, { color: getSubtitleColor() }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'feature':
        return renderFeatureCard();
      case 'pricing':
        return renderPricingCard();
      default:
        return renderDefaultCard();
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {variant === 'feature' ? (
          <View style={styles.featureRow}>
            {renderContent()}
          </View>
        ) : (
          renderContent()
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {variant === 'feature' ? (
        <View style={styles.featureRow}>
          {renderContent()}
        </View>
      ) : (
        renderContent()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Feature card styles
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Pricing card styles
  pricingContent: {
    // Custom styling handled by variant styles
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  pricingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },

  // Default card styles
  defaultContent: {
    // Custom styling handled by variant styles
  },
  defaultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  defaultSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 12,
  },
});

export default Card;
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import SimpleIcons from '../icons/SimpleIcons';
import { theme } from '../../assets/Theme';

const Input = ({
  // Content
  placeholder,
  value,
  onChangeText,
  label,
  helperText,
  errorText,

  // Input type
  secureTextEntry = false,
  keyboardType = 'default',
  returnKeyType = 'done',
  autoCapitalize = 'none',

  // Variants
  variant = 'default',
  size = 'medium',

  // State
  disabled = false,
  error = false,

  // Icons
  leftIcon,
  rightIcon,
  showPasswordToggle = false,

  // Styling
  style,
  inputStyle,
  containerStyle,

  // Events
  onFocus,
  onBlur,
  onSubmitEditing,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'compact':
        return theme.components.input.compact;
      default:
        return theme.components.input.default;
    }
  };

  // Get size modifications
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingHorizontal: 20,
          paddingVertical: 18,
          fontSize: 18,
        };
      default: // medium
        return {};
    }
  };

  // Get focus state modifications
  const getFocusStyle = () => {
    if (isFocused) {
      return {
        borderColor: theme.colors.Second[500],
        borderWidth: 2,
      };
    }
    return {};
  };

  // Get error state modifications
  const getErrorStyle = () => {
    if (error || errorText) {
      return {
        borderColor: theme.colors.Error[500],
        borderWidth: 2,
      };
    }
    return {};
  };

  const inputContainerStyle = [
    getVariantStyle(),
    getSizeStyle(),
    getFocusStyle(),
    getErrorStyle(),
    disabled && { opacity: 0.6 },
    leftIcon && { paddingLeft: 45 },
    (rightIcon || showPasswordToggle) && { paddingRight: 45 },
    style,
  ];

  const textInputStyle = [
    {
      flex: 1,
      color: variant === 'default' ? '#000' : '#000',
      fontSize: getSizeStyle().fontSize || 16,
    },
    inputStyle,
  ];

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 22;
      default:
        return 18;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          error && { color: theme.colors.Error[500] }
        ]}>
          {label}
        </Text>
      )}

      <View style={[styles.inputContainer, inputContainerStyle]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            <SimpleIcons
              name={leftIcon}
              size={getIconSize()}
              color={isFocused ? theme.colors.Second[500] : '#666'}
            />
          </View>
        )}

        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          {...props}
        />

        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
          >
            <SimpleIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={getIconSize()}
              color="#666"
            />
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <View style={styles.rightIcon}>
            <SimpleIcons
              name={rightIcon}
              size={getIconSize()}
              color={isFocused ? theme.colors.Second[500] : '#666'}
            />
          </View>
        )}
      </View>

      {(helperText || errorText) && (
        <Text style={[
          styles.helperText,
          errorText && styles.errorText
        ]}>
          {errorText || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styles handled by theme
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.Text.primary,
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 14,
    zIndex: 1,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.Text.secondary,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: theme.colors.Error[500],
  },
});

export default Input;
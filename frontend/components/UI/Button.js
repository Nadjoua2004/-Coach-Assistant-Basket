import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';

const Button = ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle
}) => {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    const buttonStyles = [
        styles.base,
        styles[size],
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.textBase,
        styles[`text_${size}`],
        isPrimary && styles.textPrimary,
        isSecondary && styles.textSecondary,
        isOutline && styles.textOutline,
        isGhost && styles.textGhost,
        textStyle,
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={buttonStyles}
        >
            {loading ? (
                <ActivityIndicator color={isOutline || isGhost ? COLORS.primary : COLORS.white} />
            ) : (
                <View style={styles.content}>
                    {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
                    <Text style={textStyles}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },

    // Sizes
    sm: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
    },
    md: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    lg: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },

    // Variants
    primary: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.sm,
    },
    secondary: {
        backgroundColor: COLORS.secondary,
        ...SHADOWS.sm,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    disabled: {
        opacity: 0.5,
    },

    // Text Styles
    textBase: {
        fontWeight: '600',
        textAlign: 'center',
    },
    text_sm: {
        fontSize: 14,
    },
    text_md: {
        fontSize: 16,
    },
    text_lg: {
        fontSize: 18,
    },

    textPrimary: {
        color: COLORS.white,
    },
    textSecondary: {
        color: COLORS.white,
    },
    textOutline: {
        color: COLORS.primary,
    },
    textGhost: {
        color: COLORS.primary,
    },
});

export default Button;

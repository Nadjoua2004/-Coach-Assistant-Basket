import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../config/theme';

const Card = ({ children, style, padding = 'md', shadow = 'sm', variant = 'default', onPress, activeOpacity = 0.7 }) => {
    const cardStyles = [
        styles.base,
        styles[`padding_${padding}`],
        SHADOWS[shadow],
        variant === 'outline' && styles.outline,
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={activeOpacity}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    outline: {
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        ...SHADOWS.none,
    },

    // Padding variants
    padding_none: { padding: 0 },
    padding_xs: { padding: SPACING.xs },
    padding_sm: { padding: SPACING.sm },
    padding_md: { padding: SPACING.md },
    padding_lg: { padding: SPACING.lg },
    padding_xl: { padding: SPACING.xl },
});

export default Card;

export const COLORS = {
    primary: '#f97316', // Orange
    secondary: '#ea580c', // Darker Orange
    accent: '#fb923c', // Lighter Orange
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    white: '#ffffff',
    black: '#000000',

    // Grays
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },

    // Backgrounds
    background: {
        main: '#f3f4f6',
        card: '#ffffff',
        input: '#ffffff',
    },

    // Text
    text: {
        primary: '#111827',
        secondary: '#4b5563',
        muted: '#9ca3af',
        inverse: '#ffffff',
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
};

export const BORDER_RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const SHADOWS = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    caption: {
        fontSize: 12,
        lineHeight: 16,
    },
};

export default {
    COLORS,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    TYPOGRAPHY,
};

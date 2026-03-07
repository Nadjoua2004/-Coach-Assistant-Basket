import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

const Input = ({
    label,
    error,
    icon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    hint,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <View style={[
                styles.inputWrapper,
                error ? styles.inputError : null,
                props.multiline ? styles.multilineWrapper : null
            ]}>
                {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

                <TextInput
                    style={[
                        styles.input,
                        props.multiline ? styles.multilineInput : null,
                        inputStyle
                    ]}
                    placeholderTextColor={COLORS.gray[400]}
                    {...props}
                />

                {rightIcon ? (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                        style={styles.rightIconContainer}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                ) : null}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {hint && !error ? <Text style={styles.hintText}>{hint}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: SPACING.md,
    },
    label: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[700],
        marginBottom: SPACING.sm,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background.input,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 56,
    },
    multilineWrapper: {
        height: 'auto',
        alignItems: 'flex-start',
        paddingVertical: SPACING.md,
    },
    input: {
        flex: 1,
        height: '100%',
        color: COLORS.text.primary,
        fontSize: 16,
        paddingVertical: 0,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: COLORS.error,
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
    rightIconContainer: {
        marginLeft: SPACING.sm,
        padding: 4,
    },
    errorText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.error,
        marginTop: 4,
        marginLeft: 4,
    },
    hintText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gray[400],
        marginTop: 4,
        marginLeft: 4,
    },
});

export default Input;

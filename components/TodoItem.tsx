// components/TodoItem.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    useWindowDimensions,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Id } from "../convex/_generated/dataModel";

interface TodoItemProps {
    todo: {
        _id: Id<"todos">;
        title: string;
        completed: boolean;
    };
    onToggle: (id: Id<"todos">) => void;
    onDelete: (id: Id<"todos">) => void;
    onEdit: (id: Id<"todos">, newTitle: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();
    const [scaleAnim] = React.useState(new Animated.Value(1));
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.title);

    // Calculate responsive values internally
    const isMobile = width < 500;

    const responsive = {
        containerPaddingVertical: isMobile ? 12 : 16,
        containerPaddingHorizontal: isMobile ? 16 : 20,
        checkboxSize: isMobile ? 20 : 22,
        checkboxMargin: isMobile ? 12 : 16,
        titleFontSize: isMobile ? 12 : 24,
        checkmarkSize: isMobile ? 14 : 16,
        iconSize: isMobile ? 18 : 20,
    };

    const animatePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleEdit = () => {
        if (isEditing) {
            if (editText.trim() && editText !== todo.title) {
                onEdit(todo._id, editText.trim());
            } else {
                setEditText(todo.title); // Reset if empty or same
            }
        }
        setIsEditing(!isEditing);
    };

    const handleSubmit = () => {
        if (editText.trim() && editText !== todo.title) {
            onEdit(todo._id, editText.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(todo.title);
        setIsEditing(false);
    };

    return (
        <Animated.View style={[
            styles.animatedContainer,
            { transform: [{ scale: scaleAnim }] }
        ]}>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.card || theme.surface,
                        borderBottomColor: theme.border,
                        opacity: todo.completed ? 0.6 : 1,
                        paddingVertical: responsive.containerPaddingVertical,
                        paddingHorizontal: responsive.containerPaddingHorizontal,
                    },
                ]}
            >
                {/* Checkbox */}
                <TouchableOpacity
                    onPress={() => {
                        animatePress();
                        onToggle(todo._id);
                    }}
                    style={[
                        styles.checkbox,
                        {
                            borderColor: todo.completed ? theme.success : theme.border,
                            backgroundColor: todo.completed ? theme.success : 'transparent',
                            width: responsive.checkboxSize,
                            height: responsive.checkboxSize,
                            marginRight: responsive.checkboxMargin,
                        },
                    ]}
                    activeOpacity={0.7}
                    disabled={isEditing}
                >
                    {todo.completed && (
                        <Ionicons name="checkmark" size={responsive.checkmarkSize} color="#FFFFFF" />
                    )}
                </TouchableOpacity>

                {/* Content Area */}
                <View style={styles.content}>
                    {isEditing ? (
                        // Edit Mode
                        <TextInput
                            style={[
                                styles.editInput,
                                {
                                    color: theme.text,
                                    backgroundColor: theme.background,
                                    borderColor: theme.primary,
                                    fontSize: responsive.titleFontSize,
                                }
                            ]}
                            value={editText}
                            onChangeText={setEditText}
                            onSubmitEditing={handleSubmit}
                            autoFocus
                            selectTextOnFocus
                        />
                    ) : (
                        // View Mode
                        <Text
                            style={[
                                styles.title,
                                {
                                    color: theme.text,
                                    textDecorationLine: todo.completed ? 'line-through' : 'none',
                                    fontSize: responsive.titleFontSize,
                                    fontFamily: 'JosefinSans',
                                },
                            ]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {todo.title}
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {isEditing ? (
                        // Edit Mode Actions
                        <>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                style={styles.actionButton}
                                disabled={!editText.trim()}
                            >
                                <Ionicons
                                    name="checkmark"
                                    size={responsive.iconSize}
                                    color={editText.trim() ? theme.success : theme.textSecondary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={styles.actionButton}
                            >
                                <Ionicons name="close" size={responsive.iconSize} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        // View Mode Actions
                        <>
                            <TouchableOpacity
                                onPress={handleEdit}
                                style={styles.actionButton}
                                disabled={todo.completed}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={responsive.iconSize}
                                    color={todo.completed ? theme.textSecondary : theme.primary}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onDelete(todo._id)}
                                style={styles.actionButton}
                            >
                                {/* X button with original textSecondary color */}
                                <Ionicons name="close" size={responsive.iconSize} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    animatedContainer: {
        width: '100%',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        width: '100%',
        minHeight: 52,
    },
    checkbox: {
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontWeight: '400',
        flexWrap: 'wrap',
    },
    editInput: {
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
});
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface TodoModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string }) => void;
}

export default function TodoModal({ visible, onClose, onSubmit }: TodoModalProps) {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (!visible) {
            setTitle('');
        }
    }, [visible]);

    const handleSubmit = () => {
        if (title.trim()) {
            onSubmit({ title: title.trim() });
            setTitle('');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>
                                    New Todo
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                                ]}
                                placeholder="What needs to be done?"
                                placeholderTextColor={theme.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                                autoFocus
                                onSubmitEditing={handleSubmit}
                            />

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: title.trim() ? theme.primary : theme.border },
                                ]}
                                onPress={handleSubmit}
                                disabled={!title.trim()}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.submitButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 250,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    submitButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
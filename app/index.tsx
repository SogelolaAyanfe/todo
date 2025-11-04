// app/index.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    ImageBackground,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../hooks/useTheme';
import TodoItem from '../components/TodoItem';
import TodoModal from '../components/TodoModal';
import ThemeToggle from '../components/ThemeToggle';
import { Id } from '../convex/_generated/dataModel';
import headerBg from "../assets/images/header-bg.png";
import headerBgDark from "../assets/images/background-two.png";

type Todo = {
    _id: Id<"todos">;
    title: string;
    completed: boolean;
};

export default function HomeScreen() {

    const { theme, isDark } = useTheme();
    const { width } = useWindowDimensions();

    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] =
        useState<'all' | 'active' | 'completed'>('all');

    const todos = useQuery(api.todo.getTodos);
    const createTodo = useMutation(api.todo.createTodo);
    const deleteTodo = useMutation(api.todo.deleteTodo);
    const toggleTodo = useMutation(api.todo.toggleTodo);
    const updateTodo = useMutation(api.todo.updateTodo); // Add update mutation

    const filteredTodos = todos?.filter((todo) => {
        const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && !todo.completed) ||
            (filterStatus === 'completed' && todo.completed);
        return matchesSearch && matchesFilter;
    });

    const handleSubmit = async (data: { title: string }) => {
        try {
            await createTodo({ title: data.title });
            setModalVisible(false);
        } catch {
            Alert.alert('Error', 'Failed to create todo');
        }
    };

    // Add edit handler function
    const handleEditTodo = async (id: Id<"todos">, newTitle: string) => {
        try {
            await updateTodo({ id, title: newTitle });
        } catch (error) {
            Alert.alert('Error', 'Failed to update todo');
        }
    };

    const activeCount = todos?.filter(t => !t.completed).length ?? 0;

    const isMobile = width < 500;

    return (

        <SafeAreaView style={[styles.pageWrapper, { backgroundColor: theme.surface }]}>
            {/* Header Background - FULL WIDTH, outside the container */}
            <View style={[styles.headerBackgroundWrapper, { backgroundColor: isDark ? '#121212' : 'transparent' }]}>
                <ImageBackground
                    source={isDark ? headerBgDark : headerBg}
                    resizeMode="cover"
                    style={styles.headerBg}
                >
                    <View style={[styles.headerContentContainer, { paddingHorizontal: isMobile ? 24 : 0 }]}>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>TODO</Text>
                            <ThemeToggle />
                        </View>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <View style={[
                                styles.searchBar,
                                { backgroundColor: theme.surface, borderColor: theme.border }
                            ]}>
                                <Ionicons name="search" size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.searchInput, { color: theme.text }]}
                                    placeholder="Search todos..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* Main Content - Centered with maxWidth */}
            <View style={[styles.container, { backgroundColor: theme.surface }]}>

                {/* Todo card */}
                <View style={styles.rowPadding}>
                    <View style={[styles.todoCard, { backgroundColor: theme.surface }]}>

                        {todos === undefined ? (
                            <View style={[styles.centerContainer, { paddingBottom: 40 }]}>
                                <ActivityIndicator size="large" color={theme.primary} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Loading...</Text>
                            </View>
                        ) : filteredTodos?.length === 0 ? (
                            <View style={[styles.centerContainer, { paddingBottom: 40 }]}>
                                {/* <Ionicons name="checkmark-circle-outline" size={64} color={theme.textSecondary} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    {searchQuery || filterStatus !== 'all' ? 'No todos found' : 'No todos yet. Create one!'}
                                </Text> */}
                            </View>
                        ) : (
                            <FlatList
                                data={filteredTodos}
                                renderItem={({ item }) => (
                                    <TodoItem
                                        todo={item}
                                        onToggle={(id) => toggleTodo({ id })}
                                        onDelete={(id) => deleteTodo({ id })}
                                        onEdit={handleEditTodo} // Add this prop
                                    />
                                )}
                                keyExtractor={(item) => String(item._id)}
                                contentContainerStyle={{ paddingVertical: 8 }}
                                style={{ flexGrow: 1 }}
                                showsVerticalScrollIndicator={false}
                            />
                        )}

                        {/* Footer - Different layout for mobile vs desktop */}
                        {isMobile ? (
                            // MOBILE: Only items left and clear completed
                            <View style={[styles.mobileFooter, { borderColor: theme.border }]}>
                                <Text style={[styles.itemsLeft, { color: theme.textSecondary }]}>
                                    {activeCount} {activeCount === 1 ? 'item' : 'items'} left
                                </Text>

                                <TouchableOpacity onPress={() => {
                                    const completed = todos?.filter(t => t.completed) ?? [];
                                    if (completed.length === 0) return;
                                    Alert.alert('Clear completed', `Delete ${completed.length} completed?`, [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Clear', style: 'destructive', onPress: async () => {
                                                for (const t of completed) await deleteTodo({ id: t._id });
                                            }
                                        }
                                    ]);
                                }}>
                                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Clear Completed</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // DESKTOP: All items in one row
                            <View style={[styles.filterFooter, { borderColor: theme.border }]}>
                                <Text style={[styles.itemsLeft, { color: theme.textSecondary }]}>
                                    {activeCount} {activeCount === 1 ? 'item' : 'items'} left
                                </Text>

                                <View style={styles.filterRow}>
                                    {(['all', 'active', 'completed'] as const).map(f => (
                                        <TouchableOpacity key={f} onPress={() => setFilterStatus(f)} activeOpacity={0.7}>
                                            <Text style={{
                                                color: filterStatus === f ? theme.primary : theme.textSecondary,
                                                fontWeight: filterStatus === f ? '700' : '500',
                                                fontSize: 14,
                                            }}>
                                                {f[0].toUpperCase() + f.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity onPress={() => {
                                    const completed = todos?.filter(t => t.completed) ?? [];
                                    if (completed.length === 0) return;
                                    Alert.alert('Clear completed', `Delete ${completed.length} completed?`, [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Clear', style: 'destructive', onPress: async () => {
                                                for (const t of completed) await deleteTodo({ id: t._id });
                                            }
                                        }
                                    ]);
                                }}>
                                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Clear Completed</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* MOBILE ONLY: Separate filter tabs below the todo card */}
                    {isMobile && (
                        <View style={[styles.mobileFilterContainer, { backgroundColor: theme.surface, marginTop: 15 }]}>
                            <View style={styles.mobileFilterRow}>
                                {(['all', 'active', 'completed'] as const).map(f => (
                                    <TouchableOpacity
                                        key={f}
                                        onPress={() => setFilterStatus(f)}
                                        activeOpacity={0.7}
                                        style={styles.mobileFilterTab}
                                    >
                                        <Text style={{
                                            color: filterStatus === f ? theme.primary : theme.textSecondary,
                                            fontWeight: filterStatus === f ? '700' : '500',
                                            fontSize: 14,
                                        }}>
                                            {f[0].toUpperCase() + f.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* FAB */}
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.primary }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>

                <TodoModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={handleSubmit} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pageWrapper: {
        flex: 1,
        width: '100%',
    },

    // Header Background - FULL WIDTH for all screens with dark mode support
    headerBackgroundWrapper: {
        width: '100%',
    },
    headerBg: {
        width: "100%",
        paddingTop: 60,
        paddingBottom: 48
    },

    // Header Content Container - Centers content within full-width background
    headerContentContainer: {
        width: '100%',
        maxWidth: 1440,
        alignSelf: 'center',
        paddingTop: 24,
    },
    headerContent: {
        flexDirection: 'row',
        maxWidth: 541,
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    searchContainer: {
        paddingHorizontal: 24,
    },

    // Main Content Container - Centered with maxWidth
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 1440,
        alignSelf: 'center',
    },

    // horizontal padding wrapper used for card
    rowPadding: {
        paddingHorizontal: 24
    },

    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 12,
        color: '#fff'
    },

    searchBar: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 541,
        alignSelf: 'center',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginTop: 18,
        marginBottom: 16,
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 17
    },

    // todo card
    todoCard: {
        width: '100%',
        maxWidth: 541,
        alignSelf: 'center',
        minHeight: 120,
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: -50,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    // Desktop Footer (all in one row)
    filterFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 22
    },

    // Mobile Footer (only items left and clear completed)
    mobileFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
    },

    // Mobile Filter Container (separate from todo card)
    mobileFilterContainer: {
        width: '100%',
        maxWidth: 541,
        alignSelf: 'center',
        borderRadius: 6,
        paddingVertical: 16,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    mobileFilterRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 22,
    },
    mobileFilterTab: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    itemsLeft: {
        fontSize: 14
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16
    },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 34,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
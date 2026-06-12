import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { ServerContext } from './server-context.js';
import { useRouter } from 'expo-router';

export default function CategoryList({ category, onSelect }) {
    const router = useRouter();
    
    const { server } = useContext(ServerContext);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParts = async () => {
            setLoading(true);
            try {
                const response = await server.get(`/products/category/${category}`);
                setParts(response.data);
                setError(null);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Could not load parts from server. Check your connection.");
            } finally {
                setLoading(false);
            }
        };

        if (category) fetchParts();
    }, [category, server]);

    if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.center} />;
    if (error) return <Text style={styles.errorText}>{error}</Text>;
    if (parts.length === 0) return <Text style={styles.emptyText}>No parts found for {category}.</Text>;

    const renderPart = ({ item }) => (
        <View style={styles.card}>
            <Image 
                source={{ uri: item.image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png" }} 
                style={styles.image} 
                resizeMode="contain"
            />
            <View style={styles.details}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₪{item.price}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity 
                        style={[styles.addBtn, { flex: 1, backgroundColor: '#6c757d' }]} 
                        onPress={() => router.push(`/product/${item._id}`)}
                    >
                        <Text style={styles.addBtnText}>View Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.addBtn, { flex: 1 }]} 
                        onPress={() => onSelect(item)}
                    >
                        <Text style={styles.addBtnText}>Add to PC</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <FlatList
            data={parts}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderPart}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 50
    },
    errorText: { 
        color: 'red', 
        textAlign: 'center', 
        marginTop: 20 
    },
    emptyText: { 
        color: '#888', 
        textAlign: 'center', 
        marginTop: 20, 
        fontSize: 16 
    },
    listContainer: { paddingBottom: 20 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    image: { 
        width: 80, 
        height: 80, 
        marginRight: 15 
    },
    details: { 
        flex: 1, 
        justifyContent: 'center' 
    },
    name: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#333', 
        marginBottom: 5 
    },
    price: { 
        fontSize: 16, 
        color: '#007AFF', 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    addBtn: { 
        backgroundColor: '#007AFF', 
        paddingVertical: 8, 
        borderRadius: 6, 
        alignItems: 'center' 
    },
    addBtnText: { 
        color: '#fff', 
        fontWeight: 'bold' 
    }
});
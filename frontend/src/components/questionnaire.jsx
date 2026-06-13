import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Questionnaire({ onClose, onBuildGenerated }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>🤖 Smart Questionnaire (Coming Soon)</Text>
            
            <TouchableOpacity style={styles.btn} onPress={onClose}>
                <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    text: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    btn: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});
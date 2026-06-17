export const generateSpecBuilderStyles = (colors, isLandscape) => ({
    container: { flex: 1, backgroundColor: colors.background },
    
    header: { 
        padding: 20, 
        backgroundColor: colors.cardBackground, 
        borderBottomWidth: 1, 
        borderColor: colors.borderColor 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        marginBottom: 10 
    },
    headerActionsRow: { 
        flexDirection: 'row', 
        gap: 10 
    },
    headerBtn: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    headerBtnText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 14 
    },
    feedbackMsg: { 
        marginTop: 10, 
        textAlign: 'center', 
        fontWeight: 'bold' 
    },
    
    gridContainer: { 
        padding: 15, 
        paddingBottom: 30 
    },
    card: { 
        backgroundColor: colors.cardBackground, 
        borderRadius: 12, 
        marginBottom: 15, 
        padding: 15, 
        borderWidth: 1, 
        borderColor: colors.borderColor, 
        elevation: 2 
    },
    cardHeader: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        borderBottomWidth: 1, 
        borderColor: colors.borderColor, 
        paddingBottom: 10, 
        marginBottom: 10 
    },
    cardBody: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        minHeight: 60, 
        gap: 15 
    },
    partImage: { width: 50, height: 50 },
    partDetails: { flex: 1 },
    partName: { 
        fontSize: 14, 
        color: colors.textMain, 
        fontWeight: '500' 
    },
    partPrice: { 
        fontSize: 16, 
        color: colors.primaryAccent, 
        fontWeight: 'bold', 
        marginTop: 4 
    },
    placeholderText: { 
        color: colors.textGrey, 
        fontStyle: 'italic', 
        flex: 1, 
        textAlign: 'center' 
    },
    cardFooter: { 
        flexDirection: 'row', 
        gap: 10, 
        marginTop: 15 
    },
    chooseBtn: { 
        flex: 1, 
        backgroundColor: colors.primaryAccent, 
        padding: 10, 
        borderRadius: 6, 
        alignItems: 'center' 
    },
    chooseBtnText: { color: '#fff', fontWeight: 'bold' },
    clearBtn: { 
        backgroundColor: colors.errorRed, 
        padding: 10, 
        borderRadius: 6, 
        alignItems: 'center', 
        paddingHorizontal: 20 
    },
    clearBtnText: { color: '#fff', fontWeight: 'bold' },

    footer: { 
        padding: 20, 
        backgroundColor: colors.cardBackground, 
        borderTopWidth: 1, 
        borderColor: colors.borderColor 
    },
    totalText: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        textAlign: 'center', 
        marginBottom: 15 
    },
    saveBtn: { 
        backgroundColor: colors.successGreen, 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    saveBtnText: { color: '#1C1C1E', fontSize: 16, fontWeight: 'bold' },
    footerMsg: {
        color: colors.errorRed,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 10,
        fontWeight: 'bold'
    },

    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end' 
    },
    modalContent: { 
        backgroundColor: colors.background, 
        height: '85%', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20, 
        padding: 20 
    },
    smallModalContent: {
        width: '100%',
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 25,
        borderWidth: 1,
        borderColor: colors.borderColor
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: colors.textMain 
    },
    closeModalText: { 
        color: colors.errorRed, 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.background,
        color: colors.textMain,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        marginTop: 10
    },
    modalActions: { flexDirection: 'row', gap: 10 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalCancelBtn: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderColor },
    modalSubmitBtn: { backgroundColor: colors.primaryAccent }
});
export const generateSummaryStyles = (colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: colors.errorRed, fontSize: 16, fontWeight: 'bold' },
    
    header: { 
        padding: 20, 
        paddingTop: 40,
        backgroundColor: colors.cardBackground, 
        borderBottomWidth: 1, 
        borderColor: colors.borderColor,
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: colors.textMain, 
        marginLeft: 15
    },
    
    listContainer: { padding: 20, paddingBottom: 40 },
    partRow: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderColor,
        alignItems: 'center'
    },
    categoryTag: {
        fontSize: 12,
        color: colors.textGrey,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 4
    },
    partName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textMain,
        flex: 1
    },
    partPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primaryAccent,
        marginLeft: 10
    },

    footer: {
        padding: 20,
        backgroundColor: colors.cardBackground,
        borderTopWidth: 1,
        borderColor: colors.borderColor
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    totalLabel: { fontSize: 20, fontWeight: 'bold', color: colors.textMain },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: colors.primaryAccent },
    
    actionRow: { flexDirection: 'row', gap: 10 },
    actionBtn: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderColor
    },
    actionBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.textMain },
    saveProfileBtn: {
        backgroundColor: colors.successGreen,
        borderWidth: 0
    },
    saveProfileBtnText: { color: '#1C1C1E' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 25,
        borderWidth: 1,
        borderColor: colors.borderColor
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textMain, marginBottom: 15 },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.background,
        color: colors.textMain,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20
    },
    modalActions: { flexDirection: 'row', gap: 10 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalCancelBtn: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderColor },
    modalSaveBtn: { backgroundColor: colors.primaryAccent },
});
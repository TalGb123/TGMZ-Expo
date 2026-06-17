export const generateInventoryStyles = (colors) => ({
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20
    },
    errorText: {
        color: colors.errorRed,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    
    // Header & Controls
    header: {
        padding: 15,
        backgroundColor: colors.cardBackground,
        borderBottomWidth: 1,
        borderColor: colors.borderColor
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textMain,
        marginBottom: 15
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10
    },
    searchInput: {
        flex: 1,
        height: 44,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 8,
        paddingHorizontal: 12,
        color: colors.textMain
    },
    addBtn: {
        backgroundColor: colors.primaryAccent,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 8
    },
    addBtnText: {
        color: '#1C1C1E',
        fontWeight: 'bold'
    },
    categoryScroll: {
        paddingBottom: 5
    },
    
    // Product List
    listContainer: {
        padding: 15,
        paddingBottom: 40
    },
    productCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderColor
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textMain,
        flex: 1,
        marginRight: 10
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primaryAccent
    },
    stockText: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1
    },
    editBtn: {
        backgroundColor: colors.background,
        borderColor: colors.borderColor
    },
    deleteBtn: {
        backgroundColor: colors.errorRed + '20',
        borderColor: colors.errorRed
    },

    // Modal Form Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: colors.background,
        height: '90%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20
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
    closeText: {
        color: colors.errorRed,
        fontWeight: 'bold',
        fontSize: 16
    },
    
    // Form Inputs
    formGroup: {
        marginBottom: 18
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMain,
        marginBottom: 8
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 8,
        padding: 12,
        color: colors.textMain,
        fontSize: 15
    },
    
    // Selectors & Pills (Mobile alternative to <select> and <datalist>)
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8
    },
    pill: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.borderColor
    },
    pillActive: {
        backgroundColor: colors.primaryAccent,
        borderColor: colors.primaryAccent
    },
    pillText: {
        color: colors.textMain,
        fontSize: 13
    },
    pillTextActive: {
        color: '#1C1C1E',
        fontWeight: 'bold'
    },
    
    // Connection Builder
    connectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10
    },
    connectionInput: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 6,
        width: 60,
        padding: 8,
        color: colors.textMain,
        textAlign: 'center'
    },
    connectionLabel: {
        color: colors.textMain,
        flex: 1,
        fontSize: 14
    },
    
    // Form Actions
    modalActionRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
        marginBottom: 40
    },
    modalSubmitBtn: {
        flex: 2,
        backgroundColor: colors.successGreen,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    modalCancelBtn: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.borderColor,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center'
    }
});
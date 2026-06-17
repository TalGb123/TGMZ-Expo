export const generateProductsStyles = (colors, isLandscape, screenWidth) => ({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: isLandscape ? 40 : 20, paddingBottom: 40 },
    listViewWrapper: { flex: 1, padding: 20 },
    pageTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30, color: colors.textMain },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: isLandscape ? "flex-start" : "space-between", gap: 15 },
    categoryBubble: { width: isLandscape ? (screenWidth - 125) / 4 : "47%", backgroundColor: colors.cardBackground, paddingVertical: 20, paddingHorizontal: 10, borderRadius: 15, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 5, borderWidth: 1, borderColor: colors.borderColor },
    bubbleImage: { width: isLandscape ? 45 : 55, height: isLandscape ? 45 : 55, marginBottom: 12 },
    bubbleText: { fontSize: 15, fontWeight: "600", color: colors.textMain, textAlign: "center" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    activeCategoryTitle: { fontSize: 22, fontWeight: "bold", color: colors.textMain },
    backBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.cardBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.borderColor },
    backBtnText: { fontSize: 14, fontWeight: "600", color: colors.textMain },
    listWrapper: { flex: 1 }
});
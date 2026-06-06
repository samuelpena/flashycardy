import SwiftUI

enum UpgradePrompt {
    static func shouldOpenPricing(for error: Error) -> Bool {
        guard let apiError = error as? ApiError else { return false }
        if apiError.statusCode == 403 {
            return apiError.message.contains("Pro plan")
                || apiError.message.contains("Deck limit")
        }
        return false
    }
}

struct PricingSafariLink: View {
    @State private var showPricing = false

    var body: some View {
        Button(L10n.CreateDeck.viewPlans) {
            showPricing = true
        }
        .sheet(isPresented: $showPricing) {
            SafariView(url: .flashycardyPricing)
        }
    }
}

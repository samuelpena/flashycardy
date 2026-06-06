import ClerkKit
import ClerkKitUI
import SwiftUI

struct ProfileToolbarButton: View {
    @Binding var authSheetPresented: Bool

    var body: some View {
        UserButton(signedOutContent: {
            Button(L10n.Auth.signIn) {
                authSheetPresented = true
            }
        })
    }
}

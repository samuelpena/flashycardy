import SwiftUI

/// Landing screen for signed-out users (mirrors extension `AuthGateScreen`).
struct AuthGateView: View {
    let onSignIn: () -> Void
    let onSignUp: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 8) {
                Text(L10n.Common.appName)
                    .font(.largeTitle.bold())
                    .foregroundStyle(.primary)
                    .accessibilityIdentifier(AccessibilityID.Auth.appName)

                Text(loc("HomePage.tagline"))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                Text(loc("Extension.authHint"))
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                    .multilineTextAlignment(.center)
                    .padding(.top, 4)
            }
            .padding(.horizontal, 24)

            VStack(spacing: 12) {
                Button(action: onSignIn) {
                    Text(L10n.Auth.signIn)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .accessibilityIdentifier(AccessibilityID.Auth.signIn)

                Button(action: onSignUp) {
                    Text(L10n.Auth.signUp)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)
                .accessibilityIdentifier(AccessibilityID.Auth.signUp)
            }
            .padding(.horizontal, 32)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("auth.gate")
    }

    private func loc(_ key: String) -> String {
        let locale = LocaleManager.currentLocale
        let resource = LocalizedStringResource(
            String.LocalizationValue(stringLiteral: key),
            locale: locale
        )
        return String(localized: resource)
    }
}

#Preview {
    AuthGateView(onSignIn: {}, onSignUp: {})
}

import SwiftUI

/// Landing screen for signed-out users (mirrors extension `AuthGateScreen`).
struct AuthGateView: View {
    let onSignIn: () -> Void
    let onSignUp: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 8) {
                Text("Flashycardy")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.primary)

                Text("Your personal flashcard platform")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                Text("Sign in with the same account you use on the web app.")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                    .multilineTextAlignment(.center)
                    .padding(.top, 4)
            }
            .padding(.horizontal, 24)

            VStack(spacing: 12) {
                Button(action: onSignIn) {
                    Text("Sign in")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)

                Button(action: onSignUp) {
                    Text("Sign up")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)
            }
            .padding(.horizontal, 32)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

#Preview {
    AuthGateView(onSignIn: {}, onSignUp: {})
}

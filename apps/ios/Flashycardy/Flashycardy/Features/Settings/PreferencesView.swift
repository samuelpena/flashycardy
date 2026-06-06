import ClerkKit
import SwiftUI

struct PreferencesView: View {
    @Environment(Clerk.self) private var clerk
    @Environment(LocaleManager.self) private var localeManager

    @State private var draftLocale: AppLocale = .en
    @State private var baselineLocale: AppLocale = .en
    @State private var isSaving = false
    @State private var saveMessage: String?

    private var isDirty: Bool { draftLocale != baselineLocale }

    var body: some View {
        let _ = localeManager.appLocale
        Form {
            Section {
                Picker(L10n.Settings.language, selection: $draftLocale) {
                    ForEach(AppLocale.allCases) { locale in
                        Text(L10n.Settings.languageOption(locale)).tag(locale)
                    }
                }
            } footer: {
                Text(helperText)
            }

            Section {
                Button(L10n.Settings.save) {
                    Task { await save() }
                }
                .disabled(!isDirty || isSaving)
            }
        }
        .navigationTitle(L10n.Settings.title)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            draftLocale = localeManager.appLocale
            baselineLocale = localeManager.appLocale
        }
        .onChange(of: localeManager.appLocale) { _, newValue in
            draftLocale = newValue
            baselineLocale = newValue
            saveMessage = nil
        }
    }

    private var helperText: String {
        if isSaving { return L10n.Settings.helperSaving }
        return saveMessage ?? L10n.Settings.helperDefault
    }

    private func save() async {
        guard isDirty, !isSaving else { return }
        isSaving = true
        saveMessage = nil

        do {
            try await localeManager.save(language: draftLocale, clerk: clerk)
            baselineLocale = draftLocale
            saveMessage = L10n.Settings.saved
        } catch {
            saveMessage = L10n.Settings.saveError
        }

        isSaving = false
    }
}

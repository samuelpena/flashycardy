import SwiftUI
import UniformTypeIdentifiers

private enum CreateDeckTab: String, CaseIterable, Identifiable {
    case manual
    case document

    var id: String { rawValue }
}

enum DocumentUploadTypes {
    static let allowed: [UTType] = [
        .pdf,
        UTType(filenameExtension: "docx") ?? .data,
        UTType(filenameExtension: "pptx") ?? .data,
    ]

    static func isSupported(fileName: String) -> Bool {
        let lower = fileName.lowercased()
        return lower.hasSuffix(".pdf") || lower.hasSuffix(".docx") || lower.hasSuffix(".pptx")
    }
}

struct CreateDeckSheet: View {
    let deckCount: Int
    let hasUnlimitedDecks: Bool?
    let onCreated: (_ deckUuid: String?) async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var tab: CreateDeckTab = .manual
    @State private var name = ""
    @State private var description = ""
    @State private var selectedFileName: String?
    @State private var selectedFileData: Data?
    @State private var isSubmitting = false
    @State private var errorMessage: String?
    @State private var showPricing = false
    @State private var showFilePicker = false

    @InjectAPI private var api

    private var limitReached: Bool {
        hasUnlimitedDecks == false && deckCount >= AppConstants.freeDeckLimit
    }

    var body: some View {
        NavigationStack {
            Group {
                if limitReached {
                    limitReachedContent
                } else {
                    mainContent
                }
            }
            .navigationTitle(L10n.CreateDeck.dialogTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L10n.Common.cancel) { dismiss() }
                }
                if !limitReached {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(confirmTitle) {
                            Task { await submit() }
                        }
                        .disabled(isSubmitting || !canSubmit)
                    }
                }
            }
            .sheet(isPresented: $showPricing) {
                SafariView(url: .flashycardyPricing)
            }
            .fileImporter(
                isPresented: $showFilePicker,
                allowedContentTypes: DocumentUploadTypes.allowed,
                allowsMultipleSelection: false
            ) { result in
                handleImportedFile(result)
            }
        }
    }

    private var confirmTitle: String {
        switch tab {
        case .manual:
            isSubmitting ? L10n.CreateDeck.creating : L10n.CreateDeck.createDeck
        case .document:
            isSubmitting ? L10n.CreateDeck.generating : L10n.CreateDeck.generateDeck
        }
    }

    private var canSubmit: Bool {
        switch tab {
        case .manual:
            !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        case .document:
            selectedFileData != nil && selectedFileName != nil
        }
    }

    private var mainContent: some View {
        Form {
            Picker("Mode", selection: $tab) {
                Text(L10n.CreateDeck.tabManual).tag(CreateDeckTab.manual)
                Text(L10n.CreateDeck.tabDocument).tag(CreateDeckTab.document)
            }
            .pickerStyle(.segmented)
            .listRowBackground(Color.clear)

            switch tab {
            case .manual:
                manualSection
            case .document:
                documentSection
            }

            if let errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.footnote)
                }
            }
        }
    }

    private var manualSection: some View {
        Section {
            TextField(L10n.CreateDeck.namePlaceholder, text: $name)
            TextField(L10n.CreateDeck.descriptionPlaceholder, text: $description, axis: .vertical)
                .lineLimit(3...6)
        } footer: {
            Text(L10n.CreateDeck.dialogDescription)
        }
    }

    private var documentSection: some View {
        Section {
            Text(L10n.CreateDeck.docIntro)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Button(L10n.CreateDeck.chooseFile) {
                showFilePicker = true
            }

            if let selectedFileName {
                LabeledContent(L10n.CreateDeck.selected, value: selectedFileName)
            } else {
                Text(L10n.CreateDeck.noFileSelected)
                    .foregroundStyle(.secondary)
            }
        } footer: {
            Text(L10n.CreateDeck.docHint(maxMb: AppConstants.documentMaxMegabytes))
        }
    }

    private var limitReachedContent: some View {
        VStack(spacing: 16) {
            Text(L10n.CreateDeck.limitTitle)
                .font(.title3.bold())
            Text(L10n.CreateDeck.limitDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            PricingSafariLink()
        }
        .padding(24)
    }

    private func handleImportedFile(_ result: Result<[URL], Error>) {
        errorMessage = nil
        guard case .success(let urls) = result, let url = urls.first else { return }

        guard url.startAccessingSecurityScopedResource() else { return }
        defer { url.stopAccessingSecurityScopedResource() }

        let fileName = url.lastPathComponent
        guard DocumentUploadTypes.isSupported(fileName: fileName) else {
            errorMessage = L10n.Actions.unsupportedFileType
            return
        }

        do {
            let data = try Data(contentsOf: url)
            guard !data.isEmpty, data.count <= AppConstants.documentMaxBytes else {
                errorMessage = L10n.Actions.fileSizeExceeded
                return
            }
            selectedFileName = fileName
            selectedFileData = data
        } catch {
            errorMessage = L10n.Common.tryAgain
        }
    }

    private func submit() async {
        isSubmitting = true
        errorMessage = nil

        do {
            switch tab {
            case .manual:
                try await submitManual()
            case .document:
                try await submitDocument()
            }
        } catch {
            if UpgradePrompt.shouldOpenPricing(for: error) || ApiErrorMessage.isDeckLimitError(error) {
                showPricing = true
            }
            errorMessage = ApiErrorMessage.message(for: error)
        }

        isSubmitting = false
    }

    private func submitManual() async throws {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }

        var input = CreateDeckInput(name: trimmedName)
        let trimmedDescription = description.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedDescription.isEmpty {
            input.description = trimmedDescription
        }
        _ = try await api.decks.create(input)
        dismiss()
        await onCreated(nil)
    }

    private func submitDocument() async throws {
        guard let selectedFileData, let selectedFileName else { return }

        let result = try await api.decks.createFromDocument(
            CreateDeckFromDocumentInput(
                fileBase64: selectedFileData.base64EncodedString(),
                fileName: selectedFileName
            )
        )
        dismiss()
        await onCreated(result.deckUuid)
    }
}

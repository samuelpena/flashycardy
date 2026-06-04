import Foundation

enum LoadErrorMessage {
  /// Maps load failures to actionable copy for the dashboard and other screens.
  static func userFacing(_ error: Error) -> String {
    if let apiError = error as? ApiError {
      if apiError.statusCode == 401 {
        return "Your session expired or is not ready yet. Pull to refresh or sign out and sign in again."
      }
      return apiError.message
    }

    if let urlError = error as? URLError {
      switch urlError.code {
      case .cannotConnectToHost, .networkConnectionLost, .notConnectedToInternet:
        return """
        Cannot reach the server at \(AppConfig.apiBaseURL.absoluteString). \
        Start the web app with `pnpm dev:web` (Simulator) or use your Mac's IP instead of 127.0.0.1 on a physical device.
        """
      default:
        break
      }
    }

    return ApiErrorMessage.message(for: error)
  }
}

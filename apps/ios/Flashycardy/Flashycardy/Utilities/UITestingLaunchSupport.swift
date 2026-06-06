import Foundation

#if DEBUG
enum UITestingLaunchSupport {
    static var forceAuthGate: Bool {
        ProcessInfo.processInfo.arguments.contains("-UITestingForceAuthGate")
            || ProcessInfo.processInfo.environment["UITestingForceAuthGate"] == "1"
    }
}
#endif

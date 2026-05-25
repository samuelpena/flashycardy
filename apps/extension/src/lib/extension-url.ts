/** Base `chrome-extension://<id>/` URL without trailing slash. */
export function getExtensionBaseUrl(): string {
  return chrome.runtime.getURL(".").replace(/\/$/, "");
}

export function getSidepanelUrl(hashPath = ""): string {
  const path = hashPath.startsWith("#") ? hashPath : hashPath ? `#${hashPath}` : "";
  return `${getExtensionBaseUrl()}/sidepanel.html${path}`;
}

export function getAuthCallbackUrl(): string {
  return `${getExtensionBaseUrl()}/auth-callback.html`;
}

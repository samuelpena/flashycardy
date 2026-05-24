export type StudyCard = {
  uuid: string;
  front: string;
  back: string;
};

export type StudySessionCardResult = {
  cardUuid: string;
  isCorrect: boolean;
};

export type FieldErrorShape = {
  fieldErrors: Record<string, string[] | undefined>;
};

export type ActionError = string | FieldErrorShape;

export function getActionErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "fieldErrors" in error) {
    const fieldErrors = (error as FieldErrorShape).fieldErrors;
    const first = Object.values(fieldErrors).flat()[0];
    return first ?? fallback;
  }
  return fallback;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("read"));
        return;
      }
      const comma = dataUrl.indexOf(",");
      const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

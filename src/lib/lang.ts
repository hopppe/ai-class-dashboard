export const getStoredLang = (): "en" | "ar" => {
  try {
    return localStorage.getItem("lang") === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
};

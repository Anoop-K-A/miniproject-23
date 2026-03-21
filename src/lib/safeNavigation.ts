export function safelyNavigate(action: () => void | Promise<unknown>) {
  try {
    const result = action();

    if (
      typeof result === "object" &&
      result !== null &&
      "catch" in result &&
      typeof (result as Promise<unknown>).catch === "function"
    ) {
      void (result as Promise<unknown>).catch((error) => {
        console.error("Navigation error:", error ?? "Unknown navigation error");
      });
    }
  } catch (error) {
    console.error("Navigation error:", error ?? "Unknown navigation error");
  }
}

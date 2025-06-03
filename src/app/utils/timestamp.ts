export const formattedTimestamp = (rawTimeStamp: string | number | Date): string => {
  try {
    const date = new Date(rawTimeStamp);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch (err) {
    console.error("Invalid timestamp:", rawTimeStamp);
    return "-";
  }
};
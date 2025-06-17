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

export const formattedTimestampTerminal = (rawTimeStamp: string | number | Date): string => {
  try {
    const date = new Date(rawTimeStamp);
    const month = date.toLocaleString("en-US", { month: "short" }); 
    const year = date.toLocaleString("en-US", {year: "numeric"})
    const day = String(date.getDate()).padStart(2, "0");            
    const hours = String(date.getHours()).padStart(2, "0");          
    const minutes = String(date.getMinutes()).padStart(2, "0");      
    const seconds = String(date.getSeconds()).padStart(2, "0");      
    const miliseconds = String(date.getMilliseconds()).padStart(2, "0");      
    
    return `${year} ${month} ${day} ${hours}:${minutes}:${seconds}:${miliseconds}`;
  } catch (err) {
    console.error("Invalid timestamp:", rawTimeStamp);
    return "-";
  }
};
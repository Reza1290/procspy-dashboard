const timestampFormat = ({ rawTimeStamp }) => {
    const timestamp = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    return timestamp.format(new Date(rawTimeStamp));
};

export const formattedTimestamp = (rawTimeStamp:string) => timestampFormat({ rawTimeStamp });
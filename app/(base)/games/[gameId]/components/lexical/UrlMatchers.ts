export const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const AUTOLINK_MATCHERS = [
    (text: string) => {
        const match = URL_REGEX.exec(text);
        if (!match) return null;
        const url = match[0];
        return {
            index: match.index,
            length: url.length,
            text: url,
            url: url.startsWith("http") ? url : `https://${url}`,
        };
    },
];

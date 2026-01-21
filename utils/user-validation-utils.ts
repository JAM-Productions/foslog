export const isUserEmailOk = (value: string) => {
    if (value === '') {
        return false;
    }

    const emailRegex =
        /^[a-zA-Z0-9_+-]+([.][a-zA-Z0-9_+-]+)*@[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
        return false;
    }

    return true;
};

export const dateOnly = (date: Date) => {
    return new Date(date.toISOString().split('T')[0]);
};

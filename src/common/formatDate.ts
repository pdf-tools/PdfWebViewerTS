export const formatDate = (dateStr: string) =>
  `${dateStr.substr(8, 2)}.${dateStr.substr(6, 2)}.${dateStr.substr(
    2,
    4,
  )} ${dateStr.substr(10, 2)}:${dateStr.substr(12, 2)}`

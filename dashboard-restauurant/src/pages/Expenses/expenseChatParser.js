export const EXPENSE_FIELDS = [
  {
    key: 'ha',
    label: 'Tiền nhà',
    aliases: ['tien thue nha', 'tien nha', 'nha'],
  },
  { key: 'gao', label: 'Tiền gạo', aliases: ['tien gao', 'gao'] },
  { key: 'cho', label: 'Tiền chợ', aliases: ['tien cho', 'cho'] },
  { key: 'kho', label: 'Tiền khô', aliases: ['tien kho', 'kho'] },
  { key: 'gas', label: 'Tiền gas', aliases: ['tien gas', 'gas'] },
  { key: 'dau', label: 'Tiền dầu', aliases: ['tien dau', 'dau'] },
  { key: 'trung', label: 'Trứng', aliases: ['tien trung', 'trung'] },
  { key: 'hop', label: 'Tiền hộp', aliases: ['tien hop', 'hop'] },
  { key: 'luong', label: 'Tiền lương', aliases: ['tien luong', 'luong'] },
  { key: 'ga', label: 'Tiền gà', aliases: ['tien ga', 'ga'] },
  { key: 'khac', label: 'Tiền khác', aliases: ['tien khac', 'khac'] },
];

const normalizeText = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();

const pad = (value) => String(value).padStart(2, '0');

const toIsoDate = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return `${year}-${pad(month)}-${pad(day)}`;
};

const readDate = (text, today) => {
  const todayDate = new Date(`${today}T00:00:00`);
  const relativeDate = text.match(/\b(hom nay|hom qua)\b/);
  if (relativeDate) {
    if (relativeDate[1] === 'hom qua')
      todayDate.setDate(todayDate.getDate() - 1);
    return {
      date: `${todayDate.getFullYear()}-${pad(todayDate.getMonth() + 1)}-${pad(todayDate.getDate())}`,
      text: text.replace(relativeDate[0], ' '),
    };
  }

  const patterns = [
    {
      regex: /\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/,
      parts: (match) => [Number(match[1]), Number(match[2]), Number(match[3])],
    },
    {
      regex:
        /\b(?:ngay\s+)?(\d{1,2})\s+thang\s+(\d{1,2})(?:\s+nam\s+(\d{4}))?\b/,
      parts: (match) => [
        Number(match[3] || today.slice(0, 4)),
        Number(match[2]),
        Number(match[1]),
      ],
    },
    {
      regex: /\b(\d{1,2})[/.](\d{1,2})(?:[/.](\d{4}))?\b/,
      parts: (match) => [
        Number(match[3] || today.slice(0, 4)),
        Number(match[2]),
        Number(match[1]),
      ],
    },
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const [year, month, day] = pattern.parts(match);
    const date = toIsoDate(year, month, day);
    if (date) return { date, text: text.replace(match[0], ' ') };
  }

  return { date: today, text };
};

const parseAmount = (segment) => {
  const match = segment.match(/(\d[\d.,]*)(?:\s*(trieu|nghin|ngan|k)\b)?/);
  if (!match) return null;

  const raw = match[1];
  const separators = [...raw.matchAll(/[.,]/g)].map((entry) => entry.index);
  let normalized = raw;
  if (separators.length) {
    const lastSeparator = separators[separators.length - 1];
    const decimals = raw.length - lastSeparator - 1;
    if (separators.length > 1 && decimals !== 3) {
      normalized = `${raw.slice(0, lastSeparator).replace(/[.,]/g, '')}.${raw.slice(lastSeparator + 1)}`;
    } else if (decimals === 3 || separators.length > 1) {
      normalized = raw.replace(/[.,]/g, '');
    } else {
      normalized = raw.replace(/[.,]/, '.');
    }
  }

  let amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  if (match[2] === 'k' || match[2] === 'nghin' || match[2] === 'ngan')
    amount *= 1000;
  if (match[2] === 'trieu') amount *= 1000000;
  return amount;
};

export function parseExpenseMessage(message, today) {
  const { date, text } = readDate(normalizeText(message), today);
  const matches = [];

  EXPENSE_FIELDS.forEach((field) => {
    const aliases = field.aliases
      .slice()
      .sort((first, second) => second.length - first.length)
      .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const matcher = new RegExp(`\\b(?:${aliases.join('|')})\\b`, 'g');
    let match;
    while ((match = matcher.exec(text)) !== null) {
      matches.push({
        key: field.key,
        label: field.label,
        index: match.index,
        end: matcher.lastIndex,
      });
    }
  });

  if (!matches.length) {
    return {
      error:
        'Mình chưa nhận ra hạng mục chi. Hãy thử ghi “tiền chợ 5436, tiền khác 3000”.',
    };
  }

  matches.sort((first, second) => first.index - second.index);
  const amounts = Object.fromEntries(EXPENSE_FIELDS.map(({ key }) => [key, 0]));
  const detected = new Set();
  const missing = new Set();

  matches.forEach((match, index) => {
    const nextMatch = matches[index + 1];
    const segment = text.slice(match.end, nextMatch?.index ?? text.length);
    const amount = parseAmount(segment);
    if (amount === null) {
      missing.add(match.label);
      return;
    }
    amounts[match.key] += amount;
    detected.add(match.key);
  });

  if (missing.size) {
    const missingLabels = [...missing].filter((label) => {
      const field = EXPENSE_FIELDS.find((entry) => entry.label === label);
      return field && !detected.has(field.key);
    });
    if (missingLabels.length) {
      return {
        error: `Mình chưa thấy số tiền cho ${missingLabels.join(', ')}.`,
      };
    }
  }

  if (![...detected].some((key) => amounts[key] > 0)) {
    return { error: 'Phiếu chưa có khoản nào lớn hơn 0.' };
  }

  return {
    date,
    amounts,
    categories: EXPENSE_FIELDS.filter(
      (field) => detected.has(field.key) && amounts[field.key] > 0
    ),
  };
}

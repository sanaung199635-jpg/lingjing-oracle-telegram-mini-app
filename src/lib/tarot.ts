export const tarotDeck = [
  "愚者",
  "魔术师",
  "女祭司",
  "皇帝",
  "恋人",
  "战车",
  "力量",
  "隐者",
  "命运之轮",
  "正义",
  "倒吊人",
  "死神",
  "节制",
  "恶魔",
  "高塔",
  "星星",
  "月亮",
  "太阳",
  "审判",
  "世界"
];

export function drawTarotCards(count = 3) {
  return [...tarotDeck].sort(() => Math.random() - 0.5).slice(0, count);
}

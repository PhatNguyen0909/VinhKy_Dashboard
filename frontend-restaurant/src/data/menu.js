export const categories = [
  { id: "all", label: "Tất cả món", icon: "✦" },
  { id: "com-ga", label: "Cơm gà", icon: "🍚" },
  { id: "mi-xao", label: "Mì xào giòn", icon: "🍜" },
  { id: "com-chien", label: "Cơm chiên", icon: "🥢" },
  { id: "combo", label: "Combo", icon: "🍱" },
  { id: "nuoc", label: "Nước uống", icon: "🥤" },
];

export const products = [
  {
    id: "chicken-rice",
    name: "Cơm Gà Hải Nam",
    category: "com-ga",
    description: "Gà luộc mềm mọng, cơm thơm nấu từ nước gà.",
    price: 55000,
    rating: "4.9",
    tag: "BÁN CHẠY",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85",
    imageDescription: "Cơm gà Hải Nam",
  },
  {
    id: "crispy-chicken",
    name: "Cơm Gà Xối Mỡ",
    category: "com-ga",
    description: "Da gà vàng giòn, cơm gà dẻo thơm đậm đà.",
    price: 55000,
    rating: "4.8",
    tag: "ĐƯỢC YÊU THÍCH",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=85",
    imageDescription: "Cơm gà xối mỡ vàng giòn",
    softTag: true,
  },
  {
    id: "seafood-noodles",
    name: "Mì Xào Giòn Hải Sản",
    category: "mi-xao",
    description: "Mì giòn rụm, hải sản tươi và rau xanh.",
    price: 65000,
    rating: "4.9",
    tag: "BÁN CHẠY",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=85",
    imageDescription: "Mì xào giòn hải sản cùng rau xanh",
  },
  {
    id: "fried-rice",
    name: "Cơm Chiên Gà Xé",
    category: "com-chien",
    description: "Cơm chiên tơi thơm, gà xé và rau củ tươi.",
    price: 50000,
    rating: "4.8",
    tag: "MÓN QUEN",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=85",
    imageDescription: "Cơm chiên vàng thơm với rau củ",
    softTag: true,
  },
  {
    id: "combo",
    name: "Combo Vĩnh Ký",
    category: "combo",
    description: "2 phần ăn tự chọn kèm 2 nước mát lạnh.",
    price: 119000,
    rating: "4.9",
    tag: "TIẾT KIỆM 20%",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85",
    imageDescription: "Combo phần ăn Vĩnh Ký đầy đủ",
  },
  {
    id: "iced-tea",
    name: "Trà Tắc Mật Ong",
    category: "nuoc",
    description: "Chua ngọt dịu nhẹ, giải nhiệt sảng khoái.",
    price: 18000,
    rating: "4.8",
    tag: "MÁT LẠNH",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=85",
    imageDescription: "Ly trà tắc mát lạnh",
    softTag: true,
  },
];

export const combos = {
  standard: { name: "Combo Vĩnh Ký", price: 119000 },
  group: { name: "Combo Nhóm", price: 249000 },
};

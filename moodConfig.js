// src/mood/moodConfig.js

export const MOOD_CONFIG = {
  happy: {
    key: "happy",
    label: "Mutlu",
    emoji: "😊",
    bgColor: "#FFE4E6", // pembe pastel
    accent: "#FB7185",
    message: "Harika gidiyorsun, bu enerjiyi kaybetme! ✨",
  },
  tired: {
    key: "tired",
    label: "Yorgun",
    emoji: "😴",
    bgColor: "#E0F2FE", // açık mavi
    accent: "#38BDF8",
    message: "Yorgun olsan bile her dakika değerli. Yavaş ama emin adım. 💙",
  },
  stressed: {
    key: "stressed",
    label: "Stresli",
    emoji: "😵",
    bgColor: "#FEF3C7", // hafif sarı
    accent: "#FACC15",
    message: "Derin bir nefes al, küçük parçalar hâlinde ilerle. 🌿",
  },
  focused: {
    key: "focused",
    label: "Odaklı",
    emoji: "🎯",
    bgColor: "#E0F7F1", // hafif mint
    accent: "#22C55E",
    message: "Odak yerinde, hedefe kilitlendin. Devam! 💪",
  },
};

export const MOOD_KEYS = Object.keys(MOOD_CONFIG);

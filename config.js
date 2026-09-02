/*
 * Cấu hình công khai của giao diện GitHub Pages.
 * URL /exec bên dưới là bản triển khai chính thức của Google Apps Script.
 */
window.IELTS_READING_CONFIG = Object.freeze({
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbz4oph00IB6X9SlUYrK65Vsjrnd_mfm2wUg-BKZCLQnBpT6kKA-sTmFIHK1HY3ZURI/exec",
  vocabFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSenCUUUZYcpZowQEpXCkJliGB15dmbiiWef2w8XoFnIABdq8Q/viewform?usp=pp_url",
});

// Public routes use opaque slugs so sequential test and passage URLs cannot be guessed.
// The lesson/full-test lookup tables are deliberately separate from the assessment data.
window.IELTS_READING_ROUTES = Object.freeze({
  lessonBySlug: Object.freeze({
    "0a58769939e0a0": "2-1",
    "3cc9b3cc60f6d5": "2-2",
    "a2066bb686dc33": "2-3",
    "aed5ad0ba6dd89": "3-1",
    "c612117a403de9": "3-2",
    "4826bbe4bcb5f4": "3-3",
    "b8440a46d5d5f6": "4-1",
    "a6b90b2e81437c": "4-2",
    "271769222feda2": "4-3",
    "e18338b8174730": "5-1",
    "0d1ed2605c8789": "5-2",
    "21d181f01ad0b9": "5-3",
    "9cc5758d751268": "6-1",
    "00ff25c5793888": "6-2",
    "e13aba3ccafc03": "6-3",
    "19c3bd07ea6523": "7-1",
    "0d3d7f278e4a1c": "7-2",
    "07a8a8142ac5fb": "7-3",
    "bd1f59c5fb3c55": "8-1",
    "6bd7fb24bbd064": "8-2",
    "e99ada309769e0": "8-3",
    "939b4bd5b464bc": "9-1",
    "c0088c13afc3e9": "9-2",
    "adddf2ed73f2a5": "9-3",
    "3d923ead041a6e": "10-1",
    "bc207c99b3d694": "10-2",
    "8049da9f63ea7d": "10-3"
  }),
  lessonSlugById: Object.freeze({
    "2-1": "0a58769939e0a0",
    "2-2": "3cc9b3cc60f6d5",
    "2-3": "a2066bb686dc33",
    "3-1": "aed5ad0ba6dd89",
    "3-2": "c612117a403de9",
    "3-3": "4826bbe4bcb5f4",
    "4-1": "b8440a46d5d5f6",
    "4-2": "a6b90b2e81437c",
    "4-3": "271769222feda2",
    "5-1": "e18338b8174730",
    "5-2": "0d1ed2605c8789",
    "5-3": "21d181f01ad0b9",
    "6-1": "9cc5758d751268",
    "6-2": "00ff25c5793888",
    "6-3": "e13aba3ccafc03",
    "7-1": "19c3bd07ea6523",
    "7-2": "0d3d7f278e4a1c",
    "7-3": "07a8a8142ac5fb",
    "8-1": "bd1f59c5fb3c55",
    "8-2": "6bd7fb24bbd064",
    "8-3": "e99ada309769e0",
    "9-1": "939b4bd5b464bc",
    "9-2": "c0088c13afc3e9",
    "9-3": "adddf2ed73f2a5",
    "10-1": "3d923ead041a6e",
    "10-2": "bc207c99b3d694",
    "10-3": "8049da9f63ea7d"
  }),
  fullTestBySlug: Object.freeze({
    "35dd5c9da4abce": 11,
    "f23b106fc7d2ee": 12,
    "fbb760483c2dab": 13,
    "2ca79d398722f9": 14,
    "e41040e57f05d0": 15,
    "c634011c0577a1": 16,
    "ae3a33344a8799": 17,
    "5b4ef13d35457b": 18,
    "916d4ce6b16051": 19,
    "11cff754b246a7": 20,
    "350cf5ffce3e7a": 21,
    "9faca690d9d4b3": 22,
    "cfda87a706e957": 23
  }),
  fullTestSlugByNumber: Object.freeze({
    "11": "35dd5c9da4abce",
    "12": "f23b106fc7d2ee",
    "13": "fbb760483c2dab",
    "14": "2ca79d398722f9",
    "15": "e41040e57f05d0",
    "16": "c634011c0577a1",
    "17": "ae3a33344a8799",
    "18": "5b4ef13d35457b",
    "19": "916d4ce6b16051",
    "20": "11cff754b246a7",
    "21": "350cf5ffce3e7a",
    "22": "9faca690d9d4b3",
    "23": "cfda87a706e957"
  })
});

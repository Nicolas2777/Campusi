// ეროვნული გამოცდების მომზადების სტრუქტურა (UI placeholder).
// მასალები მოგვიანებით ჩაიწერება — სქემა მზად არის.

export const prepSubjects = [
  {
    id: "geo", icon: "📖", name: "ქართული ენა და ლიტერატურა",
    color: "#e85d3a",
    topics: [
      { id: "geo-gram", name: "გრამატიკა", materials: [
        { type: "pdf",   title: "ბრუნვები — შემაჯამებელი", url: "#" },
        { type: "video", title: "ზმნის უღლება", url: "#" },
        { type: "task",  title: "სავარჯიშოები (20 ცალი)", url: "#" },
      ]},
      { id: "geo-lit",  name: "ლიტერატურა", materials: [
        { type: "pdf",   title: "რუსთაველი — ანალიზი", url: "#" },
        { type: "note",  title: "მე-19 ს. პერიოდი", url: "#" },
      ]},
      { id: "geo-essay", name: "წერა", materials: [
        { type: "pdf",   title: "არგუმენტირებული ესე — სტრუქტურა", url: "#" },
      ]},
    ],
  },
  {
    id: "math", icon: "➗", name: "მათემატიკა",
    color: "#4f46e5",
    topics: [
      { id: "math-alg", name: "ალგებრა", materials: [
        { type: "pdf",   title: "კვადრატული განტოლებები", url: "#" },
        { type: "video", title: "სისტემები — გადაჭრის მეთოდები", url: "#" },
        { type: "task",  title: "ვარჯიში 1", url: "#" },
      ]},
      { id: "math-geom", name: "გეომეტრია", materials: [
        { type: "pdf",   title: "სამკუთხედები", url: "#" },
      ]},
      { id: "math-prob", name: "ალბათობა და სტატისტიკა", materials: [] },
    ],
  },
  {
    id: "eng", icon: "🇬🇧", name: "ინგლისური ენა",
    color: "#0d7a5f",
    topics: [
      { id: "eng-gram", name: "Grammar", materials: [
        { type: "pdf",   title: "Tenses overview", url: "#" },
      ]},
      { id: "eng-read", name: "Reading", materials: [] },
      { id: "eng-writ", name: "Writing", materials: [] },
    ],
  },
  {
    id: "hist", icon: "🏛", name: "ისტორია",
    color: "#a0522d",
    topics: [
      { id: "hist-geo", name: "საქართველოს ისტორია", materials: [
        { type: "pdf",   title: "ერთიანი საქართველო", url: "#" },
      ]},
      { id: "hist-world", name: "მსოფლიო ისტორია", materials: [] },
    ],
  },
  {
    id: "bio", icon: "🧬", name: "ბიოლოგია",
    color: "#16a34a",
    topics: [
      { id: "bio-cell",  name: "უჯრედი", materials: [] },
      { id: "bio-genet", name: "გენეტიკა", materials: [] },
    ],
  },
  {
    id: "phys", icon: "⚛", name: "ფიზიკა",
    color: "#0ea5e9",
    topics: [
      { id: "phys-mech", name: "მექანიკა", materials: [] },
      { id: "phys-electr", name: "ელექტრობა", materials: [] },
    ],
  },
  {
    id: "chem", icon: "⚗", name: "ქიმია",
    color: "#c026d3",
    topics: [
      { id: "chem-org",  name: "ორგანული ქიმია", materials: [] },
      { id: "chem-inorg", name: "არაორგანული ქიმია", materials: [] },
    ],
  },
];

export const getPrepSubject = (id) => prepSubjects.find(s => s.id === id);

const TYPE_META = {
  pdf:   { icon: "📄", label: "PDF" },
  video: { icon: "🎬", label: "ვიდეო" },
  task:  { icon: "✏️", label: "სავარჯიშო" },
  note:  { icon: "📝", label: "ჩანაწერი" },
};
export const matMeta = (t) => TYPE_META[t] || { icon: "📎", label: t };

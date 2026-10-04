import type { PageContent, Section, SiteSettings } from "./content";

let n = 0;
const s = (type: Section["type"], data: Record<string, any>): Section => ({ id: `seed-${type}-${++n}`, type, ...data });
const L = (label: string, href: string) => ({ label, href });
const REQUEST = L("Request a Website", "/contact");

const hostingNote =
  "If you cancel your quarterly payments, you lose access to the hosted website.";

const billingChangeNote =
  "You can request a change between the $50 and $75 quarterly care plans at any time. The change takes effect at the start of your next quarterly billing period, when the new rate applies.";

const pricing = (heading: string, intro: string, withTerms: boolean): Section =>
  s("pricing", {
    anchor: withTerms ? "pricing" : "",
    eyebrow: "Pricing",
    heading,
    intro,
    tiers: [
      { name: "Website design & setup", price: "$250", cadence: "one time", description: "Design and initial setup for a hosted small-business website.", features: "One-time setup payment\nDomain cost is separate\nChoose a quarterly care plan for hosting and management, or buy the website outright for $500" },
      { name: "Domain name", price: "$50–$100+", cadence: "varies by domain", description: "The client pays the domain cost; Aidenn's Designs owns and manages the domain.", features: "The cost may be higher for a premium or popular domain\nYou approve the exact registration and renewal price before purchase\nYou may request a transfer of domain ownership" },
      { name: "Essential care", price: "$50", cadence: "per quarter", description: "Hosting and ongoing website management.", features: "Hosting and management\nOne set of revisions per quarter" },
      { name: "Monthly revision care", price: "$75", cadence: "per quarter", description: "Hosting and ongoing website management with a monthly revision set.", features: "Hosting and management\nOne set of revisions each month\nUnused monthly revisions expire; they do not roll over" },
    ],
    notes: withTerms
      ? [
          { title: "Hosting and access", body: `${hostingNote} Hosting is provided under the quarterly care plans.` },
          { title: "Buy the website outright", body: "Instead of the $250 setup plus quarterly care, choose a $500 one-time website purchase. Aidenn's Designs will no longer host or manage it; you take responsibility for arranging hosting and domain service. Domain registration remains a separate cost." },
          { title: "Changing care plans", body: `${billingChangeNote} Monthly revisions do not roll over to the next month.` },
        ]
      : [{ title: "Hosting and access", body: `${hostingNote} See hosting, access and purchase terms for details.` }],
    footnote: "A “set of revisions” is one consolidated group of requested updates sent together. Revisions are not unlimited and unused monthly sets expire at month end.",
    link: withTerms ? null : L("See full pricing and terms", "/services#pricing"),
  });

const printPricing = (): Section =>
  s("pricing", {
    anchor: "print-design",
    eyebrow: "Digital design",
    heading: "Business cards & flyers",
    intro: "Request a polished digital design. Aidenn's Designs creates and delivers the finished file; you can then place any print order yourself with the printer or platform you prefer. We provide design files only—no physical cards or flyers are printed, purchased, shipped, or fulfilled by us.",
    tiers: [
      { name: "Single-sided business card design", price: "$20", cadence: "per design", description: "One custom business card design, delivered as a digital file.", features: "Digital design only\nYou choose where and whether to print it" },
      { name: "Double-sided business card design", price: "$30", cadence: "per design", description: "One custom front-and-back business card design, delivered as a digital file.", features: "Digital design only\nYou choose where and whether to print it" },
      { name: "Digital flyer design", price: "$25", cadence: "per design", description: "One custom flyer design, delivered as a digital file.", features: "Choose landscape 8.5 × 11 in\nChoose portrait 8.5 × 11 in\nChoose half-sheet 5.5 × 8.5 in\nNo printed copies or fulfillment" },
    ],
    notes: [],
    footnote: "Cart checkout submits a request only. No payment is collected online. Aidenn's Designs will contact you to confirm the project before work begins. Flyer size and orientation are selected with the request. Half-sheet means 5.5 × 8.5 in.",
    link: null,
  });

const tutoring = s("tutoring", {
  heading: "Need a little math help?",
  body: "Aidenn’s Tutoring offers free, one-on-one K–9 math help.",
  buttonLabel: "Visit Aidenn’s Tutoring",
});

const page = (title: string, seoTitle: string, seoDescription: string, sections: Section[]): PageContent => ({
  title, seoTitle, seoDescription, shareImage: null, sections,
});

export const SEED_PAGES: { slug: string; content: PageContent }[] = [
  {
    slug: "home",
    content: page(
      "Home",
      "Aidenn's Designs — Small Business Website Design",
      "Aidenn's Designs builds small-business websites for $250 plus a separately quoted domain, with optional quarterly hosting and care plans.",
      [
        s("hero", {
          variant: "home", eyebrow: "Built with care",
          headline: "Make your business *look the part.*",
          body: "Professional websites and thoughtful digital design that help small businesses make a confident first impression.",
          primary: REQUEST, secondary: L("View Projects", "/work"), image: null, anchor: "",
        }),
        s("projects", { eyebrow: "Projects", heading: "Recent projects", intro: "", limit: "6", link: L("See all projects", "/work"), anchor: "" }),
        s("services", {
          eyebrow: "Services", heading: "Design, build, and keep it running", intro: "",
          items: [
            { title: "Website design & setup", body: "A professional website designed and initially set up for your business for $250." },
            { title: "Hosting & management", body: "Quarterly care plans cost $50 or $75 and include hosting, management, and the plan's revision allowance." },
            { title: "Domain registration", body: "A domain is priced separately, usually around $50–$100 or more depending on the name. You approve the exact price first." },
          ], anchor: "",
        }),
        s("process", {
          eyebrow: "Process", heading: "Plan, build, launch", intro: "",
          steps: [
            { title: "Plan", body: "Tell us about your business and what the site should accomplish." },
            { title: "Build", body: "Your website is designed and built, then shared with you for review." },
            { title: "Launch", body: "Your site goes live on your domain, with optional hosting and management afterward." },
          ], link: L("See the full process", "/process"), anchor: "",
        }),
        pricing("Straightforward pricing", "$250 to design and set up, a separately quoted domain, and quarterly care plans. The website can also be purchased outright for $500.", false),
        s("features", {
          eyebrow: "Why Aidenn's Designs", heading: "What you can count on", intro: "",
          items: [
            { title: "Pricing in plain sight", body: "The build price, care plan prices, and hosting terms are published on this site." },
            { title: "Domain registration handled for you", body: "Aidenn's Designs owns and manages the domain. You pay the quoted domain cost and may request an ownership transfer." },
            { title: "Works on every screen", body: "Sites are designed for phones, tablets and desktops." },
            { title: "Hosting and management available", body: "Care plans cover hosting and ongoing management so you don’t have to run the site yourself." },
          ], anchor: "",
        }),
        s("faq", {
          eyebrow: "FAQ", heading: "Common questions", intro: "",
          items: [
            { question: "Is the domain included in the $250 setup?", answer: "No. Domain registration is separate and may cost around $50–$100 or more depending on the name. Aidenn's Designs owns and manages the domain; you pay its quoted cost and may request an ownership transfer." },
            { question: "What happens if I cancel my quarterly plan?", answer: hostingNote },
            { question: "Can I buy my website instead of using quarterly care?", answer: "Yes. Instead of the $250 setup plus quarterly care, choose a $500 one-time website purchase. Aidenn's Designs will no longer host or manage the site, and you take responsibility for its hosting and domain service. Domain registration remains a separate cost." },
            { question: "Can I change my care plan?", answer: `${billingChangeNote} This applies when moving between the $50 and $75 quarterly plans.` },
          ],
          link: L("Read all questions", "/faq"), anchor: "",
        }),
        tutoring,
      ],
    ),
  },
  {
    slug: "work",
    content: page("Projects", "Projects — Aidenn's Designs", "Selected website design projects from Aidenn's Designs.", [
      s("hero", { variant: "page", eyebrow: "Projects", headline: "Selected *projects*", body: "A few businesses with websites designed by Aidenn's Designs.", primary: null, secondary: null, image: null, anchor: "" }),
      s("projects", { eyebrow: "", heading: "All projects", intro: "", limit: "all", link: null, anchor: "" }),
      s("testimonials", { eyebrow: "Testimonials", heading: "Kind words", limit: "3", anchor: "" }),
      s("cta", { heading: "Want a site like these?", body: "Tell us about your business and what you need.", primary: REQUEST, secondary: null, anchor: "" }),
    ]),
  },
  {
    slug: "services",
    content: page("Services & Pricing", "Services & Pricing — Aidenn's Designs", "$250 website design and setup, domains priced separately, $50 or $75 quarterly care, and a $500 outright purchase option.", [
      s("hero", { variant: "page", eyebrow: "Services & pricing", headline: "Clear pricing, *clear terms*", body: "What it costs, what’s separate, and how hosting and access work.", primary: REQUEST, secondary: null, image: null, anchor: "" }),
      pricing("Pricing", "Prices are shown exactly as they apply. Anything not listed here is not priced on this page.", true),
      printPricing(),
      s("text", {
        anchor: "domains", eyebrow: "Domains", heading: "Domain registration is separate",
        body: "A domain, such as yourbusiness.com, is not included in the $250 website design and setup price. Domain registration and renewal can cost around $50–$100 or more, depending on the exact name and provider. The client pays this separate cost.\n\nAidenn's Designs owns and manages the domain. You receive the exact registration and renewal pricing for approval before purchase, and you may request a transfer of domain ownership. A transfer may be subject to the domain provider's requirements.\n\nA domain is not guaranteed to be available until it has been checked and registered.",
        tone: "plain", link: null,
      }),
      s("text", {
        anchor: "hosting-access", eyebrow: "Hosting & access", heading: "Hosting, access and buying your website",
        body: `${hostingNote}\n\nThe $250 design and setup path uses a quarterly care plan for hosting and management. You may change between the $50 and $75 plans at any time; the new rate starts at your next quarterly billing period. The $75 plan includes one set of revisions each month. Unused monthly sets expire and do not roll over.\n\nAlternatively, instead of the $250 setup plus quarterly care, you may choose a $500 one-time purchase of the website. Aidenn's Designs stops hosting and managing the site, and you take responsibility for arranging hosting and domain service. Domain registration remains a separate cost.`,
        tone: "panel", link: null,
      }),
      s("text", {
        anchor: "limits", eyebrow: "Limits", heading: "What’s not covered here",
        body: "The $50 quarterly plan includes one set of revisions per quarter. The $75 quarterly plan includes one set per month; unused monthly revisions expire and do not roll over. A set is one consolidated group of requested updates, not unlimited revisions. You may request a plan change at any time, and it takes effect with your next quarterly billing period.\n\nPricing for work outside the plans, such as new pages, new features, emergency work or a redesign, is not listed on this page. Ask before assuming it is included.\n\nThe number of pages, features and the timeline for a build are not set on this page. Include what you are considering in your inquiry.",
        tone: "plain", link: null,
      }),
      s("cta", { heading: "Ready to start?", body: "Send an inquiry. It is a conversation starter, not a contract or a final quote.", primary: REQUEST, secondary: L("Read the FAQ", "/faq"), anchor: "" }),
    ]),
  },
  {
    slug: "process",
    content: page("Process", "Process — Aidenn's Designs", "How a website project moves from inquiry to launch with Aidenn's Designs.", [
      s("hero", { variant: "page", eyebrow: "Process", headline: "From inquiry to *launch*", body: "Here is how a project moves forward.", primary: REQUEST, secondary: null, image: null, anchor: "" }),
      s("process", {
        eyebrow: "", heading: "Six steps", intro: "No delivery timeline is promised on this page.",
        steps: [
          { title: "Inquiry", body: "You send a short request describing your business and what you want the site to do. Sending it is not a booking or a contract." },
          { title: "Plan", body: "We talk through what you need and what the site should accomplish." },
          { title: "Domain", body: "Aidenn's Designs owns and manages the domain. You pay its separately quoted registration and renewal cost, and may request an ownership transfer." },
          { title: "Build", body: "Your website is designed and built." },
          { title: "Review", body: "You see the site and share the changes you want." },
          { title: "Launch and care", body: "Your site goes live. Optional quarterly care plans cover hosting and ongoing management." },
        ], link: null, anchor: "",
      }),
      s("cta", { heading: "Start with an inquiry", body: "", primary: REQUEST, secondary: L("See pricing", "/services"), anchor: "" }),
    ]),
  },
  {
    slug: "about",
    content: page("About", "About — Aidenn's Designs", "About Aidenn's Designs, a website design studio for small businesses.", [
      s("hero", { variant: "page", eyebrow: "About", headline: "A website studio for *small businesses*", body: "", primary: null, secondary: null, image: null, anchor: "" }),
      s("text", {
        anchor: "", eyebrow: "", heading: "What Aidenn's Designs does",
        body: "Aidenn's Designs designs and builds websites for small businesses, and offers hosting and ongoing website management through quarterly care plans.\n\nWebsite design and setup is $250. Domain registration and renewal are separate and vary by domain. Care plans are $50 or $75 per quarter, or you may purchase the website outright for $500 and take over hosting yourself.",
        tone: "plain", link: null,
      }),
      s("features", {
        eyebrow: "What to expect", heading: "Working together", intro: "",
        items: [
          { title: "Published pricing", body: "The prices and terms on the Services & Pricing page are the ones that apply." },
          { title: "Domain ownership", body: "Aidenn's Designs owns and manages the domain. The client pays its separate quoted cost and may request an ownership transfer." },
          { title: "Clear hosting terms", body: "How hosting, access and buying your website work is written down, not buried." },
        ], anchor: "",
      }),
      s("cta", { heading: "Tell us about your business", body: "", primary: REQUEST, secondary: null, anchor: "" }),
    ]),
  },
  {
    slug: "faq",
    content: page("FAQ", "FAQ — Aidenn's Designs", "Answers about Aidenn's Designs pricing, domains, revisions, hosting, ownership, cancellation and buying your website.", [
      s("hero", { variant: "page", eyebrow: "FAQ", headline: "Questions, *answered*", body: "Pricing, domains, revisions, hosting, and what happens if you stop.", primary: null, secondary: null, image: null, anchor: "" }),
      s("faq", {
        eyebrow: "", heading: "Frequently asked questions", intro: "",
        items: [
          { question: "How much does a website cost?", answer: "Website design and initial setup is $250, with domain registration and renewal charged separately. Hosting and ongoing management are $50 or $75 per quarter. You can instead purchase the website outright for $500 and take over its hosting yourself.\n\nThe number of pages, features and the timeline are not listed here. Include what you are considering in your inquiry." },
          { question: "Is the domain included in the $250 setup?", answer: "No. Domain registration and renewal are separate and may cost around $50–$100 or more depending on the exact name and provider. You receive the exact pricing for approval before anything is purchased." },
          { question: "Who owns my domain?", answer: "Aidenn (Aidenn's Designs) owns and manages the domain, while you pay its separately quoted registration and renewal cost. You may request a transfer of ownership; the transfer is subject to the domain provider's requirements." },
          { question: "What do the care plans include?", answer: "The $50 plan is billed quarterly and includes hosting, ongoing website management, and one set of revisions per quarter. The $75 plan is billed quarterly and includes hosting, ongoing website management, and one set of revisions each month. Unused monthly sets expire and do not roll over." },
          { question: "Can I change my care plan?", answer: `${billingChangeNote} This applies when moving between the $50 and $75 quarterly plans.` },
          { question: "What is a “set of revisions”?", answer: "One consolidated group of requested updates, sent together. It is not unlimited revisions. On the $75 plan, each month's unused set expires and does not roll over to the next month." },
          { question: "Is hosting included?", answer: "Hosting is included in both quarterly care plans." },
          { question: "What happens if I cancel?", answer: hostingNote },
          { question: "Can I buy my website instead of using quarterly care?", answer: "Yes. Instead of the $250 setup plus quarterly care, choose a $500 one-time website purchase. Aidenn's Designs will no longer host or manage the site, and you take responsibility for its hosting and domain service. Domain registration remains a separate cost." },
          { question: "What about new pages, new features, emergency work or a redesign?", answer: "Pricing for work outside the care plans is not listed on this site. Ask before assuming it is included." },
          { question: "Does sending an inquiry commit me to anything?", answer: "No. An inquiry is not a booking, a contract or a final quote." },
        ], link: null, anchor: "",
      }),
      s("cta", { heading: "Still have a question?", body: "Send it with your inquiry.", primary: REQUEST, secondary: null, anchor: "" }),
    ]),
  },
  {
    slug: "contact",
    content: page("Contact", "Request a Website — Aidenn's Designs", "Request a website from Aidenn's Designs. Tell us about your business and what you want your site to do.", [
      s("contactForm", {
        anchor: "", eyebrow: "Request a Website", heading: "Tell us about your project",
        intro: "Share a few details and we’ll follow up. Sending this form is not a booking, a contract, or a final quote.",
      }),
    ]),
  },
];

export const SEED_SETTINGS: SiteSettings = {
  nav: [L("Projects", "/work"), L("Services & Pricing", "/services"), L("Process", "/process"), L("About", "/about"), L("FAQ", "/faq")],
  headerCta: REQUEST,
  footerHeading: "Ready when *you are.*",
  footerBlurb: "Custom websites and digital design for small businesses.",
  footerLinks: [L("Projects", "/work"), L("Services & Pricing", "/services"), L("Process", "/process"), L("About", "/about"), L("FAQ", "/faq"), L("Request a Website", "/contact"), L("Aidenn’s Tutoring", "https://aidennstutoring.com")],
  contactEmail: "aidenn@aidennsdesigns.com",
  contactPhone: "949-795-7036",
  social: [],
  tutoringUrl: "https://aidennstutoring.com",
  defaultDescription: "Aidenn's Designs designs and builds professional websites for small businesses.",
  defaultShareImage: null,
};

// Starter portfolio entries are inserted once per slug by the database initializer.
// Cover images are copied into the media table from public/projects at startup.
export const SEED_PROJECTS = [
  {
    id: "a1d3e8f2-1c6b-4a90-8f31-7d2e5b9c4a10",
    slug: "eddies-parts-marketing",
    name: "Eddie’s Parts Marketing",
    summary: "",
    details: "",
    services: ["Website design"],
    liveUrl: "https://eddiespartsmarketing.com/",
    cover: null,
  },
  {
    id: "b2e4f9a3-2d7c-4b01-9a42-8e3f6c0d5b21",
    slug: "tourmaline-photo-booths",
    name: "Tourmaline Photo Booths",
    summary: "",
    details: "",
    services: ["Website design"],
    liveUrl: "https://tourmalinephotobooths.com/",
    cover: null,
  },
];

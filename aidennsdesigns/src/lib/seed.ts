import type { PageContent, Section, SiteSettings } from "./content";

let n = 0;
const s = (type: Section["type"], data: Record<string, any>): Section => ({ id: `seed-${type}-${++n}`, type, ...data });
const L = (label: string, href: string) => ({ label, href });
const REQUEST = L("Request a Website", "/contact");

const hostingNote =
  "If you cancel your quarterly payments, you lose access to the hosted website.";

const pricing = (heading: string, intro: string, withTerms: boolean): Section =>
  s("pricing", {
    anchor: withTerms ? "pricing" : "",
    eyebrow: "Pricing",
    heading,
    intro,
    tiers: [
      { name: "Website design & build", price: "$500", cadence: "one time", description: "Design and build of your small business website.", features: "One-time payment\nDomain registration is separate\nHosting and management are part of the care plans" },
      { name: "Domain registration", price: "Varies", cadence: "by domain", description: "Priced separately because cost depends on the domain you choose.", features: "Exact registration and renewal pricing sent for your approval before purchase\nRegistered in your own account or legal name where technically possible" },
      { name: "Essential care", price: "$50", cadence: "per quarter", description: "Hosting and ongoing website management.", features: "Hosting\nOngoing website management\nOne set of revisions per quarter" },
      { name: "Monthly revision care", price: "$75", cadence: "per quarter", description: "Hosting and ongoing website management with more frequent updates.", features: "Hosting\nOngoing website management\nOne set of revisions per month" },
    ],
    notes: withTerms
      ? [
          { title: "Hosting and access", body: `${hostingNote} Hosting is provided under the quarterly care plans.` },
          { title: "Buying your website", body: "If you no longer want AidennsDesigns to host your website, you may purchase it. The purchase option is separate from the build fee and may be an additional $500 after the initial $500 build payment." },
        ]
      : [{ title: "Hosting and access", body: `${hostingNote} See hosting, access and purchase terms for details.` }],
    footnote: "A “set of revisions” is one consolidated group of requested updates sent together. It is not unlimited revisions.",
    link: withTerms ? null : L("See full pricing and terms", "/services#pricing"),
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
      "AidennsDesigns — Small Business Website Design",
      "AidennsDesigns designs and builds professional websites for small businesses, with optional hosting and ongoing management. $500 one-time build.",
      [
        s("hero", {
          variant: "home", eyebrow: "Built with care",
          headline: "Websites that help your business *look the part.*",
          body: "AidennsDesigns designs and builds clean, professional websites for small businesses, and can host and manage them for you after launch.",
          primary: REQUEST, secondary: L("View My Work", "/work"), image: null, anchor: "",
        }),
        s("projects", { eyebrow: "Selected work", heading: "Recent projects", intro: "", limit: "6", link: L("See all work", "/work"), anchor: "" }),
        s("services", {
          eyebrow: "Services", heading: "Design, build, and keep it running", intro: "",
          items: [
            { title: "Website design & build", body: "A professional website designed and built for your business for a $500 one-time payment." },
            { title: "Hosting & management", body: "Optional quarterly care plans cover hosting and ongoing website management, with bundled sets of revisions." },
            { title: "Domain registration", body: "Registered separately, in your own account or legal name where technically possible, with pricing sent for approval first." },
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
        pricing("Straightforward pricing", "A one-time build price, a separately priced domain, and optional quarterly care.", false),
        s("features", {
          eyebrow: "Why AidennsDesigns", heading: "What you can count on", intro: "",
          items: [
            { title: "Pricing in plain sight", body: "The build price, care plan prices, and hosting terms are published on this site." },
            { title: "Your domain, your name", body: "Where technically possible, your domain is registered in your own account or legal name." },
            { title: "Works on every screen", body: "Sites are designed for phones, tablets and desktops." },
            { title: "Hosting and management available", body: "Care plans cover hosting and ongoing management so you don’t have to run the site yourself." },
          ], anchor: "",
        }),
        s("faq", {
          eyebrow: "FAQ", heading: "Common questions", intro: "",
          items: [
            { question: "Is the domain included in the $500?", answer: "No. Domain registration is separate and its cost depends on the domain you choose. You receive the exact registration and renewal pricing for approval before anything is purchased." },
            { question: "What happens if I cancel my quarterly plan?", answer: hostingNote },
            { question: "Can I buy my website?", answer: "Yes. If you no longer want AidennsDesigns to host your website, you may purchase it. This is separate from the build fee and may be an additional $500 after the initial build payment." },
          ],
          link: L("Read all questions", "/faq"), anchor: "",
        }),
        tutoring,
      ],
    ),
  },
  {
    slug: "work",
    content: page("Work", "Work — AidennsDesigns", "Website design projects from AidennsDesigns. Concept projects are labeled as concepts.", [
      s("hero", { variant: "page", eyebrow: "Work", headline: "Selected *projects*", body: "Client projects and clearly labeled concept projects.", primary: null, secondary: null, image: null, anchor: "" }),
      s("projects", { eyebrow: "", heading: "All projects", intro: "", limit: "all", link: null, anchor: "" }),
      s("testimonials", { eyebrow: "Testimonials", heading: "Kind words", limit: "3", anchor: "" }),
      s("cta", { heading: "Want a site like these?", body: "Tell us about your business and what you need.", primary: REQUEST, secondary: null, anchor: "" }),
    ]),
  },
  {
    slug: "services",
    content: page("Services & Pricing", "Services & Pricing — AidennsDesigns", "Website design for $500 one time, domain registration priced separately, and optional quarterly care plans with hosting and management.", [
      s("hero", { variant: "page", eyebrow: "Services & pricing", headline: "Clear pricing, *clear terms*", body: "What it costs, what’s separate, and how hosting and access work.", primary: REQUEST, secondary: null, image: null, anchor: "" }),
      pricing("Pricing", "Prices are shown exactly as they apply. Anything not listed here is not priced on this page.", true),
      s("text", {
        anchor: "domains", eyebrow: "Domains", heading: "Domain registration is separate",
        body: "A domain, such as yourbusiness.com, is not included in the $500 build price. What it costs depends on the domain you choose.\n\nYou receive the exact registration and renewal pricing for your approval before anything is purchased. Where technically possible, the domain is registered in your own account or legal name, so it stays under your control if you stop using AidennsDesigns.\n\nA domain is not guaranteed to be available until it has been checked and registered.",
        tone: "plain", link: null,
      }),
      s("text", {
        anchor: "hosting-access", eyebrow: "Hosting & access", heading: "Hosting, access and buying your website",
        body: `${hostingNote}\n\nIf you no longer want AidennsDesigns to host your website, you may purchase it. The purchase is separate from the build fee and may be an additional $500 after the initial $500 build payment.`,
        tone: "panel", link: null,
      }),
      s("text", {
        anchor: "limits", eyebrow: "Limits", heading: "What’s not covered here",
        body: "The care plans include a set of revisions each quarter or month, as described above. A set of revisions is one consolidated group of requested updates, not unlimited revisions.\n\nPricing for work outside the plans, such as new pages, new features, emergency work, domain renewals or a redesign, is not listed on this page. Ask before assuming it is included.\n\nThe number of pages, features and the timeline for a build are not set on this page. Include what you are considering in your inquiry.",
        tone: "plain", link: null,
      }),
      s("cta", { heading: "Ready to start?", body: "Send an inquiry. It is a conversation starter, not a contract or a final quote.", primary: REQUEST, secondary: L("Read the FAQ", "/faq"), anchor: "" }),
    ]),
  },
  {
    slug: "process",
    content: page("Process", "Process — AidennsDesigns", "How a website project moves from inquiry to launch with AidennsDesigns.", [
      s("hero", { variant: "page", eyebrow: "Process", headline: "From inquiry to *launch*", body: "Here is how a project moves forward.", primary: REQUEST, secondary: null, image: null, anchor: "" }),
      s("process", {
        eyebrow: "", heading: "Six steps", intro: "No delivery timeline is promised on this page.",
        steps: [
          { title: "Inquiry", body: "You send a short request describing your business and what you want the site to do. Sending it is not a booking or a contract." },
          { title: "Plan", body: "We talk through what you need and what the site should accomplish." },
          { title: "Domain", body: "If you need a domain, you receive the exact registration and renewal pricing for approval before it is purchased." },
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
    content: page("About", "About — AidennsDesigns", "About AidennsDesigns, a website design studio for small businesses.", [
      s("hero", { variant: "page", eyebrow: "About", headline: "A website studio for *small businesses*", body: "", primary: null, secondary: null, image: null, anchor: "" }),
      s("text", {
        anchor: "", eyebrow: "", heading: "What AidennsDesigns does",
        body: "AidennsDesigns designs and builds websites for small businesses, and offers hosting and ongoing website management through optional quarterly care plans.\n\nPricing is published openly: a $500 one-time build, domain registration priced separately, and care plans at $50 or $75 per quarter.",
        tone: "plain", link: null,
      }),
      s("features", {
        eyebrow: "What to expect", heading: "Working together", intro: "",
        items: [
          { title: "Published pricing", body: "The prices and terms on the Services & Pricing page are the ones that apply." },
          { title: "Approval before domain purchases", body: "You see exact registration and renewal pricing before a domain is bought." },
          { title: "Clear hosting terms", body: "How hosting, access and buying your website work is written down, not buried." },
        ], anchor: "",
      }),
      s("cta", { heading: "Tell us about your business", body: "", primary: REQUEST, secondary: null, anchor: "" }),
    ]),
  },
  {
    slug: "faq",
    content: page("FAQ", "FAQ — AidennsDesigns", "Answers about AidennsDesigns pricing, domains, revisions, hosting, ownership, cancellation and buying your website.", [
      s("hero", { variant: "page", eyebrow: "FAQ", headline: "Questions, *answered*", body: "Pricing, domains, revisions, hosting, and what happens if you stop.", primary: null, secondary: null, image: null, anchor: "" }),
      s("faq", {
        eyebrow: "", heading: "Frequently asked questions", intro: "",
        items: [
          { question: "How much does a website cost?", answer: "The website design and build is $500 one time. Domain registration is separate, and optional care plans are billed quarterly.\n\nThe number of pages, features and the timeline are not listed here. Include what you are considering in your inquiry." },
          { question: "Is the domain included in the $500?", answer: "No. Domain registration is separate and its cost varies by domain. You receive the exact registration and renewal pricing for approval before anything is purchased. A domain is not guaranteed to be available until it has been checked and registered." },
          { question: "Who owns my domain?", answer: "Where technically possible, the domain is registered in your own account or legal name so it stays under your control if you stop using AidennsDesigns." },
          { question: "What do the care plans include?", answer: "Essential care is $50 per quarter and includes hosting, ongoing website management, and one set of revisions per quarter.\n\nMonthly revision care is $75 per quarter and includes hosting, ongoing website management, and one set of revisions per month." },
          { question: "What is a “set of revisions”?", answer: "One consolidated group of requested updates, sent together. It is not unlimited revisions." },
          { question: "Is hosting included?", answer: "Hosting is included in both quarterly care plans." },
          { question: "What happens if I cancel?", answer: hostingNote },
          { question: "Can I buy my website?", answer: "Yes. If you no longer want AidennsDesigns to host your website, you may purchase it. This is separate from the build fee and may be an additional $500 after the initial $500 build payment." },
          { question: "What about new pages, new features, emergency work or a redesign?", answer: "Pricing for work outside the care plans is not listed on this site. Ask before assuming it is included." },
          { question: "Does sending an inquiry commit me to anything?", answer: "No. An inquiry is not a booking, a contract or a final quote." },
        ], link: null, anchor: "",
      }),
      s("cta", { heading: "Still have a question?", body: "Send it with your inquiry.", primary: REQUEST, secondary: null, anchor: "" }),
    ]),
  },
  {
    slug: "contact",
    content: page("Contact", "Request a Website — AidennsDesigns", "Request a website from AidennsDesigns. Tell us about your business and what you want your site to do.", [
      s("contactForm", {
        anchor: "", eyebrow: "Request a Website", heading: "Tell us about your project",
        intro: "Share a few details and we’ll follow up. Sending this form is not a booking, a contract, or a final quote.",
      }),
    ]),
  },
];

export const SEED_SETTINGS: SiteSettings = {
  nav: [L("Work", "/work"), L("Services & Pricing", "/services"), L("Process", "/process"), L("About", "/about"), L("FAQ", "/faq")],
  headerCta: REQUEST,
  footerHeading: "Ready when *you are.*",
  footerBlurb: "AidennsDesigns designs and builds websites for small businesses.",
  footerLinks: [L("Work", "/work"), L("Services & Pricing", "/services"), L("Process", "/process"), L("About", "/about"), L("FAQ", "/faq"), L("Request a Website", "/contact"), L("Aidenn’s Tutoring", "https://aidennstutoring.com")],
  contactEmail: "",
  contactPhone: "",
  social: [],
  tutoringUrl: "https://aidennstutoring.com",
  defaultDescription: "AidennsDesigns designs and builds professional websites for small businesses.",
  defaultShareImage: null,
};

// Starter portfolio entries are inserted once per slug by the database initializer.
// Cover images are copied into the media table from public/projects at startup.
export const SEED_PROJECTS = [
  {
    id: "a1d3e8f2-1c6b-4a90-8f31-7d2e5b9c4a10",
    slug: "eddies-parts-marketing",
    name: "Eddie’s Parts Marketing",
    summary: "A Southern California automotive parts marketing site focused on wholesale OEM parts and dealership relationships.",
    details: "The live website introduces Eddie’s Parts Marketing and its wholesale OEM parts services, with a clear path for automotive businesses to learn more and get in touch.",
    services: ["Website design"],
    liveUrl: "https://eddiespartsmarketing.com/",
    cover: { id: "d40e28a7-5c92-4b61-9f13-8a7e3d2c6b50", alt: "Automotive photo featured on the Eddie’s Parts Marketing website", w: 1600, h: 2000 },
    filename: "eddies-parts-marketing.webp",
  },
  {
    id: "b2e4f9a3-2d7c-4b01-9a42-8e3f6c0d5b21",
    slug: "tourmaline-photo-booths",
    name: "Tourmaline Photo Booths",
    summary: "A Southern California photo booth service showcasing its handcrafted wood booth and event experience.",
    details: "The live website presents Tourmaline’s photo booth options and event services, helping visitors explore the experience and make an inquiry.",
    services: ["Website design"],
    liveUrl: "https://tourmalinephotobooths.com/",
    cover: { id: "e51f39b8-6da3-4c72-a024-9b8f4e3d7c61", alt: "Tourmaline Photo Booths’ signature handcrafted wood photo booth", w: 1200, h: 1798 },
    filename: "tourmaline-photo-booths.webp",
  },
];

const LegalPage = require("../models/legalPage");

    const PAGE_DEFINITIONS = [
    {
        slug: "privacy-policy",
        title: "Privacy Policy",
    },
    {
        slug: "terms-and-conditions",
        title: "Terms & Conditions",
        description:
        "These terms govern your access to and use of the Pronex World website and services. Please read them carefully before using the platform.",
        content: `
    <section><h2>1. Acceptance of Terms</h2><p>By accessing or using Pronex World, you agree to these Terms & Conditions and any applicable policies referenced on the website. If you do not agree, please do not use the platform.</p></section>
    <section><h2>2. About the Platform</h2><p>Pronex World provides a digital platform for discovering and evaluating real estate opportunities and related services. Information displayed on the platform is provided for general informational purposes and may change without notice.</p></section>
    <section><h2>3. Account Registration</h2><p>You are responsible for providing accurate and current information, maintaining the confidentiality of your login credentials, and notifying us promptly if you believe your account has been accessed without authorization.</p></section>
    <section><h2>4. Investment Information and Risk</h2><p>Real estate investments involve risk, including market risk, liquidity risk, valuation risk, property-specific risk, regulatory risk, and the possibility of loss of capital. Past performance or indicative projections do not guarantee future results. Nothing on the website should be treated as a guarantee of returns or as personalized financial, legal, or tax advice.</p></section>
    <section><h2>5. Property and Offering Information</h2><p>Property descriptions, valuations, projections, availability, returns, timelines, images, and other information may be based on information available at the time of publication and may be subject to change. The definitive terms of any investment or ownership arrangement are governed by the applicable transaction documents, agreements, disclosures, and applicable law.</p></section>
    <section><h2>6. User Conduct</h2><p>You must not misuse the platform, submit false information, attempt unauthorized access, interfere with website security, copy or exploit protected content without permission, or use the platform for unlawful or fraudulent activities.</p></section>
    <section><h2>7. Intellectual Property</h2><p>Website content, branding, graphics, software, text, layouts, and other materials are owned by or licensed to Pronex World unless otherwise stated. No ownership rights are transferred to you by using the platform.</p></section>
    <section><h2>8. Third-Party Services</h2><p>The platform may integrate third-party services for payments, verification, analytics, communication, or other functions. Your use of those services may be subject to additional third-party terms.</p></section>
    <section><h2>9. Limitation of Liability</h2><p>To the extent permitted by applicable law, Pronex World will not be responsible for indirect, incidental, special, consequential, or punitive losses arising from use of the website or reliance on information presented through it. Nothing in these terms excludes liability that cannot legally be excluded.</p></section>
    <section><h2>10. Suspension or Termination</h2><p>We may suspend or restrict access where reasonably necessary for security, fraud prevention, compliance, maintenance, or violation of these terms. Account or service termination does not remove obligations that are intended to survive termination.</p></section>
    <section><h2>11. Governing Law</h2><p>These terms are intended to be governed by the applicable laws of India, subject to the jurisdiction and dispute-resolution provisions contained in the applicable transaction or service documents.</p></section>
        `,
    },
    {
        slug: "refund-cancellation-policy",
        title: "Refund & Cancellation Policy",
    },
    {
        slug: "shipping-delivery-policy",
        title: "Shipping & Delivery Policy",
    },
    {
        slug: "grievance-officer",
        title: "Grievance Officer",
    },
    {
        slug: "cookie-policy",
        title: "Cookie Policy",
    },
    {
        slug: "account-data-deletion",
        title: "Account & Data Deletion",
    },
    ];

    const allowedSlugs = new Set(PAGE_DEFINITIONS.map((page) => page.slug));

    async function ensureLegalPages() {
    for (const definition of PAGE_DEFINITIONS) {
        const isTerms = definition.slug === "terms-and-conditions";

        await LegalPage.updateOne(
        { slug: definition.slug },
        {
            $setOnInsert: {
            ...definition,
            status: isTerms ? "published" : "draft",
            publishedAt: isTerms ? new Date() : null,
            lastUpdated: new Date(),
            },
        },
        { upsert: true }
        );
    }
    }

    function sanitizeAdminHtml(html = "") {
    return String(html)
        .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, "")
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/javascript\s*:/gi, "");
    }

    // GET all pages for admin
    exports.getAdminLegalPages = async (req, res) => {
    try {
        await ensureLegalPages();

        const pages = await LegalPage.find().sort({ title: 1 }).lean();

        return res.json({ success: true, pages });
    } catch (error) {
        console.error("GET LEGAL PAGES ERROR:", error);

        return res.status(500).json({
        success: false,
        message: "Failed to load legal pages",
        });
    }
    };

    // GET one published page for website
    exports.getPublicLegalPage = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!allowedSlugs.has(slug)) {
        return res.status(404).json({
            success: false,
            message: "Legal page not found",
        });
        }

        const page = await LegalPage.findOne({
        slug,
        status: "published",
        })
        .select("slug title description content lastUpdated publishedAt")
        .lean();

        if (!page) {
        return res.status(404).json({
            success: false,
            message: "This page has not been published",
        });
        }

        return res.json({ success: true, page });
    } catch (error) {
        console.error("GET PUBLIC LEGAL PAGE ERROR:", error);

        return res.status(500).json({
        success: false,
        message: "Failed to load legal page",
        });
    }
    };

    // Admin edits a page or saves a draft
    exports.updateLegalPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, description = "", content, status } = req.body;

        if (!allowedSlugs.has(slug)) {
        return res.status(404).json({
            success: false,
            message: "Invalid legal page",
        });
        }

        if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Title and content are required",
        });
        }

        if (!["draft", "published"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status must be draft or published",
        });
        }

        await ensureLegalPages();

        const existing = await LegalPage.findOne({ slug });
        const now = new Date();

        const page = await LegalPage.findOneAndUpdate(
        { slug },
        {
            $set: {
            title: title.trim(),
            description: String(description).trim(),
            content: sanitizeAdminHtml(content),
            status,
            lastUpdated: now,
            ...(status === "published"
                ? { publishedAt: existing?.publishedAt || now }
                : {}),
            },
        },
        { new: true, runValidators: true }
        );

        return res.json({
        success: true,
        message:
            status === "published"
            ? "Legal page published successfully"
            : "Legal page draft saved successfully",
        page,
        });
    } catch (error) {
        console.error("UPDATE LEGAL PAGE ERROR:", error);

        return res.status(500).json({
        success: false,
        message: "Failed to save legal page",
        });
    }
    };
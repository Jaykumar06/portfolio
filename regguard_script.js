/* ==========================================================================
   RegGuard AI - Merchant Compliance & Onboarding Simulator JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initPresetSelector();
    initMerchantForm();
    initBatchSimulator();
    initCertificateModal();
    
    // Default initial evaluation on page load
    evaluateMerchant();
});

// Preset Merchant Profiles
const merchantPresets = {
    compliant: {
        name: "TechNova Digital Solutions Pvt Ltd",
        category: "Software & SaaS",
        gstin: "07AAAAA0000A1Z5",
        pan: "AAAAA0000A",
        website: "https://technovadigital.in",
        vintage: "36",
        hasPrivacy: true,
        hasTerms: true,
        hasRefund: true,
        hasGrievance: true,
        hasHttps: true,
        isProhibited: false,
        pepCheck: false,
        bankVerified: true
    },
    amber: {
        name: "QuickKart Retail Store",
        category: "E-Commerce Retail",
        gstin: "27BBBCC1111B2Z3",
        pan: "BBBCC1111B",
        website: "https://quickkartstore.co.in",
        vintage: "8",
        hasPrivacy: true,
        hasTerms: true,
        hasRefund: false,
        hasGrievance: false,
        hasHttps: true,
        isProhibited: false,
        pepCheck: false,
        bankVerified: true
    },
    prohibited: {
        name: "BetMaster Gaming Portal",
        category: "Unregulated Online Gaming",
        gstin: "09XXXPP9999P1Z8",
        pan: "XXXPP9999P",
        website: "http://betmasterpro.net",
        vintage: "2",
        hasPrivacy: false,
        hasTerms: false,
        hasRefund: false,
        hasGrievance: false,
        hasHttps: false,
        isProhibited: true,
        pepCheck: true,
        bankVerified: false
    }
};

/* --------------------------------------------------------------------------
   1. Tab Navigation Logic
   -------------------------------------------------------------------------- */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(`tab-${target}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   2. Preset Selector Logic
   -------------------------------------------------------------------------- */
function initPresetSelector() {
    const presetSelect = document.getElementById('preset-selector');
    if (!presetSelect) return;

    presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (merchantPresets[val]) {
            fillFormWithData(merchantPresets[val]);
            evaluateMerchant();
        }
    });
}

function fillFormWithData(data) {
    document.getElementById('m-name').value = data.name;
    document.getElementById('m-category').value = data.category;
    document.getElementById('m-gstin').value = data.gstin;
    document.getElementById('m-pan').value = data.pan;
    document.getElementById('m-website').value = data.website;
    document.getElementById('m-vintage').value = data.vintage;

    document.getElementById('chk-privacy').checked = data.hasPrivacy;
    document.getElementById('chk-terms').checked = data.hasTerms;
    document.getElementById('chk-refund').checked = data.hasRefund;
    document.getElementById('chk-grievance').checked = data.hasGrievance;
    document.getElementById('chk-https').checked = data.hasHttps;
    document.getElementById('chk-prohibited').checked = data.isProhibited;
    document.getElementById('chk-pep').checked = data.pepCheck;
    document.getElementById('chk-bank').checked = data.bankVerified;
}

/* --------------------------------------------------------------------------
   3. Merchant Risk Model Evaluation Engine
   -------------------------------------------------------------------------- */
function initMerchantForm() {
    const form = document.getElementById('merchant-audit-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        evaluateMerchant();
    });
}

function evaluateMerchant() {
    // Read input parameters
    const name = document.getElementById('m-name')?.value || "Merchant Candidate";
    const category = document.getElementById('m-category')?.value || "E-Commerce";
    const vintage = parseInt(document.getElementById('m-vintage')?.value || "12", 10);
    
    const hasPrivacy = document.getElementById('chk-privacy')?.checked || false;
    const hasTerms = document.getElementById('chk-terms')?.checked || false;
    const hasRefund = document.getElementById('chk-refund')?.checked || false;
    const hasGrievance = document.getElementById('chk-grievance')?.checked || false;
    const hasHttps = document.getElementById('chk-https')?.checked || false;
    const isProhibited = document.getElementById('chk-prohibited')?.checked || false;
    const pepCheck = document.getElementById('chk-pep')?.checked || false;
    const bankVerified = document.getElementById('chk-bank')?.checked || false;

    // Base Score starts at 60
    let score = 60;
    let shapFeatures = [];

    // 1. Prohibited Goods & PEP Risk (Catastrophic Risk)
    if (isProhibited) {
        score -= 40;
        shapFeatures.push({ name: "Prohibited Goods / Category Flag", impact: -40, type: "negative" });
    } else {
        score += 10;
        shapFeatures.push({ name: "Clean Merchant Category Audit", impact: +10, type: "positive" });
    }

    if (pepCheck) {
        score -= 25;
        shapFeatures.push({ name: "Sanction / PEP Match Alert", impact: -25, type: "negative" });
    }

    // 2. Regulatory Website Policy Compliance (RBI mandatory)
    let policyCount = 0;
    if (hasPrivacy) policyCount++;
    if (hasTerms) policyCount++;
    if (hasRefund) policyCount++;
    if (hasGrievance) policyCount++;

    if (policyCount === 4) {
        score += 15;
        shapFeatures.push({ name: "Full RBI Mandatory Web Policies Found", impact: +15, type: "positive" });
    } else {
        const missing = 4 - policyCount;
        score -= missing * 8;
        shapFeatures.push({ name: `Missing ${missing} Mandatory Regulatory Policies`, impact: -(missing * 8), type: "negative" });
    }

    // 3. SSL Security & Identity Verification
    if (hasHttps) {
        score += 5;
        shapFeatures.push({ name: "SSL HTTPS Encrypted Gateway", impact: +5, type: "positive" });
    } else {
        score -= 15;
        shapFeatures.push({ name: "Insecure HTTP Protocol Detected", impact: -15, type: "negative" });
    }

    if (bankVerified) {
        score += 10;
        shapFeatures.push({ name: "NSDL / Penny-Drop Bank Name Match", impact: +10, type: "positive" });
    } else {
        score -= 10;
        shapFeatures.push({ name: "Unverified Bank Account Name", impact: -10, type: "negative" });
    }

    // 4. Business Vintage
    if (vintage >= 24) {
        score += 10;
        shapFeatures.push({ name: "Established Vintage (>2 Years)", impact: +10, type: "positive" });
    } else if (vintage < 6) {
        score -= 5;
        shapFeatures.push({ name: "New Business Entity (<6 Months)", impact: -5, type: "negative" });
    }

    // Clamp score 0 - 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determine Status
    let statusClass = "badge-green";
    let statusText = "APPROVED & EMBARGO-READY";
    let statusDesc = "Complies 100% with RBI Payment Aggregator Guidelines. Staged for 1-Click Mass Activation upon embargo lift.";
    let strokeColor = "#10b981";

    if (score < 60) {
        statusClass = "badge-red";
        statusText = "REJECTED (HIGH RISK)";
        statusDesc = "Failed regulatory compliance or identified high-risk prohibited category. Blocked from onboarding pipeline.";
        strokeColor = "#ef4444";
    } else if (score < 85) {
        statusClass = "badge-amber";
        statusText = "ACTION REQUIRED (AMBER)";
        statusDesc = "Missing mandatory regulatory policies. Triggering automated AI Compliance Remediation Advisor for SME.";
        strokeColor = "#f59e0b";
    }

    // Update UI elements
    updateScoreUI(score, strokeColor, statusClass, statusText, statusDesc, shapFeatures);
    updateRemediationAdvisor(hasRefund, hasGrievance, hasHttps, bankVerified, isProhibited);
    
    // Store evaluated details for Certificate Modal
    window.currentEvaluation = {
        name,
        category,
        score,
        statusText,
        timestamp: new Date().toLocaleString(),
        certId: "RBI-PA-CERT-" + Math.floor(100000 + Math.random() * 900000)
    };
}

function updateScoreUI(score, strokeColor, statusClass, statusText, statusDesc, shapFeatures) {
    const scoreValEl = document.getElementById('score-val');
    const circleEl = document.getElementById('score-progress-circle');
    const badgeEl = document.getElementById('status-badge');
    const descEl = document.getElementById('status-desc');
    const shapContainer = document.getElementById('shap-features-list');

    if (scoreValEl) scoreValEl.textContent = score;

    if (circleEl) {
        // Circle Circumference = 2 * PI * 70 = 440
        const offset = 440 - (440 * score) / 100;
        circleEl.style.strokeDashoffset = offset;
        circleEl.style.stroke = strokeColor;
    }

    if (badgeEl) {
        badgeEl.className = `status-badge-lg ${statusClass}`;
        badgeEl.textContent = statusText;
    }

    if (descEl) {
        descEl.textContent = statusDesc;
    }

    // Render SHAP Explainable AI list
    if (shapContainer) {
        shapContainer.innerHTML = '';
        shapFeatures.forEach(feat => {
            const item = document.createElement('div');
            item.className = 'shap-item';
            
            const fillClass = feat.type === 'positive' ? 'shap-fill-green' : 'shap-fill-red';
            const widthPct = Math.min(100, Math.abs(feat.impact) * 2.5);
            const impactStr = feat.impact > 0 ? `+${feat.impact} pts` : `${feat.impact} pts`;

            item.innerHTML = `
                <div class="shap-info">
                    <span class="shap-feature-name">${feat.name}</span>
                    <span class="shap-impact ${feat.type}">${impactStr}</span>
                </div>
                <div class="shap-bar-bg">
                    <div class="shap-bar-fill ${fillClass}" style="width: ${widthPct}%"></div>
                </div>
            `;
            shapContainer.appendChild(item);
        });
    }
}

function updateRemediationAdvisor(hasRefund, hasGrievance, hasHttps, bankVerified, isProhibited) {
    const listEl = document.getElementById('remediation-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (isProhibited) {
        listEl.innerHTML += `
            <div class="remediation-card" style="border-left-color: var(--accent-rose); background: rgba(239, 68, 68, 0.05);">
                <div class="remediation-title" style="color: #f87171;">⛔ Prohibited Business Category Detected</div>
                <div class="remediation-desc">RBI PA guidelines strictly ban unregulated gaming, crypto, or unlicensed financial services. The merchant must update their business model and submit valid regulatory licenses.</div>
            </div>
        `;
        return;
    }

    let gaps = [];

    if (!hasRefund) {
        gaps.push({
            title: "⚠️ Missing Cancellation & Refund Policy",
            desc: "RBI requires explicit refund turnarounds (e.g. 5-7 business days) stated on the checkout page.",
            code: `<a href="/cancellation-policy">Cancellation & Refund Policy</a>\n"Refunds processed within 5-7 working days to original source."`
        });
    }

    if (!hasGrievance) {
        gaps.push({
            title: "⚠️ Missing Nodal Grievance Officer Details",
            desc: "Include Grievance Officer Name, Email, and Phone Number in footer per RBI Master Directions.",
            code: `Nodal Grievance Officer: Officer Name | Email: grievance@merchant.com`
        });
    }

    if (!hasHttps) {
        gaps.push({
            title: "🔒 Insecure Website (Missing SSL Certificate)",
            desc: "Install free TLS/SSL certificate via Let's Encrypt to enforce HTTPS for customer transaction safety.",
            code: `Redirect HTTP -> HTTPS (301 Permanent Redirect)`
        });
    }

    if (!bankVerified) {
        gaps.push({
            title: "🏦 Bank Account Name Mismatch",
            desc: "Bank account legal name must match PAN/GST registered legal name exactly.",
            code: `Re-upload Bank Statement with clear Legal Account Name matching GSTIN.`
        });
    }

    if (gaps.length === 0) {
        listEl.innerHTML = `
            <div class="remediation-card" style="border-left-color: var(--accent-emerald); background: rgba(16, 185, 129, 0.05);">
                <div class="remediation-title" style="color: #34d399;">✅ Zero Regulatory Compliance Gaps Found!</div>
                <div class="remediation-desc">This merchant is 100% compliant and ready for automated RBI Audit logging.</div>
            </div>
        `;
    } else {
        gaps.forEach(g => {
            listEl.innerHTML += `
                <div class="remediation-card">
                    <div class="remediation-title">${g.title}</div>
                    <div class="remediation-desc">${g.desc}</div>
                    <div class="code-box">${g.code}</div>
                </div>
            `;
        });
    }
}

/* --------------------------------------------------------------------------
   4. 1-Click Mass Activation Batch Simulator
   -------------------------------------------------------------------------- */
function initBatchSimulator() {
    const startBtn = document.getElementById('btn-start-batch');
    const fillBar = document.getElementById('batch-progress-fill');
    const counterEl = document.getElementById('batch-counter');
    const speedEl = document.getElementById('batch-speed');
    const statusText = document.getElementById('batch-status');

    if (!startBtn) return;

    let isRunning = false;

    startBtn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        startBtn.innerHTML = `<span>Simulating Mass Activation...</span>`;

        let current = 0;
        const total = 57480;
        const speed = 1850; // activations per second
        const intervalTime = 50; // ms
        const increment = Math.ceil((speed * intervalTime) / 1000);

        statusText.textContent = "Connecting to Partner Bank Gateway & RBI Compliance Verification Log...";
        speedEl.textContent = `${speed.toLocaleString()} / sec`;

        const timer = setInterval(() => {
            current += increment;
            if (current >= total) {
                current = total;
                clearInterval(timer);
                fillBar.style.width = '100%';
                counterEl.textContent = total.toLocaleString();
                statusText.textContent = "🎉 SUCCESS: All 57,480 waitlisted merchants successfully onboarded & live!";
                startBtn.disabled = false;
                startBtn.innerHTML = `<span>Re-run Activation Simulator</span>`;
                isRunning = false;
            } else {
                const pct = ((current / total) * 100).toFixed(1);
                fillBar.style.width = `${pct}%`;
                counterEl.textContent = current.toLocaleString();
            }
        }, intervalTime);
    });
}

/* --------------------------------------------------------------------------
   5. RBI Audit Certificate Modal
   -------------------------------------------------------------------------- */
function initCertificateModal() {
    const modal = document.getElementById('cert-modal');
    const openBtn = document.getElementById('btn-view-cert');
    const closeBtn = document.getElementById('modal-close-btn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            const certData = window.currentEvaluation || {
                name: "TechNova Digital Solutions Pvt Ltd",
                category: "Software & SaaS",
                score: 92,
                statusText: "APPROVED & EMBARGO-READY",
                timestamp: new Date().toLocaleString(),
                certId: "RBI-PA-CERT-884920"
            };

            document.getElementById('cert-m-name').textContent = certData.name;
            document.getElementById('cert-m-cat').textContent = certData.category;
            document.getElementById('cert-m-score').textContent = `${certData.score} / 100`;
            document.getElementById('cert-id').textContent = certData.certId;
            document.getElementById('cert-time').textContent = certData.timestamp;

            modal.classList.add('active');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

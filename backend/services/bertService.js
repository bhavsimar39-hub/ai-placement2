// backend/services/bertService.js
// Hugging Face BERT semantic similarity via Inference API
// Model: sentence-transformers/all-MiniLM-L6-v2
// Returns cosine similarity 0..1 between two texts

const HF_API = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
const HF_NER_API = "https://api-inference.huggingface.co/models/dslim/bert-base-NER";

// ── Get embedding for one text ────────────────────────────
async function getEmbedding(text) {
    const key = process.env.HUGGINGFACE_API_KEY;
    if (!key) throw new Error("HUGGINGFACE_API_KEY not set in .env");

    const res = await fetch(HF_API, {
        method:  "POST",
        headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type":  "application/json",
        },
        body: JSON.stringify({ inputs: text.substring(0, 512), options: { wait_for_model: true } }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`HF embedding API error ${res.status}: ${err}`);
    }
    return meanPool(await res.json()); // pool token→sentence embedding
}

// ── Get embeddings for multiple texts in one call ─────────
async function getEmbeddings(texts) {
    const key = process.env.HUGGINGFACE_API_KEY;
    if (!key) throw new Error("HUGGINGFACE_API_KEY not set in .env");

    const res = await fetch(HF_API, {
        method:  "POST",
        headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type":  "application/json",
        },
        body: JSON.stringify({
            inputs: texts.map(t => t.substring(0, 512)),
            options: { wait_for_model: true }
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`HF embeddings API error ${res.status}: ${err}`);
    }
    return (await res.json()).map(meanPool); // pool token→sentence embeddings
}

// ── Mean-pool token embeddings → sentence embedding ───────
// HF feature-extraction returns shape [seq_len, hidden] per text.
// We must average across the token dimension to get one vector.
function meanPool(tokenEmbeddings) {
    if (!Array.isArray(tokenEmbeddings[0])) return tokenEmbeddings; // already 1-D
    const size   = tokenEmbeddings[0].length;
    const pooled = new Array(size).fill(0);
    for (const vec of tokenEmbeddings)
        for (let i = 0; i < size; i++) pooled[i] += vec[i];
    return pooled.map(v => v / tokenEmbeddings.length);
}


function cosineSim(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot  += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── Semantic similarity between two strings ───────────────
export async function semanticSimilarity(textA, textB) {
    const [embA, embB] = await getEmbeddings([textA, textB]);
    return cosineSim(embA, embB);
}

// ── Semantic skill matching ───────────────────────────────
// For each required skill, find best matching user skill via embeddings
// Returns { matched, partial, missing, semanticPairs }
export async function semanticSkillMatch(userSkills, requiredSkills, threshold = 0.65) {
    if (!userSkills.length || !requiredSkills.length) {
        return { matched: [], partial: [], missing: requiredSkills, semanticPairs: [] };
    }

    // Get all embeddings in two batches
    const allTexts    = [...userSkills, ...requiredSkills];
    const allEmbeds   = await getEmbeddings(allTexts);
    const userEmbeds  = allEmbeds.slice(0, userSkills.length);
    const reqEmbeds   = allEmbeds.slice(userSkills.length);

    const matched     = [];
    const partial     = [];
    const missing     = [];
    const semanticPairs = [];

    reqEmbeds.forEach((reqEmbed, ri) => {
        const reqSkill = requiredSkills[ri];
        let bestScore  = 0;
        let bestMatch  = null;

        userEmbeds.forEach((userEmbed, ui) => {
            const score = cosineSim(reqEmbed, userEmbed);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = userSkills[ui];
            }
        });

        if (bestScore >= threshold) {
            matched.push(reqSkill);
            if (bestMatch !== reqSkill) {
                semanticPairs.push({ required: reqSkill, matched: bestMatch, score: Math.round(bestScore * 100) });
            }
        } else if (bestScore >= 0.45) {
            partial.push(reqSkill);
            semanticPairs.push({ required: reqSkill, matched: bestMatch, score: Math.round(bestScore * 100), partial: true });
        } else {
            missing.push(reqSkill);
        }
    });

    return { matched, partial, missing, semanticPairs };
}

// ── Semantic JD vs Resume matching ────────────────────────
// Splits both texts into sentences, compares sentence-level similarity
export async function semanticJDMatch(resumeText, jdText) {
    // Split into meaningful chunks (sentences/phrases)
    const splitChunks = (text) =>
        text.split(/[.\n]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20)
            .slice(0, 15);

    const resumeChunks = splitChunks(resumeText);
    const jdChunks     = splitChunks(jdText);

    if (!resumeChunks.length || !jdChunks.length) {
        return { overallScore: 0, topMatches: [], gaps: [] };
    }

    // Get embeddings for all chunks
    const allChunks  = [...resumeChunks, ...jdChunks];
    const allEmbeds  = await getEmbeddings(allChunks);
    const resEmbeds  = allEmbeds.slice(0, resumeChunks.length);
    const jdEmbeds   = allEmbeds.slice(resumeChunks.length);

    const topMatches = [];
    const gaps       = [];
    const jdScores   = [];

    jdEmbeds.forEach((jdEmbed, ji) => {
        let bestScore = 0;
        let bestChunk = null;

        resEmbeds.forEach((resEmbed, ri) => {
            const score = cosineSim(jdEmbed, resEmbed);
            if (score > bestScore) {
                bestScore = score;
                bestChunk = resumeChunks[ri];
            }
        });

        jdScores.push(bestScore);

        if (bestScore >= 0.60) {
            topMatches.push({
                jdRequirement: jdChunks[ji].substring(0, 80),
                resumeMatch:   bestChunk?.substring(0, 80),
                score:         Math.round(bestScore * 100),
            });
        } else if (bestScore < 0.40) {
            gaps.push(jdChunks[ji].substring(0, 80));
        }
    });

    const overallScore = jdScores.length
        ? Math.round((jdScores.reduce((s, n) => s + n, 0) / jdScores.length) * 100)
        : 0;

    return {
        overallScore,
        topMatches: topMatches.slice(0, 5),
        gaps: gaps.slice(0, 5),
    };
}

// ── Named Entity Recognition ──────────────────────────────
export async function extractEntities(text) {
    const key = process.env.HUGGINGFACE_API_KEY;
    if (!key) return null;

    try {
        const res = await fetch(HF_NER_API, {
            method:  "POST",
            headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: text.substring(0, 512), options: { wait_for_model: true } }),
        });
        if (!res.ok) return null;
        const entities = await res.json();

        // Group entities by type
        const grouped = { PER: [], ORG: [], LOC: [], MISC: [] };
        entities.forEach(e => {
            const type = e.entity_group || e.entity?.replace(/^[BI]-/, '');
            if (grouped[type]) grouped[type].push(e.word);
        });

        return {
            names:         [...new Set(grouped.PER)],
            organisations: [...new Set(grouped.ORG)],
            locations:     [...new Set(grouped.LOC)],
        };
    } catch { return null; }
}
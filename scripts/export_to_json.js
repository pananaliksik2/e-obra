const fs = require('fs');
const path = require('path');

const sqlFiles = [
    'eobra_db.sql',
    'kabanata_63_insert.sql',
    'kabanata_64_insert.sql'
];

let chapters = new Map();
let glossary = [];
let quizzes = [];
let questions = [];

function parseValues(raw) {
    const results = [];
    let i = 0;
    while (i < raw.length) {
        while (i < raw.length && raw[i] !== '(') i++;
        if (i >= raw.length) break;
        i++; // skip '('
        
        const tuple = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        let escape = false;
        
        while (i < raw.length) {
            const char = raw[i];
            if (escape) {
                current += char;
                escape = false;
            } else if (char === '\\') {
                escape = true;
            } else if ((char === "'" || char === '"') && !inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar && inString) {
                if (raw[i+1] === stringChar) {
                    current += stringChar;
                    i++;
                } else {
                    inString = false;
                }
            } else if (char === ',' && !inString) {
                tuple.push(cleanValue(current));
                current = '';
            } else if (char === ')' && !inString) {
                tuple.push(cleanValue(current));
                results.push(tuple);
                break;
            } else {
                current += char;
            }
            i++;
        }
        i++;
    }
    return results;
}

function cleanValue(v) {
    v = v.trim();
    if (v === 'NULL') return null;
    if (v.startsWith("'") && v.endsWith("'")) {
        let text = v.slice(1, -1);
        // Step 1: Handle escaped quotes
        text = text.split("\\'").join("'").split("''").join("'");
        // Step 2: Deep Clean all line break variations
        // This handles \r\n, \n, literal rn, and other common SQL artifacts
        text = text.replace(/\\r\\n/g, '\n')
                   .replace(/\\n/g, '\n')
                   .replace(/\\r/g, '\n')
                   .replace(/\r\n/g, '\n')
                   .replace(/rn/g, '\n');
        
        // Clean up any double newlines caused by the above
        text = text.replace(/\n+/g, '\n\n').trim();
        
        return text;
    }
    if (!isNaN(v) && v !== '') return Number(v);
    return v;
}

sqlFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');

    const tables = ['chapters', 'glossary', 'quizzes', 'questions'];
    tables.forEach(table => {
        const marker = `INSERT INTO \`${table}\``;
        let pos = 0;
        while ((pos = content.indexOf(marker, pos)) !== -1) {
            const valuesKeywordPos = content.indexOf('VALUES', pos);
            if (valuesKeywordPos === -1) break;
            
            const valuesStart = valuesKeywordPos + 6;
            
            let endPos = valuesStart;
            let inString = false;
            let stringChar = '';
            let escape = false;
            
            while (endPos < content.length) {
                const char = content[endPos];
                if (escape) {
                    escape = false;
                } else if (char === '\\') {
                    escape = true;
                } else if ((char === "'" || char === '"') && !inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar && inString) {
                    if (content[endPos+1] === stringChar) endPos++;
                    else inString = false;
                } else if (char === ';' && !inString) {
                    break;
                }
                endPos++;
            }
            
            const rawValues = content.slice(valuesStart, endPos);
            const vals = parseValues(rawValues);
            
            vals.forEach(v => {
                if (table === 'chapters') {
                    let ch;
                    if (v.length >= 4) ch = { id: v[0], chapter_number: v[1], title: v[2], content: v[3] };
                    else ch = { chapter_number: v[0], title: v[1], content: v[2] };

                    const chNum = parseInt(ch.chapter_number);
                    if (isNaN(chNum)) return;
                    ch.chapter_number = chNum;
                    
                    // The content is already cleaned by parseValues -> cleanValue
                    const newContent = (ch.content || '').trim();
                    const existing = chapters.get(chNum);
                    const oldContent = (existing ? (existing.content || '') : '').trim();

                    // If it's a new chapter, or the new content is significantly different/better
                    // We use a small threshold to allow shorter but cleaner content to win if it's the same base
                    if (!existing || newContent.length >= oldContent.length - 100) {
                        chapters.set(chNum, ch);
                    }
                } else if (table === 'glossary') {
                    if (v.length >= 4) glossary.push({ id: v[0], chapter_id: v[1], word: v[2], definition: v[3], modern_context: v[4] });
                    else glossary.push({ chapter_id: v[0], word: v[1], definition: v[2], modern_context: v[3] });
                } else if (table === 'quizzes') {
                    quizzes.push({ id: v[0], chapter_id: v[1], title: v[2] });
                } else if (table === 'questions') {
                    questions.push({ id: v[0], quiz_id: v[1], question_text: v[2], option_a: v[3], option_b: v[4], option_c: v[5], option_d: v[6], correct_answer: v[7] });
                }
            });
            pos = endPos + 1;
        }
    });
});

const sortedChapters = Array.from(chapters.values()).sort((a, b) => a.chapter_number - b.chapter_number);
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
fs.writeFileSync(path.join(dataDir, 'chapters.json'), JSON.stringify(sortedChapters, null, 4));
fs.writeFileSync(path.join(dataDir, 'glossary.json'), JSON.stringify(glossary, null, 4));
fs.writeFileSync(path.join(dataDir, 'quizzes.json'), JSON.stringify({ quizzes, questions }, null, 4));

console.log(`Successfully exported ${sortedChapters.length} chapters, ${glossary.length} glossary terms, and ${questions.length} questions.`);

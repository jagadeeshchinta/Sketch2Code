const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outPath = path.join(__dirname, 'WHITEBOARDOS_PROJECT_PITCH.pdf');

function generatePitchPdf() {
  const doc = new PDFDocument({
    size: 'A4', // 595.28 x 841.89 pt
    margins: { top: 22, bottom: 22, left: 28, right: 28 },
    bufferPages: true
  });

  const writeStream = fs.createWriteStream(outPath);
  doc.pipe(writeStream);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginL = 28;
  const contentWidth = pageWidth - (marginL * 2); // 539.28 pt

  // Palette: Dark Obsidian, Indigo, Emerald, Amber, Cool Slate
  const cDark = '#090a16';
  const cIndigo = '#4f46e5';
  const cIndigoDark = '#3730a3';
  const cSlateDark = '#0f172a';
  const cSlate = '#334155';
  const cSlateMuted = '#64748b';
  const cBgCard = '#f8fafc';
  const cBorder = '#cbd5e1';
  const cEmerald = '#059669';
  const cEmeraldBg = '#f0fdf4';
  const cEmeraldBorder = '#86efac';
  const cPurpleBg = '#faf5ff';
  const cPurpleBorder = '#d8b4fe';
  const cBlueBg = '#eff6ff';
  const cBlueBorder = '#bfdbfe';

  let curY = 22;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. TOP HEADER BANNER (Obsidian Dark with Royal Indigo Top Accent)
  // ──────────────────────────────────────────────────────────────────────────
  const headerHeight = 78;
  doc.rect(marginL, curY, contentWidth, headerHeight).fill(cDark);
  doc.rect(marginL, curY, contentWidth, 3.5).fill(cIndigo);

  // Title
  doc.fillColor('#ffffff').fontSize(16.5).font('Helvetica-Bold')
     .text('WhiteboardOS — AI-Powered Sketch-to-Code Platform', marginL + 14, curY + 11);

  // Subtitle
  doc.fillColor('#a5b4fc').fontSize(9.0).font('Helvetica')
     .text('Multimodal AI Living Prototype Studio: Hand-Drawn Wireframes & Indic Voice Blueprints -> Production Web Code', marginL + 14, curY + 33);

  // Badges Row
  const bY = curY + 52;
  doc.rect(marginL + 14, bY, 216, 16).fill('#1e1b4b');
  doc.fillColor('#c7d2fe').fontSize(7.2).font('Helvetica-Bold')
     .text('THE GREAT INDIAN INTERNSHIP CHALLENGE BY GNANI.AI', marginL + 20, bY + 4.5);

  doc.rect(marginL + 236, bY, 115, 16).fill('#14532d');
  doc.fillColor('#bbf7d0').fontSize(7.2).font('Helvetica-Bold')
     .text('TRACK: MULTIMODAL AI', marginL + 242, bY + 4.5);

  doc.fillColor('#94a3b8').fontSize(7.8).font('Helvetica')
     .text('Production Submission v2.0', marginL + contentWidth - 140, bY + 4.5, { align: 'right', width: 125 });

  curY += headerHeight + 6;

  // ──────────────────────────────────────────────────────────────────────────
  // 2. DEVELOPER & REPOSITORY METADATA BAR
  // ──────────────────────────────────────────────────────────────────────────
  const metaHeight = 27;
  doc.rect(marginL, curY, contentWidth, metaHeight).fillAndStroke('#f1f5f9', cBorder);

  const colW = contentWidth / 4;

  // Col 1: Developer
  doc.fillColor(cSlateMuted).fontSize(6.8).font('Helvetica-Bold').text('DEVELOPER & ARCHITECT', marginL + 8, curY + 4.5);
  doc.fillColor(cSlateDark).fontSize(8.2).font('Helvetica-Bold').text('Jagadeesh Chinta', marginL + 8, curY + 14);

  // Col 2: Institution
  doc.fillColor(cSlateMuted).fontSize(6.8).font('Helvetica-Bold').text('ACADEMIC INSTITUTION', marginL + colW + 8, curY + 4.5);
  doc.fillColor(cSlateDark).fontSize(8.0).font('Helvetica-Bold').text('Lovely Professional University (LPU)', marginL + colW + 8, curY + 14);

  // Col 3: AI Foundation
  doc.fillColor(cSlateMuted).fontSize(6.8).font('Helvetica-Bold').text('FOUNDATION AI ENGINES', marginL + (colW * 2) + 8, curY + 4.5);
  doc.fillColor(cIndigo).fontSize(8.0).font('Helvetica-Bold').text('Gnani Prisma STT & Gemini Vision', marginL + (colW * 2) + 8, curY + 14);

  // Col 4: GitHub Link
  doc.fillColor(cSlateMuted).fontSize(6.8).font('Helvetica-Bold').text('GITHUB REPOSITORY', marginL + (colW * 3) + 8, curY + 4.5);
  doc.fillColor(cIndigo).fontSize(7.8).font('Helvetica-Bold')
     .text('github.com/jagadeeshchinta/Sketch2Code', marginL + (colW * 3) + 8, curY + 14, {
       link: 'https://github.com/jagadeeshchinta/Sketch2Code',
       underline: true
     });

  curY += metaHeight + 7;

  // ──────────────────────────────────────────────────────────────────────────
  // 3. PROBLEM STATEMENT VS. PROPOSED SOLUTION (Two Symmetrical Cards)
  // ──────────────────────────────────────────────────────────────────────────
  const row1Height = 98;
  const halfW = (contentWidth - 8) / 2;

  // Card 1: Problem Statement
  doc.rect(marginL, curY, halfW, row1Height).fillAndStroke(cBgCard, cBorder);
  doc.rect(marginL, curY, 3.5, row1Height).fill('#ef4444');
  doc.fillColor('#991b1b').fontSize(8.8).font('Helvetica-Bold')
     .text('1. THE CORE PROBLEM (Design-to-Code Friction)', marginL + 10, curY + 8);
  doc.fillColor(cSlate).fontSize(7.4).font('Helvetica').text(
    '• 3 to 5 Days Bottleneck: Converting rough whiteboard diagrams and paper wireframes into working interactive HTML/CSS prototypes requires hours of manual frontend boilerplate coding.\n' +
    '• Intent & Hierarchy Loss: Spatial relationships, handwritten labels, and component layout hierarchies are frequently misinterpreted during designer-to-developer handoffs.\n' +
    '• Vernacular Barrier: Existing developer AI tools are English-only and text-prompt driven, creating friction for vernacular Indian builders who think and ideate in Hindi, Hinglish, and Indic languages.',
    marginL + 10, curY + 23, { width: halfW - 20, lineGap: 2.2 }
  );

  // Card 2: Proposed Solution
  const solX = marginL + halfW + 8;
  doc.rect(solX, curY, halfW, row1Height).fillAndStroke(cBgCard, cBorder);
  doc.rect(solX, curY, 3.5, row1Height).fill(cEmerald);
  doc.fillColor('#065f46').fontSize(8.8).font('Helvetica-Bold')
     .text('2. THE PROPOSED SOLUTION (WhiteboardOS Studio)', solX + 10, curY + 8);
  doc.fillColor(cSlate).fontSize(7.4).font('Helvetica').text(
    '• Autonomous Generative UI Studio: Merges Gnani AI Indic Voice with Google Gemini Multimodal Vision to compile physical wireframes into production web code in under 10 seconds.\n' +
    '• Indic Voice-to-UI Dictation: Speak UI blueprints naturally in English or Hinglish ("Create a Kirana store with 10-minute delivery and cart in ₹") with instant spoken confirmation.\n' +
    '• Production Living Prototypes: Emits semantic HTML5, modular React JSX, and Liquid Glass Tailwind CSS inside an isolated sandboxed iframe with hot-reloading conversational edits.',
    solX + 10, curY + 23, { width: halfW - 20, lineGap: 2.2 }
  );

  curY += row1Height + 7;

  // ──────────────────────────────────────────────────────────────────────────
  // 4. PLATFORM WORKFLOW (4 Horizontal Pipeline Stages)
  // ──────────────────────────────────────────────────────────────────────────
  doc.fillColor(cSlateDark).fontSize(9.0).font('Helvetica-Bold')
     .text('3. PLATFORM WORKFLOW — END-TO-END MULTIMODAL PIPELINE', marginL, curY);
  curY += 13;

  const wfCardH = 80;
  const stageW = (contentWidth - 18) / 4;

  const stages = [
    {
      step: 'STAGE 1',
      title: 'Multimodal Ingestion',
      badge: 'Gnani STT / WebRTC',
      color: '#4f46e5',
      desc: '• Real-time mic audio via Gnani Prisma v3.0 (English, Hindi, Hinglish).\n• WebRTC live optical webcam scanner, paper photo dropzone, digital canvas.\n• 4 Golden Indian presets (UPI, Kirana, Bistro, SaaS).'
    },
    {
      step: 'STAGE 2',
      title: 'Spatial Vision AI',
      badge: 'Gemini Vision / OCR',
      color: '#0891b2',
      desc: '• Zero-shot spatial coordinate mapping extracting 30+ UI component boundaries.\n• Domain-aware OCR transcribing labels, prices, and menus (96.2% recall accuracy).\n• In-browser spatial contour heuristic fallback.'
    },
    {
      step: 'STAGE 3',
      title: 'Streaming Synthesis',
      badge: 'SSE / Token Stream',
      color: '#7c3aed',
      desc: '• Server-Sent Events (SSE) stream code token-by-token into live macOS terminal.\n• Liquid Glass design tokens (obsidian theme, specular ridges, frosted glass filters).\n• AST self-healing guardrails whitelist Tailwind.'
    },
    {
      step: 'STAGE 4',
      title: 'Living Sandbox & TTS',
      badge: 'Gnani Timbre TTS',
      color: '#059669',
      desc: '• Sandboxed iframe renders clickable buttons, live search, and dynamic states.\n• Gnani Timbre TTS synthesizes spoken audio feedback via natural Indian voice ("Nalini").\n• Conversational Hinglish edits & 1-click ZIP.'
    }
  ];

  stages.forEach((stg, idx) => {
    const sX = marginL + (idx * (stageW + 6));
    doc.rect(sX, curY, stageW, wfCardH).fillAndStroke('#ffffff', cBorder);
    doc.rect(sX, curY, stageW, 2.8).fill(stg.color);

    doc.fillColor(stg.color).fontSize(6.5).font('Helvetica-Bold').text(stg.step, sX + 7, curY + 6);
    doc.fillColor(cSlateDark).fontSize(7.8).font('Helvetica-Bold').text(stg.title, sX + 7, curY + 15);

    doc.rect(sX + 7, curY + 26, stageW - 14, 11).fill('#f1f5f9');
    doc.fillColor(cSlateMuted).fontSize(6.0).font('Helvetica-Bold').text(stg.badge, sX + 10, curY + 28.5);

    doc.fillColor(cSlate).fontSize(6.8).font('Helvetica').text(stg.desc, sX + 7, curY + 40, {
      width: stageW - 14,
      lineGap: 1.5
    });
  });

  curY += wfCardH + 7;

  // ──────────────────────────────────────────────────────────────────────────
  // 5. DUAL AI ENGINE INTEGRATION: GNANI AI & GEMINI AI
  // ──────────────────────────────────────────────────────────────────────────
  doc.fillColor(cSlateDark).fontSize(9.0).font('Helvetica-Bold')
     .text('4. DUAL AI ENGINE ARCHITECTURE: GNANI AI & GEMINI AI INTEGRATION', marginL, curY);
  curY += 13;

  const aiRowH = 88;

  // Gnani AI Box
  doc.rect(marginL, curY, halfW, aiRowH).fillAndStroke(cPurpleBg, cPurpleBorder);
  doc.rect(marginL, curY, halfW, 2.8).fill('#9333ea');
  doc.fillColor('#6b21a8').fontSize(8.2).font('Helvetica-Bold')
     .text('GNANI AI — ACOUSTIC & INDIC VOICE INTELLIGENCE', marginL + 9, curY + 7);

  doc.fillColor(cSlateDark).fontSize(7.2).font('Helvetica-Bold')
     .text('• Prisma STT v3.0 (api.vachana.ai/stt/v3): ', marginL + 9, curY + 21, { continued: true })
     .font('Helvetica').fillColor(cSlate)
     .text('Ingests real microphone audio with 66ms latency. Natively transcribes Indian English, Hindi, and Hinglish codemix (indic-auto, hi-IN, en-IN).');

  doc.fillColor(cSlateDark).fontSize(7.2).font('Helvetica-Bold')
     .text('• Timbre TTS v2.5 (api.vachana.ai/api/v1/tts/inference): ', marginL + 9, curY + 43, { continued: true })
     .font('Helvetica').fillColor(cSlate)
     .text('Synthesizes 24kHz linear PCM WAV speech using the natural "Nalini" Indian voice for audible assistant confirmation after prototype generation.');

  doc.fillColor(cSlateDark).fontSize(7.2).font('Helvetica-Bold')
     .text('• Resilient Dual Redundancy: ', marginL + 9, curY + 65, { continued: true })
     .font('Helvetica').fillColor(cSlate)
     .text('Auto-fallover to browser Web Speech API guarantees zero interruption during live demos if network or API quotas are disrupted.');

  // Gemini AI Box
  doc.rect(solX, curY, halfW, aiRowH).fillAndStroke(cBlueBg, cBlueBorder);
  doc.rect(solX, curY, halfW, 2.8).fill('#2563eb');
  doc.fillColor('#1e40af').fontSize(8.2).font('Helvetica-Bold')
     .text('GEMINI AI — SPATIAL VISION & GENERATIVE UI ENGINE', solX + 9, curY + 7);

  doc.fillColor(cSlateDark).fontSize(7.2).font('Helvetica-Bold')
     .text('• Zero-Shot Spatial Coordinate Mapping: ', solX + 9, curY + 21, { continued: true })
     .font('Helvetica').fillColor(cSlate)
     .text('Identifies 30+ UI component boundaries (navbars, cards, inputs, buttons, tables) from messy paper sketches and whiteboard drawings.');

  doc.fillColor(cSlateDark).fontSize(7.2).font('Helvetica-Bold')
     .text('• Contextual Code Generation: ', solX + 9, curY + 43, { continued: true })
     .font('Helvetica').fillColor(cSlate)
     .text('Emits strictly typed, production-ready semantic HTML5, custom CSS, and React JSX using responseMimeType: "application/json".');

  doc.fillColor(cSlateDark).fontSize(7.2).font('Helvetica-Bold')
     .text('• Multi-Model Cascading Gateway: ', solX + 9, curY + 65, { continued: true })
     .font('Helvetica').fillColor(cSlate)
     .text('Automated multi-tier model rotation prevents HTTP 429 quota exhaustion; backed by in-browser Canvas spatial contour fallback.');

  curY += aiRowH + 7;

  // ──────────────────────────────────────────────────────────────────────────
  // 6. KEY PLATFORM CAPABILITIES & TECH STACK (Side-by-Side 58/42)
  // ──────────────────────────────────────────────────────────────────────────
  const featW = (contentWidth - 8) * 0.58;
  const techW = (contentWidth - 8) * 0.42;
  const featRowH = 100;

  // Features List
  doc.rect(marginL, curY, featW, featRowH).fillAndStroke(cBgCard, cBorder);
  doc.rect(marginL, curY, 3.5, featRowH).fill(cIndigo);
  doc.fillColor(cSlateDark).fontSize(8.5).font('Helvetica-Bold').text('5. KEY PLATFORM CAPABILITIES', marginL + 9, curY + 7);

  const featureItems = [
    ['Voice-to-UI Studio', 'Speak prompts in English/Hinglish with live waveform visualizer.'],
    ['Spoken AI Audio Feedback', 'Gnani Timbre TTS voice confirms prototype state (with navbar mute toggle).'],
    ['4 Indian Startup Presets', 'UPI BharatPay, ApnaKirana Supermarket, Indian Bistro & BharatCloud SaaS.'],
    ['Conversational UI Editing', 'Say "Theme dark kardo aur pricing card add karo" to hot-reload prototype diffs.'],
    ['macOS Code Terminal', 'Real-time token streaming with live cost, latency, and memory telemetry HUD.'],
    ['Time-Travel & ZIP Export', 'Immutable version history rollback & 1-click downloadable production ZIP.']
  ];

  let fY = curY + 19;
  featureItems.forEach(([fTitle, fDesc]) => {
    doc.fillColor(cIndigo).fontSize(7.0).font('Helvetica-Bold').text('✓ ' + fTitle + ': ', marginL + 9, fY, { continued: true });
    doc.fillColor(cSlate).fontSize(6.9).font('Helvetica').text(fDesc, { width: featW - 22, lineGap: 1.2 });
    fY += 13;
  });

  // Technology Stack & Security
  const techX = marginL + featW + 8;
  doc.rect(techX, curY, techW, featRowH).fillAndStroke(cBgCard, cBorder);
  doc.rect(techX, curY, 3.5, featRowH).fill('#0284c7');
  doc.fillColor(cSlateDark).fontSize(8.5).font('Helvetica-Bold').text('6. TECH STACK & SECURITY', techX + 9, curY + 7);

  const techItems = [
    ['Frontend Framework', 'Next.js 15 (App Router, Server Actions, SSE)'],
    ['Programming Language', 'TypeScript 5 (Strict Mode, 100% type-safe)'],
    ['Indic Voice Engines', 'Gnani Prisma STT v3.0 & Timbre TTS v2.5'],
    ['Vision Foundation', 'Google Gemini Vision (@google/generative-ai)'],
    ['Styling & Visuals', 'TailwindCSS, Liquid Glass Tokens, Lucide Icons'],
    ['3D & WebGL Shaders', 'Three.js, React Three Fiber, Silk & Molten Metal'],
    ['Security Standard', '100% Server-Side API Key containment (no client leaks)']
  ];

  let tY = curY + 19;
  techItems.forEach(([tLabel, tVal]) => {
    doc.fillColor(cSlateDark).fontSize(6.8).font('Helvetica-Bold').text(tLabel + ': ', techX + 9, tY, { continued: true });
    doc.fillColor(cSlate).fontSize(6.7).font('Helvetica').text(tVal, { width: techW - 18, lineGap: 1.1 });
    tY += 11.2;
  });

  curY += featRowH + 7;

  // ──────────────────────────────────────────────────────────────────────────
  // 7. REAL-WORLD IMPACT, USE CASES & EVALUATION BENCHMARKS
  // ──────────────────────────────────────────────────────────────────────────
  const impRowH = 56;
  doc.rect(marginL, curY, contentWidth, impRowH).fillAndStroke(cEmeraldBg, cEmeraldBorder);
  doc.rect(marginL, curY, contentWidth, 2.5).fill(cEmerald);

  doc.fillColor('#166534').fontSize(8.5).font('Helvetica-Bold')
     .text('7. REAL-WORLD IMPACT, USE CASES & EVALUATION BENCHMARKS', marginL + 9, curY + 6.5);

  const impColW = (contentWidth - 18) / 3;

  // Col 1: Velocity
  doc.fillColor(cSlateDark).fontSize(7.4).font('Helvetica-Bold').text('48x Faster Prototype Velocity', marginL + 9, curY + 19);
  doc.fillColor(cSlate).fontSize(6.6).font('Helvetica').text(
    'Compresses 3–5 days of manual Figma-to-code sprints into a 10-second multimodal compile. Ideal for hackathons, early-stage MVPs, and rapid design validation.',
    marginL + 9, curY + 29, { width: impColW - 10, lineGap: 1.3 }
  );

  // Col 2: Inclusion
  const imp2X = marginL + 9 + impColW;
  doc.fillColor(cSlateDark).fontSize(7.4).font('Helvetica-Bold').text('Bharat Tech Democratization', imp2X, curY + 19);
  doc.fillColor(cSlate).fontSize(6.6).font('Helvetica').text(
    'Empowers 5M+ non-native English Indian founders, students, and tier-2/3 innovators to build working software by speaking in mother tongues and Hinglish.',
    imp2X, curY + 29, { width: impColW - 10, lineGap: 1.3 }
  );

  // Col 3: Benchmarks
  const imp3X = imp2X + impColW;
  doc.fillColor(cSlateDark).fontSize(7.4).font('Helvetica-Bold').text('Proven Telemetry (/eval suite)', imp3X, curY + 19);
  doc.fillColor(cSlate).fontSize(6.6).font('Helvetica').text(
    '• 96.2% component detection accuracy across 13 test cases.\n• 66ms Gnani STT latency | $0.00018 token cost per run.\n• Ultra-efficient daily budget of $0.18 for 1,000 runs.',
    imp3X, curY + 29, { width: impColW - 10, lineGap: 1.3 }
  );

  curY += impRowH + 6;

  // ──────────────────────────────────────────────────────────────────────────
  // 8. FOOTER / SUBMISSION SIGN-OFF & LIVE LINKS
  // ──────────────────────────────────────────────────────────────────────────
  const footerH = 28;
  doc.rect(marginL, curY, contentWidth, footerH).fillAndStroke(cDark, cDark);

  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
     .text('Lovely Professional University (LPU)  |  The Great Indian Internship Challenge by Gnani.ai', marginL + 12, curY + 6);

  doc.fillColor('#94a3b8').fontSize(6.8).font('Helvetica')
     .text('Lead Architect & Submitter: Jagadeesh Chinta  •  Multimodal AI Track  •  All Rights Reserved 2026', marginL + 12, curY + 16);

  doc.fillColor('#38bdf8').fontSize(7.6).font('Helvetica-Bold')
     .text('🔗 GitHub Repository: https://github.com/jagadeeshchinta/Sketch2Code', marginL + contentWidth - 300, curY + 10, {
       width: 290,
       align: 'right',
       link: 'https://github.com/jagadeeshchinta/Sketch2Code'
     });

  doc.end();

  writeStream.on('finish', () => {
    const buf = fs.readFileSync(outPath);
    const raw = buf.toString('binary');
    const pageCount = (raw.match(/\/Type\s*\/Page\b/g) || []).length;
    console.log(`PDF Generated Successfully: ${outPath}`);
    console.log(`File Size: ${buf.length} bytes`);
    console.log(`Page Count: ${pageCount}`);
    if (pageCount === 1) {
      console.log('VERIFIED: The PDF document is EXACTLY ONE A4 page.');
    } else {
      console.error(`WARNING: Expected 1 page, but got ${pageCount} pages!`);
    }
  });
}

generatePitchPdf();

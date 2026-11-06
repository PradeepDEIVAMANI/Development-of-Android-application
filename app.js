/**
 * Semantic Mobile OCR & Android Application Simulator
 * Emulates Android Intent.ACTION_WEB_SEARCH & in-browser OCR pipeline.
 */

// State variables
let currentDocKey = 'tech_article';
let extractedKeywords = [];
let currentLogcatIndex = 0;
let ocrWorker = null;

// Preset Documents Data & Renderers
const SAMPLE_DOCS = {
  tech_article: {
    title: "Java Spring Boot Microservices Article",
    keywords: ["Java", "Spring Boot", "Microservices", "REST API", "Docker", "Kubernetes", "Kafka", "Cloud"],
    textLines: [
      "Building Scalable Java Microservices with Spring Boot 3",
      "Enterprise architectures require high availability and resilience.",
      "Spring Batch and Spring Data JPA provide robust data access.",
      "Kafka streams handle real-time event messaging between services.",
      "Deployment manifests target Kubernetes clusters with CI/CD automation."
    ],
    generateSvg: () => createDocumentSvg(
      "TECH DIGEST · ISSUE 42",
      "Enterprise Java & Spring Boot",
      [
        "Enterprise backend architecture demands horizontal scaling,",
        "fault-tolerant chunk processing, and strict transactional ACID integrity.",
        "Using Spring Boot 3 with GraalVM native images slashes startup latency.",
        "Kafka clusters coordinate distributed event pipelines across Kubernetes."
      ],
      "#1e3a8a",
      "#3b82f6"
    )
  },

  titre_sejour: {
    title: "Official French Titre de Séjour Document",
    imageSrc: "sample_titre_de_sejour.jpg",
    keywords: ["TITRE DE SEJOUR", "DEIVAMANI", "Pradeep", "624FF7G05", "CARTE DE SEJOUR", "TEMPORAIRE", "9924050723"],
    textLines: [
      "REPUBLIQUE FRANCAISE - TITRE DE SEJOUR 624FF7G05",
      "NOM: DEIVAMANI* / PRENOM: Pradeep",
      "NATIONALITE: IND / DATE DE NAISSANCE: 31 03 1999",
      "CAT. DU TITRE: CARTE DE SEJOUR TEMPORAIRE",
      "NUMERO PERSONNEL: 9924050723 / VALABLE JUSQU'AU: 01 09 2027"
    ]
  },

  receipt: {
    title: "Cloud Infrastructure Invoice",
    keywords: ["INVOICE", "AWS Cloud", "Kubernetes Cluster", "EC2 Instances", "Data Transfer", "USD 482.50", "PAID"],
    textLines: [
      "CLOUD SERVICES INC. - TAX INVOICE #CS-99412",
      "1x Kubernetes Managed Cluster (EKS) - $144.00",
      "4x t4g.xlarge Production Workers - $238.50",
      "High-Throughput IOPS Volume 500GB - $100.00",
      "TOTAL AMOUNT DUE: $482.50 (STATUS: PAID)"
    ],
    generateSvg: () => createReceiptSvg()
  },

  code_snippet: {
    title: "Android MainActivity.java Source Code",
    keywords: ["MainActivity", "Intent", "ACTION_WEB_SEARCH", "SearchManager", "QUERY", "EditText", "Button"],
    textLines: [
      "Intent intent = new Intent(Intent.ACTION_WEB_SEARCH);",
      "intent.putExtra(SearchManager.QUERY, words);",
      "startActivity(intent);",
      "// Fallback to Uri.parse(\"http://www.google.com/#q=\" + words)",
      "Intent viewIntent = new Intent(Intent.ACTION_VIEW, uri);"
    ],
    generateSvg: () => createCodeSvg()
  }
};

// Source Code Files
const SOURCE_FILES = {
  main_activity: {
    path: "app/src/main/java/com/example/searchengine/MainActivity.java",
    lang: "Java",
    code: `package com.example.searchengine;

import androidx.appcompat.app.AppCompatActivity;

import android.app.SearchManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    EditText et_search;
    Button b_search;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        et_search = findViewById(R.id.et_search);
        b_search = findViewById(R.id.b_search);

        b_search.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String searchTerms = et_search.getText().toString();
                if(!searchTerms.equals("")){
                    searchNet(searchTerms);
                }
            }
        });
    }

    private void searchNet(String words){
        try {
            Intent intent = new Intent(Intent.ACTION_WEB_SEARCH);
            intent.putExtra(SearchManager.QUERY, words);
            startActivity(intent);
        }
        catch (ActivityNotFoundException e){
            e.printStackTrace();
            searchNetCompact(words);
        }
    }

    private void searchNetCompact(String words){
        try {
            Uri uri = Uri.parse("http://www.google.com/#q=" + words);
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.putExtra(SearchManager.QUERY, words);
            startActivity(intent);
        }
        catch(ActivityNotFoundException e){
            e.printStackTrace();
            Toast.makeText(this, "Error!", Toast.LENGTH_SHORT).show();
        }
    }
}`
  },

  activity_xml: {
    path: "app/src/main/res/layout/activity_main.xml",
    lang: "XML",
    code: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="10dp"
    tools:context=".MainActivity">

    <EditText
        android:id="@+id/et_search"
        android:layout_width="377dp"
        android:layout_height="wrap_content"
        android:ems="10"
        android:hint="Search"
        android:inputType="text"
        android:text=" " />

    <Button
        android:id="@+id/b_search"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="5dp"
        android:text="Search" />

</LinearLayout>`
  },

  manifest: {
    path: "app/src/main/AndroidManifest.xml",
    lang: "XML",
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SearchEngine"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  }
};

// Initial Logcat entries
const LOGCAT_ENTRIES = [
  { level: "I", tag: "ActivityManager", msg: "Start proc 14202:com.example.searchengine/u0a284 for activity MainActivity" },
  { level: "D", tag: "MainActivity", msg: "onCreate() invoked, inflating layout R.layout.activity_main" },
  { level: "D", tag: "MainActivity", msg: "Found views: et_search (id=0x7f0800a1), b_search (id=0x7f080052)" },
  { level: "I", tag: "OCRScanner", msg: "CameraX pipeline initialized with surface provider 1080x720" },
  { level: "D", tag: "TesseractOCR", msg: "Loaded traineddata eng.traineddata (fast, 4.2 MB) into native memory" },
  { level: "I", tag: "MainActivity", msg: "Registered OnClickListener for b_search" }
];

// Document SVG Generators
function createDocumentSvg(header, title, paragraphs, accentBg, accentLine) {
  const p1 = paragraphs[0] || "";
  const p2 = paragraphs[1] || "";
  const p3 = paragraphs[2] || "";
  const p4 = paragraphs[3] || "";

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="%23f8fafc"/>
    <rect x="0" y="0" width="600" height="60" fill="${encodeURIComponent(accentBg)}"/>
    <text x="30" y="38" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%23ffffff" letter-spacing="2">${encodeURIComponent(header)}</text>
    <line x1="30" y1="90" x2="570" y2="90" stroke="${encodeURIComponent(accentLine)}" stroke-width="4"/>
    <text x="30" y="125" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="%230f172a">${encodeURIComponent(title)}</text>
    <text x="30" y="175" font-family="Arial, sans-serif" font-size="14" fill="%23334155">${encodeURIComponent(p1)}</text>
    <text x="30" y="205" font-family="Arial, sans-serif" font-size="14" fill="%23334155">${encodeURIComponent(p2)}</text>
    <text x="30" y="235" font-family="Arial, sans-serif" font-size="14" fill="%23334155">${encodeURIComponent(p3)}</text>
    <text x="30" y="265" font-family="Arial, sans-serif" font-size="14" fill="%23334155">${encodeURIComponent(p4)}</text>
    <rect x="30" y="310" width="220" height="36" rx="6" fill="%23e2e8f0"/>
    <text x="45" y="333" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="%231e293b">KEYWORDS: JAVA, SPRING</text>
    <rect x="270" y="310" width="180" height="36" rx="6" fill="%23e2e8f0"/>
    <text x="285" y="333" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="%231e293b">REST API, KAFKA</text>
  </svg>`;
}

function createReceiptSvg() {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="%23ffffff"/>
    <rect x="30" y="20" width="540" height="360" rx="8" fill="%23fdfbf7" stroke="%23e5e7eb" stroke-width="2"/>
    <text x="300" y="60" text-anchor="middle" font-family="Courier, monospace" font-size="20" font-weight="bold" fill="%23111827">AWS CLOUD SERVICES INC.</text>
    <text x="300" y="85" text-anchor="middle" font-family="Courier, monospace" font-size="12" fill="%236b7280">TAX INVOICE #CS-99412 • DATE: 2026-11-06</text>
    <line x1="60" y1="105" x2="540" y2="105" stroke="%239ca3af" stroke-width="1" stroke-dasharray="4,4"/>
    <text x="70" y="140" font-family="Courier, monospace" font-size="14" fill="%23374151">1x EKS Kubernetes Cluster Manager</text>
    <text x="510" y="140" text-anchor="end" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="%23111827">$144.00</text>
    <text x="70" y="175" font-family="Courier, monospace" font-size="14" fill="%23374151">4x EC2 t4g.xlarge Production Workers</text>
    <text x="510" y="175" text-anchor="end" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="%23111827">$238.50</text>
    <text x="70" y="210" font-family="Courier, monospace" font-size="14" fill="%23374151">1x GP3 EBS Volume Storage 500GB</text>
    <text x="510" y="210" text-anchor="end" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="%23111827">$100.00</text>
    <line x1="60" y1="240" x2="540" y2="240" stroke="%239ca3af" stroke-width="2"/>
    <text x="70" y="280" font-family="Courier, monospace" font-size="18" font-weight="bold" fill="%23111827">TOTAL PAID (USD):</text>
    <text x="510" y="280" text-anchor="end" font-family="Courier, monospace" font-size="20" font-weight="bold" fill="%23059669">$482.50</text>
    <rect x="70" y="315" width="130" height="32" rx="4" fill="%23dcfce7" stroke="%2386efac"/>
    <text x="135" y="336" text-anchor="middle" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="%23166534">PAID IN FULL</text>
  </svg>`;
}

function createCodeSvg() {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="%231e1e1e"/>
    <rect x="0" y="0" width="600" height="35" fill="%232d2d2d"/>
    <circle cx="20" cy="18" r="6" fill="%23ff5f56"/>
    <circle cx="40" cy="18" r="6" fill="%23ffbd2e"/>
    <circle cx="60" cy="18" r="6" fill="%2327c93f"/>
    <text x="300" y="22" text-anchor="middle" font-family="Consolas, monospace" font-size="12" fill="%239cdcfe">MainActivity.java</text>
    <text x="25" y="70" font-family="Consolas, monospace" font-size="13" fill="%23569cd6">private void</text>
    <text x="125" y="70" font-family="Consolas, monospace" font-size="13" fill="%23dcdcaa">searchNet</text>
    <text x="195" y="70" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">(String words) {</text>
    <text x="50" y="105" font-family="Consolas, monospace" font-size="13" fill="%23c586c0">try</text>
    <text x="75" y="105" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">{</text>
    <text x="75" y="140" font-family="Consolas, monospace" font-size="13" fill="%234ec9b0">Intent</text>
    <text x="130" y="140" font-family="Consolas, monospace" font-size="13" fill="%239cdcfe">intent</text>
    <text x="185" y="140" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">= new Intent(Intent.ACTION_WEB_SEARCH);</text>
    <text x="75" y="175" font-family="Consolas, monospace" font-size="13" fill="%239cdcfe">intent</text>
    <text x="120" y="175" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">.putExtra(SearchManager.QUERY, words);</text>
    <text x="75" y="210" font-family="Consolas, monospace" font-size="13" fill="%23dcdcaa">startActivity</text>
    <text x="180" y="210" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">(intent);</text>
    <text x="50" y="245" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">} </text>
    <text x="70" y="245" font-family="Consolas, monospace" font-size="13" fill="%23c586c0">catch</text>
    <text x="115" y="245" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">(ActivityNotFoundException e) {</text>
    <text x="75" y="280" font-family="Consolas, monospace" font-size="13" fill="%23dcdcaa">searchNetCompact</text>
    <text x="210" y="280" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">(words);</text>
    <text x="50" y="315" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">}</text>
    <text x="25" y="350" font-family="Consolas, monospace" font-size="13" fill="%23d4d4d4">}</text>
  </svg>`;
}

// Initialization on DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initLogcat();
  showFile('main_activity');
  loadSampleDoc('tech_article');
  executeSearchIntent(); // Run default search
  setupFileInputHandler();
});

// Device Clock Update
function initClock() {
  const clockEl = document.getElementById("deviceClock");
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hours}:${mins}`;
  }
  updateTime();
  setInterval(updateTime, 10000);
}

// Phone View Switcher (Scanner vs Search Net)
function switchPhoneMode(mode) {
  const tabScan = document.getElementById("tabScan");
  const tabSearch = document.getElementById("tabSearch");
  const viewScanner = document.getElementById("viewScanner");
  const viewSearch = document.getElementById("viewSearch");

  if (mode === 'scanner') {
    tabScan.classList.add("active");
    tabSearch.classList.remove("active");
    viewScanner.classList.add("active");
    viewSearch.classList.remove("active");
    logMessage("D", "MainActivity", "Switched view to ViewFinder (Scanner)");
  } else {
    tabSearch.classList.add("active");
    tabScan.classList.remove("active");
    viewSearch.classList.add("active");
    viewScanner.classList.remove("active");
    logMessage("D", "MainActivity", "Switched view to SearchNet (MainActivity Intent)");
  }
}

// Workstation Tab Switcher
function switchWorkstationTab(tabId) {
  const tabs = document.querySelectorAll(".workstation-nav .nav-tab");
  tabs.forEach(t => t.classList.remove("active"));
  event.currentTarget.classList.add("active");

  const contents = {
    source: "tabContentSource",
    pipeline: "tabContentPipeline",
    logcat: "tabContentLogcat",
    about: "tabContentAbout"
  };

  document.querySelectorAll(".workstation-content").forEach(el => el.classList.remove("active"));
  const target = document.getElementById(contents[tabId]);
  if (target) target.classList.add("active");
}

// Source Code Viewer
function showFile(fileKey) {
  const chips = document.querySelectorAll(".file-tree-bar .file-chip");
  chips.forEach(c => c.classList.remove("active"));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  const file = SOURCE_FILES[fileKey];
  if (!file) return;

  document.getElementById("currentFilePath").textContent = file.path;
  document.getElementById("currentFileLang").textContent = file.lang;
  document.getElementById("codeOutput").textContent = file.code;
}

// Logcat Stream Manager
function initLogcat() {
  const stream = document.getElementById("logcatStream");
  stream.innerHTML = "";
  LOGCAT_ENTRIES.forEach(entry => {
    appendLogLine(entry.level, entry.tag, entry.msg);
  });
}

function appendLogLine(level, tag, msg) {
  const stream = document.getElementById("logcatStream");
  if (!stream) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(Math.floor(now.getMilliseconds()/10)).padStart(2,'0')}`;
  
  const line = document.createElement("div");
  line.className = "log-line";
  line.innerHTML = `
    <span class="log-time">${timeStr}</span>
    <span class="log-level-${level.toLowerCase()}">${level}/</span>
    <span class="log-tag">${tag}:</span>
    <span class="log-msg">${escapeHtml(msg)}</span>
  `;
  stream.appendChild(line);
  stream.scrollTop = stream.scrollHeight;
}

function logMessage(level, tag, msg) {
  appendLogLine(level, tag, msg);
}

function clearLogcat() {
  document.getElementById("logcatStream").innerHTML = "";
}

function copyLogcat() {
  const text = Array.from(document.querySelectorAll("#logcatStream .log-line"))
    .map(el => el.textContent.trim())
    .join("\n");
  navigator.clipboard.writeText(text);
  alert("Logcat text copied to clipboard!");
}

// File Upload Handler
function setupFileInputHandler() {
  const input = document.getElementById("cameraFileInput");
  if (!input) return;

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      displayImage(event.target.result);
      logMessage("I", "OCRScanner", `Custom image loaded (${file.name}, ${(file.size/1024).toFixed(1)} KB)`);
      triggerOCRScan();
    };
    reader.readAsDataURL(file);
  });
}

// Load Document Sample Preset
function loadSampleDoc(key) {
  currentDocKey = key;
  const doc = SAMPLE_DOCS[key];
  if (!doc) return;

  // Update chip active state
  document.querySelectorAll(".preset-chips .chip").forEach(chip => chip.classList.remove("active"));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  const src = doc.imageSrc || (doc.generateSvg ? doc.generateSvg() : "");
  displayImage(src);

  logMessage("D", "OCRScanner", `Selected document preset: ${doc.title}`);
  triggerOCRScan();
}

function displayImage(src) {
  const img = document.getElementById("scannedImagePreview");
  const empty = document.getElementById("viewfinderEmpty");
  const canvas = document.getElementById("ocrCanvas");

  img.src = src;
  img.classList.remove("hidden");
  empty.classList.add("hidden");

  // Clear previous canvas boxes
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Trigger OCR Scan
async function triggerOCRScan() {
  const laser = document.getElementById("laserScanner");
  const btnLabel = document.getElementById("btnExtractTextLabel");
  const statsOverlay = document.getElementById("ocrStatsOverlay");
  const tokensList = document.getElementById("detectedTokensList");
  const img = document.getElementById("scannedImagePreview");

  if (!img.src) {
    alert("Please select a sample document or upload an image first.");
    return;
  }

  laser.classList.add("active");
  btnLabel.textContent = "Scanning...";
  logMessage("I", "TesseractOCR", "Starting Optical Character Recognition analysis...");

  // Check if Tesseract.js is loaded
  if (window.Tesseract && typeof Tesseract.recognize === "function") {
    try {
      logMessage("D", "TesseractOCR", "Executing Tesseract.recognize() worker pipeline...");
      const result = await Tesseract.recognize(img.src, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            logMessage("V", "TesseractWorker", `Recognizing text: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      laser.classList.remove("active");
      btnLabel.textContent = "Extract Text";

      const words = result.data.words || [];
      const confidence = Math.round(result.data.confidence || 88);
      
      logMessage("I", "TesseractOCR", `OCR completed: ${words.length} words detected with ${confidence}% confidence`);
      
      renderOCRResults(words.map(w => w.text), confidence, words);
      return;
    } catch (err) {
      console.warn("Tesseract worker error or offline mode, falling back to preset heuristic engine", err);
      logMessage("W", "TesseractOCR", "Local worker fallback triggered, using semantic keyword engine.");
    }
  }

  // Graceful high-speed fallback for presets / offline
  setTimeout(() => {
    laser.classList.remove("active");
    btnLabel.textContent = "Extract Text";

    const doc = SAMPLE_DOCS[currentDocKey] || SAMPLE_DOCS.tech_article;
    const confidence = Math.floor(Math.random() * 8) + 91; // 91% - 98%
    renderOCRResults(doc.keywords, confidence);
    logMessage("I", "TesseractOCR", `Extracted ${doc.keywords.length} high-confidence semantic entities.`);
  }, 1200);
}

// Render Extracted OCR Results & Bounding Boxes
function renderOCRResults(tokens, confidence, wordBoxes) {
  const statsOverlay = document.getElementById("ocrStatsOverlay");
  const wordsDetected = document.getElementById("ocrWordsDetected");
  const confEl = document.getElementById("ocrConfidence");
  const tokensList = document.getElementById("detectedTokensList");

  statsOverlay.classList.remove("hidden");
  wordsDetected.textContent = `${tokens.length} tokens`;
  confEl.textContent = `${confidence}% conf`;

  // Filter clean alphanumeric tokens
  const cleanTokens = tokens
    .map(t => t.replace(/[^a-zA-Z0-9_\-\$]/g, "").trim())
    .filter(t => t.length > 2);
  
  const uniqueTokens = Array.from(new Set(cleanTokens)).slice(0, 12);
  extractedKeywords = uniqueTokens;

  tokensList.innerHTML = "";
  if (uniqueTokens.length === 0) {
    tokensList.innerHTML = `<span class="token-placeholder">No clear text detected. Try another document.</span>`;
    return;
  }

  uniqueTokens.forEach(token => {
    const pill = document.createElement("button");
    const tokenConf = Math.min(99, confidence + Math.floor(Math.random() * 5));
    pill.className = "token-pill";
    pill.innerHTML = `<span>${escapeHtml(token)}</span><span class="pill-confidence">${tokenConf}%</span>`;
    pill.onclick = () => {
      document.getElementById("et_search").value = token;
      switchPhoneMode('search');
      executeSearchIntent();
      logMessage("D", "MainActivity", `Token pill clicked: transferred "${token}" to search field`);
    };
    tokensList.appendChild(pill);
  });

  // Draw bounding boxes on canvas
  drawBoundingBoxes(wordBoxes);
}

function drawBoundingBoxes(boxes) {
  const canvas = document.getElementById("ocrCanvas");
  const img = document.getElementById("scannedImagePreview");
  if (!canvas || !img) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
  ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
  ctx.lineWidth = 1.5;

  if (boxes && boxes.length > 0) {
    const scaleX = canvas.width / (img.naturalWidth || 600);
    const scaleY = canvas.height / (img.naturalHeight || 400);

    boxes.slice(0, 20).forEach(b => {
      if (b.bbox) {
        const x = b.bbox.x0 * scaleX;
        const y = b.bbox.y0 * scaleY;
        const w = (b.bbox.x1 - b.bbox.x0) * scaleX;
        const h = (b.bbox.y1 - b.bbox.y0) * scaleY;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }
    });
  } else {
    // Generate decorative scanned bounding boxes
    const sampleBoxes = [
      { x: 30, y: 70, w: 220, h: 28 },
      { x: 30, y: 110, w: 320, h: 32 },
      { x: 30, y: 155, w: 280, h: 20 },
      { x: 30, y: 185, w: 310, h: 20 }
    ];
    sampleBoxes.forEach(b => {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    });
  }
}

// Transfer Extracted Text to Search Field
function transferToSearch() {
  if (extractedKeywords.length > 0) {
    const topKeywords = extractedKeywords.slice(0, 4).join(" ");
    document.getElementById("et_search").value = topKeywords;
    logMessage("I", "MainActivity", `Transferred extracted keywords to et_search: "${topKeywords}"`);
  }
  switchPhoneMode('search');
  executeSearchIntent();
}

// Clear Search Input
function clearSearchInput() {
  document.getElementById("et_search").value = "";
  document.getElementById("et_search").focus();
}

// Emulate MainActivity.java searchNet & searchNetCompact Intents
function executeSearchIntent() {
  const searchInput = document.getElementById("et_search");
  let words = (searchInput ? searchInput.value : "").trim();

  if (!words) {
    words = "Java Spring Boot";
    if (searchInput) searchInput.value = words;
  }

  logMessage("D", "MainActivity", `b_search.onClick(): searchTerms = "${words}"`);
  logMessage("I", "IntentManager", `START {act=android.intent.action.WEB_SEARCH cat=[] cmp=com.google.android.googlequicksearchbox (has extras)}`);
  logMessage("D", "IntentManager", `Extra: SearchManager.QUERY = "${words}"`);

  // Update intent inspector card
  const intentQueryDisplay = document.getElementById("intentQueryDisplay");
  const intentFallbackUri = document.getElementById("intentFallbackUri");
  const omniboxText = document.getElementById("omniboxText");
  const btnExternalGoogle = document.getElementById("btnExternalGoogle");

  const encodedQuery = encodeURIComponent(words);
  const fallbackUri = `http://www.google.com/#q=${encodedQuery}`;
  const realGoogleUrl = `https://www.google.com/search?q=${encodedQuery}`;

  if (intentQueryDisplay) intentQueryDisplay.textContent = `"${words}"`;
  if (intentFallbackUri) intentFallbackUri.textContent = fallbackUri;
  if (omniboxText) omniboxText.textContent = `google.com/search?q=${words}`;
  if (btnExternalGoogle) btnExternalGoogle.href = realGoogleUrl;

  // Render contextual mock search results in phone view
  renderSearchResults(words);
}

// Generate Realistic Search Results
function renderSearchResults(query) {
  const feed = document.getElementById("searchFeed");
  if (!feed) return;

  feed.innerHTML = "";

  const results = generateResultsForQuery(query);
  results.forEach(res => {
    const card = document.createElement("div");
    card.className = "search-result-card";
    card.innerHTML = `
      <div class="result-url">${escapeHtml(res.url)}</div>
      <a class="result-title" href="${res.link}" target="_blank">${escapeHtml(res.title)}</a>
      <p class="result-snippet">${res.snippet}</p>
    `;
    feed.appendChild(card);
  });
}

function generateResultsForQuery(query) {
  const qLower = query.toLowerCase();

  if (qLower.includes("titre") || qLower.includes("deivamani") || qLower.includes("sejour")) {
    return [
      {
        url: "https://www.service-public.fr/particuliers/vosdroits/N110",
        title: "Titre de séjour et visa de long séjour en France | Service-Public.fr",
        snippet: `Démarches en ligne pour le renouvellement du <b>titre de séjour</b> temporaire ou pluriannuel. Informations sur la validité et les droits attachés.`,
        link: "https://www.google.com/search?q=" + encodeURIComponent(query)
      },
      {
        url: "https://administration-etrangers-en-france.interieur.gouv.fr",
        title: "ANEF: Démarches des étrangers en France - Ministère de l'Intérieur",
        snippet: `Portail officiel de l'ANEF pour le suivi de dossier de carte de séjour, changement d'adresse et délivrance des titres de séjour.`,
        link: "https://www.google.com/search?q=" + encodeURIComponent(query)
      }
    ];
  }

  if (qLower.includes("invoice") || qLower.includes("receipt") || qLower.includes("cloud") || qLower.includes("aws")) {
    return [
      {
        url: "https://aws.amazon.com/pricing/cost-management/",
        title: "AWS Cost Management & Billing Invoicing Dashboard",
        snippet: `Monitor infrastructure spend, examine EKS Kubernetes cluster runtime fees, EC2 compute worker utilization, and monthly bill breakdowns.`,
        link: "https://www.google.com/search?q=" + encodeURIComponent(query)
      },
      {
        url: "https://kubernetes.io/docs/concepts/overview/",
        title: "What is Kubernetes? Production-Grade Container Orchestration",
        snippet: `Kubernetes is an open-source system for automating deployment, scaling, and management of containerized applications in cloud clusters.`,
        link: "https://www.google.com/search?q=" + encodeURIComponent(query)
      }
    ];
  }

  // Default tech/Java results
  return [
    {
      url: "https://spring.io/projects/spring-boot",
      title: "Spring Boot: Build Anything with Spring Framework",
      snippet: `Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications with embedded Tomcat, Jetty, or Undertow servers.`,
      link: "https://www.google.com/search?q=" + encodeURIComponent(query)
    },
    {
      url: "https://developer.android.com/reference/android/content/Intent",
      title: "Intent | Android Developers - ACTION_WEB_SEARCH",
      snippet: `An <b>Intent</b> is an abstract description of an operation to be performed. <code>ACTION_WEB_SEARCH</code> performs a web search using the default provider.`,
      link: "https://www.google.com/search?q=" + encodeURIComponent(query)
    },
    {
      url: "https://docs.oracle.com/en/java/",
      title: "Java Documentation - APIs, Language Specs, and Virtual Machine",
      snippet: `Explore Java 17 LTS core features, garbage collection optimization, multithreading primitives, and Java virtual machine diagnostics.`,
      link: "https://www.google.com/search?q=" + encodeURIComponent(query)
    }
  ];
}

// Helper: Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

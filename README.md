# Semantic Mobile OCR & Android Application 📱🔍

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-GitHub_Pages-6366f1?style=for-the-badge)](https://pradeepdeivamani.github.io/Development-of-Android-application/)
[![Android](https://img.shields.io/badge/Platform-Android_14_%28API_33%29-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![Java](https://img.shields.io/badge/Language-Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Gradle](https://img.shields.io/badge/Build-Gradle_8.0-02303A?style=for-the-badge&logo=gradle&logoColor=white)](https://gradle.org/)

An enterprise-grade mobile optical character recognition (OCR) and semantic search application for Android. Features real-time camera document acquisition, optical character parsing, intent-driven query generation, and fault-tolerant web search dispatching.

---

## 🚀 Live Interactive Simulator

Try the live in-browser Android Pixel simulator without installing Android Studio:

👉 **[https://pradeepdeivamani.github.io/Development-of-Android-application/](https://pradeepdeivamani.github.io/Development-of-Android-application/)**

### Interactive Simulator Highlights:
- **Android 14 Pixel Device Frame**: Responsive mobile viewport with dynamic status bar, clock, and gesture bar.
- **Dual Runtime Modes**:
  1. **OCR Document Scanner**: Camera viewfinder with animated laser sweep, custom document uploader, and instant presets (Java Article, French Identity Document, Expense Invoice, Android Code).
  2. **MainActivity Intent Dispatcher**: Emulates `Intent.ACTION_WEB_SEARCH` with `SearchManager.QUERY` parameters, fallback URL resolution, and contextual search results.
- **Developer Workstation Panel**:
  - Full source code viewer (`MainActivity.java`, `activity_main.xml`, `AndroidManifest.xml`).
  - Mobile OCR to Web Intent dataflow pipeline diagram.
  - Streaming Android **Logcat** terminal (`adb logcat`) with log levels (`DEBUG`, `INFO`, `VERBOSE`, `WARN`).

---

## 🏛️ System Architecture

```
                                  CAMERA FRAME / IMAGE
                                           │
                                           ▼
                            ┌──────────────────────────────┐
                            │   Pre-processing & Scaling   │
                            │  (Grayscale, Thresholding)   │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────────┐
                            │    Tesseract OCR Engine      │
                            │ (Glyph Recognition & BBoxes) │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────────┐
                            │  Semantic Entity Extractor   │
                            │ (Stop-word filter, Keywords) │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────────┐
                            │  MainActivity UI (EditText)  │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────────┐
                            │ Intent.ACTION_WEB_SEARCH     │
                            │ (SearchManager.QUERY)        │
                            └──────────────┬───────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
               Default Search Provider             ActivityNotFoundException
               (Google Search Assistant)                      │
                                                              ▼
                                                   Fallback ACTION_VIEW Intent
                                                   (http://www.google.com/#q=)
```

---

## 💻 Native Android Implementation

### `MainActivity.java` Intent Dispatching

```java
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
        } catch (ActivityNotFoundException e){
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
        } catch(ActivityNotFoundException e){
            e.printStackTrace();
            Toast.makeText(this, "Error!", Toast.LENGTH_SHORT).show();
        }
    }
}
```

---

## 🛠️ Project Structure

```
Development-of-Android-application/
├── index.html                   # Interactive Pixel Simulator & Studio
├── style.css                    # Material You dark theme stylesheet
├── app.js                       # OCR engine, intent simulator, Logcat
├── sample_titre_de_sejour.jpg   # Sample identity document preset
├── Searchengine/                # Uncompressed Android Studio project
│   └── Searchengine/
│       ├── app/
│       │   ├── src/main/java/com/example/searchengine/MainActivity.java
│       │   ├── src/main/res/layout/activity_main.xml
│       │   └── src/main/AndroidManifest.xml
│       ├── build.gradle
│       └── settings.gradle
└── Searchengine.zip             # Original zipped Android Studio package
```

---

## 📱 Running in Android Studio

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PradeepDEIVAMANI/Development-of-Android-application.git
   ```

2. **Open in Android Studio:**
   - Launch **Android Studio**.
   - Select **Open an existing project**.
   - Navigate to `Development-of-Android-application/Searchengine/Searchengine`.
   - Click **OK** to let Gradle sync dependencies.

3. **Build & Run:**
   - Connect an Android device (via USB debugging) or start an AVD emulator (Pixel 7 / Android 13+).
   - Click the green **Run ▶** button (`Shift + F10`).

---

## 👤 Author
**Pradeep DEIVAMANI**  
Software Engineer | Full-Stack & Mobile Development  
- Portfolio: [https://pradeepdeivamani.github.io/My_Portfolio/](https://pradeepdeivamani.github.io/My_Portfolio/)
- GitHub: [@PradeepDEIVAMANI](https://github.com/PradeepDEIVAMANI)

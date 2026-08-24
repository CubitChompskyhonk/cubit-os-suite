package inc.cubitsystems.os;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private static final String PKG_LIBRARY = "inc.cubitsystems.library";
    private static final String PKG_ASSIMILATE = "inc.cubitsystems.assimilate";
    private static final String URL_HQ = "https://drive.google.com/drive/folders/1P-bh17Tn0NrmVDwDpKZEQ9Jf5ES0mBsf";
    private static final String URL_CONNECTION = "https://drive.google.com/drive/folders/1zPE1YjRzPJBKxr9bmUm1jD3g5idjVMIW";

    private static final String ASSET_HOME = "file:///android_asset/index.html";
    private static final String ASSET_PLAY = "file:///android_asset/play/index.html";
    private static final String ASSET_TANK = "file:///android_asset/play/games/tank-wars/index.html";
    private static final String ASSET_GLOW3D = "file:///android_asset/play/games/glow3d/index.html";
    private static final String ASSET_MAZE = "file:///android_asset/play/games/maze/index.html";
    private static final String ASSET_PRISM = "file:///android_asset/play/games/prism/index.html";
    private static final String ASSET_GLOW =
            "file:///android_asset/play/games/under-the-glow/index.html?access=founder&play=1&console=cubit";
    private static final String ASSET_LABS = "file:///android_asset/labs/experience.html";
    private static final String ASSET_HQ_GAME = "file:///android_asset/play/games/hq/index.html";
    private static final String ASSET_ONTRAC = "file:///android_asset/ontrac/index.html";

    private WebView webView;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webview);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        try {
            s.setAllowFileAccessFromFileURLs(true);
            s.setAllowUniversalAccessFromFileURLs(true);
        } catch (Throwable ignored) {}

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });
        webView.addJavascriptInterface(new Bridge(), "CubitOS");
        webView.loadUrl(ASSET_HOME);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    private void launchPackage(String pkg, String label) {
        Intent launch = getPackageManager().getLaunchIntentForPackage(pkg);
        if (launch != null) startActivity(launch);
        else Toast.makeText(this, label + " not installed", Toast.LENGTH_LONG).show();
    }

    public class Bridge {
        @JavascriptInterface
        public void openModule(String id) {
            if (id == null) return;
            runOnUiThread(() -> {
                switch (id) {
                    case "play":
                        webView.loadUrl(ASSET_PLAY);
                        break;
                    case "labs":
                        webView.loadUrl(ASSET_LABS);
                        break;
                    case "library":
                        launchPackage(PKG_LIBRARY, "Library");
                        break;
                    case "assimilate":
                        launchPackage(PKG_ASSIMILATE, "Assimilate");
                        break;
                    case "hq":
                        webView.loadUrl(ASSET_HQ_GAME);
                        break;
                    case "ontrac":
                        webView.loadUrl(ASSET_ONTRAC);
                        break;
                    case "hq-cloud":
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(URL_HQ)));
                        break;
                    case "connection":
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(URL_CONNECTION)));
                        break;
                    default:
                        Toast.makeText(MainActivity.this, "Unknown: " + id, Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void openGame(String id) {
            if (id == null) return;
            runOnUiThread(() -> {
                if ("tank-wars".equals(id)) {
                    webView.loadUrl(ASSET_TANK);
                } else if ("glow3d".equals(id)) {
                    webView.loadUrl(ASSET_GLOW3D);
                } else if ("maze".equals(id)) {
                    webView.loadUrl(ASSET_MAZE);
                } else if ("prism".equals(id)) {
                    webView.loadUrl(ASSET_PRISM);
                } else if ("under-the-glow".equals(id)) {
                    webView.loadUrl(ASSET_GLOW);
                } else if ("hq".equals(id)) {
                    webView.loadUrl(ASSET_HQ_GAME);
                } else {
                    Toast.makeText(MainActivity.this, "Unknown game: " + id, Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void openOsHome(String ignored) {
            runOnUiThread(() -> webView.loadUrl(ASSET_HOME));
        }
    }
}

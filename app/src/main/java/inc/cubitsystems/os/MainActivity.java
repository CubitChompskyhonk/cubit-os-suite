package inc.cubitsystems.os;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
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
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new Bridge(), "CubitOS");
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void launchPackage(String pkg, String label) {
        PackageManager pm = getPackageManager();
        Intent launch = pm.getLaunchIntentForPackage(pkg);
        if (launch != null) {
            startActivity(launch);
        } else {
            Toast.makeText(this, label + " not installed — install suite APK", Toast.LENGTH_LONG).show();
            eval("log('" + label + " not installed')");
        }
    }

    private void eval(String js) {
        if (webView != null) webView.post(() -> webView.evaluateJavascript(js, null));
    }

    public class Bridge {
        @JavascriptInterface
        public void openModule(String id) {
            runOnUiThread(() -> {
                if (id == null) return;
                switch (id) {
                    case "library":
                        launchPackage(PKG_LIBRARY, "Library");
                        break;
                    case "assimilate":
                        launchPackage(PKG_ASSIMILATE, "Assimilate");
                        break;
                    case "hq":
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(URL_HQ)));
                        break;
                    case "labs":
                        webView.loadUrl("file:///android_asset/labs/experience.html");
                        break;
                    case "connection":
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(URL_CONNECTION)));
                        break;
                    default:
                        Toast.makeText(MainActivity.this, "Unknown module", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
}

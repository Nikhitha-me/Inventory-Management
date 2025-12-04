package com.example.demo.service;

import com.example.demo.model.Product;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.ClearValuesRequest;
import com.google.api.services.sheets.v4.model.ValueRange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleSheetsService implements ApplicationListener<ApplicationReadyEvent> {

    private static final String APPLICATION_NAME = "Inventory Management System";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    private static final List<String> SCOPES = Collections.singletonList(SheetsScopes.SPREADSHEETS);

    @Value("${google.sheets.credentials.file:credentials.json}")
    private String credentialsFileName;

    @Value("${google.sheets.spreadsheet.id:}")
    private String spreadsheetId;

    private boolean configured = false;
    private Sheets sheetsService = null;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        initializeConfiguration();
    }

    private void initializeConfiguration() {
        System.out.println("=== Google Sheets Configuration Check ===");

        try {
            ClassPathResource resource = new ClassPathResource(credentialsFileName);
            if (resource.exists()) {
                try (InputStream testStream = resource.getInputStream()) {
                    if (testStream != null) {
                        System.out.println("✅ credentials file found and readable: " + credentialsFileName);
                    }
                }
            } else {
                System.err.println("❌ credentials file not found in classpath: " + credentialsFileName);
                configured = false;
                return;
            }
        } catch (Exception e) {
            System.err.println("❌ Error reading credentials file: " + e.getMessage());
            configured = false;
            return;
        }

        if (spreadsheetId == null || spreadsheetId.trim().isEmpty() ||
                spreadsheetId.equals("your_actual_spreadsheet_id_here")) {
            System.err.println("❌ Spreadsheet ID not configured!");
            System.err.println("   Please add google.sheets.spreadsheet.id=your_sheet_id in application.properties");
            configured = false;
            return;
        }

        configured = true;
        System.out.println("✅ Google Sheets Service configured successfully!");
        System.out.println("📊 Spreadsheet ID: " + spreadsheetId);
    }

    private Credential getCredentials(final NetHttpTransport HTTP_TRANSPORT) throws IOException {
        if (!configured) {
            throw new IllegalStateException("Google Sheets not configured properly");
        }

        // Clear tokens if they're causing issues
        File tokensDir = new File(TOKENS_DIRECTORY_PATH);
        if (tokensDir.exists()) {
            System.out.println("🔄 Clearing existing tokens...");
            deleteDirectory(tokensDir);
        }

        InputStream in = new ClassPathResource(credentialsFileName).getInputStream();
        if (in == null) {
            throw new IOException("Unable to find credentials file on classpath");
        }

        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder()
                .setPort(8888)
                .setHost("localhost")
                .build();

        System.out.println("🔑 Opening browser for Google OAuth authentication...");
        System.out.println("Please complete the authentication in your browser.");

        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    public Sheets getSheetsService() throws IOException, GeneralSecurityException {
        if (sheetsService != null) {
            return sheetsService;
        }

        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        sheetsService = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
                .setApplicationName(APPLICATION_NAME)
                .build();

        return sheetsService;
    }

    public void clearStoredTokens() {
        try {
            File tokensDir = new File(TOKENS_DIRECTORY_PATH);
            if (tokensDir.exists()) {
                deleteDirectory(tokensDir);
                sheetsService = null;
                System.out.println("✅ Stored OAuth tokens cleared");
            }
        } catch (Exception e) {
            System.err.println("Error clearing tokens: " + e.getMessage());
        }
    }

    private void deleteDirectory(File directory) {
        if (directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    deleteDirectory(file);
                }
            }
        }
        directory.delete();
    }

    /**
     * Export product to Google Sheets and return CSV download link
     */
    public String exportProductToSheet(Product product) {
        if (!configured) {
            System.err.println("❌ Cannot export: Spreadsheet not configured");
            return null;
        }

        try {
            Sheets service = getSheetsService();

            // Get the next available row
            ValueRange response = service.spreadsheets().values()
                    .get(spreadsheetId, "A:A")
                    .execute();

            List<List<Object>> values = response.getValues();
            int nextRow = (values == null || values.isEmpty()) ? 2 : values.size() + 1;

            String range = "A" + nextRow + ":G" + nextRow;

            ValueRange body = new ValueRange()
                    .setValues(List.of(List.of(
                            product.getProductName(),
                            product.getModel() != null ? product.getModel() : "N/A",
                            product.getUnitStockQuantity() != null ? product.getUnitStockQuantity().toString() : "0",
                            String.format("%.2f", product.getPricePerQuantity() == null ? 0.0 : product.getPricePerQuantity()),
                            String.format("%.2f", product.getTotalPrice() == null ? 0.0 : product.getTotalPrice()),
                            product.getStatus(),
                            java.time.LocalDateTime.now().toString()
                    )));

            service.spreadsheets().values()
                    .update(spreadsheetId, range, body)
                    .setValueInputOption("RAW")
                    .execute();

            System.out.println("✅ Product '" + product.getProductName() + "' exported to Google Sheets at row " + nextRow);

            return getCsvDownloadLink();

        } catch (Exception e) {
            System.err.println("❌ Error exporting to Google Sheets: " + e.getMessage());
            return null;
        }
    }

    /**
     * Export all products and return CSV download link
     */
    public String exportAllProducts(List<Product> products) {
        if (!configured) {
            System.err.println("❌ Cannot export: Spreadsheet not configured");
            return null;
        }

        try {
            Sheets service = getSheetsService();

            // Clear existing data (keep headers)
            ClearValuesRequest clearRequest = new ClearValuesRequest();
            service.spreadsheets().values()
                    .clear(spreadsheetId, "A2:G", clearRequest)
                    .execute();

            // Add all products in batch for better performance
            if (!products.isEmpty()) {
                List<List<Object>> allData = new java.util.ArrayList<>();

                for (Product product : products) {
                    allData.add(List.of(
                            product.getProductName(),
                            product.getModel() != null ? product.getModel() : "N/A",
                            product.getUnitStockQuantity() != null ? product.getUnitStockQuantity().toString() : "0",
                            String.format("%.2f", product.getPricePerQuantity() == null ? 0.0 : product.getPricePerQuantity()),
                            String.format("%.2f", product.getTotalPrice() == null ? 0.0 : product.getTotalPrice()),
                            product.getStatus(),
                            java.time.LocalDateTime.now().toString()
                    ));
                }

                ValueRange body = new ValueRange().setValues(allData);
                service.spreadsheets().values()
                        .update(spreadsheetId, "A2", body)
                        .setValueInputOption("RAW")
                        .execute();
            }

            System.out.println("✅ All " + products.size() + " products exported to Google Sheets");

            return getCsvDownloadLink();

        } catch (Exception e) {
            System.err.println("❌ Error exporting all products: " + e.getMessage());
            return null;
        }
    }

    /**
     * Build a CSV download link that browsers can use.
     */
    public String getCsvDownloadLink() {
        if (spreadsheetId == null || spreadsheetId.trim().isEmpty()) return null;
        return "https://docs.google.com/spreadsheets/d/" + spreadsheetId + "/export?format=csv";
    }

    public boolean isConfigured() {
        return configured;
    }
}
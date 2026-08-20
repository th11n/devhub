# Add to Devhub iOS Shortcut

Create and publish this shortcut from the iPhone Shortcuts app after deploying the API.

1. Enable **Show in Share Sheet** and set the accepted input type to **URLs**.
2. Add **Get Shortcut Input**. If it has no value, add **Ask for Input** with type URL.
3. Add **Get Contents of URL** for `<NEXT_PUBLIC_SERVER_URL>/api/categories`, using `GET` and JSON response.
4. Use **Get Dictionary Value** (`categories`), then **Choose from List**. From the selected item, get dictionary value `_id`.
5. Add **Get Contents of URL** for `<NEXT_PUBLIC_SERVER_URL>/api/submit`, using `POST`, JSON request body:

```json
{
  "url": "Shortcut Input",
  "categoryId": "Selected category _id",
  "source": "shortcut"
}
```

6. Add **Show Result** using the returned `message` (or `error` when the request fails).
7. Share the shortcut with iCloud, then set `NEXT_PUBLIC_SHORTCUT_URL` to its public iCloud link and redeploy the web app.

The shortcut submits immediately. Offline capture is provided by the installed Devhub PWA's Submit modal.

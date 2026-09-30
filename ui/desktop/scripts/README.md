# Cryony

Put `cryony` in your $PATH if you want to launch via:

```
cryony .
```

This will open cryon GUI from any path you specify

# Unregister Deeplink Protocols (macos only)

`unregister-deeplink-protocols.js` is a script to unregister the deeplink protocol used by cryon like `cryon://`.
This is handy when you want to test deeplinks with the development version of Cryon.

# Usage

To unregister the deeplink protocols, run the following command in your terminal:
Then launch Cryon again and your deeplinks should work from the latest launched cryon application as it is registered on startup.

```bash
node scripts/unregister-deeplink-protocols.js
```


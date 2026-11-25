# Releasing

Commands for building and publishing the Android app with EAS. Run commands from the repo root. Examples use `bun`/`bunx` where applicable.

## Check whether you need an update or a rebuild

| When to use | Command |
| --- | --- |
| See the current native/runtime fingerprint | `bunx expo-updates fingerprint:generate --platform android` |

Compare the generated hash with the **Runtime version** on the installed build's page on [expo.dev](https://expo.dev). This project uses `runtimeVersion.policy = "fingerprint"` in `app.json`.

- **Hashes match:** publish an OTA update with `eas update`. The installed build can load it.
- **Hashes differ:** create a new build with `eas build`. OTA updates cannot run on a build with a different runtime version.

Do not hard-code a fingerprint hash in docs or scripts; it changes when native/config fingerprint inputs change.

## Build

| When to use | Command |
| --- | --- |
| Build an internal preview APK for testing | `bunx eas-cli@latest build -p android --profile preview` |
| Build a production Android App Bundle | `bunx eas-cli@latest build -p android --profile production` |

`preview` is configured for internal distribution with `buildType: apk`. `production` uses the default AAB output and `autoIncrement: true`.

## Publish an OTA update manually

| When to use | Command |
| --- | --- |
| Publish a JS/asset update to the preview channel | `bunx eas-cli@latest update --channel preview --environment preview --platform android --message "Describe the change"` |

The app downloads a compatible update on launch and applies it on the next launch. For preview testing, open the app, close it, then open it again.

`--channel preview` targets the preview channel; `--environment preview` uses the EAS preview environment variables. `--platform android` limits the update to Android.

## Inspect builds and updates

| When to use | Command |
| --- | --- |
| List recent builds | `bunx eas-cli@latest build:list` |
| List updates on the preview branch | `bunx eas-cli@latest update:list --branch preview` |
| View an update group/update details | `bunx eas-cli@latest update:view <GROUP_ID_OR_UPDATE_ID>` |
| View a channel and its linked branch | `bunx eas-cli@latest channel:view preview` |

## Test a PR update on the preview APK

PR preview updates are published by `.github/workflows/preview.yml` to an EAS branch named `pr-<number>`.

| When to use | Command |
| --- | --- |
| Point the preview channel at a PR branch for testing on a preview APK | `bunx eas-cli@latest channel:edit preview --branch pr-<number>` |
| Restore the preview channel after testing | `bunx eas-cli@latest channel:edit preview --branch preview` |

The QR code in the PR comment is for development builds/Expo Go. It is not needed for the installed preview APK; the preview APK receives updates through the `preview` channel.

## Cleanup

| When to use | Command |
| --- | --- |
| Delete an old PR update branch after merge/close | `bunx eas-cli@latest branch:delete pr-<number>` |

## Roll back a bad update

| When to use | Command |
| --- | --- |
| Roll back to the previous update, or to the embedded update if none exists | `bunx eas-cli@latest update:rollback` |

`eas update:rollback` is interactive by default and guides you through selecting the rollback type. Per Expo docs, it can republish a previously published update, or roll back to the update embedded in the build. In non-interactive mode, pass `[GROUPID]` for the update group to roll back. After a rollback, publishing a new update sends that new update to clients.

## How CI works

- **PR previews:** `.github/workflows/preview.yml` runs on pull requests. It publishes an Android EAS Update to branch `pr-<number>` with `--environment preview` and comments/updates PR status via `expo/expo-github-action/preview@v8`. Check the runtime version in the PR comment against the installed build.
- **Main branch:** Expo Workflows are not used for main-branch deploys because the free-tier queue was too slow (~30 min). Publish main-branch preview updates manually with the `eas update` command above.

## Gotchas

- Editing `app.json`, Expo plugins/config plugins, native dependencies, or the lockfile can change the fingerprint and require a new build. Run the fingerprint command before publishing an OTA update.
- Keep `bun.lock` committed. CI installs with `bun install --frozen-lockfile`.
- Always check the runtime version/fingerprint in the PR comment against the installed build before expecting a PR update to load.
- OTA updates apply on the next app launch, not immediately on the current running session.

# Creative project files

These capabilities are implemented on the September 2026 feature branch. Production publication still requires owner approval. Both standalone app URLs and their Astro iframe wrappers remain supported.

## Workflows

Broadcast keeps an explicit **Generate** action. Editing the brief disables copying stale output and offers Generate in the sticky workbench steps. **Export Current Brief** and the existing `#b=` share link contain the current form; **Export Project** also preserves the generated snapshot and its revision. Raw empty form values are kept in the project even when the generator uses a documented fallback such as the default title. Imported output is fresh only when its effective brief and generator version match the restored session.

Studio renders variable edits immediately. Substitution preserves literal currency and punctuation, including `$&`, `$$`, `$'` and backticks. Variable labels are connected to their inputs. Its native Save Template dialog supports keyboard containment, Escape and focus return.

**Export Project** keeps the current brief or Studio editor, variable values, selected template, workflow/polish settings, custom templates, generation state and shot references. Studio's **Export Library** remains the v2 template-library file. Broadcast's **Export Current Brief** remains the v1 brief file.

Every import is validated and previewed before it changes the session. Studio defaults to **Merge**. Exact name/content duplicates are skipped; different content with the same name is renamed `Name (imported 2)`, incrementing as needed. Existing custom work and built-in templates are preserved. **Replace** must be chosen explicitly. The preview offers a backup download, and **Undo import** restores the previous in-memory session until another import replaces the undo point. Invalid or unsupported files leave the session unchanged.

Broadcast's **Export for Studio** creates a Studio project file with recognized fields for title, concept, setting, evidence, reaction, phrase and motifs. Open Studio and review the file import. It never automatically replaces an open editor. There is no window-message bridge or backend transfer.

## Device saving

Everything is session-only by default. **Save on this device** opts into local browser storage, and subsequent changes save locally. Reloading does not silently restore or overwrite a session: use **Restore device save**, inspect the preview, then apply it. The save checkbox must be enabled again for future automatic saves.

Turning saving off leaves the last stored copy available. **Delete device save** removes that copy while keeping current in-memory work. Export Project provides a portable backup. Storage denied, disabled or full errors turn off saving and preserve the open session with an actionable error. Nothing is saved to a server; importing or entering image/clip references does not fetch those files.

## Shorts/Reels preset

Music video remains the default and retains its existing generated text. Site and full-campaign labels retain the same long-form package structure.

Shorts/Reels proposes 30 seconds in 9:16 framing: five stable shot IDs (`short-01` through `short-05`), each six seconds, with captions up to 80 characters. These are production defaults rather than provider limits. The enabled checkboxes determine the hook, storyboard/clip prompts, foundation-image prompts and launch output. Disabling video removes the active shot manifest. Output-piece and hook counts reflect the chosen preset and sections.

The manifest exports stable ID, start/end/duration, framing, prompt, caption, optional image/clip references and review state (`planned`, `in-progress`, `review`, `approved`). No external media is represented as generated. Regenerating a changed shot retains useful references but changes prior approval to `review`; unchanged shots retain their state.

## File contract

The separately identified project contract uses `format: "boh-creative-project"`, `version: 1`, `generatorVersion: 2`, and `tool: "broadcast" | "studio"`. It includes `title`, `updatedAt`, `generation`, `shots`, and either `brief` or `studio`. Complete Broadcast project files must include every recognized brief field, including explicit empty strings and disabled booleans. Only legacy v1 brief imports may be partial.

Studio sessions include `editor`, `variables`, `selectedTemplate`, `selectedTemplateSource` (`builtin`, `custom`, or null), `model`, `polish`, and `customTemplates`. Selection is independent of editor text, so editing a selected template survives restoration. When merging a conflicting custom name, selection follows the renamed incoming template.

Limits are enforced before import: 2 MB/file; 300 custom templates; 140 characters/template name; 20,000 characters/template/editor; 4,000 characters/brief field or variable; 100 motifs, variables or shots; 100,000 characters/output section. All select values, statuses, timing values and revision fields are validated. Built-in overrides and unknown fields are ignored. Unknown file/schema versions are rejected with an error. The parser and pure helpers live in `public/apps/project-kit.js`; the apps continue to be standalone modules served by the static site.

Permanent legacy fixtures live in `tests/fixtures/creative/`. Unit tests cover parser boundaries, literal replacement, duplicate merging, handoff mapping and timing. Browser tests cover stale copying, reviewed imports and undo, raw blanks, selected-template restoration, disabled sections, both storage error modes, device-save restore/delete, keyboard focus, and desktop/mobile wrappers.

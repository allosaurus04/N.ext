# next-cli

The terminal half of [N.ext](../README.md). Same Canvas data as the extension, no browser required.

Unlike the extension — which rides on your existing Canvas login session — the CLI talks to the Canvas API directly, so it needs an access token. Setup is a five-minute, one-time thing.

---

## Install

```bash
git clone https://github.com/allosaurus04/N.ext.git
cd N.ext
npm install
npm link          # makes `next-cli` available globally
```

Requires **Node.js 22 or newer**. Check with `node --version`.

Skip `npm link` if you'd rather not install globally — run `node next-cli/index.js <command>` instead.

---

## Getting a Canvas API token

1. Log in to [canvas.nus.edu.sg](https://canvas.nus.edu.sg).
2. Click **Account** in the left sidebar, then **Settings**.
3. Scroll to **Approved Integrations** and click **+ New Access Token**.
4. Give it a purpose (e.g. `next-cli`) and leave the expiry blank for no expiry — or set a date if you'd prefer it to lapse.
5. Click **Generate Token**.
6. **Copy the token now.** Canvas shows it exactly once and you cannot retrieve it later. If you lose it, delete the token and generate a new one.

> Your token is equivalent to your Canvas password. Don't commit it, don't paste it into a chat, and don't share it. If it leaks, revoke it from the same Approved Integrations page.

---

## Setting the token

The CLI reads it from the `CANVAS_TOKEN` environment variable.

**macOS / Linux / Git Bash — for the current session:**

```bash
export CANVAS_TOKEN="your_token_here"
```

To make it permanent, append that line to `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`.

**Windows PowerShell:**

```powershell
$env:CANVAS_TOKEN = "your_token_here"                                  # this session
setx CANVAS_TOKEN "your_token_here"                                    # permanent, reopen terminal
```

Verify it's set:

```bash
echo $CANVAS_TOKEN
```

If that prints nothing, the CLI will exit with `No CANVAS_TOKEN`.

---

## Commands

### `deadlines`

```bash
next-cli deadlines
```

Prints upcoming uncompleted assignments and quizzes, soonest first:

```
in 2d    Tutorial 4 Submission  [MA2001]
in 9d    Lab Report 2           [CS1010]
OVERDUE  Reading Quiz 3         [GEA1000]
```

Looks 30 days ahead by default.

### `files`

```bash
next-cli files <courseId> [destination]
```

Downloads every file from a course into `./<courseId>` unless you give it a destination:

```bash
next-cli files 68201 ~/Documents/CS1010
```

**Finding the course ID:** it's the number in the Canvas URL, not the module code. Open the course and look at the address bar — `canvas.nus.edu.sg/courses/68201` means the ID is `68201`. `MA2001` won't work.

Filenames are sanitised (`<>:"/\|?*` become `_`) so they're safe on Windows.

---

## Troubleshooting

**`No CANVAS_TOKEN`** — the variable isn't set in this shell. Environment variables don't carry across terminal windows unless you've added the export to your shell profile.

**`Canvas API 401`** — token is wrong, revoked, or expired. Generate a new one.

**`Canvas API 403`** — the token is fine but you don't have access to that course. Usually means the course ID is wrong, or you're not enrolled in it.

**`Canvas API 404`** — the course ID doesn't exist. Check you copied the number from the URL and not a module code.

**`next-cli` runs something unexpected** — if you have Next.js installed globally, `next` is already taken. The binary here is `next-cli`, not `next`; make sure you're typing the full name.

**Windows paths** — in Git Bash, use forward slashes or quote the path: `next-cli files 68201 "C:/Users/you/Documents/CS1010"`.
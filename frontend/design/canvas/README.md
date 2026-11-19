# AutoAgent app design (Claude Design canvas)

The source of the design canvas: every screen of the desktop app, as one board per file.
The live canvas is a private Claude Design artifact: https://claude.ai/artifact/4mtiGTbBqxjSepZBfqamF4
(only its owner can open it unless it is shared from its Share menu). These files are a copy kept in git;
the canvas is where they are edited.

| Board | File | What it shows |
|---|---|---|
| Foundations | `Main.dc.html` | Colour, typography, spacing, corner radius, elevation, icons, with token names |
| Components | `Components.dc.html` | Island key buttons, command box, agent pills, tab bar; settings buttons, inputs, switches |
| Sign in | `Login.dc.html` | GitHub, Google and email sign-in |
| First launch | `Onboarding.dc.html` | Welcome, account, connect Claude Code, ready |
| Island states | `Island.dc.html` | Compact, home, approval, question, done, error, chat |
| Settings | `Settings*.dc.html` | General, Agents, Your bot, Account & chat |

`canvas.json` is the layout of the boards on the canvas. The `.dc.html` files need the Claude Design runtime
to render; open the canvas link to see them.

